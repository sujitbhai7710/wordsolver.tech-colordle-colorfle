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
    <div style="text-align:center;padding:3rem 1rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">🎨</div>
      <h2 style="font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;">Colordle Unlimited</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;max-width:480px;margin-left:auto;margin-right:auto;">Play Colordle as many times as you want. A random target color is picked each round. Type color names and try to hit 100%.</p>
      <button onclick={startGame} class="btn btn-primary">Start Playing</button>
    </div>
  {:else if loading}
    <div style="text-align:center;padding:3rem;">
      <div style="width:48px;height:48px;border:3px solid var(--border-subtle);border-top-color:var(--accent-purple);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;" class="game-grid">
      <!-- Target Color -->
      <div class="card" style="text-align:center;padding:2rem;">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:var(--accent-purple);margin-bottom:0.75rem;">Target Color</div>
        <div style="width:100px;height:100px;border-radius:50%;margin:0 auto 1rem;background:{targetColor.hex};border:3px solid rgba(255,255,255,0.1);box-shadow:0 0 30px {targetColor.hex}44;"></div>
        <div style="font-family:monospace;font-size:0.9rem;color:var(--text-muted);">{targetColor.hex}</div>
        {#if gameOver}
          <div style="margin-top:0.75rem;font-size:1.25rem;font-weight:800;color:var(--accent-teal);">{targetColor.name}</div>
        {/if}
      </div>

      <!-- Guess Input + History -->
      <div>
        <div class="card" style="padding:1.5rem;margin-bottom:1rem;">
          {#if !gameOver}
            <div style="position:relative;margin-bottom:0.75rem;">
              <input
                type="text"
                value={guessInput}
                oninput={(e) => { guessInput = e.target.value; if (selectedGuess && e.target.value !== selectedGuess.name) selectedGuess = null; }}
                placeholder="Type a color name..."
                style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:0.75rem 1rem;color:var(--text-primary);font-size:0.9rem;outline:none;"
              />
              {#if liveSuggestions.length > 0}
                <div style="position:absolute;z-index:30;width:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;max-height:200px;overflow-y:auto;">
                  {#each liveSuggestions as s}
                    <button
                      onclick={() => { selectedGuess = s; guessInput = s.name; }}
                      style="width:100%;text-align:left;padding:0.5rem 1rem;display:flex;align-items:center;gap:0.5rem;border:none;background:transparent;cursor:pointer;color:var(--text-primary);"
                    >
                      <div style="width:20px;height:20px;border-radius:4px;background:{s.hex};border:1px solid rgba(255,255,255,0.1);"></div>
                      <span style="font-size:0.85rem;">{s.name}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            <button onclick={submitGuess} disabled={!selectedGuess} style="width:100%;padding:0.75rem;border-radius:10px;border:none;font-weight:700;font-size:0.9rem;cursor:pointer;background:{selectedGuess ? 'linear-gradient(135deg,#8b5cf6,#14b8a6)' : 'var(--bg-card)'};color:{selectedGuess ? 'white' : 'var(--text-muted)'};">
              Submit Guess
            </button>
          {:else}
            <div style="text-align:center;">
              <div style="font-size:1.5rem;margin-bottom:0.5rem;">🎉</div>
              <div style="font-weight:800;font-size:1.1rem;margin-bottom:0.25rem;">You got it in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</div>
              <button onclick={newGame} class="btn btn-primary" style="margin-top:1rem;">Play Again</button>
            </div>
          {/if}
        </div>

        <!-- Guess History -->
        {#if guesses.length > 0}
          <div class="card" style="padding:1.5rem;">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:0.75rem;">Your Guesses</div>
            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              {#each guesses as item, idx}
                <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-radius:8px;padding:0.6rem 1rem;">
                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="width:32px;height:32px;border-radius:6px;background:{item.guess.hex};border:1px solid rgba(255,255,255,0.1);"></div>
                    <span style="font-weight:600;font-size:0.85rem;">{item.guess.name}</span>
                  </div>
                  <span style="font-family:monospace;font-size:0.85rem;font-weight:700;color:{item.percent === 100 ? 'var(--accent-teal)' : item.percent >= 85 ? 'var(--accent-teal)' : item.percent >= 60 ? '#eab308' : 'var(--text-muted)'};">
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
