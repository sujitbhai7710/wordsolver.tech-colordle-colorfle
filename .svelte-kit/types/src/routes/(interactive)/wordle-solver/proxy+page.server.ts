// @ts-nocheck
import { getWordleLengthPageConfig } from '$lib/wordlebot-wasm/route-config';
import type { PageServerLoad } from './$types';

export const load = async () => {
	return {
		config: getWordleLengthPageConfig(5)
	};
};
;null as any as PageServerLoad;