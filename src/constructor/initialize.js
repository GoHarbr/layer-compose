import {$isInitialized, IS_DEV_MODE} from "../const"

export default function initialize($, coreUpdate) {
    const has$initializer = typeof $.$ == 'function'

    $(coreUpdate)

    if (has$initializer) {
        $.$()
    }



    if (IS_DEV_MODE) {
        if ($[$isInitialized]) {
            throw new Error()
        }
        $[$isInitialized] = true
    }

}

