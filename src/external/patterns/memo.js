/**
 * returns object stored on parent, or generates a new one
 * */
import {$dataPointer, $parentInstance, IS_DEV_MODE} from "../../const"

const globalMemos = {}

export default function (generatorOrObj) {
    const key = Symbol()
    return ($, _) => {
        const p = $[$parentInstance]
        let memoStorage
        if (!p) {
            if (IS_DEV_MODE) console.warn('Setting a global memo')
            memoStorage = globalMemos
        } else {
            memoStorage = $[$parentInstance][$dataPointer]
        }

        const memo = memoStorage[key]
        if (!memo) {
            return memoStorage[key] = typeof generatorOrObj == 'function' ? generatorOrObj($,_) : {}
        } else {
            return memo
        }
    }
}

