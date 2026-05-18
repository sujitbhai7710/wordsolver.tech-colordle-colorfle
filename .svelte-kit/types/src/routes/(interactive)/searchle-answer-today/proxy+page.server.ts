// @ts-nocheck
import { SEARCHLE_PUZZLES } from '$lib/searchle/searchleData';
import { getSearchlePuzzleForDate } from '$lib/searchle/daily';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load = () => ({
	totalPuzzles: SEARCHLE_PUZZLES.length,
	todayPuzzle: getSearchlePuzzleForDate(getPuzzleDateForGame('searchle')),
	meta: {
		description: `Today's Searchle autocomplete answer revealed. See the prompt, copy the answer, and browse ${SEARCHLE_PUZZLES.length.toLocaleString('en-US')} past puzzles in the archive.`
	}
});
;null as any as PageServerLoad;