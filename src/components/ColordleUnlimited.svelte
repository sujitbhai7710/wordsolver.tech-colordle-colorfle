<script>
  let colordleRuntime = $state(null);
  let allColors = $state([]);
  let targetColor = $state(null);
  let guessInput = $state('');
  let guesses = $state([]);
  let filteredSuggestions = $state([]);
  let selectedGuess = $state(null);
  let gameOver = $state(false);
  let loading = $state(true);
  let showHelp = $state(false);

  // Auto-load on mount
  $effect(() => {
    initGame();
  });

  async function initGame() {
    try {
      const mod = await import('../lib/colordle.js');
      colordleRuntime = {
        getAllColors: mod.getAllColors,
        getUniqueTargetColors: mod.getUniqueTargetColors,
        colorDiff: mod.colorDiff,
        hexToRgb: mod.hexToRgb
      };
      allColors = mod.getAllColors();
      const targets = mod.getUniqueTargetColors();
      targetColor = targets[Math.floor(Math.random() * targets.length)];
    } catch (e) {
      console.error('Failed to load colordle runtime', e);
    } finally {
      loading = false;
    }
  }

  function newGame() {
    if (!colordleRuntime) return;
    const targets = colordleRuntime.getUniqueTargetColors();
    targetColor = targets[Math.floor(Math.random() * targets.length)];
    guesses = [];
    guessInput = '';
    selectedGuess = null;
    gameOver = false;
  }

  let liveSuggestions = $derived.by(() => {
    if (guessInput.length < 2 || selectedGuess?.name === guessInput) return [];
    const lowerInput = guessInput.toLowerCase();
    const matches = [];
    for (const c of allColors) {
      if (c.name.toLowerCase().includes(lowerInput)) {
        matches.push(c);
        if (matches.length >= 8) break;
      }
    }
    return matches;
  });

  function submitGuess() {
    if (!selectedGuess || !targetColor || !colordleRuntime || gameOver) return;
    const guessRgb = colordleRuntime.hexToRgb(selectedGuess.hex);
    const targetRgb = colordleRuntime.hexToRgb(targetColor.hex);
    if (!guessRgb || !targetRgb) return;
    const percent = Math.round(colordleRuntime.colorDiff(guessRgb, targetRgb) * 100) / 100;
    guesses = [...guesses, { guess: selectedGuess, percent }];
    guessInput = '';
    selectedGuess = null;
    if (percent === 100) {
      gameOver = true;
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (selectedGuess) {
        submitGuess();
      } else if (liveSuggestions.length > 0) {
        selectedGuess = liveSuggestions[0];
        guessInput = liveSuggestions[0].name;
      }
    }
  }

  function getScoreColor(pct) {
    if (pct === 100) return 'var(--accent-green)';
    if (pct >= 90) return 'var(--accent-teal)';
    if (pct >= 75) return 'var(--accent-amber)';
    if (pct >= 50) return 'var(--accent-amber)';
    return 'var(--accent-primary)';
  }

  function getScoreBg(pct) {
    if (pct === 100) return 'rgba(16,185,129,0.08)';
    if (pct >= 90) return 'rgba(20,184,166,0.08)';
    if (pct >= 75) return 'rgba(234,179,8,0.08)';
    if (pct >= 50) return 'rgba(249,115,22,0.06)';
    return 'rgba(239,68,68,0.06)';
  }
</script>

<div class="game-container">
  <!-- Header -->
  <div class="game-header">
    <button class="help-btn" onclick={() => showHelp = !showHelp}>?</button>
    <h1 class="game-title">Colordle</h1>
    <div style="width:36px;"></div>
  </div>

  <!-- Help Modal -->
  {#if showHelp}
    <div class="help-overlay" onclick={() => showHelp = false}>
      <div class="help-modal" onclick={(e) => e.stopPropagation()}>
        <h2>How to Play</h2>
        <p>Guess the <strong>named color</strong> that matches the target swatch.</p>
        <p>Type a color name and submit your guess. You will receive a <strong>similarity percentage</strong> based on how close your guess is to the target in perceptual color distance (Delta E CIE2000).</p>
        <ul>
          <li><strong>100%</strong> = Exact match (you win!)</li>
          <li><strong>90%+</strong> = Very close</li>
          <li><strong>75%+</strong> = Getting warmer</li>
          <li><strong>Below 50%</strong> = Far off</li>
        </ul>
        <p>Keep guessing until you find the exact color name!</p>
        <button class="close-help-btn" onclick={() => showHelp = false}>Got it!</button>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="loading-section">
      <div class="spinner"></div>
      <p>Loading color database...</p>
    </div>
  {:else}
    <!-- Target Color -->
    <div class="target-section">
      <div class="target-swatch" style="background: {targetColor.hex};">
      </div>
      <div class="target-info">
        {#if gameOver}
          <span class="target-name">{targetColor.name}</span>
        {:else}
          <span class="target-label">Guess this color!</span>
        {/if}
        <span class="target-hex">{targetColor.hex}</span>
      </div>
    </div>

    <!-- Guess Input -->
    {#if !gameOver}
      <div class="input-section">
        <div class="input-wrapper">
          <input
            type="text"
            value={guessInput}
            oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
            onkeydown={handleKeyDown}
            placeholder="Type a color name..."
            class="guess-input"
            autocomplete="off"
          />
          {#if selectedGuess}
            <div class="selected-preview" style="background: {selectedGuess.hex};">
            </div>
          {/if}
          {#if liveSuggestions.length > 0 && !selectedGuess}
            <div class="suggestions-list">
              {#each liveSuggestions as s}
                <button
                  class="suggestion-item"
                  onclick={() => { selectedGuess = s; guessInput = s.name; }}
                >
                  <div class="suggestion-swatch" style="background: {s.hex};"></div>
                  <span class="suggestion-name">{s.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        <button
          class="submit-btn"
          onclick={submitGuess}
          disabled={!selectedGuess}
        >
          Guess
        </button>
      </div>
    {:else}
      <div class="won-section">
        <div class="won-msg">Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</div>
        <button class="play-again-btn" onclick={newGame}>Play Again</button>
      </div>
    {/if}

    <!-- Guess History -->
    {#if guesses.length > 0}
      <div class="history-section">
        {#each guesses as item, idx}
          <div class="history-row" style="background: {getScoreBg(item.percent)};">
            <div class="history-color" style="background: {item.guess.hex};"></div>
            <div class="history-info">
              <span class="history-name">{item.guess.name}</span>
              <span class="history-hex">{item.guess.hex}</span>
            </div>
            <div class="history-score" style="color: {getScoreColor(item.percent)};">
              {item.percent}%
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .game-container {
    max-width: 420px;
    margin: 0 auto;
    padding: 0.5rem 0.75rem 1.5rem;
    background: #fff;
    border-radius: 16px;
    border: 1px solid var(--border-subtle);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--bg-muted);
  }

  .game-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.03em;
  }

  .help-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border-subtle);
    background: #fff;
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .help-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }

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

  .help-modal h2 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); }
  .help-modal p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.75rem; }
  .help-modal ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
  .help-modal li { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem; }

  .close-help-btn {
    width: 100%;
    padding: 0.6rem;
    border-radius: 10px;
    border: none;
    background: var(--accent-primary);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    margin-top: 0.75rem;
  }

  .loading-section {
    text-align: center;
    padding: 3rem 1rem;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border-subtle);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  .loading-section p { font-size: 0.85rem; color: var(--text-muted); }

  /* Target */
  .target-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 0;
  }

  .target-swatch {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid var(--border-subtle);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .target-info {
    text-align: center;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .target-name {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent-green);
  }

  .target-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent-primary);
  }

  .target-hex {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* Input */
  .input-section {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  .input-wrapper {
    flex: 1;
    position: relative;
  }

  .guess-input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    padding-right: 2.5rem;
    border: 2px solid var(--border-subtle);
    border-radius: 10px;
    font-size: 0.85rem;
    color: var(--text-primary);
    background: var(--bg-muted);
    outline: none;
    transition: border-color 0.2s;
  }

  .guess-input:focus { border-color: var(--accent-primary); }

  .selected-preview {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 2px solid var(--border-subtle);
  }

  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 30;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    margin-top: 2px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    border-bottom: 1px solid var(--bg-muted);
    transition: background 0.1s;
  }

  .suggestion-item:hover { background: var(--bg-muted); }
  .suggestion-item:last-child { border-bottom: none; }

  .suggestion-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .suggestion-name {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .submit-btn {
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--accent-primary);
    color: white;
  }

  .submit-btn:disabled { background: var(--border-subtle); color: var(--text-muted); cursor: not-allowed; }
  .submit-btn:not(:disabled):hover { background: var(--accent-primary); }

  /* Won */
  .won-section {
    text-align: center;
    padding: 1rem 0.5rem;
  }

  .won-msg {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--accent-green);
    margin-bottom: 0.75rem;
  }

  .play-again-btn {
    padding: 0.6rem 2rem;
    border-radius: 10px;
    border: none;
    background: var(--accent-primary);
    color: white;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-again-btn:hover { background: var(--accent-primary); }

  /* History */
  .history-section {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .history-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
  }

  .history-color {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 2px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
  }

  .history-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .history-name {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-hex {
    font-family: var(--font-body);
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .history-score {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 800;
  }
</style>
