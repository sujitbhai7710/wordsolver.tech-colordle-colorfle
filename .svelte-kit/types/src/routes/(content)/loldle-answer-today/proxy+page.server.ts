// @ts-nocheck
import type { PageServerLoad } from './$types';
import { loadGameDleToday } from '$lib/game-dle/today';

export const load = async ({ fetch, setHeaders }: Parameters<PageServerLoad>[0]) => {
    return loadGameDleToday({
        fetchFn: fetch,
        setHeaders,
        game: 'loldle',
        gameTitle: 'LoLdle'
    });
};
