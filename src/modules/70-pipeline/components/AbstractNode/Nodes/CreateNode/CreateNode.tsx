/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@wings-software/uicore'
import { Icon } from '@blueprintjs/core'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { NodeType } from '../../Node'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'

const CreateNode = (props: any) => {
  return (
    <div className={cx(cssDefault.defaultNode, css.createNode)}>
      <div
        id={NodeType.CreateNode.toString()}
        className={cx(
          cssDefault.defaultCard,
          css.createNew,
          { [css.disabled]: props.disabled || false },
          { [css.selected]: props?.node?.isSelected() },
          { [cssDefault.selected]: props.dropable },
          props.nodeClassName
        )}
        style={{
          marginTop: 32 - (props.height || 64) / 2,
          height: props.height || 40,
          width: props.width || 90,
          ...props.customNodeStyle
        }}
      >
        <div>
          <Icon icon="plus" iconSize={22} color={'var(--diagram-add-node-color)'} />
        </div>
      </div>
      {!isEmpty(props.name) && (
        <Text
          data-name="node-name"
          font={{ align: 'center' }}
          padding={{ top: 'small' }}
          lineClamp={2}
          style={{ marginLeft: '-30px', marginRight: '-30px' }}
        >
          {props.name}
        </Text>
      )}
    </div>
  )
}

export default CreateNode
