export type lcInstance<T extends object> = {
    [key in keyof T]: T[key]
}
export type lcLayerConstructor<S, M> = (($: S, d: any) => M) | (($: S, d: any) => () => {}) | M
export type lcConstructor<M extends object> = (data: object | undefined) => lcInstance<M>

type OrEmptyObject<T> = T extends {} ? T : {}
type O<T> = OrEmptyObject<T>

declare function layerCompose<M1, M2, M3>(s1: lcLayerConstructor<{}, O<M1>>, s2: lcLayerConstructor<O<M1>, O<M2>>,
                                          s3: lcLayerConstructor<O<M1> & O<M2>, O<M3>>,): lcConstructor<O<M1>&O<M2>&O<M3>>;
declare function layerCompose<M1, M2>(s1: lcLayerConstructor<{}, O<M1>>,
                                      s2: lcLayerConstructor<O<M1>, O<M2>>,): lcConstructor<O<M1>&O<M2>>;
declare function layerCompose<M1>(s1: lcLayerConstructor<{}, O<M1>>): lcConstructor<O<M1>>;

declare function layerCompose(...layers: lcLayerConstructor<any, any>): lcConstructor<any>;

export default layerCompose


/* utils */
export function unbox(what: lcInstance<any>): object | undefined

export const IS_DEV_MODE: boolean
