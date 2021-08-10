import {$parentComposition, $serviceName, $services} from "../../const"

export default function ($) {
    if ($[$parentComposition]) {
        const serviceName = $[$serviceName]
        const services = $[$parentComposition][$services]
        services[serviceName] = null
    }
}
