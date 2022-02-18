import ContainerRenderer from "../renderers/ContainerRenderer"
import DataSlotRenderer from "../renderers/DataSlotRenderer"
import SlotConfigurationReader from "../renderers/SlotConfigurationReader"

export default [
    {
        subtaskRenderer: SubtaskRenderer // service
    },

    SlotConfigurationReader,
    ContainerRenderer,
    DataSlotRenderer
]
