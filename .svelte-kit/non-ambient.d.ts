
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(interactive)" | "/(content)" | "/" | "/(content)/about" | "/(interactive)/all-wordle-solver" | "/api" | "/api/archive" | "/api/archive/[game]" | "/api/colordle" | "/api/colordle/today" | "/api/contexto" | "/api/contexto/daily" | "/api/framed" | "/api/framed/archive" | "/api/nerdle-answer" | "/api/squaredle-today" | "/api/worldle-answer" | "/(content)/archive" | "/(interactive)/betweenle-answer-today" | "/(interactive)/betweenle-solver" | "/(interactive)/betweenle" | "/(interactive)/boggle-solver" | "/(interactive)/canuckle-answer-today" | "/(interactive)/canuckle-archive" | "/(interactive)/canuckle" | "/(interactive)/colordle-answer-today" | "/(interactive)/colordle-archive" | "/(interactive)/colordle-solver" | "/(interactive)/colorfle-answer-today" | "/(interactive)/colorfle-archive" | "/(interactive)/colorfle-solver" | "/(content)/contact" | "/(interactive)/contexto-answer-today" | "/(interactive)/contexto-archive" | "/(interactive)/countryle-answer-today" | "/(interactive)/countryle-archive" | "/(interactive)/countryle-solver" | "/(content)/disclaimer" | "/(content)/dotadle-answer-today" | "/(interactive)/dotadle-solver" | "/(content)/editorial-policy" | "/(interactive)/framed-answer-today" | "/(interactive)/framed-archive" | "/(interactive)/globle-answer-today" | "/(interactive)/globle-archive" | "/(content)/guides" | "/(interactive)/hangman-solver" | "/(interactive)/kanoodle-solver" | "/(interactive)/light-out-solver" | "/(content)/loldle-answer-today" | "/(interactive)/loldle-solver" | "/(interactive)/minesweeper-solver" | "/(content)/narutodle-answer-today" | "/(interactive)/narutodle-solver" | "/(interactive)/nerdle-answer-today" | "/(interactive)/nerdle-archive" | "/(interactive)/nerdle-solver" | "/(content)/onepiecedle-answer-today" | "/(interactive)/onepiecedle-solver" | "/(interactive)/onepiedle-solver" | "/(interactive)/phoodle-answer-today" | "/(interactive)/phoodle-archive" | "/(interactive)/phoodle-solver" | "/(interactive)/phrazle-answer-today" | "/(interactive)/phrazle-archive" | "/(content)/pokedle-answer-today" | "/(interactive)/pokedle-solver" | "/(content)/privacy-policy" | "/(interactive)/quordle-answer-today" | "/(interactive)/quordle-archive" | "/(interactive)/searchle-answer-today" | "/(interactive)/searchle-archive" | "/(interactive)/searchle-solver" | "/(interactive)/semantle-answer-today" | "/(interactive)/semantle-archive" | "/sitemap.xml" | "/(content)/smashdle-answer-today" | "/(interactive)/smashdle-solver" | "/(content)/solver" | "/(interactive)/soundmap-solver" | "/(interactive)/sportle-answer-today" | "/(interactive)/sportle-archive" | "/(interactive)/sportle-solver" | "/(interactive)/spotle-answer-today" | "/(interactive)/spotle-archive" | "/(interactive)/spotle-solver" | "/(interactive)/squaredle-solver" | "/(content)/terms-of-service" | "/(content)/today" | "/(interactive)/waffle-answer-today" | "/(interactive)/waffle-archive" | "/(interactive)/waffle-solver" | "/(interactive)/weaver-solver" | "/(interactive)/word-ladder-solver" | "/(interactive)/wordle-analyzer" | "/(interactive)/wordle-answer-archive" | "/(interactive)/wordle-answer-today" | "/(interactive)/wordle-solver" | "/(interactive)/worgle-answer-today" | "/(interactive)/worgle-archive" | "/(interactive)/worldle-answer-today" | "/(interactive)/worldle-archive" | "/(interactive)/worldle-solver" | "/(interactive)/[wordLength=wordlebotLength]-letter-wordle-solver" | "/(interactive)/[variant=wordlebotVariant]-solver" | "/(content)/[slug]";
		RouteParams(): {
			"/api/archive/[game]": { game: string };
			"/(interactive)/[wordLength=wordlebotLength]-letter-wordle-solver": { wordLength: MatcherParam<typeof import('../src/params/wordlebotLength.js').match> };
			"/(interactive)/[variant=wordlebotVariant]-solver": { variant: MatcherParam<typeof import('../src/params/wordlebotVariant.js').match> };
			"/(content)/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/(interactive)": { wordLength?: MatcherParam<typeof import('../src/params/wordlebotLength.js').match>; variant?: MatcherParam<typeof import('../src/params/wordlebotVariant.js').match> };
			"/(content)": { slug?: string };
			"/": { game?: string; wordLength?: MatcherParam<typeof import('../src/params/wordlebotLength.js').match>; variant?: MatcherParam<typeof import('../src/params/wordlebotVariant.js').match>; slug?: string };
			"/(content)/about": Record<string, never>;
			"/(interactive)/all-wordle-solver": Record<string, never>;
			"/api": { game?: string };
			"/api/archive": { game?: string };
			"/api/archive/[game]": { game: string };
			"/api/colordle": Record<string, never>;
			"/api/colordle/today": Record<string, never>;
			"/api/contexto": Record<string, never>;
			"/api/contexto/daily": Record<string, never>;
			"/api/framed": Record<string, never>;
			"/api/framed/archive": Record<string, never>;
			"/api/nerdle-answer": Record<string, never>;
			"/api/squaredle-today": Record<string, never>;
			"/api/worldle-answer": Record<string, never>;
			"/(content)/archive": Record<string, never>;
			"/(interactive)/betweenle-answer-today": Record<string, never>;
			"/(interactive)/betweenle-solver": Record<string, never>;
			"/(interactive)/betweenle": Record<string, never>;
			"/(interactive)/boggle-solver": Record<string, never>;
			"/(interactive)/canuckle-answer-today": Record<string, never>;
			"/(interactive)/canuckle-archive": Record<string, never>;
			"/(interactive)/canuckle": Record<string, never>;
			"/(interactive)/colordle-answer-today": Record<string, never>;
			"/(interactive)/colordle-archive": Record<string, never>;
			"/(interactive)/colordle-solver": Record<string, never>;
			"/(interactive)/colorfle-answer-today": Record<string, never>;
			"/(interactive)/colorfle-archive": Record<string, never>;
			"/(interactive)/colorfle-solver": Record<string, never>;
			"/(content)/contact": Record<string, never>;
			"/(interactive)/contexto-answer-today": Record<string, never>;
			"/(interactive)/contexto-archive": Record<string, never>;
			"/(interactive)/countryle-answer-today": Record<string, never>;
			"/(interactive)/countryle-archive": Record<string, never>;
			"/(interactive)/countryle-solver": Record<string, never>;
			"/(content)/disclaimer": Record<string, never>;
			"/(content)/dotadle-answer-today": Record<string, never>;
			"/(interactive)/dotadle-solver": Record<string, never>;
			"/(content)/editorial-policy": Record<string, never>;
			"/(interactive)/framed-answer-today": Record<string, never>;
			"/(interactive)/framed-archive": Record<string, never>;
			"/(interactive)/globle-answer-today": Record<string, never>;
			"/(interactive)/globle-archive": Record<string, never>;
			"/(content)/guides": Record<string, never>;
			"/(interactive)/hangman-solver": Record<string, never>;
			"/(interactive)/kanoodle-solver": Record<string, never>;
			"/(interactive)/light-out-solver": Record<string, never>;
			"/(content)/loldle-answer-today": Record<string, never>;
			"/(interactive)/loldle-solver": Record<string, never>;
			"/(interactive)/minesweeper-solver": Record<string, never>;
			"/(content)/narutodle-answer-today": Record<string, never>;
			"/(interactive)/narutodle-solver": Record<string, never>;
			"/(interactive)/nerdle-answer-today": Record<string, never>;
			"/(interactive)/nerdle-archive": Record<string, never>;
			"/(interactive)/nerdle-solver": Record<string, never>;
			"/(content)/onepiecedle-answer-today": Record<string, never>;
			"/(interactive)/onepiecedle-solver": Record<string, never>;
			"/(interactive)/onepiedle-solver": Record<string, never>;
			"/(interactive)/phoodle-answer-today": Record<string, never>;
			"/(interactive)/phoodle-archive": Record<string, never>;
			"/(interactive)/phoodle-solver": Record<string, never>;
			"/(interactive)/phrazle-answer-today": Record<string, never>;
			"/(interactive)/phrazle-archive": Record<string, never>;
			"/(content)/pokedle-answer-today": Record<string, never>;
			"/(interactive)/pokedle-solver": Record<string, never>;
			"/(content)/privacy-policy": Record<string, never>;
			"/(interactive)/quordle-answer-today": Record<string, never>;
			"/(interactive)/quordle-archive": Record<string, never>;
			"/(interactive)/searchle-answer-today": Record<string, never>;
			"/(interactive)/searchle-archive": Record<string, never>;
			"/(interactive)/searchle-solver": Record<string, never>;
			"/(interactive)/semantle-answer-today": Record<string, never>;
			"/(interactive)/semantle-archive": Record<string, never>;
			"/sitemap.xml": Record<string, never>;
			"/(content)/smashdle-answer-today": Record<string, never>;
			"/(interactive)/smashdle-solver": Record<string, never>;
			"/(content)/solver": Record<string, never>;
			"/(interactive)/soundmap-solver": Record<string, never>;
			"/(interactive)/sportle-answer-today": Record<string, never>;
			"/(interactive)/sportle-archive": Record<string, never>;
			"/(interactive)/sportle-solver": Record<string, never>;
			"/(interactive)/spotle-answer-today": Record<string, never>;
			"/(interactive)/spotle-archive": Record<string, never>;
			"/(interactive)/spotle-solver": Record<string, never>;
			"/(interactive)/squaredle-solver": Record<string, never>;
			"/(content)/terms-of-service": Record<string, never>;
			"/(content)/today": Record<string, never>;
			"/(interactive)/waffle-answer-today": Record<string, never>;
			"/(interactive)/waffle-archive": Record<string, never>;
			"/(interactive)/waffle-solver": Record<string, never>;
			"/(interactive)/weaver-solver": Record<string, never>;
			"/(interactive)/word-ladder-solver": Record<string, never>;
			"/(interactive)/wordle-analyzer": Record<string, never>;
			"/(interactive)/wordle-answer-archive": Record<string, never>;
			"/(interactive)/wordle-answer-today": Record<string, never>;
			"/(interactive)/wordle-solver": Record<string, never>;
			"/(interactive)/worgle-answer-today": Record<string, never>;
			"/(interactive)/worgle-archive": Record<string, never>;
			"/(interactive)/worldle-answer-today": Record<string, never>;
			"/(interactive)/worldle-archive": Record<string, never>;
			"/(interactive)/worldle-solver": Record<string, never>;
			"/(interactive)/[wordLength=wordlebotLength]-letter-wordle-solver": { wordLength: MatcherParam<typeof import('../src/params/wordlebotLength.js').match> };
			"/(interactive)/[variant=wordlebotVariant]-solver": { variant: MatcherParam<typeof import('../src/params/wordlebotVariant.js').match> };
			"/(content)/[slug]": { slug: string }
		};
		Pathname(): "/" | "/about" | "/all-wordle-solver" | `/api/archive/${string}` & {} | "/api/colordle/today" | "/api/contexto/daily" | "/api/framed/archive" | "/api/nerdle-answer" | "/api/squaredle-today" | "/api/worldle-answer" | "/archive" | "/betweenle-answer-today" | "/betweenle-solver" | "/betweenle" | "/boggle-solver" | "/canuckle-answer-today" | "/canuckle-archive" | "/canuckle" | "/colordle-answer-today" | "/colordle-archive" | "/colordle-solver" | "/colorfle-answer-today" | "/colorfle-archive" | "/colorfle-solver" | "/contact" | "/contexto-answer-today" | "/contexto-archive" | "/countryle-answer-today" | "/countryle-archive" | "/countryle-solver" | "/disclaimer" | "/dotadle-answer-today" | "/dotadle-solver" | "/editorial-policy" | "/framed-answer-today" | "/framed-archive" | "/globle-answer-today" | "/globle-archive" | "/guides" | "/hangman-solver" | "/kanoodle-solver" | "/light-out-solver" | "/loldle-answer-today" | "/loldle-solver" | "/minesweeper-solver" | "/narutodle-answer-today" | "/narutodle-solver" | "/nerdle-answer-today" | "/nerdle-archive" | "/nerdle-solver" | "/onepiecedle-answer-today" | "/onepiecedle-solver" | "/onepiedle-solver" | "/phoodle-answer-today" | "/phoodle-archive" | "/phoodle-solver" | "/phrazle-answer-today" | "/phrazle-archive" | "/pokedle-answer-today" | "/pokedle-solver" | "/privacy-policy" | "/quordle-answer-today" | "/quordle-archive" | "/searchle-answer-today" | "/searchle-archive" | "/searchle-solver" | "/semantle-answer-today" | "/semantle-archive" | "/sitemap.xml" | "/smashdle-answer-today" | "/smashdle-solver" | "/solver" | "/soundmap-solver" | "/sportle-answer-today" | "/sportle-archive" | "/sportle-solver" | "/spotle-answer-today" | "/spotle-archive" | "/spotle-solver" | "/squaredle-solver" | "/terms-of-service" | "/today" | "/waffle-answer-today" | "/waffle-archive" | "/waffle-solver" | "/weaver-solver" | "/word-ladder-solver" | "/wordle-analyzer" | "/wordle-answer-archive" | "/wordle-answer-today" | "/wordle-solver" | "/worgle-answer-today" | "/worgle-archive" | "/worldle-answer-today" | "/worldle-archive" | "/worldle-solver" | `/${string}-letter-wordle-solver` & {} | `/${string}-letter-wordle-solver/` & {} | `/${string}-solver` & {} | `/${string}-solver/` & {} | `/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/10letterwords.json" | "/11letterwords.json" | "/12letterwords.json" | "/3letterwords.json" | "/404.html" | "/4letterwords.json" | "/5afdb297468f4294b8dfb5fc552d56ae.txt" | "/6letterwords.json" | "/7letterwords.json" | "/8letterwords.json" | "/9letterwords.json" | "/Countries-Continents.csv" | "/Wordle-Answer-today.webp" | "/author-wordsolverx.webp" | "/champions_detailed.csv" | "/colordle_data.json" | "/countryle_archive.json" | "/countryle_today.json" | "/data/dotadle_heroes.json" | "/data/loldle_champions.json" | "/data/narutodle_characters.json" | "/data/onepiecedle_characters.json" | "/data/pokedle_pokemon.json" | "/data/smashdle_characters.json" | "/data/sowpods.txt" | "/data/twl06.txt" | "/data/wordle-analyzer/initial-remaining-averages.json" | "/data/wordle-analyzer/word-data.json" | "/details.csv" | "/dictionary.txt" | "/framed_data.json" | "/generated/per-length/word-data-len10.json" | "/generated/per-length/word-data-len11.json" | "/generated/per-length/word-data-len3.json" | "/generated/per-length/word-data-len4.json" | "/generated/per-length/word-data-len5.json" | "/generated/per-length/word-data-len6.json" | "/generated/per-length/word-data-len7.json" | "/generated/per-length/word-data-len8.json" | "/generated/per-length/word-data-len9.json" | "/google6fa3a911843eaf3a.html" | "/og/betweenle-solver.svg" | "/og/dotadle-solver.svg" | "/og/loldle-solver.svg" | "/og/narutodle-solver.svg" | "/og/nerdle-archive.svg" | "/og/onepiecedle-solver.svg" | "/og/pokedle-solver.svg" | "/og/smashdle-solver.svg" | "/og/wordle-10-solver.svg" | "/og/wordle-11-solver.svg" | "/og/wordle-3-solver.svg" | "/og/wordle-4-solver.svg" | "/og/wordle-5-solver.svg" | "/og/wordle-6-solver.svg" | "/og/wordle-7-solver.svg" | "/og/wordle-8-solver.svg" | "/og/wordle-9-solver.svg" | "/phoodle-wasm/phoodle_solver.js" | "/phoodle-wasm/phoodle_solver_bg.wasm" | "/quordlewordbank.json" | "/robots.txt" | "/spotle_data.json" | "/squaredle/words_alpha.txt" | "/squaredle/words_alpha.txt.gz" | "/wasm-lib/wasm_lib.js" | "/wasm-lib/wasm_lib_bg.wasm" | "/words.json" | "/wordsolverx-favicon.webp" | "/wordsolverx.webp" | "/worgle_archive.json" | "/worgle_solutions.json" | string & {};
	}
}