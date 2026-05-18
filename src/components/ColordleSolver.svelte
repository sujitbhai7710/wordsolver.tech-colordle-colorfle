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
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:360px;text-align:center;gap:1.25rem;">
      <div style="max-width:460px;">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--accent-indigo);margin-bottom:0.5rem;">Color Data On Demand</div>
        <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.625rem;color:var(--text-primary);">Start the Colordle Solver</h2>
        <p style="color:var(--text-secondary);line-height:1.7;font-size:0.925rem;">The full color database loads after you open the tool, keeping the initial page view fast and lightweight.</p>
      </div>
      <button onclick={startSolver} class="btn btn-primary">Start Solver</button>
    </div>
  {:else if loading}
    <div style="display:flex;justify-content:center;align-items:center;min-height:360px;">
      <div style="width:40px;height:40px;border:3px solid var(--border-subtle);border-top-color:var(--accent-indigo);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;" class="solver-grid">
      <!-- Input Panel -->
      <div class="card" style="padding:1.25rem;">
        <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:1rem;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent-teal),var(--accent-sky));display:flex;align-items:center;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div>
            <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">Enter Guess Data</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Search a color, then enter the % score</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.875rem;">
          <div style="position:relative;">
            <label style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:0.3rem;">Color Name</label>
            <input
              type="text"
              value={guessInput}
              oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
              placeholder="e.g. Flax, Sky Blue, Coral"
              style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.625rem 0.875rem;color:var(--text-primary);font-size:0.875rem;outline:none;transition:border-color 0.2s;"
              onfocus={(e) => e.target.style.borderColor='var(--accent-indigo)'}
              onblur={(e) => e.target.style.borderColor='var(--border-subtle)'}
            />
            {#if selectedGuess}
              <div style="position:absolute;right:10px;top:50%;display:flex;align-items:center;gap:4px;">
                <div style="width:20px;height:20px;border-radius:5px;background:{selectedGuess.hex};border:1px solid var(--border-subtle);"></div>
                <span style="color:var(--accent-teal);font-size:0.8rem;">&#10003;</span>
              </div>
            {/if}
            {#if filteredSuggestions.length > 0}
              <div style="position:absolute;z-index:30;width:100%;margin-top:4px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:10px;max-height:220px;overflow-y:auto;box-shadow:var(--shadow-lg);">
                {#each filteredSuggestions as s}
                  <button
                    onclick={() => selectSuggestion(s)}
                    style="width:100%;text-align:left;padding:0.5rem 0.875rem;display:flex;align-items:center;gap:0.625rem;border:none;background:transparent;cursor:pointer;color:var(--text-primary);border-bottom:1px solid var(--border-subtle);transition:background 0.15s;"
                    onmouseover={(e) => e.currentTarget.style.background='var(--bg-secondary)'}
                    onmouseout={(e) => e.currentTarget.style.background='transparent'}
                  >
                    <div style="width:24px;height:24px;border-radius:5px;background:{s.hex};border:1px solid var(--border-subtle);flex-shrink:0;"></div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:0.8rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{s.name}</div>
                      <div style="font-size:0.65rem;color:var(--text-muted);font-family:monospace;">{s.hex}</div>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div>
            <label style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:0.3rem;">Similarity %</label>
            <input
              type="number"
              step="0.01"
              value={percentageInput}
              oninput={(e) => percentageInput = e.target.value}
              placeholder="e.g. 50.18"
              style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.625rem 0.875rem;color:var(--text-primary);font-size:0.875rem;font-family:monospace;outline:none;transition:border-color 0.2s;"
              onfocus={(e) => e.target.style.borderColor='var(--accent-indigo)'}
              onblur={(e) => e.target.style.borderColor='var(--border-subtle)'}
              onkeydown={(e) => { if (e.key === 'Enter') handleAddStep(); }}
            />
          </div>

          <button
            onclick={handleAddStep}
            disabled={!selectedGuess || !percentageInput || processing}
            style="width:100%;padding:0.75rem;border-radius:10px;border:none;font-weight:700;font-size:0.875rem;cursor:pointer;transition:all 0.2s;background:{selectedGuess && percentageInput ? 'linear-gradient(135deg,var(--accent-teal),var(--accent-sky))' : 'var(--bg-secondary)'};color:{selectedGuess && percentageInput ? 'white' : 'var(--text-muted)'};"
          >
            {processing ? 'Calculating...' : 'Filter Results'}
          </button>
        </div>
      </div>

      <!-- History -->
      {#if history.length > 0}
        <div class="card" style="padding:1.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);">Guess History</div>
            <button onclick={handleReset} style="font-size:0.7rem;font-weight:600;color:#ef4444;background:none;border:none;cursor:pointer;">Reset All</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.375rem;">
            {#each history as item, idx}
              <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-radius:8px;padding:0.625rem 0.875rem;border:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:0.625rem;">
                  <div style="position:relative;">
                    <div style="width:32px;height:32px;border-radius:7px;background:{item.guess.hex};border:1px solid var(--border-subtle);"></div>
                    <span style="position:absolute;top:-4px;left:-4px;width:15px;height:15px;border-radius:50%;background:var(--accent-indigo);color:white;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;">{idx + 1}</span>
                  </div>
                  <div>
                    <div style="font-weight:600;font-size:0.8rem;color:var(--text-primary);">{item.guess.name}</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);font-family:monospace;">{item.guess.hex}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.375rem;">
                  <span style="font-family:monospace;font-size:0.8rem;font-weight:700;color:var(--accent-teal);background:rgba(20,184,166,0.08);padding:0.15rem 0.5rem;border-radius:5px;border:1px solid rgba(20,184,166,0.12);">{item.percent}%</span>
                  <button onclick={() => removeHistoryItem(idx)} style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.75rem;opacity:0.5;padding:4px;" onmouseover={(e) => e.target.style.opacity='1'} onmouseout={(e) => e.target.style.opacity='0.5'}>&times;</button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Candidates -->
      <div class="card" style="padding:1.25rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <div style="display:flex;align-items:center;gap:0.625rem;">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent-teal),var(--accent-sky));display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">Possible Solutions</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Click a color to use it as next guess</div>
            </div>
          </div>
          <span style="padding:0.2rem 0.625rem;border-radius:9999px;font-size:0.75rem;font-weight:700;font-family:monospace;background:{candidates.length <= 10 ? 'rgba(20,184,166,0.08)' : 'var(--bg-secondary)'};color:{candidates.length <= 10 ? 'var(--accent-teal)' : 'var(--text-muted)'};border:1px solid {candidates.length <= 10 ? 'rgba(20,184,166,0.12)' : 'var(--border-subtle)'};">{candidates.length}</span>
        </div>

        {#if candidates.length === 0}
          <div style="text-align:center;padding:2.5rem 1rem;">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;">No matches found</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">Double-check your percentages or reset</div>
            <button onclick={handleReset} style="margin-top:0.75rem;font-size:0.8rem;font-weight:600;color:var(--accent-indigo);background:none;border:none;cursor:pointer;">Reset Solver</button>
          </div>
        {:else}
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.625rem;">
            {#each candidates.slice(0, displayLimit) as c}
              <button
                onclick={() => selectSuggestion(c)}
                style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:10px;padding:0.625rem;cursor:pointer;text-align:center;transition:all 0.2s;box-shadow:var(--shadow-xs);"
                onmouseover={(e) => { e.currentTarget.style.borderColor='var(--accent-indigo)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
                onmouseout={(e) => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-xs)'; }}
              >
                <div style="width:100%;aspect-ratio:1;border-radius:8px;background:{c.hex};margin-bottom:0.375rem;border:1px solid var(--border-subtle);"></div>
                <div style="font-size:0.7rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-primary);">{c.name}</div>
                <div style="font-size:0.6rem;color:var(--text-muted);font-family:monospace;">{c.hex}</div>
              </button>
            {/each}
          </div>
          {#if displayLimit < candidates.length}
            <div style="text-align:center;margin-top:0.875rem;">
              <button onclick={() => displayLimit += 20} style="padding:0.4rem 1rem;border-radius:8px;background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-secondary);font-size:0.75rem;font-weight:600;cursor:pointer;box-shadow:var(--shadow-xs);">
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
