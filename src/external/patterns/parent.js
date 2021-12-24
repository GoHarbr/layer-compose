import {$parentInstance} from "../../const"
import core              from "./core"

export default function ($) {
    return core($)[$parentInstance]
}
