import { lc } from "../../src"

export const RemoteLens = lc()

RemoteLens._layer = {
    remoteFn($,_,) {
        console.log('remote fn')
    },
}
