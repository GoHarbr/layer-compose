import {lcConstructor} from './lcConstructor'

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
        L extends lcConstructor<infer C> ? RemapFunction<C, Spread<R>> : ( // is constructor?
                L extends {} ? RemapFunction<L, Spread<R>> : ( // is object?
                        L extends [] ? RemapFunction<Spread<L>, Spread<R>> : RemapFunction<{}, Spread<R>> // is array?
                    )
            )
    ): never

// export default function layerCompose<T extends object[]>(...layers: [...T]): lcConstructor<Spread<T>>
export default function layerCompose<T extends object[]>(...layers: [...T]): lcConstructor<Spread<T>>





export interface lcSuperMethod<F extends (args: any) => any> {
    lockOpt: (opt: {}) => void
    defaultOpt: (opt: {}) => void

    (args: Parameters<F>): ReturnType<F>
}

export type lcSuperAccessor<T extends object> = {
    [key in keyof T]: T[key] extends (args: any) => any ? lcSuperMethod<T[key]> : T[key]
}
