/** Removes undefined properties */
export default function cleanData(data) {
    if (data == null || typeof data != "object") {
        if (data === undefined) throw new Error('Data cannot be `undefined`')
        return data
    }

    if (Array.isArray(data)) {
        return data.filter(_ => _ !== undefined).map(cleanData)
    } else {
        return Object.fromEntries(Object.entries(data).map(([k,v]) => {
            if (v === undefined) return
            return [k, cleanData(v)]
        }).filter(_ => _ !== undefined))
    }
}
