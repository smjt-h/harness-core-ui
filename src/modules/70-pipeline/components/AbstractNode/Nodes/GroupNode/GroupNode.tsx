/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Text, Color } from '@wings-software/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import css from '../DefaultNode/DefaultNode.module.scss'

const GroupNode = (props: any): React.ReactElement => {
  const allowAdd = props.allowAdd ?? false
  const [_addClicked, setAddClicked] = React.useState(false)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)

  const nodesInfo = React.useMemo(() => {
    return props?.children
      ?.slice(props.intersectingIndex - 1)
      .map((node: any) => ({ name: node.name, icon: node.icon }))
  }, [props?.children, props.intersectingIndex])

  const getGroupNodeName = (): string => {
    return `${defaultTo(nodesInfo?.[0]?.name, '')} +  ${nodesInfo.length - 1} more stages`
  }
  const onAddNodeClick = (
    e: React.MouseEvent<Element, MouseEvent>,
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-shadow
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
          {nodesInfo[0].icon && <Icon size={28} name={nodesInfo[0].icon} />}
          {nodesInfo[1].icon && <Icon size={28} name={nodesInfo[1].icon} />}
        </div>
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
        style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
        padding={'small'}
        lineClamp={2}
      >
        {getGroupNodeName()}
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
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      )}
    </div>
  )
}

export default GroupNode
