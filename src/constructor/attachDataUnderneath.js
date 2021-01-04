import {selectExistingServices} from "../utils"

export function attachDataUnderneath(data, compositionInstance) {
    if (typeof Object.getPrototypeOf(data) != "object"
        || Object.getPrototypeOf(Object.getPrototypeOf(data)) == null) {
        Object.setPrototypeOf(compositionInstance, data)
    } else {
        Object.assign(Object.create(data), compositionInstance)
    }

    for (const serviceName in selectExistingServices(compositionInstance)) {
        const d = data[serviceName]
        if (typeof d =="object") {
            attachDataUnderneath(d, compositionInstance[serviceName])
        }
    }
}
