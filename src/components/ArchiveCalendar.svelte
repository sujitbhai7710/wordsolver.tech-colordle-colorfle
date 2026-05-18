<script>
  import { getTargetColors } from '../lib/colordle.js';
  import { getPuzzleAnswer, COLOR_NAMES, COLORS, WEIGHTS } from '../lib/colorfle.js';

  let {
    gameName = 'Puzzle',
    gameColor = 'teal',
    gameType = 'colordle', // 'colordle' or 'colorfle'
    startDate = new Date('2024-01-01'),
    today = new Date(),
  } = $props();

  let currentMonth = $state(new Date(today.getFullYear(), today.getMonth(), 1));
  let selectedDate = $state(null);
  let selectedAnswer = $state(null);
  let answerRevealed = $state(false);
  let viewMode = $state('calendar');
  let searchQuery = $state('');

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const colorThemes = {
    teal: { primary: '#0D7C66', primaryLight: 'rgba(13,124,102,0.06)', primaryMid: 'rgba(13,124,102,0.12)', primaryBorder: 'rgba(13,124,102,0.2)' },
    pink: { primary: '#BE3A6B', primaryLight: 'rgba(190,58,107,0.06)', primaryMid: 'rgba(190,58,107,0.12)', primaryBorder: 'rgba(190,58,107,0.2)' },
    blue: { primary: '#1B4965', primaryLight: 'rgba(27,73,101,0.06)', primaryMid: 'rgba(27,73,101,0.12)', primaryBorder: 'rgba(27,73,101,0.2)' },
  };

  let theme = $derived(colorThemes[gameColor] || colorThemes.teal);

  // Pre-compute colordle targets once
  let colordleTargets = $derived.by(() => {
    if (gameType !== 'colordle') return [];
    return getTargetColors();
  });

  let calendarDays = $derived.by(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, date: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateKey = formatDateKey(date);
      const isFuture = date > today;
      const isToday = dateKey === formatDateKey(today);
      const isAfterStart = date >= startDate;
      days.push({
        day: d,
        currentMonth: true,
        date: isAfterStart && !isFuture ? date : null,
        dateKey: isAfterStart && !isFuture ? dateKey : null,
        isToday,
        isFuture,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: null });
    }

    return days;
  });

  let allPuzzles = $derived.by(() => {
    const puzzles = [];
    const d = new Date(startDate);
    while (d <= today) {
      const dateKey = formatDateKey(d);
      puzzles.push({
        date: new Date(d),
        dateKey,
        formatted: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        dayNum: puzzles.length + 1,
      });
      d.setDate(d.getDate() + 1);
    }
    return puzzles.reverse();
  });

  let filteredPuzzles = $derived.by(() => {
    if (!searchQuery.trim()) return allPuzzles.slice(0, 60);
    const q = searchQuery.toLowerCase();
    return allPuzzles.filter(p =>
      p.formatted.toLowerCase().includes(q) || String(p.dayNum).includes(q)
    ).slice(0, 60);
  });

  let availableMonths = $derived.by(() => {
    const months = [];
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 1);
    while (d <= end) {
      months.push({ label: MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear(), date: new Date(d) });
      d.setMonth(d.getMonth() + 1);
    }
    return months.reverse();
  });

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function prevMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }

  function nextMonth() {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      currentMonth = next;
    }
  }

  function goToMonth(date) {
    currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function computeAnswer(dateKey) {
    if (gameType === 'colordle') {
      return computeColordleAnswer(dateKey);
    } else if (gameType === 'colorfle') {
      return computeColorfleAnswer(dateKey);
    }
    return null;
  }

  function computeColordleAnswer(dateKey) {
    try {
      const date = new Date(dateKey + 'T12:00:00Z');
      const sd = new Date('2024-01-01T12:00:00Z');
      const dayNum = Math.floor((date.getTime() - sd.getTime()) / 86400000);
      const color = colordleTargets[Math.abs(dayNum) % colordleTargets.length];
      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      return {
        html: `
          <div style="text-align:center;">
            <div style="width:110px;height:110px;border-radius:50%;margin:0 auto 1rem;border:3px solid var(--border-subtle);box-shadow:var(--shadow-lg);display:flex;align-items:center;justify-content:center;background:${color.hex};font-size:0.85rem;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.3);">${color.name}</div>
            <div style="font-size:1.5rem;font-weight:800;margin-bottom:0.375rem;color:var(--text-primary);">${color.name}</div>
            <div style="font-family:monospace;font-size:0.9rem;color:var(--text-muted);margin-bottom:0.25rem;">${color.hex}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">Puzzle #${dayNum} &middot; ${formattedDate}</div>
          </div>
        `,
      };
    } catch (e) {
      console.error('Error computing colordle answer:', e);
      return null;
    }
  }

  function computeColorfleAnswer(dateKey) {
    try {
      const date = new Date(dateKey + 'T12:00:00Z');
      const answer = getPuzzleAnswer(date, 0);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const colorBlocks = answer.colors.map((idx, i) => {
        const name = answer.colorNames[i];
        const hex = answer.colorHexes[i];
        const weight = WEIGHTS[0][i];
        return `<div style="text-align:center;">
          <div style="width:56px;height:56px;border-radius:12px;background:${hex};border:2px solid var(--border-subtle);margin:0 auto 0.375rem;box-shadow:var(--shadow-sm);"></div>
          <div style="font-weight:700;font-size:0.85rem;color:var(--text-primary);">${name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);font-family:monospace;">${hex}</div>
          <div style="margin-top:0.25rem;padding:0.15rem 0.5rem;border-radius:6px;background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.12);font-size:0.65rem;font-weight:700;color:var(--accent-pink);display:inline-block;">
            ${Math.round(weight * 100)}%
          </div>
        </div>`;
      }).join('');

      return {
        html: `
          <div style="text-align:center;">
            <div style="width:110px;height:110px;border-radius:50%;margin:0 auto 1rem;border:3px solid var(--border-subtle);box-shadow:var(--shadow-lg);background:${answer.targetHex};"></div>
            <div style="display:flex;justify-content:center;gap:1.25rem;margin-bottom:1rem;flex-wrap:wrap;">
              ${colorBlocks}
            </div>
            <div style="margin-top:0.75rem;">
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.375rem;">Mixed to produce:</div>
              <div style="display:flex;align-items:center;justify-content:center;gap:0.5rem;">
                <div style="width:32px;height:32px;border-radius:50%;background:${answer.targetHex};border:2px solid var(--border-subtle);"></div>
                <span style="font-family:monospace;font-size:1rem;font-weight:800;color:var(--text-primary);">${answer.targetHex}</span>
              </div>
            </div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem;">Puzzle #${answer.puzzleNumber} &middot; ${formattedDate}</div>
          </div>
        `,
      };
    } catch (e) {
      console.error('Error computing colorfle answer:', e);
      return null;
    }
  }

  function handleDateClick(dateKey) {
    selectedDate = dateKey;
    answerRevealed = false;
    try {
      selectedAnswer = computeAnswer(dateKey);
    } catch (e) {
      console.error('Error getting answer:', e);
      selectedAnswer = null;
    }
  }

  let isNextDisabled = $derived(
    currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()
  );
  let isPrevDisabled = $derived(
    currentMonth.getFullYear() === startDate.getFullYear() && currentMonth.getMonth() === startDate.getMonth()
  );
  let monthLabel = $derived(MONTH_NAMES[currentMonth.getMonth()] + ' ' + currentMonth.getFullYear());
</script>

<div class="archive-calendar">
  <!-- Controls -->
  <div class="controls-bar">
    <div class="view-toggle" style="--theme-primary: {theme.primary};">
      <button
        onclick={() => viewMode = 'calendar'}
        class="toggle-btn"
        class:active={viewMode === 'calendar'}
      >
        Calendar
      </button>
      <button
        onclick={() => viewMode = 'list'}
        class="toggle-btn"
        class:active={viewMode === 'list'}
      >
        List
      </button>
    </div>
    <div class="search-wrap">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search by date or puzzle #..."
        class="search-input"
      />
    </div>
  </div>

  <!-- Calendar View -->
  {#if viewMode === 'calendar' && !searchQuery.trim()}
    <div class="calendar-card" style="--theme-primary: {theme.primary}; --theme-light: {theme.primaryLight}; --theme-mid: {theme.primaryMid}; --theme-border: {theme.primaryBorder};">
      <!-- Month Navigation -->
      <div class="month-nav">
        <button onclick={prevMonth} disabled={isPrevDisabled} class="nav-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 class="month-title">{monthLabel}</h2>
        <button onclick={nextMonth} disabled={isNextDisabled} class="nav-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- Quick Month Jump -->
      <div class="month-jump">
        {#each availableMonths.slice(0, 12) as m}
          <button
            onclick={() => goToMonth(m.date)}
            class="jump-btn"
            class:jump-active={m.date.getMonth() === currentMonth.getMonth() && m.date.getFullYear() === currentMonth.getFullYear()}
          >{m.label}</button>
        {/each}
      </div>

      <!-- Day Headers -->
      <div class="day-headers">
        {#each DAY_NAMES as day}
          <div class="day-header">{day}</div>
        {/each}
      </div>

      <!-- Calendar Grid -->
      <div class="day-grid">
        {#each calendarDays as dayObj}
          {#if dayObj.date}
            <button
              onclick={() => handleDateClick(dayObj.dateKey)}
              class="day-cell day-clickable"
              class:day-today={dayObj.isToday}
              class:day-selected={selectedDate === dayObj.dateKey}
              title="{gameName} - {dayObj.dateKey}"
            >
              <span class="day-num">{dayObj.day}</span>
              {#if dayObj.isToday}
                <span class="today-dot"></span>
              {/if}
            </button>
          {:else}
            <div class="day-cell day-disabled" class:day-outside={!dayObj.currentMonth}>
              {dayObj.day}
            </div>
          {/if}
        {/each}
      </div>
    </div>

  <!-- List View -->
  {:else}
    <div class="list-card" style="--theme-primary: {theme.primary}; --theme-light: {theme.primaryLight};">
      <div class="list-header">
        <h2>{searchQuery.trim() ? 'Search Results' : 'Recent Puzzles'} ({filteredPuzzles.length}{filteredPuzzles.length === 60 ? '+' : ''})</h2>
      </div>
      <div class="list-scroll">
        {#each filteredPuzzles as puzzle}
          <button
            onclick={() => handleDateClick(puzzle.dateKey)}
            class="list-item"
            class:list-item-selected={selectedDate === puzzle.dateKey}
          >
            <span class="list-num">#{puzzle.dayNum}</span>
            <div class="list-info">
              <div class="list-title">{gameName} #{puzzle.dayNum}</div>
              <div class="list-date">{puzzle.formatted}</div>
            </div>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        {/each}
        {#if filteredPuzzles.length === 0}
          <div class="list-empty">
            <p>No puzzles found</p>
            <span>Try a different search term</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Selected Date Answer -->
  {#if selectedDate && selectedAnswer}
    <div id="archive-answer" class="answer-section">
      <div class="answer-card" style="--theme-primary: {theme.primary}; --theme-light: {theme.primaryLight}; --theme-mid: {theme.primaryMid}; --theme-border: {theme.primaryBorder};">
        <div class="answer-label">{gameName} Answer — {selectedDate}</div>

        {#if !answerRevealed}
          <button class="reveal-btn" onclick={() => answerRevealed = true}>
            <div class="reveal-circle">
              ?
            </div>
            <div class="reveal-text">Click to reveal the answer</div>
          </button>
        {:else}
          <div class="reveal-content">
            {@html selectedAnswer.html}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if selectedDate && !selectedAnswer}
    <div class="answer-section">
      <div class="answer-card" style="text-align:center;padding:2rem;">
        <p style="color:var(--text-muted);">No answer data available for {selectedDate}.</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .archive-calendar {
    max-width: 520px;
    margin: 0 auto;
  }

  .controls-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .view-toggle {
    display: inline-flex;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .toggle-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
    font-weight: 600;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-body);
  }

  .toggle-btn.active {
    background: var(--theme-primary, var(--accent-primary));
    color: white;
  }

  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 280px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2rem;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    font-size: 0.8rem;
    color: var(--text-primary);
    background: var(--bg-card);
    outline: none;
    transition: border-color 0.2s;
    font-family: var(--font-body);
  }

  .search-input:focus {
    border-color: var(--accent-primary);
  }

  .calendar-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .month-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--bg-muted);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .month-jump {
    display: flex;
    gap: 0.375rem;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
    overflow-x: auto;
  }

  .jump-btn {
    padding: 0.3rem 0.625rem;
    font-size: 0.65rem;
    font-weight: 600;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-family: var(--font-body);
  }

  .jump-btn:hover {
    background: var(--bg-muted);
    color: var(--text-secondary);
  }

  .jump-btn.jump-active {
    background: var(--theme-primary, var(--accent-primary));
    color: white;
  }

  .day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0.75rem 0.75rem 0.25rem;
    gap: 2px;
  }

  .day-header {
    text-align: center;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    padding: 0.375rem 0;
  }

  .day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0.375rem 0.75rem 1rem;
    gap: 3px;
  }

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    position: relative;
  }

  .day-clickable {
    border: 1px solid var(--border-subtle);
    background: var(--bg-card);
    cursor: pointer;
    transition: all 0.2s;
  }

  .day-clickable:hover {
    background: var(--bg-muted);
    border-color: var(--theme-primary, var(--accent-teal));
    transform: translateY(-1px);
  }

  .day-today {
    background: var(--bg-muted) !important;
  }

  .today-dot {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--theme-primary, var(--accent-teal));
  }

  .day-selected {
    border-color: var(--theme-primary, var(--accent-teal)) !important;
    box-shadow: 0 0 0 2px var(--theme-mid, rgba(13,124,102,0.2));
  }

  .day-num {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-primary);
  }

  .day-disabled {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .day-outside {
    opacity: 0.2;
  }

  /* List view */
  .list-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .list-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .list-header h2 {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .list-scroll {
    max-height: 500px;
    overflow-y: auto;
  }

  .list-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text-primary);
    font-family: var(--font-body);
  }

  .list-item:hover {
    background: var(--bg-muted);
  }

  .list-item-selected {
    background: var(--bg-muted);
  }

  .list-num {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--bg-muted);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--theme-primary, var(--accent-teal));
    flex-shrink: 0;
  }

  .list-info {
    flex: 1;
  }

  .list-title {
    font-weight: 600;
    font-size: 0.85rem;
  }

  .list-date {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .list-empty {
    padding: 3rem 1.25rem;
    text-align: center;
  }

  .list-empty p {
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .list-empty span {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Answer section */
  .answer-section {
    margin-top: 1.5rem;
  }

  .answer-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: 2rem;
    text-align: center;
    box-shadow: var(--shadow-md);
    position: relative;
  }

  .answer-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--theme-primary, var(--accent-teal));
    margin-bottom: 1.25rem;
  }

  .reveal-btn {
    display: block;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s;
    padding: 1rem 0;
    font-family: var(--font-body);
  }

  .reveal-btn:hover {
    transform: scale(1.02);
  }

  .reveal-btn:hover .reveal-circle {
    background: var(--theme-mid, rgba(13,124,102,0.12));
    border-color: var(--theme-primary, rgba(13,124,102,0.4));
  }

  .reveal-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--theme-light, rgba(13,124,102,0.06));
    border: 3px solid var(--theme-border, rgba(13,124,102,0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.875rem;
    font-size: 2.5rem;
    font-weight: 900;
    font-family: var(--font-display);
    color: var(--theme-primary, var(--accent-teal));
    transition: all 0.3s;
  }

  .reveal-text {
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>
