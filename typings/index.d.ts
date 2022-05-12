import {lcInstance} from "./lcConstructor";

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

type lc = {
    (tag?: string): {}
    parent: typeof parent
}
export const lc: lc;

export function coreLens(transform: (parentCore) => object): ($, _) => object

export function defaults(_:object, values: object): void
export function generate(from: (($,_) => object) | object): ($, _) => object
export function transform(transform: (_) => object): ($, _) => object

export function lens(parentType?: object): object
export function memo(_: object, generator: (($,_) => object) | object): ($, _) => object
export function attach(generator: (($,_) => object) | object): ($, _) => object

export function parent($: lcInstance<any>): lcInstance<any>
export function core($: lcInstance<any>): lcInstance<any>
export function compose(...fns: [($,_,o) => void]): ($,_,o) => void

export function defer($: lcInstance<any>, fn: Function): lcInstance<any>
export function pause($: lcInstance<any>): () => void

export function orNull(what): any
export function copy(define: (object) => void): ($,_,o) => void
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
export function enableDebug(options: {
    trackDeadlocks: boolean,
    logTypes: {
        propertySet: boolean,
        propertyRead: boolean,
        accessorCall: boolean,
        methodCall: boolean,
        methodExecuted: boolean,
        coreUpdate: boolean,
        singleton: boolean,
        lens: boolean,
        dependency: boolean
    }
}): void
