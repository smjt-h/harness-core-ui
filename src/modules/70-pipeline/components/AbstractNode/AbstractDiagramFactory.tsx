/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { Node } from './Node'

export interface NodeData {
  name: string
  icon: IconName
  selectedColour: string
  unSelectedColour: string
  selectedIconColour: string
  unSelectedIconColour: string
}

export abstract class AbstractDiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  protected abstract type: string

  protected nodeBank: Map<string, Node<unknown>>
  protected nodeDataMap: Map<string, NodeData>
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  constructor() {
    this.nodeBank = new Map()
    this.nodeDataMap = new Map()
  }

  getType(): string {
    return this.type
  }

  registerNode<T>(node: Node<T>): void {
    this.nodeBank.set(node.getType(), node as Node<unknown>)

    this.nodeDataMap.set(node.getType(), {
      name: node.getName(),
      icon: node.getDefaultIconName(),
      selectedColour: node.getSelectedColour(),
      unSelectedColour: node.getUnSelectedColour(),
      selectedIconColour: node.getSelectedIconColour(),
      unSelectedIconColour: node.getUnSelectedIconColour()
    })
    const nodeMap = node.getInvocationMap()
    if (nodeMap) {
      this.invocationMap = new Map([...this.invocationMap, ...nodeMap])
    }
  }

  deregisterNode(type: string): void {
    const deletedNode = this.nodeBank.get(type)
    if (deletedNode) {
      this.nodeBank.delete(type)
      this.nodeDataMap.delete(type)
      if (deletedNode.getInvocationMap()) {
        this.invocationMap = new Map()
        this.nodeBank.forEach(node => {
          const nodeMap = node.getInvocationMap()
          if (nodeMap) {
            this.invocationMap = new Map([...this.invocationMap, ...nodeMap])
          }
        })
      }
    }
  }

  getNode<T>(type?: string): Node<T> | undefined {
    if (type && !isEmpty(type)) {
      return this.nodeBank.get(type) as Node<T>
    }
    return
  }

  getNodeIdentifier(type: string): string | undefined {
    return this.nodeBank.get(type)?.getIdentifier()
  }

  getNodeName(type: string): string | undefined {
    return this.nodeBank.get(type)?.getName()
  }

  getNodeDefaultIcon(type: string): IconName {
    return this.nodeBank.get(type)?.getDefaultIconName() || 'disable'
  }

  getNodeSelectedColour(type: string): string | undefined {
    return this.nodeBank.get(type)?.getDefaultIconName()
  }

  getNodeUnselectedColour(type: string): string | undefined {
    return this.nodeBank.get(type)?.getUnSelectedColour()
  }

  getNodeSelectedIconColour(type: string): string | undefined {
    return this.nodeBank.get(type)?.getSelectedIconColour()
  }

  getNodeUnSelectedIconColour(type: string): string | undefined {
    return this.nodeBank.get(type)?.getUnSelectedIconColour()
  }

  getIsParallelNodeAllowed(type: string): boolean | undefined {
    return this.nodeBank.get(type)?.getIsParallelNodeAllowed()
  }

  getInvocationMap(): Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > {
    return this.invocationMap
  }
}
