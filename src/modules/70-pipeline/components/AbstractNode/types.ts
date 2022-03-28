import type { IconName } from '@harness/uicore'

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
  id: string
  identifier: string
  type: string
  name: string
  icon: IconName
  status?: string
  data: any
  nodeType?: string
  graphType?: PipelineGraphType
  children?: PipelineGraphState[]
  parentStepGroupId?: string
  readonly?: boolean
}
export interface NodeIds {
  startNode: string
  createNode: string
  endNode: string
}

export interface SVGPathRecord {
  [key: string]: string
}

export type NodeBank = Map<string, NodeDetails>
export interface NodeDetails {
  component: React.FC
  isDefault?: boolean
}

export interface NodeCollapsibleProps {
  /** parent element selector to listen resize event on */
  parentSelector: string
  /** percent child visible to collapse */
  percentageNodeVisible?: number
  /** margin from child bottom to start expanding */
  bottomMarginInPixels?: number
}

export enum NodeStatus {
  Loading = 'Loading',
  Success = 'Success',
  Failure = 'Failure'
}

export enum NodeType {
  Default = 'default-node',
  EmptyNode = 'empty-node',
  CreateNode = 'create-node',
  DiamondNode = 'default-diamond',
  StartNode = 'start-node',
  GroupNode = 'group-node',
  IconNode = 'icon-node',
  EndNode = 'end-node',
  StepGroupNode = 'StepGroup'
}

export interface NodeProps<T> {
  width: number
  height: number
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
}

export interface NodeInterface {
  identifier: string
  type: NodeType
  name: string
  defaultIcon: IconName
  secondaryIcon?: IconName
  selectedColour?: string
  unSelectedColour?: string
  selectedIconColour?: string
  unSelectedIconColour?: string
}
export interface BaseReactComponentProps {
  getNode: (node: NodeType) => { component: React.FC<BaseReactComponentProps> }
  fireEvent(arg0: {
    type: string
    target: EventTarget
    data: {
      allowAdd?: boolean | undefined
      entityType?: string
      identifier?: string
      parentIdentifier?: string
      prevNodeIdentifier?: string
      node?: any
      destination?: any
    }
  }): void
  status: string
  data: any
  readonly: boolean
  onClick: any
  id: string | undefined
  isSelected: boolean
  icon: string
  identifier: string
  name: JSX.Element
  defaultSelected: any
  parentIdentifier?: string
  isParallelNode: boolean
  prevNodeIdentifier?: string
  nextNode: any
  allowAdd?: boolean
  type?: string
  selectedNodeId?: string
}
