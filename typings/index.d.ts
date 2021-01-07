export type lcConstructor<T extends object> = (data: object) => lcInstance<T>

export type lcInstance<T extends object> = {
    [key in keyof T]: T[key]
}

export default function layerCompose <T extends {}>(...layers): lcConstructor<T>

/* utils */
export function unbox(what: lcInstance<any>): object | undefined
