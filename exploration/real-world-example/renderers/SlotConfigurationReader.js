export default function({Super}) {
    const setSlotEnabled = {Super}

    /*
    * Task expects a true/false value in `slots`, however DataSlotRenderer expands these
    * Used in intializer of all views
    * */

    return {
        readSlotConfiguration() {
            Object.entries(this.slots).forEach(([name, isEnabled]) => {
                setSlotEnabled(name, isEnabled)
            })
        }
    }
}
