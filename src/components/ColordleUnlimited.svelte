<script>
  let colordleRuntime = $state(null);
  let allColors = $state([]);
  let targetColor = $state(null);
  let guessInput = $state('');
  let guesses = $state([]);
  let filteredSuggestions = $state([]);
  let selectedGuess = $state(null);
  let gameOver = $state(false);
  let gameStarted = $state(false);
  let loading = $state(false);

  async function startGame() {
    gameStarted = true;
    loading = true;
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
        if (matches.length >= 10) break;
      }
    }
    return matches;
  });

  function submitGuess() {
    if (!selectedGuess || !targetColor || !colordleRuntime) return;
    const guessRgb = colordleRuntime.hexToRgb(selectedGuess.hex);
    const targetRgb = colordleRuntime.hexToRgb(targetColor.hex);
    if (!guessRgb || !targetRgb) return;
    const percent = Math.round(colordleRuntime.colorDiff(guessRgb, targetRgb) * 100) / 100;
    const newGuess = { guess: selectedGuess, percent };
    guesses = [...guesses, newGuess];
    guessInput = '';
    selectedGuess = null;
    if (percent === 100) {
      gameOver = true;
    }
  }
</script>

<div>
  {#if !gameStarted}
    <div style="text-align:center;padding:2.5rem 1rem;">
      <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--accent-indigo),var(--accent-violet));margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="4.5"/><circle cx="17.5" cy="15.5" r="4.5"/><circle cx="8.5" cy="15.5" r="4.5"/></svg>
      </div>
      <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem;color:var(--text-primary);">Colordle Unlimited</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.25rem;max-width:420px;margin-left:auto;margin-right:auto;font-size:0.925rem;">Play Colordle as many times as you want. A random target color is picked each round. Type color names and try to hit 100%.</p>
      <button onclick={startGame} class="btn btn-primary">Start Playing</button>
    </div>
  {:else if loading}
    <div style="text-align:center;padding:2.5rem;">
      <div style="width:40px;height:40px;border:3px solid var(--border-subtle);border-top-color:var(--accent-indigo);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto;"></div>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;" class="game-grid">
      <!-- Target Color -->
      <div class="card" style="text-align:center;padding:1.75rem;">
        <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--accent-indigo);margin-bottom:0.625rem;">Target Color</div>
        <div style="width:88px;height:88px;border-radius:50%;margin:0 auto 0.75rem;background:{targetColor.hex};border:3px solid var(--border-subtle);box-shadow:var(--shadow-md);"></div>
        <div style="font-family:monospace;font-size:0.85rem;color:var(--text-muted);">{targetColor.hex}</div>
        {#if gameOver}
          <div style="margin-top:0.5rem;font-size:1.1rem;font-weight:800;color:var(--accent-emerald);">{targetColor.name}</div>
        {/if}
      </div>

      <!-- Guess Input + History -->
      <div>
        <div class="card" style="padding:1.25rem;margin-bottom:0.75rem;">
          {#if !gameOver}
            <div style="position:relative;margin-bottom:0.625rem;">
              <input
                type="text"
                value={guessInput}
                oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
                placeholder="Type a color name..."
                style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.625rem 0.875rem;color:var(--text-primary);font-size:0.875rem;outline:none;transition:border-color 0.2s;"
                onfocus={(e) => e.target.style.borderColor='var(--accent-indigo)'}
                onblur={(e) => e.target.style.borderColor='var(--border-subtle)'}
              />
              {#if liveSuggestions.length > 0}
                <div style="position:absolute;z-index:30;width:100%;margin-top:4px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:10px;max-height:180px;overflow-y:auto;box-shadow:var(--shadow-lg);">
                  {#each liveSuggestions as s}
                    <button
                      onclick={() => { selectedGuess = s; guessInput = s.name; }}
                      style="width:100%;text-align:left;padding:0.4rem 0.875rem;display:flex;align-items:center;gap:0.5rem;border:none;background:transparent;cursor:pointer;color:var(--text-primary);border-bottom:1px solid var(--border-subtle);"
                    >
                      <div style="width:18px;height:18px;border-radius:4px;background:{s.hex};border:1px solid var(--border-subtle);"></div>
                      <span style="font-size:0.8rem;">{s.name}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            <button onclick={submitGuess} disabled={!selectedGuess} style="width:100%;padding:0.625rem;border-radius:10px;border:none;font-weight:700;font-size:0.875rem;cursor:pointer;background:{selectedGuess ? 'linear-gradient(135deg,var(--accent-indigo),var(--accent-teal))' : 'var(--bg-secondary)'};color:{selectedGuess ? 'white' : 'var(--text-muted)'};transition:all 0.2s;">
              Submit Guess
            </button>
          {:else}
            <div style="text-align:center;">
              <div style="font-weight:800;font-size:1rem;margin-bottom:0.25rem;color:var(--text-primary);">You got it in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</div>
              <button onclick={newGame} class="btn btn-primary" style="margin-top:0.75rem;">Play Again</button>
            </div>
          {/if}
        </div>

        <!-- Guess History -->
        {#if guesses.length > 0}
          <div class="card" style="padding:1.25rem;">
            <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);margin-bottom:0.625rem;">Your Guesses</div>
            <div style="display:flex;flex-direction:column;gap:0.3rem;">
              {#each guesses as item, idx}
                <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-radius:8px;padding:0.5rem 0.875rem;border:1px solid var(--border-subtle);">
                  <div style="display:flex;align-items:center;gap:0.625rem;">
                    <div style="width:28px;height:28px;border-radius:6px;background:{item.guess.hex};border:1px solid var(--border-subtle);"></div>
                    <span style="font-weight:600;font-size:0.8rem;color:var(--text-primary);">{item.guess.name}</span>
                  </div>
                  <span style="font-family:monospace;font-size:0.8rem;font-weight:700;color:{item.percent === 100 ? 'var(--accent-emerald)' : item.percent >= 85 ? 'var(--accent-teal)' : item.percent >= 60 ? '#eab308' : 'var(--text-muted)'};">
                    {item.percent}%
                  </span>
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
