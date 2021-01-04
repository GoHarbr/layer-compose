import layerCompose from '../src'

describe('Data specific access points', () => {
    test('read access from outside', () => {
        const c = layerCompose({
            serviceKey: [{
                method() {}
            }]
        })({
            dataKey: 1,
            serviceKey: {
                key: 'v'
            }
        })

        expect(c.dataKey).toBe(1)
        expect(c.serviceKey.key).toEqual('v')
    })
})
