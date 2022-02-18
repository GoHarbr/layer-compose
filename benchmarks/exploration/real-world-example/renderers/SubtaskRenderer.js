/* file */
import ContainerRenderer from "./ContainerRenderer"

export default layerCompose(
    ContainerRenderer,

    function ({services}) {
        const {dataManager} = services

        return {
            render() {
                let ids = dataManager.subtaskIds
                // OR perhaps
                ids = dataManager.getActiveSubtaskIds()

                const tasks = ids.map(id => this.createTask(id))
                this.domContainer // use it to insert the tasks into dom
            }
        }
    }
)
