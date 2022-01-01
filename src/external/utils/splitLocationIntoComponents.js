const re = /((\/?[\w.\-$_ ]+)+):([0-9]+):([0-9]+)/
export default function (errorLocationLine) {
    const match = re.exec(errorLocationLine)
    if (match.length) {
        return { filename: match[1], line: Number.parseInt(match[3]), column: Number.parseInt(match[4]), id: match[0] }
    } else {
        return null
    }
}
