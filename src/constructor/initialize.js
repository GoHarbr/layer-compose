import {$isInitialized, IS_DEV_MODE} from "../const"

export default function initialize($) {
    const has$initializer = typeof $.$ == 'function'
    const has_initializer = typeof $._ == 'function'

    has_initializer && $._()
    has$initializer && $.$()


    if (IS_DEV_MODE) {
        if ($[$isInitialized]) {
            throw new Error()
        }
        $[$isInitialized] = true
    }

}

