import type { IconName } from '@harness/uicore'
import type { CSSProperties } from 'react'

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
  component: React.FC<BaseReactComponentProps>
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

export type FireEventMethod = (arg0: {
  type: string
  target: EventTarget
  data: {
    allowAdd?: boolean
    entityType?: string
    identifier?: string
    parentIdentifier?: string
    prevNodeIdentifier?: string
    node?: any
    destination?: any
    nodesInfo?: NodeInfo[]
  }
}) => void

export interface NodeInfo {
  name: string
  icon: string
  identifier: string
  type: string
}

export type GetNodeMethod = (type?: string | undefined) => NodeDetails
export interface BaseReactComponentProps {
  getNode?: GetNodeMethod
  fireEvent?: FireEventMethod
  setSelectedNode?(identifier: string): void
  getDefaultNode?(): NodeDetails | null
  updateGraphLinks?(): void
  isFirstParallelNode?: boolean
  className?: string
  name?: string
  identifier?: string
  id: string
  icon?: string
  iconStyle?: CSSProperties
  readonly?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isSelected?: boolean
  defaultSelected?: any
  parentIdentifier?: string
  isParallelNode?: boolean
  prevNodeIdentifier?: string
  nextNode?: PipelineGraphState
  allowAdd?: boolean
  prevNode?: PipelineGraphState
  type?: string
  selectedNodeId?: string
  nodesInfo?: NodeInfo[]
  width?: number
  height?: number
  data?: any
}
