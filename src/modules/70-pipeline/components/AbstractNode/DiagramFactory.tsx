/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import React from 'react'
import { NodeType } from './Node'
import CreateNode from './Nodes/CreateNode/CreateNode'
import DefaultNode from './Nodes/DefaultNode/DefaultNode'
import EndNode from './Nodes/EndNode'
import StartNode from './Nodes/StartNode'
import PipelineGraph from './PipelineGraph/PipelineGraph'

export interface NodeData {
  name: string
  icon: IconName
  selectedColour: string
  unSelectedColour: string
  selectedIconColour: string
  unSelectedIconColour: string
}

export class DiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  type = ''
  canCreate = false
  canDelete = false
  nodeBank: Map<string, React.FC<any>>

  constructor(diagramType: string) {
    this.nodeBank = new Map()
    this.type = diagramType
    this.registerNode(NodeType.Default, DefaultNode)
    this.registerNode(NodeType.StartNode, StartNode)
    this.registerNode(NodeType.CreateNode, CreateNode)
    this.registerNode(NodeType.EndNode, EndNode)
  }

  getType(): string {
    return this.type
  }

  registerNode(type: string, Component: React.FC<any>): void {
    this.nodeBank.set(type, Component)
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

  render(): React.FC<any> {
    const PipelineStudioHOC: React.FC<any> = (props: any): React.ReactElement => (
      <PipelineGraph getNode={this.getNode.bind(this)} {...props} />
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
