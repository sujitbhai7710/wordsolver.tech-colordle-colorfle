// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = async () => {
	throw redirect(301, '/5-letter-wordle-solver');
};
;null as any as PageServerLoad;