const n=`:root {
  --correct-color: rgb(83, 141, 78);
  --wrong-spot-color: rgb(181, 159, 59);
  --incorrect-color: rgb(120, 124, 126);
  --tile-border: #d3d6da;
  --background: #f6f2e8;
  --panel: rgba(255, 255, 255, 0.9);
  --panel-strong: #ffffff;
  --text-color: #1a1a1b;
  --muted-text: #5f6368;
  --link-border: #d7d2c8;
  --card-border: rgba(182, 174, 160, 0.45);
  --shadow-soft: 0 16px 40px rgba(76, 66, 50, 0.08);
  --shadow-hover: 0 18px 38px rgba(76, 66, 50, 0.12);
  --accent: #7a5c2e;
  --accent-soft: #f0e3c5;
  --button-text: #fdfaf2;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), transparent 32%),
    radial-gradient(circle at top right, rgba(242, 228, 193, 0.5), transparent 26%),
    linear-gradient(180deg, #faf7f1 0%, var(--background) 54%, #f4efe4 100%);
  color: var(--text-color);
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
}

body {
  display: flex;
  justify-content: center;
  padding: 0 8px 28px;
}

a,
button,
input,
select {
  font: inherit;
}

button,
input,
select {
  border: 1px solid var(--link-border);
  background: #fff;
  color: var(--text-color);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease;
}

button {
  cursor: pointer;
}

button:hover,
select:hover,
input:hover {
  border-color: #b7afa1;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
.tile:focus-visible,
.word-button:focus-visible {
  outline: 3px solid rgba(122, 92, 46, 0.16);
  outline-offset: 2px;
}

.landing-shell {
  width: min(960px, calc(100vw - 24px));
  padding: 24px 0 48px;
}

.hero {
  border: 1px solid #e7e7e7;
  padding: 24px;
  margin-bottom: 20px;
}

.hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
}

.eyebrow,
.game-kicker,
.board-label,
.column-heading,
.hint-text,
.subtitle,
.mode-description {
  color: var(--muted-text);
  font-size: 0.95rem;
}

.hero-copy {
  color: var(--muted-text);
  line-height: 1.55;
  max-width: 60ch;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}

.game-card {
  border: 1px solid #e7e7e7;
  padding: 18px;
}

.game-card h2 {
  margin: 6px 0 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-link {
  text-decoration: none;
  color: var(--text-color);
  border: 1px solid var(--link-border);
  padding: 8px 10px;
  font-size: 0.95rem;
}

.solver-page {
  width: 100%;
  display: flex;
  justify-content: center;
}

.solver-container {
  width: min(470px, calc(100vw - 12px));
  padding: 16px 0 36px;
  min-height: 600px;
}

.wordle-solver-container {
  width: min(560px, calc(100vw - 12px));
}

.canuckle-daily-container {
  width: min(760px, calc(100vw - 12px));
  --correct-color: rgb(220, 38, 38);
}

.canuckle-daily-container .main-action {
  border-color: rgba(220, 38, 38, 0.4);
  background: linear-gradient(180deg, #ef4444 0%, rgb(220, 38, 38) 100%);
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.2);
}

/* ── Canuckle Daily: Premium Light Summary Card ── */
.canuckle-summary-card {
  padding: 24px 28px;
  margin-bottom: 16px;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.canuckle-summary-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.04), transparent 70%);
  pointer-events: none;
}

.canuckle-summary-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.04), transparent 70%);
  pointer-events: none;
}

.canuckle-summary-card .canuckle-label {
  position: relative;
  z-index: 1;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #dc2626;
  margin: 0;
}

.canuckle-summary-card .canuckle-number {
  position: relative;
  z-index: 1;
  margin: 8px 0 4px;
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.canuckle-summary-card .canuckle-meta {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.canuckle-action-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  color: #0f172a;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  transition: all 180ms ease;
}

.canuckle-action-btn:hover {
  background: linear-gradient(180deg, #fcd34d 0%, #fbbf24 100%);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.canuckle-action-btn.secondary {
  color: #475569;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: none;
}

.canuckle-action-btn.secondary:hover {
  background: rgba(0, 0, 0, 0.07);
  box-shadow: none;
}



.canuckle-archive-container {
  width: min(920px, calc(100vw - 12px));
  --correct-color: rgb(220, 38, 38);
}

.canuckle-archive-container .main-action {
  border-color: rgba(220, 38, 38, 0.4);
  background: linear-gradient(180deg, #ef4444 0%, rgb(220, 38, 38) 100%);
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.2);
}

.top-of-screen {
  text-align: center;
  padding: 18px 18px 20px;
  margin-bottom: 14px;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(249, 247, 242, 0.92));
  box-shadow: var(--shadow-soft);
}

.brand-link {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--accent);
  text-decoration: none;
  font-size: 0.88rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(122, 92, 46, 0.14);
  box-shadow: 0 8px 20px rgba(76, 66, 50, 0.05);
}

.brand-link:hover {
  transform: translateY(-1px);
}

.title-block h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.title-block p {
  margin: 8px 0 0;
}

.mode-description {
  line-height: 1.45;
}

.top-of-screen.is-wordle {
  background: linear-gradient(160deg, rgba(83, 141, 78, 0.96), rgba(34, 197, 94, 0.9));
  border-color: rgba(83, 141, 78, 0.35);
  color: #fff;
}

.top-of-screen.is-wordle .brand-link,
.top-of-screen.is-canuckle .brand-link {
  color: inherit;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: none;
}

.top-of-screen.is-wordle .subtitle,
.top-of-screen.is-wordle .mode-description,
.top-of-screen.is-canuckle .subtitle,
.top-of-screen.is-canuckle .mode-description {
  color: rgba(255, 255, 255, 0.86);
}

.top-of-screen.is-canuckle {
  background: linear-gradient(160deg, rgba(220, 38, 38, 0.95), rgba(248, 113, 113, 0.88));
  border-color: rgba(239, 68, 68, 0.35);
  color: #fff;
}

.wordle-length-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.wordle-length-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
}

.wordle-length-link.is-active {
  background: #fff;
  color: var(--correct-color);
  border-color: #fff;
}

.settings-card,
.guesses-panel,
.results-panel {
  border: 1px solid var(--card-border);
  background: var(--panel);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(10px);
}

.settings-card {
  padding: 14px;
  margin-bottom: 14px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-grid label {
  display: grid;
  gap: 6px;
  font-size: 0.95rem;
}

.settings-grid select,
.settings-grid input {
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
}

.hard-mode-row {
  grid-column: 1 / -1;
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.hard-mode-row input {
  width: 18px;
  height: 18px;
}

.guesses-panel {
  padding: 16px 12px 14px;
}

.guess-entry {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

#guess-input {
  flex: 1;
  max-width: 240px;
  min-height: 42px;
  text-align: center;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 14px;
  border: 1px solid rgba(83, 141, 78, 0.16);
  box-shadow: inset 0 0 0 1px rgba(83, 141, 78, 0.05);
  background: rgba(255, 255, 255, 0.96);
}

#guess-input::placeholder {
  color: #9aa0a6;
  letter-spacing: 0.03em;
}

#guess-input:focus {
  outline: none;
}

.main-action {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(83, 141, 78, 0.4);
  background: linear-gradient(180deg, #6caa64 0%, var(--correct-color) 100%);
  color: var(--button-text);
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(83, 141, 78, 0.2);
}

.hint-text {
  text-align: center;
  margin: 12px 0 16px;
}

.boards {
  display: grid;
  gap: 10px;
}

.board-card {
  width: 100%;
  padding: 10px 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(122, 92, 46, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(250, 248, 243, 0.96));
}

.board-label {
  margin: 0 0 6px;
  text-align: left;
}

.turn-stack {
  display: grid;
  gap: 6px;
}

.guess-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.guess-row.static-word {
  margin-bottom: 10px;
}

.tile {
  width: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
  height: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.9rem, calc(1.9rem - (var(--word-length, 5) - 5) * 0.12rem), 1.9rem);
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 14px;
  border: 2px solid var(--tile-border);
  background: linear-gradient(180deg, #ffffff 0%, #faf9f5 100%);
  padding: 0;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.03);
}

.static-tile {
  cursor: default;
}

.tile:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 -2px 0 rgba(0, 0, 0, 0.03),
    0 10px 18px rgba(76, 66, 50, 0.08);
}

.color-b {
  background: var(--incorrect-color);
  border-color: var(--incorrect-color);
  color: #fff;
}

.color-g {
  background: var(--correct-color);
  border-color: var(--correct-color);
  color: #fff;
}

.color-y {
  background: var(--wrong-spot-color);
  border-color: var(--wrong-spot-color);
  color: #fff;
}

.color-x {
  background: #f3efe6;
  border-color: #d6cdbf;
  color: #8d7d62;
}

.woodle-row {
  padding: 6px 0 2px;
}

.woodle-counts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.woodle-counts label {
  display: grid;
  gap: 6px;
  font-size: 0.92rem;
  color: var(--muted-text);
}

.woodle-counts select {
  min-height: 38px;
  padding: 8px 10px;
  border-radius: 12px;
}

.empty-card,
.loading-card {
  text-align: center;
  color: var(--muted-text);
  padding: 16px 12px;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--card-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-results-prompt {
  text-align: center;
  padding: 32px 16px;
  color: var(--muted-text);
}

.empty-results-icon {
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-results-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 6px;
}

.empty-results-hint {
  font-size: 0.92rem;
  margin: 0;
  line-height: 1.5;
  max-width: 36ch;
  margin-inline: auto;
}

.next-previous-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.next-previous-buttons button {
  min-height: 38px;
  padding: 0 14px;
  text-transform: lowercase;
  border-radius: 999px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 20px rgba(76, 66, 50, 0.06);
}

#solve-button {
  border-color: rgba(122, 92, 46, 0.34);
  background: linear-gradient(180deg, #8e6d3d 0%, var(--accent) 100%);
  color: var(--button-text);
  box-shadow: 0 12px 26px rgba(122, 92, 46, 0.2);
}

#reset-button {
  color: #8a3d30;
}

.results-panel {
  margin-top: 12px;
  padding: 16px 14px;
}

.results-panel.results-stale {
  border-color: rgba(122, 92, 46, 0.3);
}

.results-stale-note {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff7e6 0%, #f7efd9 100%);
  border: 1px solid rgba(122, 92, 46, 0.16);
  color: #6d532b;
  font-size: 0.95rem;
  line-height: 1.4;
}

.possibilities {
  text-align: center;
  margin: 0;
}

.possibilities.total {
  font-size: 1.45rem;
  margin-bottom: 6px;
}

.possibilities.separated {
  font-size: 1rem;
  color: var(--muted-text);
  font-weight: 400;
  margin-bottom: 14px;
}

.mini-title {
  text-align: center;
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(122, 92, 46, 0.09);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-word-wrap {
  min-width: 0;
}

.word-button {
  border: none;
  background: transparent;
  padding: 6px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-color);
}

.score-note {
  color: var(--muted-text);
  font-size: 0.95rem;
  text-align: right;
}

.answers-section {
  margin-top: 14px;
}

.candidate-group {
  border-top: 1px solid rgba(122, 92, 46, 0.09);
  padding: 12px 0;
}

.candidate-group summary {
  cursor: pointer;
  color: var(--muted-text);
}

.candidate-group-open {
  border-top: 1px solid rgba(122, 92, 46, 0.09);
  padding: 12px 0;
}

.candidate-columns {
  display: grid;
  gap: 12px;
  padding-top: 10px;
}

.candidate-columns p {
  margin: 0;
  line-height: 1.45;
  word-break: break-word;
}

.button-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.subtle-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(122, 92, 46, 0.18);
  background: rgba(255, 255, 255, 0.94);
  color: var(--text-color);
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(76, 66, 50, 0.06);
}

.canuckle-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.canuckle-nav-link {
  text-decoration: none;
  color: var(--muted-text);
  border: 1px solid rgba(122, 92, 46, 0.16);
  background: rgba(255, 255, 255, 0.92);
  padding: 8px 12px;
  border-radius: 999px;
}

.canuckle-nav-link.is-active {
  color: var(--accent);
  border-color: rgba(122, 92, 46, 0.34);
  background: rgba(240, 227, 197, 0.55);
}

/* ── Canuckle Daily: Premium Inline Card ── */

/* Make shadow host transparent so page background shows through */
:host {
  background: transparent !important;
}

/* Remove WASM shell padding when showing daily card */
.shadow-body:has(.canuckle-daily-container) {
  padding: 0 !important;
  display: block !important;
}

.canuckle-daily-container {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  min-height: auto !important;
  background: transparent !important;
}

.canuckle-daily-container .solver-page {
  background: transparent !important;
  display: block !important;
}

.canuckle-plain {
  padding: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  position: relative;
}

/* Top accent bar */
.canuckle-plain::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ef4444 0%, #f87171 50%, #ef4444 100%);
}

.canuckle-plain > * {
  padding-left: 20px;
  padding-right: 20px;
}

.canuckle-plain > *:first-child {
  padding-top: 20px;
}

.canuckle-plain > *:last-child {
  padding-bottom: 20px;
}

.canuckle-h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.canuckle-date {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 0;
  font-weight: 500;
}

.canuckle-h3 {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 18px 0 8px;
}

.canuckle-answer-reveal {
  margin: 0 20px;
  padding: 14px 18px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 50%, #ffffff 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(220, 38, 38, 0.06);
  overflow: hidden;
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.canuckle-answer-reveal:hover {
  border-color: #fca5a5;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 14px rgba(220, 38, 38, 0.1);
}

.canuckle-answer-word {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #0f172a;
}

.canuckle-answer-note {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.canuckle-fact-text {
  margin: 0 20px 20px;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #fee2e2;
  background: linear-gradient(135deg, #fef2f2 0%, #fffafa 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.7;
}

.canuckle-fact-text a {
  color: #dc2626;
  text-decoration: underline;
  text-decoration-color: rgba(220, 38, 38, 0.3);
  font-weight: 600;
}

.canuckle-fact-text a:hover {
  text-decoration-color: #dc2626;
}

/* Skeleton loading states for Canuckle */
.canuckle-plain .skeleton-pulse {
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.canuckle-plain .canuckle-fact-line {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: #e2e8f0;
  animation: skeleton-pulse 2s ease-in-out infinite;
  margin: 0 0 8px;
}

.canuckle-plain .canuckle-fact-line.short {
  width: 60%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (max-width: 520px) {
  .canuckle-plain > * {
    padding-left: 14px;
    padding-right: 14px;
  }

  .canuckle-plain > *:first-child {
    padding-top: 16px;
  }

  .canuckle-plain > *:last-child {
    padding-bottom: 16px;
  }

  .canuckle-answer-reveal {
    margin: 0 14px;
    padding: 12px 14px;
  }

  .canuckle-answer-word {
    font-size: 1.2rem;
  }

  .canuckle-fact-text {
    margin: 0 14px 16px;
    padding: 12px 14px;
  }
}

.canuckle-distribution {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.distribution-row {
  display: grid;
  grid-template-columns: 82px 1fr auto;
  align-items: center;
  gap: 10px;
}

.distribution-label,
.distribution-value {
  font-size: 0.92rem;
  color: var(--muted-text);
}

.distribution-bar {
  display: flex;
  align-items: center;
  height: 12px;
  border-radius: 999px;
  background: rgba(122, 92, 46, 0.08);
  overflow: hidden;
}

.distribution-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d6bf8b 0%, #9d7b45 100%);
}

.archive-search {
  display: grid;
  gap: 6px;
}

.archive-toolbar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.archive-toolbar-copy {
  margin: 0;
  color: var(--muted-text);
  line-height: 1.5;
}

.archive-toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.archive-search input {
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 14px;
}

.archive-results {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.archive-entry {
  border: 1px solid rgba(122, 92, 46, 0.09);
  border-radius: 18px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.78);
}

.archive-entry summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  cursor: pointer;
  list-style: none;
}

.archive-entry summary::-webkit-details-marker {
  display: none;
}

.archive-index {
  font-weight: 700;
}

.archive-date {
  color: var(--muted-text);
}

.archive-answer-pill {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(240, 227, 197, 0.5);
  border: 1px solid rgba(122, 92, 46, 0.12);
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}

.archive-entry-body {
  display: grid;
  gap: 14px;
  padding-top: 12px;
}

.archive-actions {
  display: flex;
  justify-content: flex-start;
}

.archive-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

.compact-distribution .distribution-row {
  grid-template-columns: 72px 1fr auto;
 }

@media (max-width: 520px) {
  .solver-container {
    width: calc(100vw - 8px);
    padding-top: 8px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .guess-entry {
    flex-direction: column;
  }

  #guess-input,
  .main-action {
    width: 100%;
    max-width: none;
  }

  .tile {
    width: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
    height: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
    font-size: clamp(0.75rem, calc(1.55rem - (var(--word-length, 5) - 5) * 0.1rem), 1.55rem);
    border-radius: 10px;
  }

  .suggestion-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .score-note {
    text-align: left;
  }

  .woodle-counts {
    grid-template-columns: 1fr;
  }

  .canuckle-summary-grid,
  .canuckle-actions,
  .canuckle-reveal-card summary,
  .archive-entry summary,
  .archive-toolbar-top,
  .archive-toolbar-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .canuckle-reveal-toggle {
    min-width: 0;
  }

  .distribution-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
`;export{n as default};
