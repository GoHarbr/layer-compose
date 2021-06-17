import layerCompose from '../../layerCompose'

export default layerCompose(
    {
        getJson($, _) {
            _.json = {}
            $.buildJson()
            return _.json
        }
    },
)
