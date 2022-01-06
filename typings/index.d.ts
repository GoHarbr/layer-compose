import {lcConstructor, lcInstance} from "./lcConstructor";

export { layerCompose } from './layerCompose';

type $<T> = (layer: T) => {
    (core: {}, cb: ($: T) => void) : void,
    $: <T2>(layer: T2) => $<T | T2>
}

export const $: <T>(layer: T) => {
    (core: {}, cb: ($: T) => void) : void,
    $: <T2>(layer: T2) => $<T | T2>
}
export const o: {$: typeof $}

export function coreLens(transform: (parentCore) => object): ($, _) => object

export function defaults(_:object, values: object): void
export function generate(from: (($,_) => object) | object): ($, _) => object
export function transform(transform: (_) => object): ($, _) => object

export function lens(transform: (parent, parentCore) => object): ($, _) => object
export function memo(generator: (($,_) => object) | object): ($, _) => object
export function attach(generator: (($,_) => object) | object): ($, _) => object

export function parent($: lcInstance<any>): lcInstance<any>
export function core($: lcInstance<any>): lcInstance<any>

export function defer($: lcInstance<any>, fn: Function): lcInstance<any>
export function pause($: lcInstance<any>, fn: Function): () => void

/**
* Copies (generated) value into the core
* */
export function assign(value: (($,_) => object) | object): ($, _) => object
/**
 * Replaces the core with generated value
 * Does nothing if generator returns undefined or null
 * */
export function replace($: lcInstance<any>, replaceWith: object): void

export const IS_DEV_MODE: boolean

export function unbox(instance: lcInstance<any>): object
export function enableDebug(): void
