// @ts-nocheck
import type { PageServerLoad } from './$types';
import { format } from 'date-fns';
import archiveJson from '../../../../static/worgle_archive.json';
import solutionsJson from '../../../../static/worgle_solutions.json';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import {
	formatWorgleDateKey,
	getWorgleEntryForDateKey,
	parseWorgleDateKey,
	type WorgleArchiveEntry
} from '$lib/worgle';

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
	const archive = archiveJson as WorgleArchiveEntry[];
	const solutions = solutionsJson as string[];
	const todayDate = getPuzzleDateForGame('worgle');
	const todayKey = formatWorgleDateKey(todayDate);
	const todayEntry = getWorgleEntryForDateKey(todayKey, archive, solutions);
	const latestStoredEntry = archive[archive.length - 1] ?? null;
	const last30Entries = archive.filter((entry) => entry.date <= todayKey).slice(-30).reverse();
	const previousEntry =
		archive
			.filter((entry) => entry.date < todayKey)
			.slice(-1)
			.at(0) ?? null;
	const formattedDate = format(parseWorgleDateKey(todayKey), 'MMMM d, yyyy');

	setHeaders({
		'X-Puzzle-Date': todayKey
	});

	return {
		todayKey,
		formattedDate,
		todayEntry,
		previousEntry,
		last30Entries,
		stats: {
			totalSolutions: solutions.length,
			totalArchived: archive.length,
			latestStoredDate: latestStoredEntry?.date ?? null
		},
		meta: {
			title: `Worgle Answer Today - ${formattedDate} | WordSolverX`,
			description: `Get the Worgle answer for ${formattedDate}, the live puzzle number, and the recent archive in one place.`,
			keywords: `worgle answer today, worgle archive, worgle answer ${todayKey}`
		}
	};
};
