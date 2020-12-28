export default layerCompose(
    function ({borrow}) {
        borrow.name = ''
        borrow.startDate = -1
        borrow.endDate = -1

        return {
            setName(n) {
                if (n) {
                    this.name = n
                }
            },

            setDates(start, end) {
                const s = start || this.startDate
                const e = end || this.endDate
                if (e <= s) throw new Error('End must be after start')
                this.startDate = s
                this.endDate = e
            }
        }
    }

)
