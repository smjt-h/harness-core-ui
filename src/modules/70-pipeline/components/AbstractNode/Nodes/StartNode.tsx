/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Color } from '@wings-software/uicore'
import { NodeType } from '../Node'
import SVGMarker from './SVGMarker'
import css from './Nodes.module.scss'

const DEFAULT_ICON: IconName = 'play'

function StartNode(): React.ReactElement {
  return (
    <div className={css.defaultNode}>
      <div id={NodeType.StartNode.toString()} className={css.nodeStart}>
        <div className={css.markerStartNode}>
          <SVGMarker />
        </div>
        <div>
          <Icon name={DEFAULT_ICON} color={Color.GREEN_400} className={css.icon} />
        </div>
      </div>
    </div>
  )
}

export default StartNode
