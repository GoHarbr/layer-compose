// taken from https://github.com/voodoocreation/ts-deepmerge/blob/master/src/index.ts

// declare module "layer-compose" {
    interface IObject {
        [key: string]: any;
    }

    type TUnionToIntersection<U> = (
        U extends any ? (k: U) => void : never
        ) extends (k: infer I) => void
        ? I
        : never;

    // export = layerCompose

    export function layerCompose<T extends IObject[], R extends TUnionToIntersection<T[number]>>(...layers: T): lcConstructor<R> // layerCompose.lcConstructor<R>;
// }

// declare namespace layerCompose {
    export interface lcSuperMethod<F extends (args: any) => any> {
        (args: Parameters<F>): ReturnType<F>
        lockOpt: (opt: {}) => void
        defaultOpt: (opt: {}) => void
    }
    export type lcSuperAccessor<T extends object> = {
        [key in keyof T]: T[key] extends (args: any) => any ? lcSuperMethod<T[key]> : T[key]
    }
    export type lcInstance<T> = {
        [key in keyof T]: T[key]
    }
    export interface lcConstructor<M> {
        (data: object | undefined) : lcInstance<M>
        withDefaults: (object) => lcConstructor<M>
        transform: (object) => lcConstructor<M>
    }

    export default layerCompose

    /* utils */
    export function unbox(what: lcInstance<any>): object | undefined

    export function getComposition(what: lcConstructor<any>): object | undefined

    export function cleanData(data: object): object

    export function transformGetters(data: object): object

    export function withTransform(transformer: (object) => object, ...layers: object[]): lcConstructor<any>

    export const IS_DEV_MODE: boolean
// }
