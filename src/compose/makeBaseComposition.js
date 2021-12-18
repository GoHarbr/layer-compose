import {
    $dataPointer,
    $extendSuper,
    $importsComplete,
    $layerOrder,
    $layers, $parentInstance,
    $runOnInitialize,
    $writableKeys
} from "../const"

export default function () {
    return {
        [$layers]: new Map(),
        [$layerOrder]: [],
        [$dataPointer]: null,
        [$writableKeys]: [$parentInstance],
    }
}
