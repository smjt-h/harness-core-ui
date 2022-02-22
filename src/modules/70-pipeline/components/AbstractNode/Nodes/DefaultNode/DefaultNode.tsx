/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { Icon, Text, Color, Button, ButtonVariation } from '@wings-software/uicore'
import cx from 'classnames'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import css from './DefaultNode.module.scss'

const iconStyle = {
  color: 'var(--white)'
}
const SECONDARY_ICON: IconName = 'command-echo'

const DefaultNode = (props: any): JSX.Element => {
  const allowAdd = props.allowAdd ?? false
  const [addClicked, setAddClicked] = React.useState(false)
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)

  const onAddNodeClick = (
    e: React.MouseEvent<Element, MouseEvent>
    // identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    // setAddClicked: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    e.stopPropagation()
    props?.fireEvent({
      type: Event.AddParallelNode,
      identifier: props?.identifier,
      node: props,
      callback: () => {
        setAddClicked(false)
      },
      target: e.target
    })
  }

  React.useEffect(() => {
    const currentNode = nodeRef.current

    const onMouseOver = (_e: MouseEvent): void => {
      if (!addClicked && allowAdd) {
        setVisibilityOfAdd(true)
      }
      // onMouseOverNode(e, props.node)
    }

    const onMouseEnter = (_e: MouseEvent): void => {
      // onMouseEnterNode(e, props.node)
    }

    const onMouseLeave = (_e: MouseEvent): void => {
      if (!addClicked && allowAdd) {
        setVisibilityOfAdd(false)
      }
      // onMouseLeaveNode(e, props.node)
    }

    if (currentNode) {
      currentNode.addEventListener('mouseenter', onMouseEnter)
      currentNode.addEventListener('mouseover', onMouseOver)
      currentNode.addEventListener('mouseleave', onMouseLeave)
    }
    return () => {
      if (currentNode) {
        currentNode.removeEventListener('mouseenter', onMouseEnter)
        currentNode.removeEventListener('mouseover', onMouseOver)
        currentNode.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [nodeRef, allowAdd, addClicked])

  return (
    <>
      <div
        className={`${cx(css.defaultNode, 'default-node')} draggable`}
        ref={nodeRef}
        onClick={event => {
          event.stopPropagation()
          props?.fireEvent({ type: Event.ClickNode, entityType: DiagramType.Default, identifier: props?.identifier })
          props?.setSelectedNode(props?.identifier)
        }}
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
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destinationNode: props
          })
        }}
      >
        <div
          id={props.identifier}
          data-nodeid={props.identifier}
          draggable={true}
          className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
          style={{
            width: props.width || 90,
            height: props.height || 40,
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
          <div className="execution-running-animation" />
          {props.icon && (
            <Icon
              size={28}
              name={props.icon}
              inverse={props?.isSelected}
              // {...options.iconProps}
              style={{ pointerEvents: 'none', ...iconStyle }}
            />
          )}

          {SECONDARY_ICON && <Icon className={css.secondaryIcon} size={8} name={SECONDARY_ICON} />}
          <Button
            className={css.closeNode}
            minimal
            icon="cross"
            variation={ButtonVariation.PRIMARY}
            iconProps={{ size: 10 }}
            onMouseDown={e => {
              e.stopPropagation()
              props?.fireEvent({
                type: Event.RemoveNode,
                identifier: props?.identifier
              })
            }}
            withoutCurrentColor={true}
          />
        </div>
        {props.name && (
          <Text
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
            padding={'small'}
            lineClamp={2}
          >
            {props.name}
          </Text>
        )}
        {allowAdd && (
          <div
            onClick={event => {
              event.stopPropagation()

              setAddClicked(true)
              setVisibilityOfAdd(true)
              onAddNodeClick(event)
            }}
            className={css.addNode}
            data-nodeid="add-parallel"
            style={{
              width: props.width || 90,
              height: props.height || 40,
              display: showAdd ? 'flex' : 'none'
              // marginLeft: (128 - (props.width || 64)) / 2
            }}
          >
            <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
          </div>
        )}
      </div>
      {!props.isParallelNode && (
        <div
          data-linkid={props?.identifier}
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddLinkClicked,
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
              node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
              destinationNode: props
            })
          }}
          className={cx(css.addNodeIcon)}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
    </>
  )
}

export default DefaultNode
