/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { v4 as uuid } from 'uuid'
import { NodeType } from './Node'
import CreateNode from './Nodes/CreateNode/CreateNode'
import DefaultNode from './Nodes/DefaultNode/DefaultNode'
import EndNode from './Nodes/EndNode'
import StartNode from './Nodes/StartNode'
import PipelineGraph from './PipelineGraph/PipelineGraph'
import GroupNode from './Nodes/GroupNode/GroupNode'
import type { BaseListener, ListenerHandle } from './types'
import { StepGroupNode } from './Nodes/StepGroupNode/StepGroupNode'

export class DiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  type = ''
  canCreate = false
  canDelete = false
  nodeBank: Map<string, React.FC>
  listeners: { [id: string]: BaseListener }
  constructor(diagramType: string) {
    this.nodeBank = new Map()
    this.type = diagramType
    this.registerNode(NodeType.Default, DefaultNode)
    this.registerNode(NodeType.StartNode, StartNode)
    this.registerNode(NodeType.CreateNode, CreateNode)
    this.registerNode(NodeType.EndNode, EndNode)
    this.registerNode(NodeType.GroupNode, GroupNode)
    this.registerNode(NodeType.StepGroupNode, StepGroupNode)
    this.listeners = {}
  }

  getType(): string {
    return this.type
  }

  registerNode(type: string, Component: React.FC): void {
    this.nodeBank.set(type, Component)
  }

  registerListeners(listeners: Record<string, BaseListener>): Record<string, ListenerHandle> {
    const result: Record<string, ListenerHandle> = {}
    Object.entries(listeners).forEach(listener => {
      const id = uuid()
      this.listeners[listener[0]] = listener[1]
      result[id] = {
        id: id,
        listener: listener[1],
        deregister: () => {
          delete this.listeners[id]
        }
      }
    })
    return result
  }

  deregisterListener(listenerKey: string): boolean {
    if (this.listeners[listenerKey]) {
      delete this.listeners[listenerKey]
      return true
    }
    return false
  }

  getListenerHandle(listener: string): ListenerHandle | undefined {
    let listenerHandle
    if (typeof listener === 'string') {
      const listernHandle = this.listeners[listener]
      return {
        id: listener,
        listener: listernHandle,
        deregister: () => {
          delete this.listeners[listener]
        }
      }
    }

    return listenerHandle
  }

  getNode(type?: string): React.FC<any> | undefined {
    return this.nodeBank.get(type as string)
  }

  deregisterNode(type: string): void {
    const deletedNode = this.nodeBank.get(type)
    if (deletedNode) {
      this.nodeBank.delete(type)
    }
  }

  fireEvent(event: any): void {
    this.getListenerHandle(event.type)?.listener?.(event)
  }

  render(): React.FC<any> {
    const PipelineStudioHOC: React.FC<any> = (props: any): React.ReactElement => (
      <PipelineGraph getNode={this.getNode.bind(this)} fireEvent={this.fireEvent.bind(this)} {...props} />
    )
    return PipelineStudioHOC
  }
}

const DiagramNodes = {
  [NodeType.Default]: DefaultNode,
  [NodeType.CreateNode]: CreateNode,
  [NodeType.EndNode]: EndNode,
  [NodeType.StartNode]: StartNode
}

export { DiagramNodes, NodeType }
