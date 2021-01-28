export const IS_DEV_MODE = process.env.NODE_ENV !== 'production'

export const $isLc = Symbol('isLc')
export const $lcId = Symbol()
export const $isLcData = Symbol()

export const $isService = Symbol('isService')
export const $dataPointer = Symbol('dataPointer')
export const $servicesPointer = Symbol()
export const $runOnInitialize = Symbol()

export const $initializer = Symbol()
export const $isInitialized = Symbol()
export const $setData = Symbol()
export const $functionSymbolIds = Symbol('array-of-function-symbol-ids')

export const $spec = Symbol()
export const $composition = Symbol()

export const $dataProxyMap = Symbol('dataProxyMap')
export const $borrowedKeys = Symbol('borrowedKeys')

export const $layerId = Symbol()
export const $$ = Symbol('$$')
