import React, { useRef, useState } from 'react'
import { defaultTo } from 'lodash-es'
import classNames from 'classnames'
import { NodeType } from '../Node'
import { v4 as uuid } from 'uuid'
// import { checkIntersectonBottom, useIntersectionObserver } from './PipelineGraphUtils'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import type { NodeIds, PipelineGraphState } from '../types'
import css from './PipelineGraph.module.scss'
export interface PipelineGraphRecursiveProps {
  nodes?: PipelineGraphState[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  uniqueNodeIds?: NodeIds
  fireEvent?: (event: any) => void
  setSelectedNode?: (nodeId: string) => void
  startEndNodeNeeded?: boolean
  startEndNodeStyle?: { height?: string; width?: string }
}
export const PipelineGraphRecursive = ({
  nodes,
  getNode,
  selectedNode,
  fireEvent,
  setSelectedNode,
  uniqueNodeIds,
  startEndNodeNeeded = true,
  startEndNodeStyle
}: PipelineGraphRecursiveProps): React.ReactElement => {
  const StartNode: React.FC<any> | undefined = getNode(NodeType.StartNode)
  const CreateNode: React.FC<any> | undefined = getNode(NodeType.CreateNode)
  const EndNode: React.FC<any> | undefined = getNode(NodeType.EndNode)
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <div>
          <div style={startEndNodeStyle} id={uniqueNodeIds?.startNode} className={classNames(css.graphNode)}>
            <StartNode />
          </div>
        </div>
      )}
      {nodes?.map((node, index) => {
        return (
          <PipelineGraphNode
            fireEvent={fireEvent}
            selectedNode={selectedNode}
            data={node}
            key={node?.identifier}
            getNode={getNode}
            setSelectedNode={setSelectedNode}
            isNextNodeParallel={!!nodes?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!nodes?.[index - 1]?.children?.length}
            prevNodeIdentifier={nodes?.[index - 1]?.identifier}
          />
        )
      })}
      {CreateNode && startEndNodeNeeded && (
        <CreateNode
          graphType={nodes?.[0]?.graphType}
          identifier={uniqueNodeIds?.createNode}
          name={'Add Stage'}
          fireEvent={fireEvent}
          getNode={getNode}
        />
      )}
      {EndNode && startEndNodeNeeded && (
        <div style={startEndNodeStyle} id={uniqueNodeIds?.endNode} className={classNames(css.graphNode)}>
          <EndNode />
        </div>
      )}
      <div></div>
    </div>
  )
}

interface PipelineGraphNode {
  className?: string
  data: PipelineGraphState
  fireEvent?: (event: any) => void
  getNode?: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode?: (nodeId: string) => void
  isParallelNode?: boolean
  isNextNodeParallel?: boolean
  isPrevNodeParallel?: boolean
  isLastChild?: boolean
  prevNodeIdentifier?: string
}

const PipelineGraphNodeBasic = ({
  fireEvent,
  getNode,
  setSelectedNode,
  data,
  className,
  isLastChild,
  selectedNode,
  isParallelNode,
  prevNodeIdentifier,
  isNextNodeParallel,
  isPrevNodeParallel
}: PipelineGraphNode): React.ReactElement | null => {
  const NodeComponent: React.FC<any> | undefined = getNode?.(data?.nodeType) || getNode?.(NodeType.Default)
  const ref = useRef<HTMLDivElement>(null)
  // const isIntersecting = useIntersectionObserver(ref, { threshold: 0.98 }, checkIntersectonBottom)
  const [id, setId] = useState<string>('')
  const rerenderChild = () => {
    setId(uuid())
  }
  const [collapseNode, setCollapseNode] = useState(false)

  const getGroupNodeHeader = (): Array<PipelineGraphState> => {
    const nodes: PipelineGraphState[] = []
    if (!data) return nodes
    nodes.push(data)
    data?.children?.forEach(child => {
      if (nodes.length < 2) {
        nodes.push(child)
      }
      if (child?.identifier === selectedNode) {
        if (nodes.length === 2) {
          nodes.splice(1, 1)
          nodes.unshift(child)
        }
      }
    })
    return nodes
  }

  const getGroupNodeName = (nodes: PipelineGraphState[]): string => {
    return `${defaultTo(nodes?.[0]?.name, '')} ${defaultTo(nodes?.[1]?.name, '')} ${
      (data?.children?.length || 0) > 1 ? ` + ${(data?.children?.length || 0) - 1} more stages` : ''
    }`
  }
  if (data.identifier === 'stpgrp11') {
    console.log(data)
  }

  return (
    <div
      ref={ref}
      className={classNames(
        { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
        css.node
      )}
    >
      {collapseNode ? (
        <GroupNode
          {...data}
          icons={(getGroupNodeHeader() || []).map(node => node.icon)}
          name={getGroupNodeName(getGroupNodeHeader() || [])}
          fireEvent={fireEvent}
          className={classNames(css.graphNode, className)}
          setSelectedNode={setSelectedNode}
          isSelected={selectedNode === data?.identifier}
          isParallelNode={isParallelNode}
          key={data?.identifier}
          allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
          prevNodeIdentifier={prevNodeIdentifier}
        />
      ) : (
        <>
          {NodeComponent && (
            <NodeComponent
              {...data}
              rerenderChild={rerenderChild}
              getNode={getNode}
              fireEvent={fireEvent}
              className={classNames(css.graphNode, className)}
              setSelectedNode={setSelectedNode}
              isSelected={selectedNode === data?.identifier}
              isParallelNode={isParallelNode}
              key={`${id}-${data?.identifier}`}
              allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
              isFirstParallelNode={true}
              prevNodeIdentifier={prevNodeIdentifier}
            />
          )}
          {data?.children?.map((currentStage, index) => (
            <PipelineGraphNode
              fireEvent={fireEvent}
              getNode={getNode}
              key={`${id}-${currentStage?.identifier}`}
              className={css.parallel}
              data={currentStage}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              isParallelNode={true}
              isLastChild={index + 1 === data?.children?.length}
              prevNodeIdentifier={prevNodeIdentifier}
            />
          ))}
        </>
      )}
    </div>
  )
}
const PipelineGraphNode = React.memo(PipelineGraphNodeBasic)
export { PipelineGraphNode }
