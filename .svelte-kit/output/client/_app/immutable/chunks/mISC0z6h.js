import{_ as g}from"./PPVm8Dsz.js";import{g as P,a as F,W as I,b as E,c as O}from"./CACuO2kX.js";const C=new Map;let A=null;function u(e,t){const c=e.querySelector(t);if(!c)throw new Error(`Missing expected element: ${t}`);return c}function v(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function N(e,t){e.innerHTML=`
                <main class="solver-page">
                        <div class="solver-container">
                                <section class="results-panel">
                                        <p class="loading-card">${v(t)}</p>
                                </section>
                        </div>
                </main>
        `}function ie(e,t){let c=!1;return(async()=>{try{if(t.pageType==="canuckle-daily"){await M();return}if(t.pageType==="canuckle-archive"){await B();return}await w(t.game,t.wordLength)}catch(a){c||N(e,a instanceof Error?a.message:"The WASM solver could not load.")}})(),()=>{c=!0};async function w(a,s){const l=P(a),i=F(a,s??5),r=await z(a,i);if(c)return;const o=`wordlebot-wasm:${a}:${i}`,d=Q(o),n={game:a,gameName:l.name,boards:l.boards,wordLength:i,feedbackMode:l.feedback,description:l.description,dataset:r,bank:d.bank??"restricted",hardMode:d.hardMode??!1,maxGuesses:d.maxGuesses??l.defaultMax,warmleDistance:d.warmleDistance??3,turns:d.turns??[]},p=l.supportsWarmleDistance?`
                                        <label>
                                                Warmle distance
                                                <select id="warmle-distance">
                                                        ${[1,2,3].map(m=>`
                                                                                <option value="${m}" ${m===n.warmleDistance?"selected":""}>${m}</option>
                                                                        `).join("")}
                                                </select>
                                        </label>
                                `:"",h=n.game==="canuckle"?`
                                                <option value="restricted" ${n.bank==="restricted"?"selected":""}>Curated Canuckle answers</option>
                                                <option value="complete" ${n.bank==="complete"?"selected":""}>Accepted Canuckle words</option>
                                        `:`
                                                <option value="restricted" ${n.bank==="restricted"?"selected":""}>Most likely answers</option>
                                                <option value="complete" ${n.bank==="complete"?"selected":""}>All possible answers</option>
                                        `;n.game==="wordle"?`${n.wordLength}`:n.game==="canuckle"||`${n.gameName}`,n.game==="wordle"?`${n.wordLength}`:n.game==="spotle"||`${n.gameName}`,n.game==="wordle"||n.game;const b=n.game==="wordle"?"solver-container wordle-solver-container":n.game==="canuckle"?"solver-container canuckle-daily-container":"solver-container";e.innerHTML=`
                        <main class="solver-page">
                                <div class="${b}" style="--word-length: ${n.wordLength}">
                                        <section class="settings-card">
                                                <div class="settings-grid">
                                                        <label>
                                                                Game
                                                                <select id="game-select">
                                                                        ${I.map(m=>`
                                                                                        <option value="${m.slug}" ${m.slug===n.game?"selected":""}>${v(m.slug==="spotle"?"Spotle (Wordle)":m.name)}</option>
                                                                                `).join("")}
                                                                </select>
                                                        </label>
                                                        <label>
                                                                Word length
                                                                <select id="length-select">
                                                                        ${l.lengths.map(m=>`
                                                                                                <option value="${m}" ${m===n.wordLength?"selected":""}>${m}</option>
                                                                                        `).join("")}
                                                                </select>
                                                        </label>
                                                        <label>
                                                                Answers
                                                                <select id="bank-select">${h}</select>
                                                        </label>
                                                        <label>
                                                                Max guesses
                                                                <select id="max-select">
                                                                        ${Array.from({length:19},(m,Y)=>Y+3).map(m=>`
                                                                                                <option value="${m}" ${m===n.maxGuesses?"selected":""}>${m}</option>
                                                                                        `).join("")}
                                                                </select>
                                                        </label>
                                                        ${p}
                                                        <label class="hard-mode-row">
                                                                <span>Hard mode</span>
                                                                <input id="hard-toggle" type="checkbox" ${n.hardMode?"checked":""} />
                                                        </label>
                                                </div>
                                        </section>

                                        <section class="guesses-panel">
                                                <div class="guess-entry">
                                                        <input id="guess-input" maxlength="${n.wordLength}" autocomplete="off" spellcheck="false" placeholder="ENTER YOUR GUESS" />
                                                        <button id="add-guess" class="main-action" type="button">Add guess</button>
                                                </div>
                                                <p class="hint-text">${v(se(n))}</p>
                                                <section id="boards" class="boards"></section>
                                                <div class="next-previous-buttons">
                                                        <button id="solve-button" type="button">calculate next guess</button>
                                                        <button id="undo-button" type="button">remove last guess</button>
                                                        <button id="reset-button" type="button">reset</button>
                                                </div>
                                        </section>

                                        <section id="results" class="results-panel">
                                                <div class="loading-card"><div class="loading-spinner"></div>Calculating suggestions...</div>
                                        </section>
                                </div>
                        </main>
                `;const f=u(e,"#guess-input"),G=u(e,"#boards"),_=u(e,"#results");V(l,n.wordLength),H({state:n,storageKey:o,guessInput:f,boardsContainer:G,resultsContainer:_}),y(G,n,o,_),await L(n,_)}async function M(){const a=await D();if(c)return;const s=t.pageType==="canuckle-daily"?t.visibleDateKey:T(),l=R(a,s),i=l.find(r=>r.date===s)??l.at(-1);if(!i){N(e,"Canuckle data is not available right now.");return}e.innerHTML=`
							<main class="solver-page">
								<div class="solver-container canuckle-daily-container">
									<div class="canuckle-plain">
										<h2 class="canuckle-h2">Puzzle #${i.index}</h2>
										<p class="canuckle-date">${v(S(i.date))}</p>

										<h3 class="canuckle-h3">Answer</h3>
										<div class="canuckle-answer-reveal">
											<p class="canuckle-answer-word">${v(i.answer.toUpperCase())}</p>
											<p class="canuckle-answer-note">Puzzle #${i.index} · ${v(S(i.date))}</p>
										</div>

										<h3 class="canuckle-h3">Canadian Fact</h3>
										<div class="canuckle-fact-text">${W(i)}</div>
									</div>
								</div>
							</main>
						`}async function B(){const a=await D();if(c)return;const s=t.pageType==="canuckle-archive"?t.visibleDateKey:T(),l=[...R(a,s)].reverse(),i={query:"",visibleCount:250};e.innerHTML=`
                        <main class="solver-page">
                                <div class="solver-container canuckle-archive-container">
                                        <section class="settings-card archive-toolbar">
                                                <div class="archive-toolbar-top">
                                                        <p class="archive-toolbar-copy">Browse ${l.length} visible Canuckle archive entries without leaving the main archive page.</p>
                                                        <div class="archive-toolbar-actions">
                                                                <a class="subtle-link-button" href="${E("today")}">See answer today</a>
                                                                <a class="main-action button-link" href="${E("solver")}">Open solver</a>
                                                        </div>
                                                </div>
                                                <label class="archive-search">
                                                        <span>Search archive</span>
                                                        <input id="archive-search" type="search" placeholder="Search by puzzle, date, answer, or fact" />
                                                </label>
                                                <p id="archive-summary" class="hint-text"></p>
                                        </section>

                                        <section id="archive-results" class="results-panel archive-results"></section>
                                        <div class="archive-more-wrap">
                                                <button id="archive-more" class="subtle-link-button" type="button">Load more</button>
                                        </div>
                                </div>
                        </main>
                `;const r=u(e,"#archive-search"),o=u(e,"#archive-summary"),d=u(e,"#archive-results"),n=u(e,"#archive-more"),p=()=>{const h=l.filter(f=>Z(f,i.query)),b=h.slice(0,i.visibleCount);o.textContent=`Showing ${b.length} of ${h.length} archived puzzles.`,d.innerHTML=b.map(f=>`
                                                <details class="archive-entry">
                                                        <summary>
                                                                <span class="archive-index">#${f.index}</span>
                                                                <span class="archive-date">${v(S(f.date))}</span>
                                                                <span class="archive-answer-pill">${v(f.answer)}</span>
                                                        </summary>
                                                        <div class="archive-entry-body">
                                                                <div class="canuckle-fact">${W(f)}</div>
                                                                <div class="archive-actions">
                                                                        <a class="subtle-link-button" href="${E("solver")}">Open Canuckle solver</a>
                                                                </div>
                                                        </div>
                                                </details>
                                        `).join(""),n.hidden=b.length>=h.length};r.addEventListener("input",()=>{i.query=r.value.trim().toLowerCase(),i.visibleCount=250,p()}),n.addEventListener("click",()=>{i.visibleCount+=250,p()}),p()}function V(a,s){u(e,"#game-select").addEventListener("change",l=>{const i=P(l.currentTarget.value),r=F(i.slug,s);window.location.href=O(i.slug,r)}),u(e,"#length-select").addEventListener("change",l=>{const i=Number(l.currentTarget.value);window.location.href=O(a.slug,i)})}function H({state:a,storageKey:s,guessInput:l,boardsContainer:i,resultsContainer:r}){u(e,"#bank-select").addEventListener("change",o=>{a.bank=o.currentTarget.value,k(s,a),$(r)}),u(e,"#max-select").addEventListener("change",o=>{a.maxGuesses=Number(o.currentTarget.value),k(s,a),$(r)}),u(e,"#hard-toggle").addEventListener("change",o=>{a.hardMode=o.currentTarget.checked,k(s,a),$(r)}),e.querySelector("#warmle-distance")?.addEventListener("change",o=>{a.warmleDistance=Number(o.currentTarget.value),k(s,a),$(r)}),u(e,"#add-guess").addEventListener("click",()=>{const o=l.value.trim().toUpperCase();if(!re(a,a.dataset,o)){l.focus(),l.select();return}a.turns.push({guess:o,feedback:Array.from({length:a.boards},()=>x(a))}),l.value="",y(i,a,s,r),k(s,a),$(r)}),u(e,"#solve-button").addEventListener("click",async()=>{k(s,a),await L(a,r)}),u(e,"#undo-button").addEventListener("click",async()=>{a.turns.pop(),y(i,a,s,r),k(s,a),await L(a,r)}),u(e,"#reset-button").addEventListener("click",async()=>{a.turns=[],y(i,a,s,r),k(s,a),await L(a,r)}),l.addEventListener("input",()=>{l.value=l.value.replace(/[^a-z]/gi,"").toUpperCase().slice(0,a.wordLength)}),l.addEventListener("keydown",o=>{o.key==="Enter"&&(o.preventDefault(),u(e,"#add-guess").click())})}function y(a,s,l,i){a.innerHTML=Array.from({length:s.boards},(r,o)=>{const d=s.turns.map((n,p)=>U(s,n,p,o)).join("");return`
                                <article class="board-card">
                                        ${s.boards>1?`<p class="board-label">Board ${o+1}</p>`:""}
                                        <div class="turn-stack">${d||'<div class="empty-card">No guesses yet.</div>'}</div>
                                </article>
                        `}).join(""),a.querySelectorAll(".tile").forEach(r=>{r.addEventListener("click",()=>{const o=Number(r.dataset.turn),d=Number(r.dataset.board),n=Number(r.dataset.letter),p=s.turns[o].feedback[d][n],h=ne(s,p);s.turns[o].feedback[d]=ee(s.turns[o].feedback[d],n,h),r.className=`tile color-${h.toLowerCase()}`,k(l,s),$(i)})}),a.querySelectorAll(".woodle-correct, .woodle-wrong").forEach(r=>{r.addEventListener("change",()=>{const o=Number(r.dataset.turn),d=Number(r.dataset.board),n=a.querySelector(`.woodle-row[data-turn="${o}"][data-board="${d}"]`);if(!n)return;const p=Number(n.querySelector(".woodle-correct")?.value??"0"),h=Number(n.querySelector(".woodle-wrong")?.value??"0"),b=Math.max(0,Math.min(s.wordLength-p,h)),f=n.querySelector(".woodle-wrong");f&&b!==h&&(f.value=String(b)),s.turns[o].feedback[d]=ae(s.wordLength,p,b),k(l,s),$(i)})})}function U(a,s,l,i){if(a.feedbackMode==="woodle"){const r=s.feedback[i]??x(a),o=q(r,"G"),d=q(r,"Y");return`
                                <div class="woodle-row" data-turn="${l}" data-board="${i}">
                                        <div class="guess-row static-word">
                                                ${s.guess.split("").map(n=>`<span class="tile static-tile">${v(n)}</span>`).join("")}
                                        </div>
                                        <div class="woodle-counts">
                                                <label>
                                                        Exact
                                                        <select class="woodle-correct" data-turn="${l}" data-board="${i}">
                                                                ${j(a.wordLength,o)}
                                                        </select>
                                                </label>
                                                <label>
                                                        Misplaced
                                                        <select class="woodle-wrong" data-turn="${l}" data-board="${i}">
                                                                ${j(a.wordLength-o,d)}
                                                        </select>
                                                </label>
                                        </div>
                                </div>
                        `}return`
                        <div class="guess-row" data-turn="${l}" data-board="${i}">
                                ${s.guess.split("").map((r,o)=>`
                                                        <button
                                                                class="tile color-${(s.feedback[i]?.[o]??x(a)[o]).toLowerCase()}"
                                                                type="button"
                                                                data-turn="${l}"
                                                                data-board="${i}"
                                                                data-letter="${o}"
                                                        >${v(r)}</button>
                                                `).join("")}
                        </div>
                `}async function L(a,s){s.classList.remove("results-stale"),s.innerHTML='<div class="loading-card"><div class="loading-spinner"></div>Calculating suggestions...</div>';const l=a.game==="canuckle"?"canuckle":`len${a.wordLength}`,r=(await J(l))({game:a.game,bank:a.bank,hardMode:a.hardMode,maxGuesses:a.maxGuesses,warmleDistance:a.warmleDistance,turns:a.turns});if(c)return;const o=r.totalLikely+r.totalUnlikely,d=a.turns.length>0;s.innerHTML=`
                        ${d?`
                                <h2 class="possibilities total">${o} possibilit${K(o)}</h2>
                                <h3 class="possibilities separated">
                                        ${r.totalLikely} probable answer${r.totalLikely===1?"":"s"},
                                        ${r.totalUnlikely} unlikely possibilit${r.totalUnlikely===1?"y":"ies"}.
                                </h3>
                        `:""}
                        <h3 class="mini-title">${d?"Your best possible guesses are:":"Best starting words:"}</h3>
                        <ol class="suggestion-list">
                                ${r.suggestions.map(n=>`
                                                        <li class="suggestion-item">
                                                                <div class="suggestion-word-wrap">
                                                                        <button class="word-button" data-suggestion="${v(n.word)}" type="button">${v(n.word)}</button>
                                                                </div>
                                                                <div class="score-note">${v(X(n,a,r.boardCount))}</div>
                                                        </li>
                                                `).join("")||'<li class="suggestion-item"><div class="score-note">No guesses available from the current state.</div></li>'}
                        </ol>
                        ${d?`<div class="answers-section">
                                ${r.likelyAnswers.map((n,p)=>{const h=n,b=r.unlikelyAnswers[p];return`
                                                                <div class="candidate-group-open">
                                                                        ${r.boardCount>1?`<p class="board-label">Board ${p+1}: ${h.length} probable, ${b.length} unlikely</p>`:""}
                                                                        <div class="candidate-columns">
                                                                                <div>
                                                                                        <p class="column-heading">Probable answers (${h.length})</p>
                                                                                        <p>${h.map(v).join(", ")||"None"}</p>
                                                                                </div>
                                                                                <div>
                                                                                        <p class="column-heading">Unlikely answers (${b.length})</p>
                                                                                        <p>${b.map(v).join(", ")||"None"}</p>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        `}).join("")}
                        </div>`:""}
                `,s.querySelectorAll(".word-button").forEach(n=>{n.addEventListener("click",()=>{const p=u(e,"#guess-input");p.value=n.dataset.suggestion??"",p.focus(),u(e,"#add-guess").click()})})}}async function z(e,t){if(e==="canuckle")return(await D()).solver;const{getWordDataForLength:c}=await g(async()=>{const{getWordDataForLength:w}=await import("./C_s-30k2.js");return{getWordDataForLength:w}},[],import.meta.url);return c(t)}async function J(e){if(C.has(e))return C.get(e);let t;switch(e){case"len3":t=await g(()=>import("./aZT69gwQ.js"),[],import.meta.url);break;case"len4":t=await g(()=>import("./5dO22Y7O.js"),[],import.meta.url);break;case"len5":t=await g(()=>import("./CZanK6in.js"),[],import.meta.url);break;case"len6":t=await g(()=>import("./C6i7xHt4.js"),[],import.meta.url);break;case"len7":t=await g(()=>import("./C5oN9k_G.js"),[],import.meta.url);break;case"len8":t=await g(()=>import("./DKPWH3wP.js"),[],import.meta.url);break;case"len9":t=await g(()=>import("./CCQkDkOR.js"),[],import.meta.url);break;case"len10":t=await g(()=>import("./DFK1TDha.js"),[],import.meta.url);break;case"len11":t=await g(()=>import("./CqqnMvEW.js"),[],import.meta.url);break;case"canuckle":t=await g(()=>import("./VZQYOK9d.js"),[],import.meta.url);break;default:throw new Error(`Unknown solver key: ${e}`)}return await t.default(),C.set(e,t.solve),t.solve}async function D(){return A||(A=g(()=>import("./BuvA92yD.js"),[],import.meta.url).then(e=>e.default)),A}function R(e,t=T()){return e.puzzles.filter(c=>c.date<=t)}function T(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function W(e){const t=e.fact.join("");return v(t.replace(/\s*Check out\s*Practice Mode\s*to play random Canuckle games for fun without affecting your stats or streak numbers!\s*/gi,"").replace(/\s*Practice Mode\s*to play random Canuckle games for fun without affecting your stats or streak numbers!\s*/gi,"").replace(/\s*Check out\s*$/i,"").trim())}function Z(e,t){return t?[`#${e.index}`,e.index,e.answer,e.date,...e.fact].join(" ").toLowerCase().includes(t):!0}function S(e){return new Intl.DateTimeFormat(void 0,{month:"short",day:"numeric",year:"numeric"}).format(new Date(`${e}T12:00:00Z`))}function Q(e){try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}}function k(e,t){localStorage.setItem(e,JSON.stringify({bank:t.bank,hardMode:t.hardMode,maxGuesses:t.maxGuesses,warmleDistance:t.warmleDistance,turns:t.turns}))}function $(e){e.querySelector(".results-stale-note")||e.insertAdjacentHTML("afterbegin",`
                                <div class="results-stale-note">
                                        Board updated. Click <strong>calculate next guess</strong> to refresh these results.
                                </div>
                        `),e.classList.add("results-stale")}function j(e,t){return Array.from({length:e+1},(c,w)=>`<option value="${w}" ${w===t?"selected":""}>${w}</option>`).join("")}function X(e,t,c){const w=t.turns.length;return t.game==="xordle"?`${e.average.toFixed(3)} merge score`:c>1?`${e.average.toFixed(3)} guesses`:e.wrong>0?`${((1-e.wrong)*100).toFixed(2)}% solve rate`:w===0?`${e.average.toFixed(3)} guesses`:`${(e.average-w).toFixed(3)} guesses left`}function K(e){return e===1?"y":"ies"}function ee(e,t,c){return`${e.slice(0,t)}${c}${e.slice(t+1)}`}function q(e,t){return e.split("").filter(c=>c===t).length}function ae(e,t,c){return`${"G".repeat(t)}${"Y".repeat(c)}${"B".repeat(Math.max(0,e-t-c))}`}function x(e){return"B".repeat(e.wordLength)}function te(e){return e.feedbackMode==="spotle"?["B","G","Y","X"]:["B","G","Y"]}function ne(e,t){const c=te(e);return c[(c.indexOf(t)+1)%c.length]}function re(e,t,c){return c.length!==e.wordLength?!1:e.game==="thirdle"?/^[A-Z]+$/.test(c):t.guesses.includes(c)}function se(e){return e.game==="canuckle"?"Click tiles to cycle gray, green, and yellow after adding each guess. The answer bank uses Canuckle's Canadian-themed list.":e.feedbackMode==="woodle"?"After each guess, set how many letters are exact matches and how many are misplaced.":e.feedbackMode==="warmle"?"Click tiles to cycle between gray, green, and yellow. Yellow means alphabetically close, not misplaced.":e.feedbackMode==="peaks"?"Click tiles to cycle between gray, green, and yellow. Gray means the answer letter is earlier; yellow means later.":e.feedbackMode==="spotle"?"Click tiles to cycle gray, green, yellow, and blank after adding each guess.":e.game==="hardle"?"Click tiles to match the clue. Hardle can swap greens and yellows compared with standard Wordle.":e.game==="fibble"?"Click tiles to match the clue. In Fibble, one tile in each clue may be a lie.":e.game==="xordle"?"Click tiles to match the merged clue coming from the two hidden words.":"Click tiles to cycle gray, green, and yellow after adding each guess."}export{ie as mountWordlebotApp};
