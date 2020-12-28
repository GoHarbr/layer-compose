/*
* Scenario:
*
* Task
* id, name, start & end dates, subtaskIds
*
* The same task is shown on the page in 2 spots
* a row view and an expanded view
*
* So we reuse the data between the views
* We also manage the views, eg: expanded view might be closed or opened
*
* To make the matters even more complex, each view is modifiable
* In row view, columns can be shown or removed
* In expanded view certain elements can also be shown or removed
*
* To put a cherry on top, we reuse the row renderer within the expanded view
* to render subtasks
* */


/* file: */
const dataManager = [
    (_super) => {
        return {
            setTaskData(d) {
                _super.setName(d.name)
                _super.setDates(d.start, d.end)
            }
        }
    },
    //// NOTE: borrow and super are the same object
    //// for clarity's sake it might be better to design layerCompose to have a reserved `$borrow` key
    //// and use (eg) _super.$borrow.name = '' to set defaults
    // or maybe instead provide to each function an object in shape {_super, borrow, service} depending on what's beneath it
    function (borrow) {
        borrow.name = ''
        borrow.startDate = -1
        borrow.endDate = -1

        return {
            setName(n) {
                if (n) {
                    this.name = n
                }
            },

            setDates(start, end) {
                const s = start || this.startDate
                const e = end || this.endDate
                if (e <= s) throw new Error('End must be after start')
                this.startDate = s
                this.endDate = e
            }
        }
    }
]

/* file: */
const dataLoader = {
        async loadRemote() {
            const d = await query(this.id)
            super.setTaskData(d)
        }
    }

/* file */
function gatedContainerRenderer(borrow) {
    borrow.domContainer = null
    borrow.isEnabled = false

    return {
        render(continueRendering) {
            if (this.isEnabled && this.domContainer) {
                continueRendering()
            }
        },
        toggleDisplay() {},
        setContainer(elem) {this.domContainer = elem}
    }
}

/* file */
// used in rendering rows AND expanded views
function baseColumnRenderer(borrow) {
    borrow.columns = {}

    return {
        toggleColumnDisplay(columnName) {
            const c = getColumn(this.columns, columnName)
            c.isEnabled = !c.isEnabled
        },
        setColumnRenderer(columnName, elementRenderer) {
            const c = getColumn(this.columns, columnName)
            c.renderer = elementRenderer
        },
        render() {
            for (const columnName of Object.keys(this.columns)) {
                const c = getColumn(this.columns, columnName)
                if (c.isEnabled) {
                    c.renderer()
                }
            }
        }
    }
}
function getColumn(columns, name) {
    return columns[name] || (columns[name] = {isEnabled: false, renderer: null})
}

/* file */

/* file */
const rowViewRenderer = function (borrow) {
    return {
        render() {

        }
    }
}

/* file */
const expendedViewRenderer = {

}

/* file */
const subtaskRenderer = layerCompose(
    function (_super) {
        return {
            render() {
                const ids = this.data.subtaskIds
                _super.render(/*() => ... */)
            }
        }
    },
    gatedContainerRenderer
)


/* file */
// in the real world this defenition would not be a monolith like this
// it would be split across different files, each with its own call to `layerCompose`

const commonRenderStack = layerCompose(
    _super => {
        _super.render.override(layers => {
            // layers is an array only includes the ones that have `render` method defined
            layers.top()
        })
    },
    gatedContainerRenderer, baseColumnRenderer, subtaskRenderer
)

const Task = layerCompose(
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
    (_super) => {
        // ??? maybe use immer.js to make it work like this or similar
        _super.setDefaults(task => ({
            views: {}, // will do nothing since views are defined on initialization
            data: {id: task.id}
        }))
        _super.dataManager.takeSubset(task => task.data) // dataManager will not see `views` prop
    },
    {
        dataManager: [dataLoader, dataManager],
        viewManager: {
            row: [rowViewRenderer, ],
            expanded: [expandedViewRenderer]
        }
    }
)


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


/* mocks */

function query(id) {
    return {name: 'name', startDate: Date.now(), endDate: Date.now() + 24 * 3600 * 1000}
}
