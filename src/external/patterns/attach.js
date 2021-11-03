export default function attach(valuesOrGenerator) {
    return ($,_) => {
        const values = typeof valuesOrGenerator == 'function' ? valuesOrGenerator($,_) : valuesOrGenerator

        for (const [k,v] of Object.entries(values)) {
            // v must be a Lens
            // todo. k must be a capital

            // Lens compositions are stored under key starting with _
            $[k] = (cb) => {
                if (!cb) throw new Error("Callback must be present to access the service")
                cb(v)
            }
        }
    }
}
