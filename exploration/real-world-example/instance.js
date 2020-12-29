import Task from "./Task"

/*
* Task has shape:
*
*
* {
*   (data, super, services) => object
*   [Symbol()]: true
* }
*
* it's a function with a
* */

Task({
    id: "task-id", views: {
        row: {
            isEnabled: true, domContainer: {/*html elem*/}, slots: {
                name: true,
                startDate: true,
                endDate: false
            }
        },
        expanded: {
            isEnable: false, domContainer: null, slots: {
                name: true,
                startDate: false,
                endDate: false
            }
        }
    }
})
