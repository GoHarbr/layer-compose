// we don't necessarily have to wrap an object with layerCompose to use it in another layerCompose stack

export default ({Super}) => {
    const {setTaskData} = Super

    return {
        async loadRemote() {
            const d = await query(this.id)
            setTaskData(d)
        }
    }
}

function query(id) {
    return {name: 'name', startDate: Date.now(), endDate: Date.now() + 24 * 3600 * 1000}
}
