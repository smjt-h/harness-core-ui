/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Node } from './Node'

export enum PipelineNodeType {
  Default = 'default',
  EmptyNode = 'empty-node',
  CreateNew = 'create-new',
  DiamondNode = 'default-diamond',
  StartNode = 'node-start',
  GroupNode = 'group-node',
  IconNode = 'icon-node'
}

export abstract class PipelineNode<T extends { type?: string }> extends Node<T> {
  protected abstract type: PipelineNodeType
  protected isParallelNodeAllowed = false

  getType(): PipelineNodeType {
    return this.type
  }

  getIsParallelNodeAllowed(): boolean {
    return this.isParallelNodeAllowed
  }
}
