/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import React from 'react'
import type { Node } from './Node'
import { DefaultNode } from './Nodes/DefaultNode'
import { DiamondNode } from './Nodes/DiamondNode'
import { EmptyNode } from './Nodes/EmptyNode'
import { EndNode } from './Nodes/EndNode'
import { StartNode } from './Nodes/StartNode'
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
  nodeBank: Map<string, Node>

  constructor(diagramType: string) {
    this.nodeBank = new Map()
    this.type = diagramType
  }

  getType(): string {
    return this.type
  }

  registerNode(node: Node): void {
    this.nodeBank.set(node.getType(), node as Node)
  }

  getNode(type?: string): Node | undefined {
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
const diagram = new DiagramFactory('graph')

diagram.registerNode(new DefaultNode())
diagram.registerNode(new DiamondNode())
diagram.registerNode(new EmptyNode())
diagram.registerNode(new StartNode())
diagram.registerNode(new EndNode())
const CDPipelineStudio = diagram.render()
export default CDPipelineStudio
