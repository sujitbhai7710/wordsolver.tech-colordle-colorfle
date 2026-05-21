const DEFAULT_ANSWER_API_BASE = 'https://colordleanswer-api.wordleanswerofficial.workers.dev';

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || DEFAULT_ANSWER_API_BASE).replace(/\/+$/, '');
}

export const ANSWER_API_BASE = normalizeBaseUrl(
  import.meta.env.PUBLIC_ANSWER_API_BASE || import.meta.env.ANSWER_API_BASE
);

let todayBundlePromise = null;

async function fetchJson(path) {
  const response = await fetch(`${ANSWER_API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Answer API request failed (${response.status}) for ${path}${body ? `: ${body}` : ''}`);
  }

  return response.json();
}

export async function fetchTodayBundle() {
  if (!todayBundlePromise) {
    todayBundlePromise = fetchJson('/api/today').catch((error) => {
      todayBundlePromise = null;
      throw error;
    });
  }

  return todayBundlePromise;
}

export async function fetchColordleArchiveMonth(monthKey) {
  return fetchJson(`/api/colordle/archive?month=${monthKey}`);
}

export async function fetchColorfleArchiveMonth(monthKey) {
  return fetchJson(`/api/colorfle/archive?month=${monthKey}`);
}
