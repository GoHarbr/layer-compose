import {IS_DEV_MODE} from 'layer-compose'

export const List = [
    {
        pushAll: $ => $.watch(),
        push: $ => $.watch(),
    },
    {
        watch($,_) {
            // IS_DEV_MODE && console.log('List is updated. Entry count: ' + _.entities.length)
        },
        pushAll($,_, opt) {
            _.entities = [..._.entities, ...opt.items]
        },
        push($,_, opt) {
            _.entities.push(opt.item)
        },
        getAll: ($,_) => {
            return _.entities
        },
        find($,_, opt) {
            return _.entities.find(t => t.id === opt.id)
        },

        init($,_) {
            _.entities = []
        }
    }
]
