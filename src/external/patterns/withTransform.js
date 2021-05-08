import layerCompose from "../../layerCompose"

export default function (transformer, ...layers) {
    return layerCompose(($, _) =>
            _(core => {
                return transformer(core)
            }),
        ...layers
    )
}
