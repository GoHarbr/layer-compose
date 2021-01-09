import {IS_DEV_MODE} from 'layer-compose'

export const List = [
    ({watch}) => ({
        pushAll: watch,
        push: watch,
    }),

    ($, d) => {
        d({entities: []})

        return {
            watch(d) {
                IS_DEV_MODE && console.log('List is updated. Entry count: ' + d.entities.length)
            },
            pushAll(d, {items}) {
                d.entities = [...d.entities, ...items]
            },
            push(d, {item}) {
                d.entities.push(item)
            },
            getAll: d => {
                return d.entities
            },
            find(d, {id}) {
                return d.entities.find(t => t.id === id)
            }
        }
    }]
