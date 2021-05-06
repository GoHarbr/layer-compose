import layerCompose from '../../src/index'

export default layerCompose(
    $ => $.getDom.defaultOpt({
        tag: 'div',
        class: ''
    }),
    {
        class: false,

        getDom($, _, opt) {
            if (!_.container) {
                _.container = `container-${opt.tag}`
            }
            return _.container
        },

        update($, _) {
            if (_.container) {
                _.container += "-update"
            }
        }
    })
    .partial({
        container: null,
        lazyStyle: null,
        class: ''
    })
