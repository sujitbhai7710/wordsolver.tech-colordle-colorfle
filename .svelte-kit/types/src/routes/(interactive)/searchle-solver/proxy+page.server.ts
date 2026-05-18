// @ts-nocheck
import { getSearchlePuzzleForDate } from '$lib/searchle/daily';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load = () => ({
	dailyPuzzle: getSearchlePuzzleForDate(getPuzzleDateForGame('searchle'))
});
;null as any as PageServerLoad;