export function copy(def) {
    const fields = []
    const defP = new Proxy([], {
        get(target, prop) {
            fields.push(prop)
            return defP
        }
    })

    def(defP)

    return ($,_,o) => {
        for (const f of fields) {
            // if in o AND not the same in _
            (f in o && !(f in _ && o[f] == _[f])) && (_[f] = o[f])
        }
    }
}

/*
https://jsben.ch/f17AJ

const fields = ['a', 'b', 'c', 'd'];
const obj = {'a': 1, b: 2, c: 4, d: 6};

let sum = 0;
for (const f of fields) {
  sum += obj[f];
}

-----

const obj = {'a': 1, b: 2, c: 4, d: 6};
const a = (o) => o['a'];
const b = (o) => o['b'];
const c = (o) => o['c'];
const d = (o) => o['d'];

const sum = a(obj) + b(obj) + c(obj) + d(obj);

* */
