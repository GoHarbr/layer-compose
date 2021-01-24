import {IS_DEV_MODE} from 'layer-compose'

export const List = [
    {
        pushAll: $ => $.watch(),
        push: $ => $.watch(),
    },
    {
        watch(_) {
            // IS_DEV_MODE && console.log('List is updated. Entry count: ' + _.entities.length)
        },
        pushAll(_, {items}) {
            _.entities = [..._.entities, ...items]
        },
        push(_, {item}) {
            _.entities.push(item)
        },
        getAll: _ => {
            return _.entities
        },
        find(_, {id}) {
            return _.entities.find(t => t.id === id)
        },

        init(_) {
            _.entities = []
        }
    }
]
