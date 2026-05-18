import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BwHrRAkb.js","_app/immutable/chunks/DR1OH7a1.js","_app/immutable/chunks/B--w_SLd.js","_app/immutable/chunks/DG-OD9wC.js","_app/immutable/chunks/e2E2YOnE.js"];
export const stylesheets = [];
export const fonts = [];
