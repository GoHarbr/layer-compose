import {lcConstructor, lcInstance} from "./lcConstructor";

export { layerCompose } from './layerCompose';

export function coreLens(transform: (parentCore) => object): ($, _) => object

export function defaults(transform: (() => object) | object): ($, _) => object
export function generate(from: (($,_) => object) | object): ($, _) => object
export function transform(transform: (_) => object): ($, _) => object

export function lens(transform: (parent, parentCore) => object): ($, _) => object
export function memo(generator: (($,_) => object) | object): ($, _) => object
export function attach(generator: (($,_) => object) | object): ($, _) => object

/**
* Copies (generated) value into the core
* */
export function assign(value: (($,_) => object) | object): ($, _) => object
/**
 * Replaces the core with generated value
 * Does nothing if generator returns undefined or null
 * */
export function replace(replaceWith: (($,_) => object) | object)

export const IS_DEV_MODE: boolean

export function unbox(instance: lcInstance<any>): object
