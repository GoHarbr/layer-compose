import RowView      from "./views/RowView"
import ExpandedView from "./views/ExpandedView"
import DataManager  from "./DataManager"

export default layerCompose(
    function ({services}) {
        const {row, expanded} = services.viewManagers
        const {dataManager} = services

        return {
            async toggleRowView(insideDomElem) {
                if (!!insideDomElem) {
                    await dataManager.loadRemote()
                    row.setContainer(insideDomElem)
                    row.toggleDisplay(true)
                    row.render()
                }
            },
            async toggleExpandedView(insideDomElem) {
                if (!!insideDomElem) {
                    await dataManager.loadRemote()
                    expanded.setContainer(insideDomElem)
                    expanded.toggleDisplay(true)
                    expanded.render()
                }
            }
        }
    },
    ({services, borrow}) => {
        borrow.id = undefined // effectively prevents id from being changed anywhere
        // and since the default is `undefined`, layerCompose will force it to be set to a non-undefined value on instantiation

        const {row, expanded} = services.viewManagers
        const {dataManager} = services

        dataManager.createDataView(task => task.data) // dataManager will not see `views` prop
        // this will need to work closely with `borrow` to keep track of which properties have been borrowed

        row.createDataView(task => task.views.row)
        expanded.createDataView(task => task.views.expanded)
    },
    {
        viewManagers: {
            row: RowView,
            expanded: ExpandedView
        }
    },
    {
        dataManager: DataManager,
    }
)
