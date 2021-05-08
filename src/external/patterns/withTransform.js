import layerCompose from "../../index"

export default function (transformer, ...layers) {
    return layerCompose(($, _) =>
            _(core => {
                return transformer(core)
            }),
        ...layers
    )
}
