/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName } from '@wings-software/uicore'
import { Node, NodeInterface, NodeType } from '../Node'

export class StartNode extends Node {
  protected type = NodeType.StartNode
  // constructor(options: NodeInterface) {
  //   super({
  //     identifier: options.identifier,
  //     name: options.name
  //   } as NodeInterface)
  // }
  protected defaultIcon: IconName = 'play'
  protected secondaryIcon: IconName = 'play'
  protected selectedColour = 'var(--diagram-start-node)'
  protected unSelectedColour = 'black'
  protected selectedIconColour = 'black'
  protected unSelectedIconColour = 'black'
  render?(): React.ReactElement {
    return (
      <div
        id={NodeType.StartNode.toString()}
        style={{ height: '20px', width: '20px', borderRadius: '50%', background: 'grey' }}
      >
        <Icon name={this.defaultIcon} />
      </div>
    )
  }
}
