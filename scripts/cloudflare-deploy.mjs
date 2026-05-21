import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const WORKER_DIR = path.join(ROOT_DIR, 'worker');
const ENV_FILE = path.join(ROOT_DIR, 'cloudflare.env.local');
const DEFAULT_GITHUB_REPO = 'akarohitmishra/colordlebro';
const DEFAULT_API_BASE = 'https://colordleanswer-api.wordleanswerofficial.workers.dev';
const DEFAULT_PRODUCTION_BRANCH = 'main';

const args = new Set(process.argv.slice(2));
const setupOnly = args.has('--setup-only');
const skipBuild = args.has('--skip-build');
const skipPages = args.has('--skip-pages');
const skipWorker = args.has('--skip-worker');
const skipSecrets = args.has('--skip-secrets');

function fail(message) {
  console.error(`\n[cloudflare-deploy] ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`\n[cloudflare-deploy] ${message}`);
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${path.basename(filePath)}. Create it from cloudflare.env.example first.`);
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function makeProcessEnv(fileEnv) {
  return {
    ...process.env,
    ...fileEnv,
    GITHUB_REPO: fileEnv.GITHUB_REPO || DEFAULT_GITHUB_REPO,
    PUBLIC_ANSWER_API_BASE: fileEnv.PUBLIC_ANSWER_API_BASE || DEFAULT_API_BASE,
    CLOUDFLARE_PAGES_PRODUCTION_BRANCH:
      fileEnv.CLOUDFLARE_PAGES_PRODUCTION_BRANCH || DEFAULT_PRODUCTION_BRANCH,
  };
}

function requireEnv(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    fail(`Missing required keys in ${path.basename(ENV_FILE)}: ${missing.join(', ')}`);
  }
}

function resolveCommand(command) {
  if (process.platform === 'win32' && (command === 'npm' || command === 'npx')) {
    return `${command}.cmd`;
  }

  return command;
}

function quoteForCmd(arg) {
  if (!arg) {
    return '""';
  }

  if (!/[\s"&|^<>]/.test(arg)) {
    return arg;
  }

  return `"${arg.replace(/"/g, '\\"')}"`;
}

function run(command, commandArgs, options = {}) {
  const resolvedCommand = resolveCommand(command);
  const label = [command, ...commandArgs].join(' ');
  info(`Running: ${label}`);

  const spawnOptions = {
    cwd: options.cwd || ROOT_DIR,
    env: options.env || process.env,
    stdio: options.capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    shell: false,
  };

  const result = process.platform === 'win32' && resolvedCommand.endsWith('.cmd')
    ? spawnSync(
        process.env.ComSpec || 'cmd.exe',
        ['/d', '/s', '/c', `${quoteForCmd(resolvedCommand)} ${commandArgs.map(quoteForCmd).join(' ')}`],
        spawnOptions
      )
    : spawnSync(resolvedCommand, commandArgs, spawnOptions);

  if (result.error) {
    fail(`Command failed to start: ${label} (${result.error.message})`);
  }

  if (result.status !== 0) {
    if (options.capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    fail(`Command failed: ${label}`);
  }

  return result;
}

function getPagesProjects(env) {
  const result = run(
    'npx',
    ['wrangler', 'pages', 'project', 'list'],
    { cwd: WORKER_DIR, env, capture: true }
  );

  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('│'))
    .map((line) => line.split('│').map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length > 0 && cells[0] !== 'Project Name')
    .map((cells) => ({ name: cells[0] }));
}

function ensurePagesProject(env) {
  const projectName = env.CLOUDFLARE_PAGES_PROJECT_NAME;
  const projects = getPagesProjects(env);
  const exists = projects.some((project) => {
    const name = project?.name || project?.projectName || project?.project_name;
    return name === projectName;
  });

  if (exists) {
    info(`Pages project already exists: ${projectName}`);
    return;
  }

  run(
    'npx',
    [
      'wrangler',
      'pages',
      'project',
      'create',
      projectName,
      '--production-branch',
      env.CLOUDFLARE_PAGES_PRODUCTION_BRANCH,
    ],
    { cwd: WORKER_DIR, env }
  );
}

function syncWorkerSecrets(env) {
  requireEnv(env, ['GITHUB_TOKEN']);

  const secretsFile = path.join(
    os.tmpdir(),
    `colordlebro-worker-secrets-${Date.now()}.env`
  );

  const secretLines = [
    `GITHUB_TOKEN=${env.GITHUB_TOKEN}`,
    `GITHUB_REPO=${env.GITHUB_REPO}`,
  ];

  fs.writeFileSync(secretsFile, `${secretLines.join('\n')}\n`, 'utf8');

  try {
    run(
      'npx',
      ['wrangler', 'secret', 'bulk', secretsFile, '--config', 'wrangler.toml'],
      { cwd: WORKER_DIR, env }
    );
  } finally {
    fs.rmSync(secretsFile, { force: true });
  }
}

function buildSite(env) {
  run('npm', ['run', 'build'], { cwd: ROOT_DIR, env });
}

function deployPages(env) {
  const deployStamp = new Date().toISOString().replace(/[:.]/g, '-');

  run(
    'npx',
    [
      'wrangler',
      'pages',
      'deploy',
      'dist',
      '--cwd',
      '..',
      '--project-name',
      env.CLOUDFLARE_PAGES_PROJECT_NAME,
      '--branch',
      env.CLOUDFLARE_PAGES_PRODUCTION_BRANCH,
      '--commit-dirty',
      `--commit-message=manual-cloudflare-deploy-${deployStamp}`,
    ],
    { cwd: WORKER_DIR, env }
  );
}

function deployWorker(env) {
  run('npx', ['wrangler', 'deploy', '--config', 'wrangler.toml'], {
    cwd: WORKER_DIR,
    env,
  });
}

function main() {
  const fileEnv = parseEnvFile(ENV_FILE);
  const env = makeProcessEnv(fileEnv);

  requireEnv(env, [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_PAGES_PROJECT_NAME',
  ]);

  info(`Using GitHub dispatch repo: ${env.GITHUB_REPO}`);

  ensurePagesProject(env);

  if (!skipSecrets) {
    syncWorkerSecrets(env);
  }

  if (setupOnly) {
    info('Setup-only run complete.');
    return;
  }

  if (!skipWorker) {
    deployWorker(env);
  }

  if (!skipBuild) {
    buildSite(env);
  }

  if (!skipPages) {
    deployPages(env);
  }

  info('Cloudflare deploy complete.');
}

main();
