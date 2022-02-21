/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import css from '../DefaultNode/DefaultNode.module.scss'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'

const DEFAULT_ICON: IconName = 'stop'
const SELECTED_COLOUR = 'var(--diagram-stop-node)'

const GroupNode = (props: any): React.ReactElement => {
  const allowAdd = props.allowAdd ?? false
  const [addClicked, setAddClicked] = React.useState(false)
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)

  const onAddNodeClick = (
    e: React.MouseEvent<Element, MouseEvent>,
    identifier: string,
    setAddClicked: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    e.stopPropagation()
    props?.fireEvent({
      type: Event.AddParallelNode,
      identifier,
      callback: () => {
        setAddClicked(false)
      },
      target: e.target
    })
  }

  return (
    <div
      className={css.defaultNode}
      //   onClick={e => onClickNode(e, props.node)}
      onMouseDown={e => {
        props?.fireEvent({ type: Event.ClickNode, entityType: DiagramType.GroupNode, identifier: props?.identifier })
        props?.setSelectedNode(props?.identifier)
      }}
      onDragOver={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          const dropData: { id: string; identifier: string } = JSON.parse(
            event.dataTransfer.getData(DiagramDrag.NodeDrag)
          )
          props.node.setSelected(false)
          props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
        }
      }}
    >
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: props.width || 90,
          height: props.height || 40,
          marginTop: -8,
          marginLeft: 8
        }}
      ></div>
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: props.width || 90,
          height: props.height || 40,
          marginTop: -4,
          marginLeft: 4
        }}
      ></div>

      <div
        id={props.identifier}
        data-nodeid={props.identifier}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: props.width || 90,
          height: props.height || 40,
          marginTop: 32 - (props.height || 64) / 2,
          ...props.customNodeStyle
        }}
      >
        <div className={css.iconGroup}>
          {props.icons?.[0] && <Icon size={28} name={props.icons[0]} {...props.iconPropsAr?.[0]} />}
          {props.icons?.[1] && <Icon size={28} name={props.icons[1]} {...props.iconPropsAr?.[1]} />}
        </div>
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
        style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
        padding={'small'}
        lineClamp={2}
        // font={{ size: 'normal', align: 'center' }}
        // style={{ cursor: 'pointer' }}
        // padding="xsmall"
        // // width={90}
      >
        {props.name}
      </Text>
      {allowAdd && (
        <div
          onClick={e => {
            e.stopPropagation()
            setAddClicked(true)
            setVisibilityOfAdd(true)
            onAddNodeClick(e, props.identifier, props.node)
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
  )
}

export default GroupNode
