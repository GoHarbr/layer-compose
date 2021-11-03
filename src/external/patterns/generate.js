export default function generate(valuesOrGenerator) {
    return ($,_) => {
        const res = typeof valuesOrGenerator == 'function' ? valuesOrGenerator($,_) : valuesOrGenerator

        if (typeof res == 'function') {
            return res($,_)
        } else {
            for (const [k, v] of Object.entries(res)) {
                if (typeof v == 'function') res[k] = v($, _)
            }
            return res
        }
    }
}
