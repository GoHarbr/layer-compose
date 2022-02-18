import Task from "../Task"
import common from "./common"

export default layerCompose(
    function ({borrow, services, Super}) {
        const {readSlotConfiguration} = Super

        /* used by SubtaskRenderer */
        borrow.createTask = function (id) {
            return Task({
                id, views: {
                    row: {
                        isEnabled: true, domContainer: {/*html elem*/}, slots: {
                            name: true,
                            startDate: true,
                            endDate: false
                        }
                    }
                }
            })
        }

        readSlotConfiguration()

    },
    function ({services, Super}) {
        const {render, setSlotRenderer} = Super

        // same principle as with Super, this allows us to catch errors at factory build rather
        // than method execution, and provide clarity around dependencies
        /* A service is accessible in any layer that is above where the service is defined */
        const {dataManager, subtaskRenderer} = services

        // this call is recorded, but not actually executed

        return {
            setContainer(elem) {
                const [nameSlot, startDateSlot, subtasksSlot] = [elem.children[1], elem.children[2], elem.children[3]]

                setSlotRenderer('name', () => nameSlot.innerHTML = dataManager.name)
                setSlotRenderer('startDate', () => startDateSlot.innerHTML = dataManager.startDate)
                setSlotRenderer('subtasks', subtaskRenderer.render)

                // refresh view
                render({
                    prepareContainer: () => {
                        /* ... */
                    }
                })
            }
        }
    },

    ...common
)
