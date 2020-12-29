export default function ({Super, borrow}) {
    borrow.domContainer = null
    borrow.isEnabled = false

    const {render} = Super
    // Caveat:
    // IF a method is used from Super (in other words combined lower layers)
    // AND the same method is defined on this layer
    // THEN this layer must call it for the call to propagate to the lower layers!


    return {
        render({prepareContainer}) {
            if (this.isEnabled && this.domContainer) {
                prepareContainer(this.domContainer)

                /*
                * IMPORTANT
                * The following render call will receive all the same parameters as this render call,
                * plus any additional specified on it here
                *
                * ??? can this be done?
                * */

                render()
            }
        },
        toggleDisplay() {
            this.isEnabled = !this.isEnabled
        },
        setContainer(elem) {
            this.domContainer = elem
        }
    }
}
