/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import classnames from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation } from '@wings-software/uicore'
import { Event, DiagramDrag, DiagramType } from '@pipeline/components/Diagram'
import CreateNode from '../CreateNode/CreateNode'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import DefaultNode from '../DefaultNode/PipelineStageNode'

export function StepGroupNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)

  React.useEffect(() => {
    props?.updateGraphLinks()
  }, [isNodeCollapsed])

  return (
    <>
      {isNodeCollapsed ? (
        <DefaultNode
          onClick={() => {
            setNodeCollapsed(false)
          }}
          {...props}
          icon="step-group"
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
            onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
            className={classnames(
              css.stepGroup,
              { [css.firstnode]: !props?.isParallelNode },
              { [css.marginBottom]: props?.isParallelNode }
            )}
          >
            <div id={props?.id} className={css.horizontalBar}></div>
            <div className={css.stepGroupHeader}>
              <Layout.Horizontal
                spacing="xsmall"
                onMouseOver={e => {
                  e.stopPropagation()
                }}
                onMouseOut={e => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  className={css.collapseIcon}
                  name="minus"
                  onClick={e => {
                    e.stopPropagation()
                    setNodeCollapsed(true)
                  }}
                />
                <Text lineClamp={1}>{props.name}</Text>
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph
                getDefaultNode={props?.getDefaultNode}
                id={props?.id}
                identifier={props?.identifier}
                prevNodeIdentifier={props?.prevNodeIdentifier}
                data={props?.data?.stepGroup?.steps}
                fireEvent={props?.fireEvent}
                getNode={props?.getNode}
                updateSVGLinks={props.updateSVGLinks}
                isNodeCollapsed={isNodeCollapsed}
                updateGraphLinks={props?.updateGraphLinks}
              />
            </div>
            <Button
              className={classnames(css.closeNode, { [defaultCss.readonly]: props.readonly })}
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
          </div>
          {allowAdd && (
            <CreateNode
              className={classnames(
                defaultCss.addNode,
                defaultCss.stepGroupAddNode,
                { [defaultCss.visible]: showAdd },
                { [defaultCss.marginBottom]: props?.isParallelNode }
              )}
              onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
              onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
              onDrop={(event: any) => {
                props?.fireEvent({
                  type: Event.DropNodeEvent,
                  entityType: DiagramType.Default,
                  node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                  destination: props
                })
              }}
              onClick={(event: any) => {
                event.stopPropagation()
                props?.fireEvent({
                  type: Event.AddParallelNode,
                  identifier: props?.identifier,
                  parentIdentifier: props?.parentIdentifier,
                  entityType: DiagramType.StepGroupNode,
                  node: props,
                  target: event.target
                })
              }}
            />
          )}
        </div>
      )}
    </>
  )
}
