import {$parentComposition, $serviceName, $services} from "../../const"

export default function ($) {
    if ($[$parentComposition]) {
        const serviceName = $[$serviceName]
        const parent = $[$parentComposition]
        const services = parent[$services]
        services[serviceName] = null
    }
}
