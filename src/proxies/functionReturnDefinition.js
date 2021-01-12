import {definedGetProxy, noSetAccessProxy} from "./proxies"

export default {
    ...definedGetProxy,
    ...noSetAccessProxy
}
