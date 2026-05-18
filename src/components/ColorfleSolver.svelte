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
    if (latest.feedback.every((v) => v === 'green')) {
      solved = true;
    }
  }

  function refineSuggestions() {
    if (solved || guesses.length === 0 || guesses.some((g) => g.feedback.some((v) => v === null))) return;
    const possibilities = getAllCombinations(0).filter((candidate) =>
      guesses.every((guess) => checkGuess(guess.colors, candidate, guess.feedback))
    );
    if (possibilities.length === 0) {
      errorMessage = 'No combinations matched the selected feedback. Double-check your colors and feedback.';
      suggestions = [];
      return;
    }
    errorMessage = '';
    suggestions = possibilities.slice(0, 5).map((colors) => {
      const target = getCombinationTargetColor(colors, 0);
      return {
        colors,
        colorNames: colors.map((i) => COLOR_NAMES[i]),
        colorHexes: colors.map((i) => COLORS[i]),
        targetColor: target.rgb,
        targetHex: target.hex,
        similarity: 0
      };
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
    if (value === 'green') return 'Green';
    if (value === 'yellow') return 'Yellow';
    if (value === 'gray') return 'Gray';
    return 'Unset';
  }

  function feedbackBg(value) {
    if (value === 'green') return 'rgba(16,185,129,0.1)';
    if (value === 'yellow') return 'rgba(234,179,8,0.1)';
    if (value === 'gray') return 'rgba(156,163,175,0.1)';
    return 'var(--bg-card)';
  }

  function feedbackBorder(value) {
    if (value === 'green') return 'rgba(16,185,129,0.3)';
    if (value === 'yellow') return 'rgba(234,179,8,0.3)';
    if (value === 'gray') return 'rgba(156,163,175,0.3)';
    return 'var(--border-subtle)';
  }
</script>

<div class="solver-wrapper">
  <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;" class="solver-grid">
    <!-- Left: Input -->
    <div class="card" style="padding:1.25rem;">
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:0.375rem;">Target Hex</label>
        <div style="display:flex;gap:0.5rem;">
          <input value={hexInput} oninput={(e) => hexInput = e.target.value} placeholder="#8ce874" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.625rem 0.875rem;color:var(--text-primary);font-family:monospace;font-size:0.875rem;outline:none;transition:border-color 0.2s;" onfocus={(e) => e.target.style.borderColor='var(--accent-pink)'} onblur={(e) => e.target.style.borderColor='var(--border-subtle)'} />
          <button onclick={handleSolveHex} style="padding:0.625rem 1rem;border-radius:10px;border:none;background:linear-gradient(135deg,var(--accent-coral),var(--accent-pink));color:white;font-weight:700;font-size:0.8rem;cursor:pointer;transition:transform 0.2s;" onmouseover={(e) => e.target.style.transform='translateY(-1px)'} onmouseout={(e) => e.target.style.transform='none'}>Solve</button>
        </div>
        {#if errorMessage}
          <div style="margin-top:0.375rem;font-size:0.75rem;color:#ef4444;font-weight:500;">{errorMessage}</div>
        {/if}
      </div>

      <!-- Color Picker Toggle -->
      <div style="border-top:1px solid var(--border-subtle);padding-top:0.875rem;">
        <button onclick={() => showColorPicker = !showColorPicker} style="background:none;border:none;color:var(--accent-pink);font-size:0.8rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.375rem;">
          {showColorPicker ? 'Hide Color Picker' : 'Pick a Color Instead'}
        </button>
        {#if showColorPicker}
          <div style="margin-top:0.625rem;background:var(--bg-secondary);border-radius:10px;padding:0.875rem;border:1px solid var(--border-subtle);">
            <div style="display:flex;align-items:center;gap:0.875rem;flex-wrap:wrap;">
              <input type="color" bind:value={pickerColor} style="width:72px;height:72px;border-radius:10px;border:2px solid var(--border-subtle);cursor:pointer;padding:0;" />
              <div>
                <div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.375rem;">
                  <div style="width:28px;height:28px;border-radius:6px;background:{pickerColor};border:1px solid var(--border-subtle);"></div>
                  <span style="font-family:monospace;font-weight:700;font-size:0.9rem;color:var(--text-primary);">{pickerColor}</span>
                </div>
                <button onclick={applyPickerColor} style="padding:0.4rem 0.875rem;border-radius:8px;border:none;background:linear-gradient(135deg,var(--accent-coral),var(--accent-pink));color:white;font-weight:600;font-size:0.75rem;cursor:pointer;">Use This Color</button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Guesses -->
      {#if guesses.length > 0}
        <div style="margin-top:1rem;border-top:1px solid var(--border-subtle);padding-top:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <div style="font-weight:700;font-size:1rem;color:var(--text-primary);">Guesses</div>
            {#if !solved && guesses.every((g) => g.feedback.every((v) => v !== null))}
              <button onclick={refineSuggestions} style="padding:0.4rem 0.875rem;border-radius:8px;border:none;background:linear-gradient(135deg,var(--accent-teal),var(--accent-sky));color:white;font-weight:600;font-size:0.75rem;cursor:pointer;">Refine</button>
            {/if}
          </div>
          {#each guesses as guess, gi}
            <div style="background:var(--bg-secondary);border-radius:10px;padding:0.625rem;margin-bottom:0.375rem;border:1px solid var(--border-subtle);">
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.625rem;">
                {#each guess.colors as colorIdx, ci}
                  <button onclick={() => cycleFeedback(gi, ci)} style="border-radius:10px;padding:0.625rem;text-align:center;background:{feedbackBg(guess.feedback[ci])};border:1px solid {feedbackBorder(guess.feedback[ci])};cursor:pointer;transition:all 0.15s;">
                    <div style="width:40px;height:40px;border-radius:8px;background:{COLORS[colorIdx]};margin:0 auto 0.375rem;border:1px solid var(--border-subtle);"></div>
                    <div style="font-weight:600;font-size:0.75rem;color:var(--text-primary);">{COLOR_NAMES[colorIdx]}</div>
                    <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.1em;color:{guess.feedback[ci] === 'green' ? 'var(--accent-emerald)' : guess.feedback[ci] === 'yellow' ? '#eab308' : guess.feedback[ci] === 'gray' ? 'var(--text-muted)' : 'var(--text-muted)'};margin-top:0.1rem;">{feedbackLabel(guess.feedback[ci])}</div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if solved}
        <div style="margin-top:0.875rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:0.875rem;">
          <div style="font-weight:800;color:var(--accent-emerald);font-size:1rem;">Solved!</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.2rem;">The latest feedback indicates the current suggestion is the exact answer.</div>
        </div>
      {/if}
    </div>

    <!-- Right: Suggestions -->
    <div class="card" style="padding:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <div style="font-weight:700;font-size:1rem;color:var(--text-primary);">Suggestions</div>
        <span style="font-size:0.75rem;color:var(--text-muted);">{suggestions.length} shown</span>
      </div>

      {#if suggestions.length === 0}
        <div style="text-align:center;padding:1.75rem 1rem;color:var(--text-secondary);">
          Enter a target hex above or use the color picker to get matching three-color combinations.
        </div>
      {:else}
        <div style="display:flex;flex-direction:column;gap:0.625rem;">
          {#each suggestions as suggestion}
            <div style="background:var(--bg-secondary);border-radius:10px;padding:0.875rem;border:1px solid var(--border-subtle);">
              <div style="display:flex;align-items:center;gap:0.875rem;flex-wrap:wrap;">
                <div style="width:56px;height:56px;border-radius:10px;background:{suggestion.targetHex};display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-family:monospace;font-weight:700;color:{getContrastColor(suggestion.targetHex)};border:1px solid var(--border-subtle);flex-shrink:0;box-shadow:var(--shadow-sm);">
                  {suggestion.targetHex}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;flex-wrap:wrap;gap:0.375rem;">
                    {#each suggestion.colors as colorIdx, i}
                      <div style="display:flex;align-items:center;gap:0.3rem;background:var(--bg-card);padding:0.2rem 0.5rem;border-radius:6px;border:1px solid var(--border-subtle);">
                        <div style="width:20px;height:20px;border-radius:4px;background:{COLORS[colorIdx]};border:1px solid var(--border-subtle);"></div>
                        <div>
                          <div style="font-size:0.7rem;font-weight:600;color:var(--text-primary);">{COLOR_NAMES[colorIdx]}</div>
                          <div style="font-size:0.55rem;color:var(--text-muted);font-family:monospace;">{suggestion.colorHexes[i]}</div>
                        </div>
                      </div>
                    {/each}
                  </div>
                  {#if suggestion.similarity > 0}
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem;">Similarity {suggestion.similarity.toFixed(1)}%</div>
                  {/if}
                </div>
                <button onclick={() => useSuggestion(suggestion)} style="padding:0.4rem 0.875rem;border-radius:8px;border:none;background:linear-gradient(135deg,var(--accent-coral),var(--accent-pink));color:white;font-weight:600;font-size:0.7rem;cursor:pointer;flex-shrink:0;">Use This</button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @media (min-width: 768px) {
    .solver-grid { grid-template-columns: 2fr 3fr !important; }
  }
</style>
