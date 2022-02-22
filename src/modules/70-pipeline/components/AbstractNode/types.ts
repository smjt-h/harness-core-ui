import type { IconName } from '@harness/uicore'
import type { StageElementWrapperConfig, ExecutionWrapperConfig } from 'services/cd-ng'

export interface ListenerHandle {
  deregister: () => any
  id: string
  listener: BaseListener
}

export interface NodeData {
  name: string
  icon: IconName
  selectedColour: string
  unSelectedColour: string
  selectedIconColour: string
  unSelectedIconColour: string
}

export type BaseListener = (event: any) => void

export const enum PipelineGraphType {
  STAGE_GRAPH = 'STAGE_GRAPH',
  STEP_GRAPH = 'STEP_GRAPH'
}
export interface PipelineGraphState {
  identifier: string
  type: string
  name: string
  icon: IconName
  data: StageElementWrapperConfig | ExecutionWrapperConfig
  nodeType?: string
  graphType?: PipelineGraphType
  children?: PipelineGraphState[]
}
