/// <reference types="typings-esm-loader" />
/// @ts-check

import { pathToFileURL } from 'url';
import path from 'path';
import yargs from 'yargs';

const config = (new URL(import.meta.url).search.trim().toLowerCase() || '?').slice(1).split('/').filter(s => s).map(opt => {
    const split = opt.split('=');
    return split.length === 1 ? /** @type {const} */ ([split[0], true]) : /** @type {const} */ ([split.slice(0, -1).join('='), split.at(-1)]);
});

// ltr: https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-iterative.md
// rtl (default): https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-middleware.md
const CHAINING_MODE = config.find(([opt, v]) => (opt === 'iterative' || opt === 'ltr') && v === true) && 'ltr' || 'rtl';

const logger = /** @type {const} */ ({
    enabled: config.find(([opt, v]) => opt === 'debug' && v === true) && true,
    get log() { return this.enabled ? (...msg) => console.log('esmultiloader>', ...msg) : () => {} }
});

logger.log('url:', import.meta.url);
logger.log('cwd:', process.cwd());

const argv = /** @type {{ loader?: string | string[], experimentalLoader?: string | string[] }} */ (yargs(process.execArgv).argv);
const specifiers = [argv.loader || [], argv.experimentalLoader || []].flat().slice(0, -1);
if (CHAINING_MODE === 'rtl') specifiers.reverse();

const loaders = /** @type {Map<Loader, string>} */ (new Map());
const hooks = {
    /** @type {Map<resolve, string>} */
    resolve: new Map(),
    /** @type {Map<load, string>} */
    load: new Map(),
    /** @type {Map<globalPreload, string>} */
    globalPreload: new Map()
};

for (const specifier of specifiers) {
    const loaderSpecifier = /^\.?\.?\//.test(specifier) ? pathToFileURL(path.resolve(process.cwd(), specifier)).href : specifier;
    const loader = /** @type {Loader} */ (await import(loaderSpecifier));
    loaders.set(loader, specifier);

    if (typeof loader.resolve === 'function') hooks.resolve.set(loader.resolve, specifier);
    if (typeof loader.load === 'function') hooks.load.set(loader.load, specifier);
    if (typeof loader.globalPreload === 'function') hooks.globalPreload.set(loader.globalPreload, specifier);
}

logger.log('loaders resolved:', loaders);
logger.log('hooks resolved:', hooks);

/** @type {resolve} */
export async function resolve(specifier, context, defaultResolve) {
    return await invokeResolveHook(0, specifier, context);
    /**
     * @param {number} index
     * @param {string} specifier
     * @param {Resolve.Context} context
     * @return {Promise<Resolve.Return>}
     */
    async function invokeResolveHook(index, specifier, context) {
        const [resolveHook, name] = [...hooks.resolve][index] ?? [];
        if (!resolveHook) return await defaultResolve(specifier, context, defaultResolve);

        logger.log(`invoking resolve hook #${index} from loader ${name} for specifier ${specifier}`);
        return await resolveHook(specifier, context, async (specifier, context, defaultResolve) => {
            // Hook passed to the next hook in the chain.
            return await invokeResolveHook(index + 1, specifier, context);
        });
    }
}

/** @type {load} */
export async function load(url, context, defaultLoad) {
    return await invokeLoadHook(0, url, context);
    /**
     * @param {number} index
     * @param {string} url
     * @param {Load.Context} context
     * @return {Promise<Load.Return>}
     */
    async function invokeLoadHook(index, url, context) {
        const [loadHook, name] = [...hooks.load][index] ?? [];
        if (!loadHook) return await defaultLoad(url, context, defaultLoad);

        logger.log(`invoking load hook #${index} from loader ${name} for url ${url}`);
        return await loadHook(url, context, async (url, context, defaultLoad) => {
            // Hook passed to the next hook in the chain.
            return await invokeLoadHook(index + 1, url, context);
        });
    }
}

/** @type {globalPreload} */
export function globalPreload() {
    let preloadScript = '';

    let index = 0;
    for (const [globalPreloadHook, name] of hooks.globalPreload) {
        logger.log(`invoking globalPreload hook #${index} from loader ${name}`);
        preloadScript += globalPreloadHook() + '\n';
        index++;
    };
    
    return preloadScript;
}
