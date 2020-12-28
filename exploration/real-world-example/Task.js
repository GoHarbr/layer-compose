const commonRenderStack = layerCompose(
    _super => {
        _super.render.override(function (layers, ...rest) { // this function is curried internally, thus becoming just `function(...rest)`
            // layers is an array only includes the ones that have `render` method defined
            layers.top.render()
        })
    },
    gatedContainerRenderer, baseColumnRenderer, subtaskRenderer
)

export default layerCompose(
    {
        async toggleRowView(insideDomElem){
            if (!!insideDomElem) {
                await super.dataManager.loadRemote()
                super.viewManager.row.setContainer(insideDomElem)
                super.viewManager.row.toggleDisplay(true)
                super.viewManager.row.render()
            }
        },
        async toggleExpandedView(insideDomElem){
            if (!!insideDomElem) {
                await super.dataManager.loadRemote()
                super.viewManager.expanded.setContainer(insideDomElem)
                super.viewManager.expanded.toggleDisplay(true)
                super.viewManager.expanded.render()
            }
        }
    },
    ({_super}) => {
        _super.dataManager.createDataView(task => task.data) // dataManager will not see `views` prop
        _super.viewManager.row.createDataView(task => task.views.row)
        _super.viewManager.expanded.createDataView(task => task.views.expanded)

        // both row and expanded renderers will now be able to access `dataManager` (but only after initialization)
        _super.viewManager.$all.addServices({
            dataManager: _super.dataManager
        })
    },
    {
        dataManager: DataManager,
        viewManager: {
            row: [rowViewRenderer, commonRenderStack],
            expanded: [expandedViewRenderer, commonRenderStack]
        }
    }
)
