<script>
  import { COLORS, COLOR_NAMES, WEIGHTS, mixColors, rgbToHex, colorSimilarityYCC } from '../lib/colorfle.js';

  // Color palette layout matching the real colorfle game
  const PALETTE_ROW_1 = [0, 1, 6, 8, 13, 14, 17]; // White, Cream, Yellow, Orange, Brown, Red, Maroon
  const PALETTE_ROW_2 = [5, 3, 7, 9, 11, 12];      // Cyan, Mint, Lime, Green, Olive, Teal
  const PALETTE_ROW_3 = [2, 4, 10, 16, 15, 18, 19]; // Pink, Lavender, Magenta, Purple, Blue, Navy, Black

  let targetColors = $state([]);
  let targetHex = $state('');
  let guesses = $state([]);
  let currentGuess = $state([]);
  let gameOver = $state(false);
  let won = $state(false);
  let maxGuesses = 6;
  let numSlots = 3;
  let eliminatedColors = $state(new Set());
  let message = $state('');
  let showHelp = $state(false);

  // Initialize game on mount
  $effect(() => {
    newGame();
  });

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
    currentGuess = [];
    gameOver = false;
    won = false;
    eliminatedColors = new Set();
    message = '';
  }

  function addColor(colorIdx) {
    if (gameOver) return;
    if (currentGuess.length >= numSlots) return;
    if (currentGuess.includes(colorIdx)) return;
    currentGuess = [...currentGuess, colorIdx];
  }

  function removeLastColor() {
    if (gameOver) return;
    currentGuess = currentGuess.slice(0, -1);
  }

  function submitGuess() {
    if (gameOver) return;
    if (currentGuess.length !== numSlots) return;

    const answerCopy = [...targetColors];
    const guessCopy = [...currentGuess];
    const feedback = new Array(numSlots).fill('gray');

    // First pass: greens
    for (let i = 0; i < numSlots; i++) {
      if (guessCopy[i] === answerCopy[i]) {
        feedback[i] = 'green';
        answerCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    // Second pass: yellows
    for (let i = 0; i < numSlots; i++) {
      if (guessCopy[i] === -2) continue;
      const index = answerCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        feedback[i] = 'yellow';
        answerCopy[index] = -1;
      }
    }

    const guessRgb = mixColors(currentGuess, 0);
    const targetRgb = mixColors(targetColors, 0);
    const similarity = colorSimilarityYCC(guessRgb, targetRgb);
    const guessHex = rgbToHex(guessRgb);

    guesses = [...guesses, {
      colors: [...currentGuess],
      feedback,
      hex: guessHex,
      similarity
    }];

    // Mark eliminated colors
    for (let i = 0; i < numSlots; i++) {
      if (feedback[i] === 'gray') {
        eliminatedColors = new Set([...eliminatedColors, currentGuess[i]]);
      }
    }

    currentGuess = [];

    if (feedback.every(f => f === 'green')) {
      gameOver = true;
      won = true;
      message = `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!`;
    } else if (guesses.length >= maxGuesses) {
      gameOver = true;
      message = 'Out of guesses!';
    }
  }

  function getFeedbackBorderColor(f) {
    if (f === 'green') return 'forestgreen';
    if (f === 'yellow') return '#FFEA00';
    return '#d3d3d3';
  }
</script>

<div class="game-container">
  <!-- Header -->
  <div class="game-header">
    <button class="help-btn" onclick={() => showHelp = !showHelp}>?</button>
    <h1 class="game-title">Colorfle</h1>
    <div style="width:36px;"></div>
  </div>

  <!-- Help Modal -->
  {#if showHelp}
    <div class="help-overlay" onclick={() => showHelp = false}>
      <div class="help-modal" onclick={(e) => e.stopPropagation()}>
        <h2>How to Play</h2>
        <p>Guess the <strong>3 colors</strong> that mix together to create the target color.</p>
        <ul>
          <li>The first color has a weight of <strong>50%</strong></li>
          <li>The second color has a weight of <strong>34%</strong></li>
          <li>The third color has a weight of <strong>16%</strong></li>
        </ul>
        <p>After each guess, the color blocks will show feedback:</p>
        <div class="feedback-examples">
          <div class="feedback-example">
            <div class="example-block" style="border-color: forestgreen;"></div>
            <span>Green = Correct color AND position</span>
          </div>
          <div class="feedback-example">
            <div class="example-block" style="border-color: #FFEA00;"></div>
            <span>Yellow = Correct color, wrong position</span>
          </div>
          <div class="feedback-example">
            <div class="example-block" style="border-color: #d3d3d3;"></div>
            <span>Gray = Color not in the answer</span>
          </div>
        </div>
        <p>You have <strong>6 guesses</strong>. Good luck!</p>
        <button class="close-help-btn" onclick={() => showHelp = false}>Got it!</button>
      </div>
    </div>
  {/if}

  <!-- Target Color Display -->
  <div class="target-section">
    <div class="target-circle" style="background: {targetHex};">
      <div class="target-label">{targetHex}</div>
    </div>
    <div class="target-info">
      <span class="guesses-remaining">{maxGuesses - guesses.length} left</span>
    </div>
  </div>

  <!-- Guess Rows -->
  <div class="guess-field">
    {#each Array(maxGuesses) as _, rowIdx}
      <div class="guess-row">
        {#if rowIdx < guesses.length}
          <!-- Completed guess -->
          {@const guess = guesses[rowIdx]}
          {#each guess.colors as colorIdx, ci}
            <div class="guess-block filled" style="background: {COLORS[colorIdx]}; border-color: {getFeedbackBorderColor(guess.feedback[ci])};">
            </div>
          {/each}
          <button class="avg-block filled-avg" style="background: {guess.hex};" title="Similarity: {guess.similarity}%">
            <span class="avg-text" style="color: {guess.similarity > 50 ? (guess.hex === '#ffffff' || guess.hex === '#FFFAC8' ? '#333' : '#fff') : '#333'}">{guess.similarity}%</span>
          </button>
        {:else if rowIdx === guesses.length}
          <!-- Current row -->
          {#each Array(numSlots) as _, ci}
            <div class="guess-block {currentGuess[ci] !== undefined ? 'filled' : ''}" style={currentGuess[ci] !== undefined ? `background: ${COLORS[currentGuess[ci]]}; border-color: #878a8c;` : ''}>
            </div>
          {/each}
          <div class="avg-block empty-avg">
            <span class="avg-question">?</span>
          </div>
        {:else}
          <!-- Empty future row -->
          {#each Array(numSlots) as _, ci}
            <div class="guess-block"></div>
          {/each}
          <div class="avg-block empty-avg">
            <span class="avg-question">?</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Color Palette -->
  {#if !gameOver}
    <div class="color-field">
      <div class="palette-row">
        {#each PALETTE_ROW_1 as colorIdx}
          <button
            class="color-btn {eliminatedColors.has(colorIdx) ? 'eliminated' : ''} {currentGuess.includes(colorIdx) ? 'selected' : ''}"
            style="--btn-color: {COLORS[colorIdx]};"
            onclick={() => addColor(colorIdx)}
            disabled={eliminatedColors.has(colorIdx) || currentGuess.includes(colorIdx)}
            title={COLOR_NAMES[colorIdx]}
          >
          </button>
        {/each}
        <button class="action-btn delete-btn" onclick={removeLastColor} title="Delete">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
        </button>
      </div>
      <div class="palette-row">
        {#each PALETTE_ROW_2 as colorIdx}
          <button
            class="color-btn {eliminatedColors.has(colorIdx) ? 'eliminated' : ''} {currentGuess.includes(colorIdx) ? 'selected' : ''}"
            style="--btn-color: {COLORS[colorIdx]};"
            onclick={() => addColor(colorIdx)}
            disabled={eliminatedColors.has(colorIdx) || currentGuess.includes(colorIdx)}
            title={COLOR_NAMES[colorIdx]}
          >
          </button>
        {/each}
        <button class="action-btn enter-btn" onclick={submitGuess} disabled={currentGuess.length !== numSlots}>
          ENTER
        </button>
      </div>
      <div class="palette-row">
        {#each PALETTE_ROW_3 as colorIdx}
          <button
            class="color-btn {eliminatedColors.has(colorIdx) ? 'eliminated' : ''} {currentGuess.includes(colorIdx) ? 'selected' : ''}"
            style="--btn-color: {COLORS[colorIdx]};"
            onclick={() => addColor(colorIdx)}
            disabled={eliminatedColors.has(colorIdx) || currentGuess.includes(colorIdx)}
            title={COLOR_NAMES[colorIdx]}
          >
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Game Over -->
    <div class="game-over-section">
      {#if won}
        <div class="game-over-msg won">{message}</div>
      {:else}
        <div class="game-over-msg lost">{message}</div>
        <div class="answer-reveal">
          Answer: {targetColors.map(i => COLOR_NAMES[i]).join(' + ')}
        </div>
      {/if}
      <button class="play-again-btn" onclick={newGame}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .game-container {
    max-width: 420px;
    margin: 0 auto;
    padding: 0.5rem 0.75rem 1.5rem;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .game-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
  }

  .help-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .help-btn:hover { border-color: #6366f1; color: #6366f1; }

  .help-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .help-modal {
    background: #fff;
    border-radius: 16px;
    padding: 2rem;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }

  .help-modal h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #0f172a;
  }

  .help-modal p { font-size: 0.875rem; color: #475569; line-height: 1.6; margin-bottom: 0.75rem; }
  .help-modal ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
  .help-modal li { font-size: 0.85rem; color: #475569; margin-bottom: 0.25rem; }

  .feedback-examples { margin: 0.75rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .feedback-example { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #475569; }
  .example-block { width: 28px; height: 28px; border-radius: 4px; border: 3px solid; background: #e2e8f0; flex-shrink: 0; }

  .close-help-btn {
    width: 100%;
    padding: 0.6rem;
    border-radius: 10px;
    border: none;
    background: #6366f1;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    margin-top: 0.75rem;
  }

  /* Target Section */
  .target-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
  }

  .target-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    position: relative;
  }

  .target-label {
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    background: rgba(255,255,255,0.85);
    color: #333;
    position: absolute;
    bottom: 8px;
  }

  .target-info {
    margin-top: 0.5rem;
  }

  .guesses-remaining {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 600;
  }

  /* Guess Field */
  .guess-field {
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .guess-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .guess-block {
    width: 44px;
    height: 44px;
    border: 4px solid #878a8c;
    border-radius: 2px;
    background: #d3d3d3;
    transition: all 0.15s;
  }

  .guess-block.filled {
    animation: popIn 0.15s ease;
  }

  @keyframes popIn {
    0% { transform: scale(0.8); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .avg-block {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    border: 2px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.15s;
  }

  .empty-avg {
    background: #ededed;
  }

  .filled-avg {
    border-color: transparent;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }

  .avg-question {
    font-size: 0.8rem;
    font-weight: 700;
    color: #94a3b8;
  }

  .avg-text {
    font-size: 0.6rem;
    font-weight: 800;
  }

  /* Color Field */
  .color-field {
    padding: 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .palette-row {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .color-btn {
    width: 44px;
    height: 44px;
    border-radius: 10%;
    border: 3px solid #1a1a1a;
    background: var(--btn-color);
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }

  .color-btn:hover:not(:disabled) {
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .color-btn.selected {
    transform: scale(0.9);
    opacity: 0.5;
  }

  .color-btn.eliminated {
    opacity: 0.25;
    cursor: not-allowed;
    position: relative;
  }

  .color-btn.eliminated::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -2px;
    right: -2px;
    height: 3px;
    background: #666;
    transform: rotate(-45deg);
  }

  .action-btn {
    height: 44px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    background: #d3d3d3;
    color: #333;
  }

  .delete-btn {
    width: 52px;
    padding: 0;
  }

  .delete-btn:hover { background: #bbb; }

  .enter-btn {
    width: 72px;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
  }

  .enter-btn:hover:not(:disabled) { background: #6366f1; color: white; }
  .enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Game Over */
  .game-over-section {
    text-align: center;
    padding: 1.5rem 0.5rem;
  }

  .game-over-msg {
    font-family: 'Outfit', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .game-over-msg.won { color: #10b981; }
  .game-over-msg.lost { color: #ef4444; }

  .answer-reveal {
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .play-again-btn {
    padding: 0.65rem 2rem;
    border-radius: 10px;
    border: none;
    background: #6366f1;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-again-btn:hover { background: #4f46e5; transform: translateY(-1px); }
</style>
