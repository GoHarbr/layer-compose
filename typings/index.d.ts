import {lcConstructor, lcInstance} from "./lcConstructor";

export { layerCompose } from './layerCompose'

export function unbox(what: lcInstance<any>): object | undefined

export function getLayerId(what: any): Symbol | undefined

export function renameIntoGetter(name: string): string | undefined

export function getComposition(what: lcConstructor<any>): object | undefined

export function cleanData(data: object): object

export function transformGetters(data: object): object

export function transform(transformer: (object) => object): Function

export function defaults(defaultValues: object): Function

export function detachSelf($: lcInstance<any>)

export function withTransform(transformer: (object) => object, ...layers: object[]): lcConstructor<any>

export const IS_DEV_MODE: boolean
