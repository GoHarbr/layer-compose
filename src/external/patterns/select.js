import { IS_DEV_MODE } from "../../const"

export function select(from) {
    const selected = {}
    const p = new Proxy(() => {}, {
        get(target, prop) {
            const v = from[prop]
            if (IS_DEV_MODE && v === undefined) throw new Error('Selected key does not exist')

            selected[prop] = v
            return p
        },

        apply() {
            return selected
        }
    })

    return p
}
