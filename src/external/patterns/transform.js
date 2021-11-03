export default function (transformer) {
    return ($, _) => {
        const res = transformer(_)
        if (!res) {
            throw new Error("Transformer must return a new core object")
        }
        return res
    }
}
