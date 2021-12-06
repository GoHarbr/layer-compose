import {unbox, layerCompose, defaults} from "../src"
import {IS_DEV_MODE} from '../src/const'

describe('Using JS built-ins', () => {
    test('can use Set', async () => {
        const c = layerCompose(
            defaults(() => {
                return {
                    set : new Set()
                }
            }),

            {
            async init($,_) {},
            async add($,_) {
                _.set.add('A')
            }
        })()

        c.init()
        c.add()

        await c

        expect(IS_DEV_MODE).toBeTruthy()
        expect(unbox(c).set.has('A')).toBeTruthy()
    })

})
