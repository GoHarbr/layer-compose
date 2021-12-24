// adapted from https://github.com/voodoocreation/ts-deepmerge/blob/master/src/index.ts
// https://stackoverflow.com/questions/49682569/typescript-merge-object-types

type RT<L, R> = L extends (...args) => any ? (
        R extends (...args) => any ? /* if both L & R */ ReturnType<R> & ReturnType<L> : /* if only L */ReturnType<L>
    ) : /* if only R -> */ (R extends (...args) => any ? ReturnType<R> : any)

type KEYS<L,R> = keyof L | keyof R
type RemapFunction<L, R> = {
        [P in KEYS<L,R>]: (any?: any) => RT<P extends keyof L ? L[P] : never, P extends keyof R ? R[P] : never>
    }

type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R] ? (
        L extends Function ? ( // is initializer or is it a Composition
                L extends {is: () => any} ? (L extends lcConstructor<infer C> ? RemapFunction<C, Spread<R>> : Spread<R>) : Spread<R>
            ) : ( // is constructor?
                L extends {} ? RemapFunction<L, Spread<R>> : ( // is object?
                        L extends [] ? RemapFunction<Spread<L>, Spread<R>> : Spread<R> // is array?
                    )
            )
    ): {}

/*
* Exports
* */



type SelfKeys<A extends readonly [...any]> = A extends [infer L, ...infer R] ? (
    L extends {} ? KEYS<L, SelfKeys<R>> : ( // is object?
        L extends [] ? KEYS<SelfKeys<L>, SelfKeys<R>> : SelfKeys<R> // is array?
        )
) : never

type Self<A extends readonly [...any]> = {
    [K in SelfKeys<A>]: (opt?: any) => any
}

export interface lcConstructor<M> {
    // withDefaults: (object: object) => lcConstructor<M>
    // transform: (object: object) => lcConstructor<M>
    is: (c: lcConstructor<any>) => boolean

    (data: object | undefined, cb: Function): M

    // (data: object | undefined): lcInstance<M>
}

// type MethodLayer<S>

// type MethodLayer<T, S> = {
//     [K in keyof T]: ($: S, _: any, opt?: any) => void
// }
type MethodLayer<T, S> = T extends {} ? {
    [K in keyof T]: ($: S, _: any, opt?: any) => void
} : {}

// type MethodLayers<A extends readonly [...any], S> = [{}]

type MethodLayers<A extends readonly [...any], S> = {
    [K in keyof A]: A[K] extends {} ? MethodLayer<A[K], S> : ( // is object?
        A[K] extends [] ? MethodLayers<A[K],S> : {} // is array?
        )
}

type Layers<A extends readonly any[]> = MethodLayers<A, Self<A>>


export function layerCompose<T extends {}[]>(...layers: [...T]): lcConstructor<Spread<T>>
// export function layerCompose<T extends [A extends {} ? {_($: {test: () => void})} : never], A>(...layers: T): lcConstructor<Spread<T>>
// export function layerCompose<T extends [A extends {} ? { [K in keyof A]: ($: {test: () => void}) => any } : never], A>(...layers: T): lcConstructor<Spread<T>>
// export function layerCompose<A>(...layers: [{_($: {test: () => void})}]): lcConstructor<Spread<[A]>>

// export function layerCompose<A extends {_($: {test: () => void})}>(...layers: [A]): lcConstructor<Spread<[A]>>
// export function layerCompose(...layers: [ {_: ($: {test: () => void}) => void}, any ]): lcConstructor<Spread<typeof layers>>
// export function layerCompose(...layers: [ {_: ($: {test: () => void}, _: any) => any}, any ]): lcConstructor<Spread<typeof layers>>
// export function layerCompose(l1: {_: ($: {test: () => void}, _: any) => any}): void

// export function layerCompose< K1 extends keyof L1, L1 extends {[key in K1]: ($: {test: () => void}) => void}>(l1: L1): void


// type Layers = [
//
// ]
// export function layerCompose(...layers: Layers): lcConstructor<Spread<T>>
// export function layerCompose(...layers: Layers<any>): lcConstructor<Spread<T>>
// export function layerCompose<A extends [...MethodLayers<A,S>], S extends Self<A>>(...layers: A): lcConstructor<Spread<A>>
// export const layerCompose<A extends [...MethodLayers<A,S>], S extends Self<A>>(...layers: A): lcConstructor<Spread<A>>

// export function layerCompose(layers: {[K : number] : MethodLayer<typeof layers, {}>}): lcConstructor<Spread<[]>>
// export function layerCompose(layers: Layers<typeof layers>): lcConstructor<Spread<[]>>

// type L = (layers: any[]) => any extends (layers: Layers<infer T>) => any ? (layers: Layers<T>) => lcConstructor<Spread<T>> : never
// type L = (layers: MethodLayer<any,any>[]) => any extends (layers: [MethodLayer<infer T,any>]) => any ? (layers: any[]) => T : never
// export const layerCompose: L

// export function layerCompose<A extends {
//     [K in keyof A]: ($: S, _: any, opt?: any) => void
// }, S extends Self<[A]>>(...layers: [A]): lcConstructor<Spread<[A]>>
// export function layerCompose(...layers: Layers): lcConstructor<Spread<T>>
