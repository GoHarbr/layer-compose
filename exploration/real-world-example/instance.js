import Task from "./Task"

Task({
    id: "task-id", views: {
        row: {
            isEnabled: true, domContainer: {/*html elem*/}, columns: {
                name: true,
                startDate: true,
                endDate: false
            }
        },
        expanded: {
            isEnable: false, domContainer: null, columns: {
                name: true,
                startDate: false,
                endDate: false
            }
        }
    }
})
