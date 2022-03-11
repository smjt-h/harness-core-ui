/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { IconName } from '@wings-software/uicore'
import { Icon, Text, Color, Button, ButtonVariation } from '@wings-software/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import stepsfactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import SVGMarker from '../SVGMarker'
import { PipelineGraphType } from '../../types'
import { NodeType } from '../../Node'
import CreateNode from '../CreateNode/CreateNode'
import css from './DefaultNode.module.scss'

const SECONDARY_ICON: IconName = 'command-echo'

function PipelineStageNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const stepData = stepsfactory.getStepData(props.type)
  return (
    <div
      className={`${cx(css.defaultNode, 'default-node')} draggable`}
      // ref={nodeRef}
      onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
      onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
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
      onDragOver={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent({
          type: Event.DropNodeEvent,
          entityType: DiagramType.Default,
          node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
          destination: props
        })
      }}
    >
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={true}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: props.graphType === PipelineGraphType.STEP_GRAPH ? 64 : 90,
          height: props.graphType === PipelineGraphType.STEP_GRAPH ? 64 : 40,
          marginTop: 32 - (props.height || 64) / 2,
          cursor: props.disableClick ? 'not-allowed' : props.draggable ? 'move' : 'pointer',
          opacity: props.dragging ? 0.4 : 1
        }}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          // if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className={css.markerStart}>
          <SVGMarker />
        </div>
        <div className="execution-running-animation" />
        {props.icon && <Icon size={28} name={stepData?.icon || 'cross'} inverse={props?.isSelected} />}
        {SECONDARY_ICON && <Icon className={css.secondaryIcon} size={8} name={SECONDARY_ICON} />}
        <Button
          className={cx(css.closeNode, { [css.readonly]: props.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
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
        <div className={css.markerEnd}>
          <SVGMarker />
        </div>
      </div>
      {props.name && (
        <Text
          width={props.graphType === PipelineGraphType.STEP_GRAPH ? 64 : 90}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && (
        <CreateNode
          onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
          onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              identifier: props?.identifier,
              parentIdentifier: props?.parentIdentifier,
              entityType: DiagramType.Default,
              node: props,
              target: event.target
            })
          }}
          className={cx(
            css.addNode,
            { [css.visible]: showAddNode },
            {
              [css.stepAddNode]: props.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [css.stageAddNode]: props.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && (
        <div
          data-linkid={props?.identifier}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
              entityType: DiagramType.Link,
              node: props,
              prevNodeIdentifier: props?.prevNodeIdentifier,
              parentIdentifier: props?.parentIdentifier,
              identifier: props?.identifier
            })
          }}
          onDragOver={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(true)
          }}
          onDragLeave={event => {
            event.stopPropagation()
            event.preventDefault()
            setShowAddLink(false)
          }}
          onDrop={event => {
            event.stopPropagation()
            setShowAddLink(false)
            props?.fireEvent({
              type: Event.DropLinkEvent,
              linkBeforeStepGroup: false,
              entityType: DiagramType.Link,
              node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
              destination: props
            })
          }}
          className={cx(
            css.addNodeIcon,
            css.left,
            {
              [css.show]: showAddLink
            },
            {
              [css.stepAddIcon]: props.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [css.stageAddIcon]: props.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {(props?.nextNode?.nodeType === NodeType.StepGroupNode || (!props?.nextNode && props?.parentIdentifier)) &&
        !props.isParallelNode && (
          <div
            data-linkid={props?.identifier}
            onClick={event => {
              event.stopPropagation()
              props?.fireEvent({
                type: Event.AddLinkClicked,
                linkBeforeStepGroup: true,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Link,
                identifier: props?.identifier,
                node: props
              })
            }}
            onDragOver={event => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onDrop={event => {
              event.stopPropagation()
              props?.fireEvent({
                type: Event.DropLinkEvent,
                linkBeforeStepGroup: true,
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              })
            }}
            className={cx(
              css.addNodeIcon,
              css.right,
              {
                [css.show]: showAddLink
              },
              {
                [css.stepAddIcon]: props.graphType === PipelineGraphType.STEP_GRAPH
              },
              {
                [css.stageAddIcon]: props.graphType === PipelineGraphType.STAGE_GRAPH
              }
            )}
          >
            <Icon name="plus" color={Color.WHITE} />
          </div>
        )}
    </div>
  )
}

export default PipelineStageNode
