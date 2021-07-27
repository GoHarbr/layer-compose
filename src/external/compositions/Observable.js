import layerCompose from '../../layerCompose'
import Async        from "./Async"
import defaults     from "../patterns/defaults"

const $owner = Symbol()
const $assign = Symbol()

/**
 * Notifies all layers of the current object that a write has been performed to the internal interface (which usually
 * would be a POJO)
 * */

export default layerCompose(
    Async,

    ($, _) => {
        _(makeProxy)
        $._attachObservable()
    },

    {
        Observable: [
            $ => $(Owner => ({ Owner })),
            defaults({ paused: false }, true),
            {
                pause($, _) {
                    _.paused = true
                },
                resume($, _) {
                    _.paused = false
                },
                onUpdate($, _) {
                    if (!_.paused) {
                        $.Owner.onUpdate()
                    }
                },
            },
        ]
    },

    {
        _attachObservable($, _) {
            if ("onUpdate" in $) {
                _[$owner] = $
            }
        },
        then($, _) {
            /* check if has `then` */
            if ("then" in _ && typeof _.then == "function") {
                // wrapping in a function is important, to preserve order of execution
                $.await(() => new Promise((res, rej) => _.then(() => res(), rej)))
            }
        }
    },
)

export function isObservable(obj) {
    return obj[$owner]
}

function makeProxy(proxyTarget) {

    proxyTarget[$assign] = Object.assign.bind(proxyTarget)

    return new Proxy(proxyTarget, {
        set(target, prop, val) {

            const hasChanged = target[prop] !== val
            target[prop] = val

            if (hasChanged && typeof prop != 'symbol' && prop[0] !== "_") {
                const owner = proxyTarget[$owner]
                if (owner) {
                    owner.Observable.onUpdate({
                        prop,
                        val
                    })
                }
            }
            return true
        }
    })
}
