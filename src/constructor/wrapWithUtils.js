import lens from "../external/patterns/lens"

export function wrapWithUtils(constructor) {
    constructor.lens = ($, applicator) => lens($, applicator, constructor)
}
