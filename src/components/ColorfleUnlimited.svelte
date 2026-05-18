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
    // Pick 3 random unique color indices
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

  function cycleColor(position) {
    if (gameOver) return;
    currentGuess[position] = (currentGuess[currentGuess.length - 1 - 0] + 1) % 20;
    // Ensure unique
    let newVal = (currentGuess[position] + 1) % 20;
    while (currentGuess.includes(newVal) && currentGuess.indexOf(newVal) !== position) {
      newVal = (newVal + 1) % 20;
    }
    currentGuess[position] = newVal;
  }

  function setColor(position, idx) {
    if (gameOver) return;
    const newGuess = [...currentGuess];
    newGuess[position] = idx;
    currentGuess = newGuess;
  }

  function submitGuess() {
    if (gameOver) return;

    // Calculate feedback
    const answerCopy = [...targetColors];
    const guessCopy = [...currentGuess];
    const feedback = new Array(3).fill('gray');

    // Check greens first
    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] === answerCopy[i]) {
        feedback[i] = 'green';
        answerCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    // Check yellows
    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] === -2) continue;
      const index = answerCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        feedback[i] = 'yellow';
        answerCopy[index] = -1;
      }
    }

    const guessHex = rgbToHex(mixColors(currentGuess, 0));
    const similarity = colorSimilarityYCC(
      { r: 0, g: 0, b: 0 }, // placeholder
      { r: 0, g: 0, b: 0 }
    );

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
    if (f === 'green') return '#14b8a6';
    if (f === 'yellow') return '#eab308';
    return '#6b6b8d';
  }
</script>

<div>
  {#if !gameStarted}
    <div style="text-align:center;padding:3rem 1rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">🔮</div>
      <h2 style="font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;">Colorfle Unlimited</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;max-width:480px;margin-left:auto;margin-right:auto;">Practice Colorfle without waiting for the daily reset. Guess the three source colors that mix to create the target.</p>
      <button onclick={startGame} class="btn btn-primary">Start Playing</button>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;" class="game-grid">
      <!-- Target Color -->
      <div class="card" style="text-align:center;padding:2rem;">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:var(--accent-pink);margin-bottom:0.75rem;">Target Color</div>
        <div style="width:100px;height:100px;border-radius:50%;margin:0 auto 0.75rem;background:{targetHex};border:3px solid rgba(255,255,255,0.1);box-shadow:0 0 30px {targetHex}44;"></div>
        <div style="font-family:monospace;font-size:0.9rem;color:var(--text-muted);">{targetHex}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">{remainingGuesses} guesses remaining</div>
      </div>

      <!-- Game Area -->
      <div>
        <!-- Current Guess -->
        <div class="card" style="padding:1.5rem;margin-bottom:1rem;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:0.75rem;">Your Guess</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem;">
            {#each currentGuess as colorIdx, position}
              <div style="text-align:center;">
                <select
                  value={colorIdx}
                  onchange={(e) => setColor(position, parseInt(e.target.value))}
                  style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.6rem;color:var(--text-primary);font-size:0.8rem;outline:none;cursor:pointer;"
                >
                  {#each COLORS as _, idx}
                    <option value={idx}>{COLOR_NAMES[idx]}</option>
                  {/each}
                </select>
                <div style="width:48px;height:48px;border-radius:8px;background:{COLORS[colorIdx]};margin:0.5rem auto 0.25rem;border:1px solid rgba(255,255,255,0.1);"></div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Weight: {Math.round(WEIGHTS[0][position] * 100)}%</div>
              </div>
            {/each}
          </div>

          <!-- Preview mix -->
          {#if true}
            {@const mixPreview = rgbToHex(mixColors(currentGuess, 0))}
            <div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-bottom:1rem;">
              <span style="font-size:0.75rem;color:var(--text-muted);">Preview:</span>
              <div style="width:32px;height:32px;border-radius:50%;background:{mixPreview};border:1px solid rgba(255,255,255,0.1);"></div>
              <span style="font-family:monospace;font-size:0.75rem;color:var(--text-muted);">{mixPreview}</span>
            </div>
          {/if}

          {#if !gameOver}
            <button onclick={submitGuess} style="width:100%;padding:0.75rem;border-radius:10px;border:none;background:linear-gradient(135deg,#ec4899,#f97316);color:white;font-weight:700;font-size:0.9rem;cursor:pointer;">
              Submit Guess
            </button>
          {:else}
            <div style="text-align:center;">
              {#if won}
                <div style="font-size:1.5rem;margin-bottom:0.5rem;">🎉</div>
                <div style="font-weight:800;font-size:1.1rem;color:var(--accent-teal);margin-bottom:0.25rem;">Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</div>
              {:else}
                <div style="font-size:1.5rem;margin-bottom:0.5rem;">😔</div>
                <div style="font-weight:800;font-size:1.1rem;color:#ef4444;margin-bottom:0.25rem;">Out of guesses!</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">Answer: {targetColors.map((i) => COLOR_NAMES[i]).join(' + ')}</div>
              {/if}
              <button onclick={newGame} class="btn btn-primary" style="margin-top:0.75rem;">Play Again</button>
            </div>
          {/if}
        </div>

        <!-- Previous Guesses -->
        {#if guesses.length > 0}
          <div class="card" style="padding:1.5rem;">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:0.75rem;">Previous Guesses</div>
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              {#each guesses as guess, gi}
                <div style="display:grid;grid-template-columns:repeat(3,1fr) auto;gap:0.5rem;align-items:center;background:var(--bg-secondary);border-radius:8px;padding:0.6rem 1rem;">
                  {#each guess.colors as colorIdx, ci}
                    <div style="text-align:center;">
                      <div style="width:32px;height:32px;border-radius:6px;background:{COLORS[colorIdx]};margin:0 auto 0.25rem;border:2px solid {feedbackColor(guess.feedback[ci])};"></div>
                      <div style="font-size:0.65rem;color:{feedbackColor(guess.feedback[ci])};font-weight:700;text-transform:uppercase;">{guess.feedback[ci]}</div>
                    </div>
                  {/each}
                  <div style="width:28px;height:28px;border-radius:50%;background:{guess.hex};border:1px solid rgba(255,255,255,0.1);"></div>
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
  @media (min-width: 768px) {
    .game-grid { grid-template-columns: auto 1fr !important; }
  }
</style>
