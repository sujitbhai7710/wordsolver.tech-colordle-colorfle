export type PuzzleGame = 'colordle' | 'colorfle';

interface PuzzleWindowConfig {
	boundaryHourUtc: number;
	boundaryMinuteUtc: number;
	visibleDateOffsetDays: number;
}

const DAILY_ROLLOVER_GRACE_SECONDS = 30;

const PUZZLE_WINDOW_CONFIG: Record<PuzzleGame, PuzzleWindowConfig> = {
	colordle: {
		boundaryHourUtc: 16,
		boundaryMinuteUtc: 30,
		visibleDateOffsetDays: 1
	},
	colorfle: {
		boundaryHourUtc: 15,
		boundaryMinuteUtc: 0,
		visibleDateOffsetDays: 1
	}
};

function formatDateKeyFromUtcParts(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parsePuzzleDateKey(dateKey: string): Date {
	return new Date(`${dateKey}T12:00:00Z`);
}

export function formatPuzzleDateKey(date: Date): string {
	return formatDateKeyFromUtcParts(
		date.getUTCFullYear(),
		date.getUTCMonth() + 1,
		date.getUTCDate()
	);
}

function getWorkerLatestDate(config: PuzzleWindowConfig, now: Date): string {
	const currentBoundary = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		config.boundaryHourUtc,
		config.boundaryMinuteUtc,
		DAILY_ROLLOVER_GRACE_SECONDS,
		0
	);

	if (now.getTime() >= currentBoundary) {
		const visibleDate = new Date(
			Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate() + config.visibleDateOffsetDays
			)
		);
		return formatPuzzleDateKey(visibleDate);
	}

	const visibleDate = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + config.visibleDateOffsetDays - 1
		)
	);
	return formatPuzzleDateKey(visibleDate);
}

export function getPuzzleDateKeyForGame(game: PuzzleGame, now: Date = new Date()): string {
	return getWorkerLatestDate(PUZZLE_WINDOW_CONFIG[game], now);
}

export function getPuzzleDateForGame(game: PuzzleGame, now: Date = new Date()): Date {
	return parsePuzzleDateKey(getPuzzleDateKeyForGame(game, now));
}
