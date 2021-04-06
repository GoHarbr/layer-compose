import {definedGetProxy}  from "./proxies"
import {noSetAccessProxy} from "./noSetAccessProxy"

/*
* TODO. Deprecated?
* */

export default {
    ...definedGetProxy,
    ...noSetAccessProxy
}
