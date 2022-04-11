export function wrapInjected($) {
    return {
        then: $.then,
        catch: $.catch
    }
}
