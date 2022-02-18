export default function ({borrow}) {
    borrow.slots = {}

    // `slots` are dynamically populated
    // this presents a challenge gating write access
    // the rule is that a layer is allowed to set properties on an object that it borrowed, unless another layer has borrowed that property

    // eg. this layer can set this.slots.name, this.slots.date, etc
    // as long as these aren't borrowed somewhere else

    return {
        setSlotEnabled(slotName, isOn) {
            const c = getSlot(this.slots, slotName)
            c.isEnabled = isOn
        },
        setSlotRenderer(SlotName, elementRenderer) {
            const c = getSlot(this.slots, slotName)
            c.renderer = elementRenderer
        },
        render() {
            for (const slotName of Object.keys(this.slots)) {
                const c = getSlot(this.slots, slotName)
                if (c.isEnabled) {
                    c.renderer()
                }
            }
        }
    }
}

function getSlot(slots, name) {
    return slots[name] || (slots[name] = {isEnabled: false, renderer: null})
}
