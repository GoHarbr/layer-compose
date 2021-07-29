export interface lcConstructor<M> {
    withDefaults: (object: object) => lcConstructor<M>
    transform: (object: object) => lcConstructor<M>
    is: (c: lcConstructor<any>) => boolean

    (data: object | undefined): M

    // (data: object | undefined): lcInstance<M>
}

export type lcInstance<T> = {
    [key in keyof T]: T[key]
}
