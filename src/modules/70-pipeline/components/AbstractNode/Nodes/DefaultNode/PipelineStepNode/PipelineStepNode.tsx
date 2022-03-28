/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, Text, Button, ButtonVariation, IconName, Utils } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import stepsfactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import SVGMarker from '../../SVGMarker'
import { NodeType } from '../../../types'
import defaultCss from '../DefaultNode.module.scss'

const CODE_ICON: IconName = 'command-echo'

interface PipelineStepNodeProps {
  getNode: (node: NodeType) => { component: React.FC<any> }
  fireEvent(arg0: {
    type: string
    target: EventTarget
    data: {
      allowAdd?: boolean | undefined
      entityType?: string
      identifier?: string
      parentIdentifier?: string
      prevNodeIdentifier?: string
      node?: PipelineStepNodeProps
      destination?: PipelineStepNodeProps
    }
  }): void
  status: string
  data: any
  readonly: boolean
  onClick: any
  id: string | undefined
  isSelected: boolean
  icon: string
  identifier: string
  name: JSX.Element
  defaultSelected: any
  parentIdentifier?: string
  isParallelNode: boolean
  prevNodeIdentifier?: string
  nextNode: any
  allowAdd?: boolean
  type: string
  selectedNodeId?: string
}
function PipelineStepNode(props: PipelineStepNodeProps): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const stepType = props.type || props?.data?.step?.stepType || ''
  const stepData = stepsfactory.getStepData(stepType)
  let stepIconColor = stepsfactory.getStepIconColor(stepType)
  if (stepIconColor && Object.values(Color).includes(stepIconColor)) {
    stepIconColor = Utils.getRealCSSColor(stepIconColor)
  }
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component

  const stepStatus = props?.status || (props?.data?.step?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus as ExecutionStatus,
    ExecutionPipelineNodeType.NORMAL
  )
  const isNodeSelected = props.isSelected || props?.selectedNodeId === props?.id
  return (
    <div
      className={cx(defaultCss.defaultNode, 'default-node', {
        draggable: !props.readonly
      })}
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
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            ...props
          }
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
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
    >
      <div className={cx(defaultCss.markerStart, defaultCss.stepMarker)}>
        <SVGMarker />
      </div>
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={!props.readonly}
        className={cx(defaultCss.defaultCard, {
          [defaultCss.selected]: isNodeSelected,
          [defaultCss.failed]: stepStatus === ExecutionStatusEnum.Failed,
          [defaultCss.runningNode]: stepStatus === ExecutionStatusEnum.Running
        })}
        style={{
          width: 64,
          height: 64
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
        onMouseEnter={event => {
          event.stopPropagation()

          props?.fireEvent({
            type: Event.MouseEnterNode,
            target: event.target,
            data: { ...props }
          })
        }}
        onMouseLeave={event => {
          event.stopPropagation()
          setVisibilityOfAdd(false)
          props?.fireEvent({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: { ...props }
          })
        }}
      >
        <div className="execution-running-animation" />
        {(stepData?.icon || props?.icon) && (
          <Icon
            size={28}
            color={isNodeSelected ? Color.WHITE : stepIconColor}
            name={(stepData?.icon || props?.icon || 'cross') as IconName}
            inverse={isNodeSelected || (stepStatus as string) === ExecutionStatusEnum.Failed}
            className={defaultCss.primaryIcon}
          />
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={defaultCss.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {CODE_ICON && (
          <Icon
            className={defaultCss.codeIcon}
            color={isNodeSelected ? Color.WHITE : undefined}
            size={8}
            name={CODE_ICON}
          />
        )}

        <Button
          className={cx(defaultCss.closeNode, { [defaultCss.readonly]: props.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
          iconProps={{ size: 10 }}
          onMouseDown={e => {
            e.stopPropagation()
            props?.fireEvent({
              type: Event.RemoveNode,
              target: e.target,
              data: { identifier: props?.identifier, node: props }
            })
          }}
          withoutCurrentColor={true}
        />
      </div>
      <div className={cx(defaultCss.markerEnd, defaultCss.stepMarker)}>
        <SVGMarker />
      </div>
      {props.name && (
        <Text
          width={90}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={defaultCss.stepNameText}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && CreateNode && !props.readonly && (
        <CreateNode
          onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
          onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            })
          }}
          className={cx(defaultCss.addNode, defaultCss.stepAddNode, { [defaultCss.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !props.readonly && (
        <div
          data-linkid={props?.identifier}
          onMouseOver={event => event.stopPropagation()}
          onMouseEnter={event => event.stopPropagation()}
          onMouseLeave={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
              target: event.target,
              data: {
                entityType: DiagramType.Link,
                node: props,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                identifier: props?.identifier
              }
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
              target: event.target,
              data: {
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              }
            })
          }}
          className={cx(defaultCss.addNodeIcon, defaultCss.left, defaultCss.stepAddIcon, {
            [defaultCss.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {!props?.nextNode && props?.parentIdentifier && !props.readonly && !props.isParallelNode && (
        <div
          data-linkid={props?.identifier}
          onMouseOver={event => event.stopPropagation()}
          onMouseEnter={event => event.stopPropagation()}
          onMouseLeave={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
              target: event.target,
              data: {
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Link,
                identifier: props?.identifier,
                node: props
              }
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
              target: event.target,
              data: {
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              }
            })
          }}
          className={cx(defaultCss.addNodeIcon, defaultCss.right, defaultCss.stepAddIcon, {
            [defaultCss.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
    </div>
  )
}

export default PipelineStepNode
