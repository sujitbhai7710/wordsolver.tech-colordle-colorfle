<script>
  let guessInput = $state('');
  let percentageInput = $state('');
  let history = $state([]);
  let candidates = $state([]);
  let allColors = $state([]);
  let suggestions = $state([]);
  let selectedGuess = $state(null);
  let displayLimit = $state(12);
  let solverStarted = $state(false);
  let loading = $state(false);
  let processing = $state(false);

  let colordleRuntime = $state(null);

  async function startSolver() {
    solverStarted = true;
    loading = true;
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
</script>

<div class="solver-wrapper">
  {#if !solverStarted}
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;gap:1.5rem;">
      <div style="max-width:500px;">
        <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:var(--accent-teal);margin-bottom:0.5rem;">Color Data On Demand</div>
        <h2 style="font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;">Start the Colordle Solver</h2>
        <p style="color:var(--text-secondary);line-height:1.7;">The full color database loads after you open the tool, keeping the initial page view fast and lightweight.</p>
      </div>
      <button onclick={startSolver} class="btn btn-primary">Start Solver</button>
    </div>
  {:else if loading}
    <div style="display:flex;justify-content:center;align-items:center;min-height:400px;">
      <div style="width:48px;height:48px;border:3px solid var(--border-subtle);border-top-color:var(--accent-teal);border-radius:50%;animation:spin 1s linear infinite;"></div>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;" class="solver-grid">
      <!-- Input Panel -->
      <div class="card" style="padding:1.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#14b8a6,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:1.25rem;">🔍</div>
          <div>
            <div style="font-weight:800;font-size:1rem;">Enter Guess Data</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Search a color, then enter the % score</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem;">
          <div style="position:relative;">
            <label style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:0.4rem;">Color Name</label>
            <input
              type="text"
              value={guessInput}
              oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
              placeholder="e.g. Flax, Sky Blue, Coral"
              style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.75rem 1rem;color:var(--text-primary);font-size:0.9rem;outline:none;"
            />
            {#if selectedGuess}
              <div style="position:absolute;right:12px;top:50%;display:flex;align-items:center;gap:4px;">
                <div style="width:24px;height:24px;border-radius:6px;background:{selectedGuess.hex};border:2px solid rgba(255,255,255,0.1);"></div>
                <span style="color:var(--accent-teal);">&#10003;</span>
              </div>
            {/if}
            {#if filteredSuggestions.length > 0}
              <div style="position:absolute;z-index:30;width:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;max-height:240px;overflow-y:auto;">
                {#each filteredSuggestions as s}
                  <button
                    onclick={() => selectSuggestion(s)}
                    style="width:100%;text-align:left;padding:0.6rem 1rem;display:flex;align-items:center;gap:0.75rem;border:none;background:transparent;cursor:pointer;color:var(--text-primary);border-bottom:1px solid var(--border-subtle);"
                  >
                    <div style="width:28px;height:28px;border-radius:6px;background:{s.hex};border:1px solid rgba(255,255,255,0.1);flex-shrink:0;"></div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:0.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{s.name}</div>
                      <div style="font-size:0.7rem;color:var(--text-muted);font-family:monospace;">{s.hex}</div>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div>
            <label style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:0.4rem;">Similarity %</label>
            <input
              type="number"
              step="0.01"
              value={percentageInput}
              oninput={(e) => percentageInput = e.target.value}
              placeholder="e.g. 50.18"
              style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.75rem 1rem;color:var(--text-primary);font-size:0.9rem;font-family:monospace;outline:none;"
              onkeydown={(e) => { if (e.key === 'Enter') handleAddStep(); }}
            />
          </div>

          <button
            onclick={handleAddStep}
            disabled={!selectedGuess || !percentageInput || processing}
            style="width:100%;padding:0.85rem;border-radius:10px;border:none;font-weight:700;font-size:0.9rem;cursor:pointer;transition:all 0.2s;background:{selectedGuess && percentageInput ? 'linear-gradient(135deg,#14b8a6,#3b82f6)' : 'var(--bg-card)'};color:{selectedGuess && percentageInput ? 'white' : 'var(--text-muted)'};"
          >
            {processing ? 'Calculating...' : 'Filter Results'}
          </button>
        </div>
      </div>

      <!-- History -->
      {#if history.length > 0}
        <div class="card" style="padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);">Guess History</div>
            <button onclick={handleReset} style="font-size:0.75rem;font-weight:600;color:#ef4444;background:none;border:none;cursor:pointer;">Reset All</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            {#each history as item, idx}
              <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-radius:10px;padding:0.75rem 1rem;">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <div style="position:relative;">
                    <div style="width:36px;height:36px;border-radius:8px;background:{item.guess.hex};border:2px solid rgba(255,255,255,0.1);"></div>
                    <span style="position:absolute;top:-4px;left:-4px;width:16px;height:16px;border-radius:50%;background:var(--text-primary);color:var(--bg-primary);font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;">{idx + 1}</span>
                  </div>
                  <div>
                    <div style="font-weight:600;font-size:0.85rem;">{item.guess.name}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);font-family:monospace;">{item.guess.hex}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <span style="font-family:monospace;font-size:0.85rem;font-weight:700;color:var(--accent-teal);background:rgba(20,184,166,0.1);padding:0.2rem 0.6rem;border-radius:6px;">{item.percent}%</span>
                  <button onclick={() => removeHistoryItem(idx)} style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem;opacity:0.5;" onmouseover={(e) => e.target.style.opacity='1'} onmouseout={(e) => e.target.style.opacity='0.5'}>&times;</button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Candidates -->
      <div class="card" style="padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#14b8a6,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:1.25rem;">&#10003;</div>
            <div>
              <div style="font-weight:800;font-size:1rem;">Possible Solutions</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Click a color to use it as next guess</div>
            </div>
          </div>
          <span style="padding:0.3rem 0.8rem;border-radius:9999px;font-size:0.8rem;font-weight:700;font-family:monospace;background:{candidates.length <= 10 ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.05)'};color:{candidates.length <= 10 ? 'var(--accent-teal)' : 'var(--text-muted)'};">{candidates.length}</span>
        </div>

        {#if candidates.length === 0}
          <div style="text-align:center;padding:3rem 1rem;">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🎨</div>
            <div style="font-weight:600;color:var(--text-secondary);">No matching colors found</div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Double-check your percentages or reset</div>
            <button onclick={handleReset} style="margin-top:1rem;font-size:0.8rem;font-weight:600;color:var(--accent-teal);background:none;border:none;cursor:pointer;">Reset Solver</button>
          </div>
        {:else}
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.75rem;">
            {#each candidates.slice(0, displayLimit) as c}
              <button
                onclick={() => selectSuggestion(c)}
                style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.75rem;cursor:pointer;text-align:center;transition:all 0.2s;"
                onmouseover={(e) => { e.currentTarget.style.borderColor='rgba(20,184,166,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onmouseout={(e) => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.transform='none'; }}
              >
                <div style="width:100%;aspect-ratio:1;border-radius:8px;background:{c.hex};margin-bottom:0.5rem;border:1px solid rgba(255,255,255,0.05);"></div>
                <div style="font-size:0.75rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{c.name}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);font-family:monospace;">{c.hex}</div>
              </button>
            {/each}
          </div>
          {#if displayLimit < candidates.length}
            <div style="text-align:center;margin-top:1rem;">
              <button onclick={() => displayLimit += 20} style="padding:0.5rem 1.25rem;border-radius:8px;background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-secondary);font-size:0.8rem;font-weight:600;cursor:pointer;">
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (min-width: 768px) {
    .solver-grid { grid-template-columns: 2fr 3fr !important; }
  }
</style>
