<script>
  import { COLORS, COLOR_NAMES, WEIGHTS, checkGuess, getAllCombinations, getCombinationTargetColor, getContrastColor, isValidHex, normalizeHex, solveFromHexTopN } from '../lib/colorfle.js';

  let hexInput = $state('');
  let errorMessage = $state('');
  let suggestions = $state([]);
  let guesses = $state([]);
  let solved = $state(false);
  let showColorPicker = $state(false);
  let pickerColor = $state('#ff0000');

  function handleSolveHex() {
    if (!isValidHex(hexInput)) {
      errorMessage = 'Enter a valid hex color such as #8ce874.';
      return;
    }
    errorMessage = '';
    suggestions = solveFromHexTopN(normalizeHex(hexInput), 5);
    guesses = [];
    solved = false;
  }

  function applyPickerColor() {
    hexInput = pickerColor;
    showColorPicker = false;
    handleSolveHex();
  }

  function useSuggestion(result) {
    if (solved) return;
    guesses = [...guesses, { colors: result.colors, feedback: [null, null, null] }];
    suggestions = [];
  }

  function cycleFeedback(guessIndex, colorIndex) {
    const updated = guesses.map((guess, index) => {
      if (index !== guessIndex) return guess;
      const feedback = [...guess.feedback];
      const current = feedback[colorIndex];
      feedback[colorIndex] = current === null ? 'green' : current === 'green' ? 'yellow' : current === 'yellow' ? 'gray' : null;
      return { ...guess, feedback };
    });
    guesses = updated;
    const latest = updated[guessIndex];
    if (latest.feedback.every(v => v === 'green')) {
      solved = true;
    }
  }

  function refineSuggestions() {
    if (solved || guesses.length === 0 || guesses.some(g => g.feedback.some(v => v === null))) return;
    const possibilities = getAllCombinations(0).filter(candidate =>
      guesses.every(guess => checkGuess(guess.colors, candidate, guess.feedback))
    );
    if (possibilities.length === 0) {
      errorMessage = 'No combinations matched the selected feedback.';
      suggestions = [];
      return;
    }
    errorMessage = '';
    suggestions = possibilities.slice(0, 5).map(colors => {
      const target = getCombinationTargetColor(colors, 0);
      return { colors, colorNames: colors.map(i => COLOR_NAMES[i]), colorHexes: colors.map(i => COLORS[i]), targetColor: target.rgb, targetHex: target.hex, similarity: 0 };
    });
  }

  function resetSolver() {
    hexInput = '';
    errorMessage = '';
    suggestions = [];
    guesses = [];
    solved = false;
    showColorPicker = false;
  }

  function feedbackLabel(value) {
    if (value === 'green') return 'Correct';
    if (value === 'yellow') return 'Wrong pos';
    if (value === 'gray') return 'Absent';
    return 'Click to set';
  }

  function feedbackColors(value) {
    if (value === 'green') return { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: 'var(--accent-green)' };
    if (value === 'yellow') return { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', text: 'var(--accent-amber)' };
    if (value === 'gray') return { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)', text: 'var(--text-muted)' };
    return { bg: 'var(--bg-muted)', border: 'var(--border-subtle)', text: 'var(--text-muted)' };
  }

  function handleHexKey(e) {
    if (e.key === 'Enter') handleSolveHex();
  }
</script>

<div class="solver-wrapper">
  <div class="solver-grid">
    <!-- Left: Input -->
    <div class="solver-panel">
      <div class="panel-section">
        <label class="field-label">Target Hex Color</label>
        <div class="hex-input-row">
          <input
            value={hexInput}
            oninput={(e) => hexInput = e.target.value}
            onkeydown={handleHexKey}
            placeholder="#8ce874"
            class="hex-input"
          />
          <button onclick={handleSolveHex} class="solve-btn">Solve</button>
        </div>
        {#if errorMessage}
          <div class="error-msg">{errorMessage}</div>
        {/if}
      </div>

      <!-- Color Picker -->
      <div class="picker-section">
        <button onclick={() => showColorPicker = !showColorPicker} class="picker-toggle">
          {showColorPicker ? 'Hide Color Picker' : 'Pick a Color Instead'}
        </button>
        {#if showColorPicker}
          <div class="picker-box">
            <div class="picker-content">
              <input type="color" bind:value={pickerColor} class="color-picker" />
              <div class="picker-info">
                <div class="picker-preview-row">
                  <div class="picker-swatch" style="background: {pickerColor};"></div>
                  <span class="picker-hex">{pickerColor}</span>
                </div>
                <button onclick={applyPickerColor} class="use-color-btn">Use This Color</button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Guesses -->
      {#if guesses.length > 0}
        <div class="guesses-section">
          <div class="guesses-header">
            <span class="guesses-title">Guesses</span>
            {#if !solved && guesses.every(g => g.feedback.every(v => v !== null))}
              <button onclick={refineSuggestions} class="refine-btn">Refine</button>
            {/if}
          </div>
          {#each guesses as guess, gi}
            <div class="guess-row">
              <div class="guess-colors">
                {#each guess.colors as colorIdx, ci}
                  {@const fb = feedbackColors(guess.feedback[ci])}
                  <button
                    onclick={() => cycleFeedback(gi, ci)}
                    class="guess-color-btn"
                    style="background: {fb.bg}; border-color: {fb.border};"
                  >
                    <div class="guess-swatch" style="background: {COLORS[colorIdx]};"></div>
                    <div class="guess-color-name">{COLOR_NAMES[colorIdx]}</div>
                    <div class="guess-feedback-label" style="color: {fb.text};">{feedbackLabel(guess.feedback[ci])}</div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if solved}
        <div class="solved-box">
          <div class="solved-title">Solved!</div>
          <div class="solved-desc">The latest feedback indicates the current suggestion is the exact answer.</div>
        </div>
      {/if}
    </div>

    <!-- Right: Suggestions -->
    <div class="solver-panel">
      <div class="suggestions-header">
        <span class="suggestions-title">Suggestions</span>
        <span class="suggestions-count">{suggestions.length} shown</span>
      </div>

      {#if suggestions.length === 0}
        <div class="empty-suggestions">
          Enter a target hex above or use the color picker to get matching three-color combinations.
        </div>
      {:else}
        <div class="suggestions-list">
          {#each suggestions as suggestion}
            <div class="suggestion-card">
              <div class="suggestion-preview" style="background: {suggestion.targetHex};">
                <span style="color: {getContrastColor(suggestion.targetHex)}; font-size: 0.6rem; font-weight: 700; font-family: var(--font-body);">{suggestion.targetHex}</span>
              </div>
              <div class="suggestion-colors">
                {#each suggestion.colors as colorIdx, i}
                  <div class="suggestion-color-chip">
                    <div class="chip-swatch" style="background: {COLORS[colorIdx]};"></div>
                    <div>
                      <div class="chip-name">{COLOR_NAMES[colorIdx]}</div>
                      <div class="chip-hex">{suggestion.colorHexes[i]}</div>
                    </div>
                  </div>
                {/each}
              </div>
              <button onclick={() => useSuggestion(suggestion)} class="use-btn">Use This</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .solver-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .solver-grid { grid-template-columns: 2fr 3fr; }
  }

  .solver-panel {
    background: #fff;
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .panel-section { margin-bottom: 1rem; }
  .field-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); display: block; margin-bottom: 0.375rem; }

  .hex-input-row { display: flex; gap: 0.5rem; }
  .hex-input {
    flex: 1; background: var(--bg-muted); border: 2px solid var(--border-subtle); border-radius: 10px;
    padding: 0.6rem 0.875rem; color: var(--text-primary); font-family: var(--font-body); font-size: 0.875rem; outline: none; transition: border-color 0.2s;
  }
  .hex-input:focus { border-color: var(--accent-pink); }

  .solve-btn {
    padding: 0.6rem 1rem; border-radius: 10px; border: none;
    background: var(--accent-pink); color: white; font-weight: 700; font-size: 0.8rem;
    cursor: pointer; transition: transform 0.2s; white-space: nowrap;
  }
  .solve-btn:hover { transform: translateY(-1px); }

  .error-msg { margin-top: 0.375rem; font-size: 0.75rem; color: var(--accent-primary); font-weight: 500; }

  .picker-section { border-top: 1px solid var(--bg-muted); padding-top: 0.875rem; }
  .picker-toggle { background: none; border: none; color: var(--accent-pink); font-size: 0.8rem; font-weight: 600; cursor: pointer; }

  .picker-box { margin-top: 0.5rem; background: var(--bg-muted); border-radius: 10px; padding: 0.875rem; border: 1px solid var(--border-subtle); }
  .picker-content { display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; }
  .color-picker { width: 72px; height: 72px; border-radius: 10px; border: 2px solid var(--border-subtle); cursor: pointer; padding: 0; }

  .picker-preview-row { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.375rem; }
  .picker-swatch { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-subtle); }
  .picker-hex { font-family: var(--font-body); font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }

  .use-color-btn {
    padding: 0.4rem 0.875rem; border-radius: 8px; border: none;
    background: var(--accent-pink); color: white; font-weight: 600; font-size: 0.75rem; cursor: pointer;
  }

  .guesses-section { margin-top: 1rem; border-top: 1px solid var(--bg-muted); padding-top: 1rem; }
  .guesses-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .guesses-title { font-weight: 700; font-size: 1rem; color: var(--text-primary); }

  .refine-btn {
    padding: 0.4rem 0.875rem; border-radius: 8px; border: none;
    background: var(--accent-teal); color: white; font-weight: 600; font-size: 0.75rem; cursor: pointer;
  }

  .guess-row { background: var(--bg-muted); border-radius: 10px; padding: 0.5rem; margin-bottom: 0.375rem; border: 1px solid var(--border-subtle); }
  .guess-colors { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

  .guess-color-btn {
    border-radius: 10px; padding: 0.5rem; text-align: center; border: 2px solid; cursor: pointer; transition: all 0.15s; background: var(--bg-muted);
  }

  .guess-swatch { width: 36px; height: 36px; border-radius: 8px; margin: 0 auto 0.25rem; border: 1px solid var(--border-subtle); }
  .guess-color-name { font-weight: 600; font-size: 0.75rem; color: var(--text-primary); }
  .guess-feedback-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.1rem; font-weight: 600; }

  .solved-box { margin-top: 0.875rem; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 0.875rem; }
  .solved-title { font-weight: 800; color: var(--accent-green); font-size: 1rem; }
  .solved-desc { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem; }

  .suggestions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .suggestions-title { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
  .suggestions-count { font-size: 0.75rem; color: var(--text-muted); }

  .empty-suggestions { text-align: center; padding: 1.75rem 1rem; color: var(--text-muted); font-size: 0.875rem; }

  .suggestions-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .suggestion-card {
    background: var(--bg-muted); border-radius: 10px; padding: 0.875rem; border: 1px solid var(--border-subtle);
    display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
  }

  .suggestion-preview {
    width: 56px; height: 56px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border-subtle); flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .suggestion-colors { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 0.3rem; }

  .suggestion-color-chip {
    display: flex; align-items: center; gap: 0.25rem; background: #fff;
    padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid var(--border-subtle);
  }

  .chip-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--border-subtle); }
  .chip-name { font-size: 0.7rem; font-weight: 600; color: var(--text-primary); }
  .chip-hex { font-size: 0.55rem; color: var(--text-muted); font-family: var(--font-body); }

  .use-btn {
    padding: 0.4rem 0.875rem; border-radius: 8px; border: none;
    background: var(--accent-pink); color: white; font-weight: 600; font-size: 0.7rem;
    cursor: pointer; flex-shrink: 0;
  }
</style>
