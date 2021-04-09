/*
*
* FIXME
*  These types are incorrect
*
* */

export interface lcSuperMethod<F extends (args: any) => any> {
    (args: Parameters<F>): ReturnType<F>
    lockOpt: (opt: {}) => void
    defaultOpt: (opt: {}) => void
}
export type lcSuperAccessor<T extends object> = {
    [key in keyof T]: T[key] extends (args: any) => any ? lcSuperMethod<T[key]> : T[key]
}
export type lcInstance<T extends object> = {
    [key in keyof T]: T[key]
}
//
export type lcLayerConstructor<S extends {}, M extends {} | never> =
    (($: lcSuperAccessor<S>, d: any) => M) |
    (($: lcSuperAccessor<S>, d: any) => void) |
    (($: lcSuperAccessor<S>, d: any) => () => {}) |
    M

export type lcConstructor<M extends object> = (data: object | undefined) => lcInstance<M>

type OrEmptyObject<T> = T extends {} ? T : {}
type O<T> = OrEmptyObject<T>

declare function layerCompose<M1, M2, M3>(s1: lcLayerConstructor<O<M2&M3>, O<M1>>, s2: lcLayerConstructor<O<M3>, O<M2>>,
                                          s3: lcLayerConstructor<{}, O<M3>>): lcConstructor<O<M1>&O<M2>&O<M3>>;
declare function layerCompose<M1, M2>(s1: lcLayerConstructor<O<M2>, O<M1>>,
                                      s2: lcLayerConstructor<{}, O<M2>>,): lcConstructor<O<M1>&O<M2>>;
declare function layerCompose<M1>(s1: lcLayerConstructor<{}, O<M1>>): lcConstructor<O<M1>>;

declare function layerCompose(...layers: lcLayerConstructor<any, any>): lcConstructor<any>;

export default layerCompose


/* utils */
export function unbox(what: lcInstance<any>): object | undefined
export function getComposition(what: lcConstructor<any>): object | undefined
export function cleanData(data: object): object
export function transformGetters(data: object): object
export const IS_DEV_MODE: boolean
