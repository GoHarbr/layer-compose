import layerCompose from '../../layerCompose'

export default layerCompose(
    {
        getJson($, _) {
            _.JSON = {}
            $.toJSON()
            return _.JSON
        }
    },
)
