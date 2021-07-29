import {lcConstructor} from './lcConstructor'

type RemapFunction<L, R> = { [P in (keyof L | keyof R)]: (any) => any }

type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R] ? RemapFunction<L, Spread<R>> : never

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
