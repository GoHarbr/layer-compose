import layerCompose from "../../layerCompose"

export default function (transformer) {
    return ($, _) => _(core => {
                return transformer(core)
            })
}
