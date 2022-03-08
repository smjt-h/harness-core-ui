/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Position } from '@blueprintjs/core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon, Text, Button, ButtonVariation, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { DefaultPortLabel } from '@pipeline/components/Diagram/port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '@pipeline/components/Diagram/port/DefaultPortModel'
import { useStrings } from 'framework/strings'
import css from './DiamondNode.module.scss'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { PipelineGraphType } from '../../types'

export function DiamondNodeWidget(props: any): JSX.Element {
  const [dragging, setDragging] = React.useState(false)
  const { getString } = useStrings()
  const isSelected = props?.isSelected

  return (
    <div
      className={cssDefault.defaultNode}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent({
          type: Event.ClickNode,
          entityType: DiagramType.Default,
          identifier: props?.identifier,
          parentIdentifier: props?.parentIdentifier
        })
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div
        id={props.id}
        data-nodeid={props.id}
        className={cx(cssDefault.defaultCard, css.diamond, { [cssDefault.selected]: isSelected }, props.nodeClassName)}
        draggable={true}
        onDragStart={event => {
          setDragging(true)
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props.node.serialize()))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          if (props.allowDropOnLink) event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          if (props.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        <div className="execution-running-animation" />
        {props.icon && <Icon size={28} inverse={isSelected} name={props.icon} style={props.iconStyle} />}
        {props.isInComplete && <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />}
        {props?.tertiaryIcon && (
          <Icon
            className={css.tertiaryIcon}
            size={15}
            name={props?.tertiaryIcon}
            style={props?.tertiaryIconStyle}
            {...props.tertiaryIconProps}
          />
        )}
        {props.secondaryIcon && (
          <Icon
            className={css.secondaryIcon}
            size={8}
            name={props.secondaryIcon}
            style={props.secondaryIconStyle}
            {...props.secondaryIconProps}
          />
        )}
        {props.skipCondition && (
          <div className={css.conditional}>
            <Text
              tooltip={`Skip condition:\n${props.skipCondition}`}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {props.conditionalExecutionEnabled && (
          <div className={css.conditional}>
            <Text
              tooltip={getString('pipeline.conditionalExecution.title')}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {props.isTemplate && (
          <Icon
            size={8}
            className={css.template}
            name={'template-library'}
            color={isSelected ? Color.WHITE : Color.PRIMARY_7}
          />
        )}
        {props.canDelete && (
          <Button
            className={cx(cssDefault.closeNode, css.diamondClose)}
            minimal
            variation={ButtonVariation.PRIMARY}
            icon="cross"
            iconProps={{ size: 10 }}
            onMouseDown={e => {
              e.stopPropagation()
              props?.fireEvent({
                type: Event.RemoveNode,
                identifier: props?.identifier,
                node: props
              })
            }}
            withoutCurrentColor={true}
          />
        )}
      </div>
      <Text
        width={props.graphType === PipelineGraphType.STEP_GRAPH ? 64 : 90}
        font={{ size: 'normal', align: 'center' }}
        color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
        className={cssDefault.nameText}
        padding={'small'}
        lineClamp={2}
      >
        {props.name}
      </Text>
    </div>
  )
}
