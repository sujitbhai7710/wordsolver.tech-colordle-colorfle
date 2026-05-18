import * as universal from '../entries/pages/(interactive)/all-wordle-solver/_page.ts.js';
import * as server from '../entries/pages/(interactive)/all-wordle-solver/_page.server.ts.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(interactive)/all-wordle-solver/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/(interactive)/all-wordle-solver/+page.ts";
export { server };
export const server_id = "src/routes/(interactive)/all-wordle-solver/+page.server.ts";
export const imports = ["_app/immutable/nodes/24.3TajqJHU.js","_app/immutable/chunks/DR1OH7a1.js","_app/immutable/chunks/B--w_SLd.js","_app/immutable/chunks/BlomONCL.js"];
export const stylesheets = [];
export const fonts = [];
