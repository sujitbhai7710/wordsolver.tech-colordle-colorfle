<script>
  let guessInput = $state('');
  let percentageInput = $state('');
  let history = $state([]);
  let candidates = $state([]);
  let allColors = $state([]);
  let selectedGuess = $state(null);
  let displayLimit = $state(12);
  let loading = $state(true);
  let processing = $state(false);

  let colordleRuntime = $state(null);

  // Auto-load on mount
  $effect(() => {
    initSolver();
  });

  async function initSolver() {
    try {
      const mod = await import('../lib/colordle.js');
      colordleRuntime = {
        getAllColors: mod.getAllColors,
        getUniqueTargetColors: mod.getUniqueTargetColors,
        findBestCandidates: mod.findBestCandidates
      };
      allColors = mod.getAllColors();
      candidates = mod.getUniqueTargetColors();
    } catch (e) {
      console.error('Failed to load colordle runtime', e);
    } finally {
      loading = false;
    }
  }

  let filteredSuggestions = $derived.by(() => {
    if (guessInput.length < 2 || selectedGuess?.name === guessInput) return [];
    const lowerInput = guessInput.toLowerCase();
    const matches = [];
    for (const c of allColors) {
      if (c.name.toLowerCase().includes(lowerInput)) {
        matches.push(c);
        if (matches.length >= 20) break;
      }
    }
    return matches;
  });

  function handleAddStep() {
    if (!colordleRuntime || !selectedGuess || !percentageInput) return;
    const percent = parseFloat(percentageInput);
    if (isNaN(percent) || percent < 0 || percent > 100) return;
    processing = true;
    const newHistoryItem = { guess: selectedGuess, percent };
    history = [...history, newHistoryItem];
    const allTargets = colordleRuntime.getUniqueTargetColors();
    candidates = colordleRuntime.findBestCandidates(allTargets, history);
    guessInput = '';
    percentageInput = '';
    selectedGuess = null;
    processing = false;
    displayLimit = 12;
  }

  function handleReset() {
    if (!colordleRuntime) return;
    history = [];
    candidates = colordleRuntime.getUniqueTargetColors();
    guessInput = '';
    percentageInput = '';
    selectedGuess = null;
    displayLimit = 12;
  }

  function selectSuggestion(color) {
    selectedGuess = color;
    guessInput = color.name;
  }

  function removeHistoryItem(idx) {
    if (!colordleRuntime) return;
    history = history.filter((_, i) => i !== idx);
    const allTargets = colordleRuntime.getUniqueTargetColors();
    if (history.length === 0) {
      candidates = allTargets;
    } else {
      candidates = colordleRuntime.findBestCandidates(allTargets, history);
    }
  }

  function handlePercentKey(e) {
    if (e.key === 'Enter') handleAddStep();
  }
</script>

<div class="solver-wrapper">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading solver...</p>
    </div>
  {:else}
    <div class="solver-grid">
      <!-- Input Panel -->
      <div class="solver-input">
        <div class="input-header">
          <div class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div>
            <div class="input-title">Enter Guess Data</div>
            <div class="input-subtitle">Search a color, then enter the % score</div>
          </div>
        </div>

        <div class="input-fields">
          <div class="field-wrapper">
            <label class="field-label">Color Name</label>
            <input
              type="text"
              value={guessInput}
              oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
              placeholder="e.g. Flax, Sky Blue, Coral"
              class="field-input"
            />
            {#if selectedGuess}
              <div class="selected-indicator">
                <div class="selected-swatch" style="background: {selectedGuess.hex};"></div>
                <span class="selected-check">&#10003;</span>
              </div>
            {/if}
            {#if filteredSuggestions.length > 0}
              <div class="dropdown-list">
                {#each filteredSuggestions as s}
                  <button onclick={() => selectSuggestion(s)} class="dropdown-item">
                    <div class="dropdown-swatch" style="background: {s.hex};"></div>
                    <div class="dropdown-info">
                      <div class="dropdown-name">{s.name}</div>
                      <div class="dropdown-hex">{s.hex}</div>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div>
            <label class="field-label">Similarity %</label>
            <input
              type="number"
              step="0.01"
              value={percentageInput}
              oninput={(e) => percentageInput = e.target.value}
              onkeydown={handlePercentKey}
              placeholder="e.g. 50.18"
              class="field-input mono"
            />
          </div>

          <button
            onclick={handleAddStep}
            disabled={!selectedGuess || !percentageInput || processing}
            class="filter-btn"
          >
            {processing ? 'Calculating...' : 'Filter Results'}
          </button>
        </div>
      </div>

      <!-- History -->
      {#if history.length > 0}
        <div class="history-panel">
          <div class="panel-header">
            <span class="panel-title">Guess History</span>
            <button onclick={handleReset} class="reset-btn">Reset All</button>
          </div>
          <div class="history-list">
            {#each history as item, idx}
              <div class="history-item">
                <div class="history-item-left">
                  <div class="history-color-wrap">
                    <div class="history-swatch" style="background: {item.guess.hex};"></div>
                    <span class="history-idx">{idx + 1}</span>
                  </div>
                  <div>
                    <div class="history-name">{item.guess.name}</div>
                    <div class="history-hex">{item.guess.hex}</div>
                  </div>
                </div>
                <div class="history-item-right">
                  <span class="history-percent">{item.percent}%</span>
                  <button onclick={() => removeHistoryItem(idx)} class="remove-btn">&times;</button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Candidates -->
      <div class="candidates-panel">
        <div class="panel-header">
          <div class="candidates-header-left">
            <div class="candidates-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="panel-title">Possible Solutions</div>
              <div class="panel-subtitle">Click a color to use as next guess</div>
            </div>
          </div>
          <span class="count-badge">{candidates.length}</span>
        </div>

        {#if candidates.length === 0}
          <div class="no-results">
            <p>No matches found</p>
            <span>Double-check your percentages or reset</span>
            <button onclick={handleReset} class="reset-link">Reset Solver</button>
          </div>
        {:else}
          <div class="candidates-grid">
            {#each candidates.slice(0, displayLimit) as c}
              <button onclick={() => selectSuggestion(c)} class="candidate-card">
                <div class="candidate-swatch" style="background: {c.hex};"></div>
                <div class="candidate-name">{c.name}</div>
                <div class="candidate-hex">{c.hex}</div>
              </button>
            {/each}
          </div>
          {#if displayLimit < candidates.length}
            <div class="show-more">
              <button onclick={() => displayLimit += 20} class="show-more-btn">
                Show More ({candidates.length - displayLimit} remaining)
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 1rem;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border-subtle);
    border-top-color: var(--accent-teal);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-state p { font-size: 0.85rem; color: var(--text-muted); }

  .solver-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .solver-grid { grid-template-columns: 2fr 3fr; }
  }

  .solver-input, .history-panel, .candidates-panel {
    background: #fff;
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .input-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  .input-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--accent-teal);
    display: flex; align-items: center; justify-content: center;
  }

  .input-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
  .input-subtitle { font-size: 0.7rem; color: var(--text-muted); }

  .input-fields { display: flex; flex-direction: column; gap: 0.75rem; }

  .field-wrapper { position: relative; }
  .field-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); display: block; margin-bottom: 0.3rem; }

  .field-input {
    width: 100%;
    background: var(--bg-muted);
    border: 2px solid var(--border-subtle);
    border-radius: 10px;
    padding: 0.6rem 0.875rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .field-input:focus { border-color: var(--accent-primary); }
  .field-input.mono { font-family: var(--font-body); }

  .selected-indicator {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    display: flex; align-items: center; gap: 4px;
  }

  .selected-swatch { width: 20px; height: 20px; border-radius: 5px; border: 1px solid var(--border-subtle); }
  .selected-check { color: var(--accent-teal); font-size: 0.8rem; }

  .dropdown-list {
    position: absolute; z-index: 30; width: 100%; margin-top: 4px;
    background: #fff; border: 1px solid var(--border-subtle); border-radius: 10px;
    max-height: 220px; overflow-y: auto;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }

  .dropdown-item {
    width: 100%; text-align: left; padding: 0.5rem 0.875rem;
    display: flex; align-items: center; gap: 0.625rem;
    border: none; background: transparent; cursor: pointer; color: var(--text-primary);
    border-bottom: 1px solid var(--bg-muted); transition: background 0.1s;
  }

  .dropdown-item:hover { background: var(--bg-muted); }
  .dropdown-swatch { width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--border-subtle); flex-shrink: 0; }
  .dropdown-name { font-size: 0.8rem; font-weight: 600; }
  .dropdown-hex { font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-body); }

  .filter-btn {
    width: 100%; padding: 0.7rem; border-radius: 10px; border: none;
    font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
  }

  .filter-btn:not(:disabled) {
    background: var(--accent-teal); color: white;
  }

  .filter-btn:disabled { background: var(--bg-muted); color: var(--text-muted); cursor: not-allowed; }

  .panel-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;
  }

  .panel-title { font-weight: 700; font-size: 0.8rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.08em; }
  .panel-subtitle { font-size: 0.7rem; color: var(--text-muted); }
  .reset-btn { font-size: 0.7rem; font-weight: 600; color: var(--accent-primary); background: none; border: none; cursor: pointer; }

  .history-list { display: flex; flex-direction: column; gap: 4px; }

  .history-item {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--bg-muted); border-radius: 8px; padding: 0.5rem 0.875rem; border: 1px solid var(--border-subtle);
  }

  .history-item-left { display: flex; align-items: center; gap: 0.625rem; }
  .history-color-wrap { position: relative; }
  .history-swatch { width: 32px; height: 32px; border-radius: 7px; border: 1px solid var(--border-subtle); }
  .history-idx {
    position: absolute; top: -4px; left: -4px;
    width: 15px; height: 15px; border-radius: 50%;
    background: var(--accent-primary); color: white; font-size: 8px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  .history-name { font-weight: 600; font-size: 0.8rem; color: var(--text-primary); }
  .history-hex { font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-body); }

  .history-item-right { display: flex; align-items: center; gap: 0.375rem; }
  .history-percent {
    font-family: var(--font-body); font-size: 0.8rem; font-weight: 700; color: var(--accent-teal);
    background: rgba(20,184,166,0.08); padding: 0.15rem 0.5rem;
    border-radius: 5px; border: 1px solid rgba(20,184,166,0.12);
  }

  .remove-btn {
    background: none; border: none; color: var(--text-muted); cursor: pointer;
    font-size: 0.75rem; padding: 4px; opacity: 0.5; transition: opacity 0.15s;
  }

  .remove-btn:hover { opacity: 1; }

  .candidates-header-left { display: flex; align-items: center; gap: 0.625rem; }

  .candidates-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--accent-teal);
    display: flex; align-items: center; justify-content: center;
  }

  .count-badge {
    padding: 0.2rem 0.625rem; border-radius: 9999px;
    font-size: 0.75rem; font-weight: 700; font-family: var(--font-body);
  }

  .no-results { text-align: center; padding: 2rem 1rem; }
  .no-results p { font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-primary); }
  .no-results span { font-size: 0.85rem; color: var(--text-muted); }
  .reset-link { display: inline-block; margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600; color: var(--accent-primary); background: none; border: none; cursor: pointer; }

  .candidates-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.5rem;
  }

  .candidate-card {
    background: #fff; border: 1px solid var(--border-subtle); border-radius: 10px;
    padding: 0.5rem; cursor: pointer; text-align: center;
    transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .candidate-card:hover {
    border-color: var(--accent-primary); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  }

  .candidate-swatch {
    width: 100%; aspect-ratio: 1; border-radius: 8px; margin-bottom: 0.25rem; border: 1px solid var(--border-subtle);
  }

  .candidate-name { font-size: 0.7rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .candidate-hex { font-size: 0.6rem; color: var(--text-muted); font-family: var(--font-body); }

  .show-more { text-align: center; margin-top: 0.75rem; }
  .show-more-btn {
    padding: 0.4rem 1rem; border-radius: 8px; background: #fff;
    border: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: 0.75rem;
    font-weight: 600; cursor: pointer;
  }
</style>
