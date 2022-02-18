export default layerCompose((borrow) => {
    borrow.subtaskIds = []
    return {

        /*
        * Important caveat:
        * If this layer is used on top of a layer that also has a `setTaskData` method, then both will be called
        * a layer needs not to worry about the layers underneath
        * */

        setSubtaskIds(subtaskIds) {
            if (subtaskIds) {
                this.subtaskIds = subtaskIds
            } else {
                this.subtaskIds = []
            }
        },
        getActiveSubtaskIds() {

        }
    }
})
