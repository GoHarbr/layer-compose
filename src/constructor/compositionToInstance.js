import {
    $awaitedUponBy,
    $dataPointer,
    $fullyQualifiedName,
    $isCompositionInstance,
    $lensName,
    $parentInstance,
    $tag,
    IS_DEV_MODE
} from "../const"
import { core_unsafe } from "../external/patterns/core"
import seal from "./seal"
import wrapStandardMethods from "./wrapStandardMethods"
import initialize from "./initialize"
import { queueForExecution } from "../execution/queueForExecution"
import { wrapCompositionWithProxy } from "../proxies/wrapCompositionWithProxy"

export async function constructFromComposition(composition, coreObject, {
    lensName,
    fullyQualifiedName,
    preinitializer,
    tag,
    singleton,
    parent
}) {
    const compositionInstance = seal(composition)
    wrapStandardMethods(compositionInstance) // for methods like .then

    setProperties(compositionInstance, {
        lensName,
        fullyQualifiedName,
        tag,
        singleton,
        parent
    })

    // setAccessors(compositionInstance) // todo. remove?
    initialize(compositionInstance, coreObject)
    // preinitializer runs first, thus must be queued last
    preinitializer && queueForExecution(compositionInstance, () => preinitializer(compositionInstance), null, { next: true })

    if (IS_DEV_MODE) {
        return [wrapCompositionWithProxy(compositionInstance)]
    } else {
        return [compositionInstance]
    }
}

function setProperties(compositionInstance, {
    lensName,
    fullyQualifiedName,
    tag,
    singleton,
    parent
}) {

    compositionInstance[$isCompositionInstance] = true
    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName

    compositionInstance[$tag] = tag
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName || tag

    compositionInstance[$dataPointer] = singleton && core_unsafe(singleton) || singleton || {}
    compositionInstance[$dataPointer][$parentInstance] = parent
    compositionInstance[$awaitedUponBy] = new Set()
}
