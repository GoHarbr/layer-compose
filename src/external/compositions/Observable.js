import layerCompose from '../../layerCompose';
import Async        from "./Async"

const $owner = Symbol();
const $assign = Symbol()

/**
 * Notifies all layers of the current object that a write has been performed to the internal interface (which usually would be a POJO)
 * */

export default layerCompose(
    Async,

    ($, _) => {
        _(makeProxy);
        $._attachObservable();
    },

    {
        _attachObservable($, _) {
            _[$owner] = $;
        },

        then($, _) {
            /* check if has `then` */
            if ("then" in _ && typeof _.then == "function") {
                // wrapping in a function is important, to preserve order of execution
                $.await(() => new Promise((res, rej) => _.then(() => res(), rej)))
            }
        }
    },

);

export function isObservable(obj) {
    return obj[$owner]
}

function makeProxy(proxyTarget) {

    proxyTarget[$assign] = Object.assign.bind(proxyTarget)

    return new Proxy(proxyTarget, {
        set(target, prop, val) {

            target[prop] = val;

            if (typeof prop != 'symbol' && prop[0] !== "_") {
                const owner = proxyTarget[$owner];
                if (owner && "onUpdate" in owner) {
                    owner.onUpdate({
                        prop,
                        val
                    });
                }
            }
            return true;
        }
    });
}
