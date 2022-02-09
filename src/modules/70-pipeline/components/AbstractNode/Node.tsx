/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { PipelineNodeType } from './PipelineNode'

export enum NodeStatus {
  Loading = 'Loading',
  Success = 'Success',
  Failure = 'Failure'
}

// enum DiagramType {
//   Default = 'default',
//   EmptyNode = 'empty-node',
//   CreateNew = 'create-new',
//   DiamondNode = 'default-diamond',
//   StartNode = 'node-start',
//   GroupNode = 'group-node',
//   IconNode = 'icon-node'
// }

export interface NodeProps<T> {
  width: number
  height: number
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
}

export abstract class Node<T> {
  protected abstract identifier: string
  //   protected abstract type: DiagramType
  protected abstract name: string
  protected abstract defaultIcon: IconName
  protected abstract secondaryIcon?: IconName
  protected abstract selectedColour: string
  protected abstract unSelectedColour: string
  protected abstract selectedIconColour: string
  protected abstract unSelectedIconColour: string
  protected abstract renderNode(props: NodeProps<T>): JSX.Element
  protected invocationMap?: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  >

  abstract getType(): PipelineNodeType
  abstract getIsParallelNodeAllowed(): boolean

  getIdentifier(): string {
    return this.identifier
  }

  getName(): string {
    return this.name
  }

  getDefaultIconName(): IconName {
    return this.defaultIcon
  }

  getSecondaryIconName(): IconName | undefined {
    return this.secondaryIcon
  }

  getSelectedColour(): string {
    return this.selectedColour
  }

  getUnSelectedColour(): string {
    return this.unSelectedColour
  }

  getSelectedIconColour(): string {
    return this.selectedIconColour
  }

  getUnSelectedIconColour(): string {
    return this.unSelectedIconColour
  }

  getInvocationMap():
    | Map<RegExp, (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>>
    | undefined {
    return this.invocationMap
  }
}
