export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["10letterwords.json","11letterwords.json","12letterwords.json","3letterwords.json","404.html","4letterwords.json","5afdb297468f4294b8dfb5fc552d56ae.txt","6letterwords.json","7letterwords.json","8letterwords.json","9letterwords.json","Countries-Continents.csv","Wordle-Answer-today.webp","author-wordsolverx.webp","champions_detailed.csv","colordle_data.json","countryle_archive.json","countryle_today.json","data/dotadle_heroes.json","data/loldle_champions.json","data/narutodle_characters.json","data/onepiecedle_characters.json","data/pokedle_pokemon.json","data/smashdle_characters.json","data/sowpods.txt","data/twl06.txt","data/wordle-analyzer/initial-remaining-averages.json","data/wordle-analyzer/word-data.json","details.csv","dictionary.txt","framed_data.json","generated/per-length/word-data-len10.json","generated/per-length/word-data-len11.json","generated/per-length/word-data-len3.json","generated/per-length/word-data-len4.json","generated/per-length/word-data-len5.json","generated/per-length/word-data-len6.json","generated/per-length/word-data-len7.json","generated/per-length/word-data-len8.json","generated/per-length/word-data-len9.json","google6fa3a911843eaf3a.html","og/betweenle-solver.svg","og/dotadle-solver.svg","og/loldle-solver.svg","og/narutodle-solver.svg","og/nerdle-archive.svg","og/onepiecedle-solver.svg","og/pokedle-solver.svg","og/smashdle-solver.svg","og/wordle-10-solver.svg","og/wordle-11-solver.svg","og/wordle-3-solver.svg","og/wordle-4-solver.svg","og/wordle-5-solver.svg","og/wordle-6-solver.svg","og/wordle-7-solver.svg","og/wordle-8-solver.svg","og/wordle-9-solver.svg","phoodle-wasm/phoodle_solver.js","phoodle-wasm/phoodle_solver_bg.wasm","quordlewordbank.json","robots.txt","spotle_data.json","squaredle/words_alpha.txt","squaredle/words_alpha.txt.gz","wasm-lib/wasm_lib.js","wasm-lib/wasm_lib_bg.wasm","words.json","wordsolverx-favicon.webp","wordsolverx.webp","worgle_archive.json","worgle_solutions.json"]),
	mimeTypes: {".json":"application/json",".html":"text/html",".txt":"text/plain",".csv":"text/csv",".webp":"image/webp",".svg":"image/svg+xml",".js":"text/javascript",".wasm":"application/wasm",".gz":"application/gzip"},
	_: {
		client: {start:"_app/immutable/entry/start.CSwhJVYv.js",app:"_app/immutable/entry/app.f0LioCkd.js",imports:["_app/immutable/entry/start.CSwhJVYv.js","_app/immutable/chunks/CEH1_9TU.js","_app/immutable/chunks/B--w_SLd.js","_app/immutable/chunks/B2nBMHGc.js","_app/immutable/chunks/D0iwhpLH.js","_app/immutable/chunks/ZbSRU1JC.js","_app/immutable/entry/app.f0LioCkd.js","_app/immutable/chunks/PPVm8Dsz.js","_app/immutable/chunks/CACuO2kX.js","_app/immutable/chunks/B--w_SLd.js","_app/immutable/chunks/bF8CWp0D.js","_app/immutable/chunks/DR1OH7a1.js","_app/immutable/chunks/ZbSRU1JC.js","_app/immutable/chunks/CqI6-il_.js","_app/immutable/chunks/e2E2YOnE.js","_app/immutable/chunks/DNDffsb-.js","_app/immutable/chunks/DYzIav86.js","_app/immutable/chunks/B2nBMHGc.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/58.js')),
			__memo(() => import('./nodes/74.js')),
			__memo(() => import('./nodes/75.js')),
			__memo(() => import('./nodes/76.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/(interactive)/all-wordle-solver",
				pattern: /^\/all-wordle-solver\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/api/archive/[game]",
				pattern: /^\/api\/archive\/([^/]+?)\/?$/,
				params: [{"name":"game","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/archive/_game_/_server.ts.js'))
			},
			{
				id: "/api/colordle/today",
				pattern: /^\/api\/colordle\/today\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/colordle/today/_server.ts.js'))
			},
			{
				id: "/api/contexto/daily",
				pattern: /^\/api\/contexto\/daily\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/contexto/daily/_server.ts.js'))
			},
			{
				id: "/api/framed/archive",
				pattern: /^\/api\/framed\/archive\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/framed/archive/_server.ts.js'))
			},
			{
				id: "/api/nerdle-answer",
				pattern: /^\/api\/nerdle-answer\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/nerdle-answer/_server.ts.js'))
			},
			{
				id: "/api/squaredle-today",
				pattern: /^\/api\/squaredle-today\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/squaredle-today/_server.ts.js'))
			},
			{
				id: "/api/worldle-answer",
				pattern: /^\/api\/worldle-answer\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/worldle-answer/_server.ts.js'))
			},
			{
				id: "/(interactive)/betweenle",
				pattern: /^\/betweenle\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/(interactive)/onepiedle-solver",
				pattern: /^\/onepiedle-solver\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/sitemap.xml",
				pattern: /^\/sitemap\.xml\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/sitemap.xml/_server.ts.js'))
			},
			{
				id: "/(interactive)/sportle-answer-today",
				pattern: /^\/sportle-answer-today\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/(interactive)/sportle-archive",
				pattern: /^\/sportle-archive\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(interactive)/sportle-solver",
				pattern: /^\/sportle-solver\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(content)/[slug]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set(["/","/about","/archive","/betweenle-solver","/boggle-solver","/colorfle-solver","/colordle-solver","/contact","/countryle-solver","/disclaimer","/dotadle-solver","/editorial-policy","/guides","/hangman-solver","/kanoodle-solver","/light-out-solver","/loldle-solver","/minesweeper-solver","/narutodle-solver","/nerdle-solver","/onepiecedle-solver","/canuckle","/canuckle/__data.json","/canuckle-answer-today","/canuckle-answer-today/__data.json","/canuckle-archive","/canuckle-solver","/phoodle-solver","/pokedle-solver","/privacy-policy","/quordle-solver","/dordle-solver","/octordle-solver","/thirdle-solver","/hardle-solver","/warmle-solver","/woodle-solver","/w-peaks-solver","/xordle-solver","/fibble-solver","/spotle-wordle-solver","/searchle-solver","/searchle-solver/__data.json","/smashdle-solver","/solver","/soundmap-solver","/spotle-solver","/squaredle-solver","/terms-of-service","/waffle-solver","/weaver-solver","/word-ladder-solver","/wordle-analyzer","/wordle-solver","/wordle-solver/__data.json","/worldle-solver","/3-letter-wordle-solver","/4-letter-wordle-solver","/5-letter-wordle-solver","/6-letter-wordle-solver","/7-letter-wordle-solver","/8-letter-wordle-solver","/9-letter-wordle-solver","/10-letter-wordle-solver","/11-letter-wordle-solver","/today","/betweenle-answer-today","/betweenle-answer-today/__data.json","/colorfle-answer-today","/colordle-answer-today","/colordle-answer-today/__data.json","/contexto-answer-today","/contexto-answer-today/__data.json","/countryle-answer-today","/dotadle-answer-today","/dotadle-answer-today/__data.json","/framed-answer-today","/globle-answer-today","/globle-answer-today/__data.json","/loldle-answer-today","/loldle-answer-today/__data.json","/narutodle-answer-today","/narutodle-answer-today/__data.json","/nerdle-answer-today","/nerdle-answer-today/__data.json","/onepiecedle-answer-today","/onepiecedle-answer-today/__data.json","/phoodle-answer-today","/phoodle-answer-today/__data.json","/phrazle-answer-today","/pokedle-answer-today","/pokedle-answer-today/__data.json","/quordle-answer-today","/quordle-answer-today/__data.json","/searchle-answer-today","/searchle-answer-today/__data.json","/semantle-answer-today","/semantle-answer-today/__data.json","/smashdle-answer-today","/smashdle-answer-today/__data.json","/spotle-answer-today","/spotle-answer-today/__data.json","/worgle-answer-today","/worgle-answer-today/__data.json","/waffle-answer-today","/waffle-answer-today/__data.json","/wordle-answer-today","/wordle-answer-today/__data.json","/worldle-answer-today","/worldle-answer-today/__data.json","/colorfle-archive","/colordle-archive","/contexto-archive","/countryle-archive","/framed-archive","/framed-archive/__data.json","/globle-archive","/nerdle-archive","/phoodle-archive","/phrazle-archive","/quordle-archive","/searchle-archive","/semantle-archive","/spotle-archive","/worgle-archive","/waffle-archive","/wordle-answer-archive","/worldle-archive"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
