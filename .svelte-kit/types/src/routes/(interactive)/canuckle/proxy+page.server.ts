// @ts-nocheck
import { getCanuckleTodayPageConfig } from '$lib/wordlebot-wasm/route-config';
import type { PageServerLoad } from './$types';

export const load = async () => {
	return {
		config: getCanuckleTodayPageConfig()
	};
};
;null as any as PageServerLoad;