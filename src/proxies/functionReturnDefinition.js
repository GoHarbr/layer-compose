import {definedGetProxy}  from "./proxies"
import {noSetAccessProxy} from "./noSetAccessProxy"

export default {
    ...definedGetProxy,
    ...noSetAccessProxy
}
