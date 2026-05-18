<script>
  import { COLORS, COLOR_NAMES, WEIGHTS, mixColors, rgbToHex, getContrastColor, colorSimilarityYCC } from '../lib/colorfle.js';

  let targetColors = $state([]);
  let targetHex = $state('');
  let guesses = $state([]);
  let currentGuess = $state([0, 1, 2]);
  let gameOver = $state(false);
  let won = $state(false);
  let remainingGuesses = $state(6);
  let gameStarted = $state(false);

  function startGame() {
    gameStarted = true;
    newGame();
  }

  function newGame() {
    const pool = Array.from({ length: 20 }, (_, i) => i);
    const chosen = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      chosen.push(pool[idx]);
      pool.splice(idx, 1);
    }
    targetColors = chosen;
    const targetRgb = mixColors(chosen, 0);
    targetHex = rgbToHex(targetRgb);
    guesses = [];
    currentGuess = [0, 1, 2];
    gameOver = false;
    won = false;
    remainingGuesses = 6;
  }

  function setColor(position, idx) {
    if (gameOver) return;
    const newGuess = [...currentGuess];
    newGuess[position] = idx;
    currentGuess = newGuess;
  }

  function submitGuess() {
    if (gameOver) return;

    const answerCopy = [...targetColors];
    const guessCopy = [...currentGuess];
    const feedback = new Array(3).fill('gray');

    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] === answerCopy[i]) {
        feedback[i] = 'green';
        answerCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] === -2) continue;
      const index = answerCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        feedback[i] = 'yellow';
        answerCopy[index] = -1;
      }
    }

    const guessHex = rgbToHex(mixColors(currentGuess, 0));

    guesses = [...guesses, {
      colors: [...currentGuess],
      feedback,
      hex: guessHex
    }];

    remainingGuesses--;

    if (feedback.every((f) => f === 'green')) {
      gameOver = true;
      won = true;
    } else if (remainingGuesses <= 0) {
      gameOver = true;
    }
  }

  function feedbackColor(f) {
    if (f === 'green') return 'var(--accent-emerald)';
    if (f === 'yellow') return '#eab308';
    return 'var(--text-muted)';
  }

  function feedbackBg(f) {
    if (f === 'green') return 'rgba(16,185,129,0.1)';
    if (f === 'yellow') return 'rgba(234,179,8,0.1)';
    return 'rgba(156,163,175,0.08)';
  }
</script>

<div>
  {#if !gameStarted}
    <div style="text-align:center;padding:2.5rem 1rem;">
      <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--accent-pink),var(--accent-coral));margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
      </div>
      <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem;color:var(--text-primary);">Colorfle Unlimited</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.25rem;max-width:420px;margin-left:auto;margin-right:auto;font-size:0.925rem;">Practice Colorfle without waiting for the daily reset. Guess the three source colors that mix to create the target.</p>
      <button onclick={startGame} class="btn btn-primary">Start Playing</button>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;" class="game-grid">
      <!-- Target Color -->
      <div class="card" style="text-align:center;padding:1.75rem;">
        <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--accent-pink);margin-bottom:0.625rem;">Target Color</div>
        <div style="width:88px;height:88px;border-radius:50%;margin:0 auto 0.625rem;background:{targetHex};border:3px solid var(--border-subtle);box-shadow:var(--shadow-md);"></div>
        <div style="font-family:monospace;font-size:0.85rem;color:var(--text-muted);">{targetHex}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.375rem;">{remainingGuesses} guesses remaining</div>
      </div>

      <!-- Game Area -->
      <div>
        <!-- Current Guess -->
        <div class="card" style="padding:1.25rem;margin-bottom:0.75rem;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);margin-bottom:0.625rem;">Your Guess</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.625rem;margin-bottom:0.75rem;">
            {#each currentGuess as colorIdx, position}
              <div style="text-align:center;">
                <select
                  value={colorIdx}
                  onchange={(e) => setColor(position, parseInt(e.target.value))}
                  style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:8px;padding:0.5rem;color:var(--text-primary);font-size:0.75rem;outline:none;cursor:pointer;"
                >
                  {#each COLORS as _, idx}
                    <option value={idx}>{COLOR_NAMES[idx]}</option>
                  {/each}
                </select>
                <div style="width:40px;height:40px;border-radius:8px;background:{COLORS[colorIdx]};margin:0.375rem auto 0.2rem;border:1px solid var(--border-subtle);"></div>
                <div style="font-size:0.6rem;color:var(--text-muted);">Weight: {Math.round(WEIGHTS[0][position] * 100)}%</div>
              </div>
            {/each}
          </div>

          <!-- Preview mix -->
          {#if true}
            {@const mixPreview = rgbToHex(mixColors(currentGuess, 0))}
            <div style="display:flex;align-items:center;justify-content:center;gap:0.625rem;margin-bottom:0.75rem;padding:0.5rem;background:var(--bg-secondary);border-radius:8px;border:1px solid var(--border-subtle);">
              <span style="font-size:0.7rem;color:var(--text-muted);">Preview:</span>
              <div style="width:28px;height:28px;border-radius:50%;background:{mixPreview};border:1px solid var(--border-subtle);"></div>
              <span style="font-family:monospace;font-size:0.7rem;color:var(--text-muted);">{mixPreview}</span>
            </div>
          {/if}

          {#if !gameOver}
            <button onclick={submitGuess} style="width:100%;padding:0.625rem;border-radius:10px;border:none;background:linear-gradient(135deg,var(--accent-coral),var(--accent-pink));color:white;font-weight:700;font-size:0.875rem;cursor:pointer;transition:transform 0.2s;" onmouseover={(e) => e.target.style.transform='translateY(-1px)'} onmouseout={(e) => e.target.style.transform='none'}>
              Submit Guess
            </button>
          {:else}
            <div style="text-align:center;">
              {#if won}
                <div style="font-weight:800;font-size:1rem;color:var(--accent-emerald);margin-bottom:0.25rem;">Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</div>
              {:else}
                <div style="font-weight:800;font-size:1rem;color:#ef4444;margin-bottom:0.25rem;">Out of guesses!</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.375rem;">Answer: {targetColors.map((i) => COLOR_NAMES[i]).join(' + ')}</div>
              {/if}
              <button onclick={newGame} class="btn btn-primary" style="margin-top:0.625rem;">Play Again</button>
            </div>
          {/if}
        </div>

        <!-- Previous Guesses -->
        {#if guesses.length > 0}
          <div class="card" style="padding:1.25rem;">
            <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);margin-bottom:0.625rem;">Previous Guesses</div>
            <div style="display:flex;flex-direction:column;gap:0.375rem;">
              {#each guesses as guess, gi}
                <div style="display:grid;grid-template-columns:repeat(3,1fr) auto;gap:0.375rem;align-items:center;background:var(--bg-secondary);border-radius:8px;padding:0.5rem 0.875rem;border:1px solid var(--border-subtle);">
                  {#each guess.colors as colorIdx, ci}
                    <div style="text-align:center;">
                      <div style="width:28px;height:28px;border-radius:6px;background:{COLORS[colorIdx]};margin:0 auto 0.2rem;border:2px solid {feedbackColor(guess.feedback[ci])};"></div>
                      <div style="font-size:0.55rem;color:{feedbackColor(guess.feedback[ci])};font-weight:700;text-transform:uppercase;">{guess.feedback[ci]}</div>
                    </div>
                  {/each}
                  <div style="width:24px;height:24px;border-radius:50%;background:{guess.hex};border:1px solid var(--border-subtle);"></div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (min-width: 768px) {
    .game-grid { grid-template-columns: auto 1fr !important; }
  }
</style>
