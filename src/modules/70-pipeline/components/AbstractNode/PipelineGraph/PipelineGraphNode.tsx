import React, { useRef, useState } from 'react'
import { defaultTo } from 'lodash-es'
import classNames from 'classnames'
import { NodeType } from '../Node'
import { checkIntersectonBottom, useIntersectionObserver } from './PipelineGraphUtils'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import type { NodeIds, PipelineGraphState } from '../types'
import css from './PipelineGraph.module.scss'
export interface PipelineGraphRecursiveProps {
  stages?: PipelineGraphState[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  uniqueNodeIds?: NodeIds
  fireEvent?: (event: any) => void
  setSelectedNode?: (nodeId: string) => void
  startEndNodeNeeded?: boolean
  mergeSVGLinks?: (svgPath: string[]) => void
}
export const PipelineGraphRecursive = ({
  stages,
  getNode,
  selectedNode,
  fireEvent,
  setSelectedNode,
  uniqueNodeIds,
  startEndNodeNeeded,
  mergeSVGLinks
}: PipelineGraphRecursiveProps): React.ReactElement => {
  const StartNode: React.FC<any> | undefined = getNode(NodeType.StartNode)
  const CreateNode: React.FC<any> | undefined = getNode(NodeType.CreateNode)
  const EndNode: React.FC<any> | undefined = getNode(NodeType.EndNode)
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <div>
          <div id={uniqueNodeIds?.startNode} className={classNames(css.graphNode)}>
            <StartNode />
          </div>
        </div>
      )}
      {stages?.map((stage, index) => {
        return (
          <PipelineGraphNode
            fireEvent={fireEvent}
            selectedNode={selectedNode}
            data={stage}
            key={stage?.identifier}
            getNode={getNode}
            setSelectedNode={setSelectedNode}
            isNextNodeParallel={!!stages?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!stages?.[index - 1]?.children?.length}
            mergeSVGLinks={mergeSVGLinks}
          />
        )
      })}
      {CreateNode && startEndNodeNeeded && (
        <CreateNode identifier={uniqueNodeIds?.createNode} name={'Add Stage'} fireEvent={fireEvent} getNode={getNode} />
      )}
      {EndNode && startEndNodeNeeded && (
        <div id={uniqueNodeIds?.endNode} className={classNames(css.graphNode)}>
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
  mergeSVGLinks?: (svgPath: string[]) => void
}

export const PipelineGraphNode = ({
  className,
  data,
  fireEvent,
  getNode,
  setSelectedNode,
  selectedNode,
  isParallelNode,
  isNextNodeParallel,
  isPrevNodeParallel,
  isLastChild,
  mergeSVGLinks
}: PipelineGraphNode): React.ReactElement | null => {
  const NodeComponent: React.FC<any> | undefined = getNode?.(data?.nodeType) || getNode?.(NodeType.Default)

  const ref = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref, { threshold: 0.98 }, checkIntersectonBottom)
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
        />
      ) : (
        <>
          {NodeComponent && (
            <NodeComponent
              {...data}
              getNode={getNode}
              fireEvent={fireEvent}
              className={classNames(css.graphNode, className)}
              setSelectedNode={setSelectedNode}
              isSelected={selectedNode === data?.identifier}
              isParallelNode={isParallelNode}
              key={data?.identifier}
              allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
              isFirstParallelNode={true}
              updateSVGLinks={mergeSVGLinks}
            />
          )}
          {data?.children?.map((currentStage, index) => (
            <PipelineGraphNode
              fireEvent={fireEvent}
              getNode={getNode}
              key={currentStage?.identifier}
              className={css.parallel}
              data={currentStage}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              isParallelNode={true}
              isLastChild={index + 1 === data?.children?.length}
              mergeSVGLinks={mergeSVGLinks}
            />
          ))}
        </>
      )}
    </div>
  )
}
