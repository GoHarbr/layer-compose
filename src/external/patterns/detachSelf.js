import {$compositionId, $parentComposition} from "../../const"

export default function ($) {
    if ($[$parentComposition]) {
        const selfId = $[$compositionId]
        $[$parentComposition][selfId] = null
    }
}
