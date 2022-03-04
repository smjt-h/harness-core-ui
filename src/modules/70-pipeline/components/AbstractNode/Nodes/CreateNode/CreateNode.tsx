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
import { DiagramType, Event } from '@pipeline/components/Diagram'
import { PipelineGraphType } from '../../types'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'

function CreateNode(props: any): React.ReactElement {
  return (
    <div
      onMouseOver={() => {
        if (props?.onMouseOver) {
          props.onMouseOver()
        }
      }}
      onMouseLeave={() => {
        if (props?.onMouseLeave) {
          props.onMouseLeave()
        }
      }}
      className={cssDefault.defaultNode}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        props?.onDrop && props?.onDrop(event)
      }}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        if (props?.onClick) {
          props?.onClick(event)
          return
        }
        props?.fireEvent({
          type: Event.AddLinkClicked,
          entityType: DiagramType.CreateNew,
          identifier: props.identifier,
          target: event.target
        })
      }}
    >
      <div
        id={props.identifier}
        data-linkid={props.identifier}
        data-nodeid={props.identifier || props['data-nodeid']}
        className={cx(
          cssDefault.defaultCard,
          css.createNode,
          { [css.disabled]: props.disabled || false },
          { [css.selected]: props?.node?.isSelected },
          { [cssDefault.selected]: props.dropable },
          { [props.className]: props.className },
          {
            [css.stepAddIcon]: props.graphType === PipelineGraphType.STEP_GRAPH
          },
          {
            [css.stageAddIcon]: props.graphType === PipelineGraphType.STAGE_GRAPH
          }
        )}
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
