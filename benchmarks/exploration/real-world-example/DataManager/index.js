import RemoteLoader from "./RemoteLoader"
import SubtaskData from "./SubtaskData"
import SimpleTaskData from "./SimpleTaskData"

export default layerCompose(
    RemoteLoader,

    ({Super}) => {
        const {setName, setDates, setSubtaskIds} = Super
        // by requiring these to be destructured here, as opposed to being used directly in the layer's methods
        // we are introducing a safety feature
        // we can check if the layers underneath do indeed provide these methods

        // it is more verbose to write, but it is more readable (dependency transparency)

        // todo.
        // Make sure that `Super` is inaccessible/throws error if used in layer's methods eg. setTaskData()

        return {

            /* a convenience method */
            setTaskData(d) {
                setName(d.name)
                setDates(d.start, d.end)
                setSubtaskIds(d.subtaskIds)
            }
        }
    },

    SubtaskData,
    SimpleTaskData
)
