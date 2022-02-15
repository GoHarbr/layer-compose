import { core, defaults, enableDebug, lc, parent } from "../../src/index"

enableDebug()

/*
* Basic shopping cart example
*
* User, Cart, Item
* */

const _id = lc()
_id._ID = (_) => "_.id"
_id._manage = {
    _($,_,o) {
        if (o.id) _.id = o.id
    },
    $($,_) {
        // make sure id exists by the end of instantiation
        if (!_.id) throw new Error('Missing id')
    }
}

const Item = lc()
Item._ = _id

const Cart = lc()
Cart._ = _id
Cart._items = {
    $($,_) {
        defaults(_, {items: []})
    },
    addItem($,_,itemProperties) {
        return $.Item(itemProperties || null, item => {
            _.items.push(item)
        })
    },
    removeItem($,_,o) {

    },

    Item
}


const User = lc()
User._id = {
    $($,_) {
        // automatically generate the id
        $({id: generateUuid()})
    }
}
User._basicInfo = {
    async _($,_,o) {
        // giving a user a default name
        defaults(_, {name: 'unknown'})
        // or changing the name to whatever is given
        if (o.name) _.name = o.name
    }
}
User._cart = {
    $($,_) {
        defaults(_, {cart: null})
    },
    setCart($,_,cart) {
        _.cart = cart
    },
    Cart: { // extending the Cart lens
        $($,_) {
            const p = parent($)
            const _p = core(p)
            const cart = _p.cart
            if (cart) {
                $(core(cart))
            } else {

                // define an id that will help with queries
                $({id: _p.id + generateUuid()})
                return p.setCart($)
            }
        },

        clearCart($,_) {
            // removes all items
            _.items = []
        }
    }
}
User.Cart = Cart // the base of the Cart lens is the globally defined Cart composition
User._ = _id // mixing in the id layer


describe("Basic shopping cart example", () => {
    test("User has automatically generated id", (done) => {

        // run
        User({name: 'anton'}, async user => {
            expect(user._ID)
            console.log(user._ID)

            await user({dateOfBirth: "yesterday"})

            const c = core(user)
            expect(c.dateOfBirth).toBeTruthy()
            done()
        })

    })

    test("User has a cart that can have items", done => {
        User({}, user => {
            user.Cart({}, async cart => {
                await cart.addItem({type: "Grocery", id: 'grocery-1'})

                const _cartCore = core(cart)
                expect(_cartCore.items.length).toBeTruthy()
            })
        })
    })
})



function generateUuid() {
    return Math.random().toString()
}
