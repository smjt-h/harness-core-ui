import React, { useEffect, useRef, useState } from 'react'
import { throttle } from 'lodash-es'
import classNames from 'classnames'
import type { StageElementConfig } from 'services/cd-ng'
import { NodeType } from '../Node'
import { checkIntersectonBottom, useIntersectionObserver } from './utils'
import css from './PipelineGraph.module.scss'

export const PipelineGraphRecursive = ({
  stages,
  getNode,
  selectedNode,
  setSelectedNode,
  dropLinkEvent,
  dropNodeEvent
}: {
  stages?: StageElementConfig[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode: (nodeId: string) => void
  dropLinkEvent: (event: any) => void
  dropNodeEvent: (event: any) => void
}): React.ReactElement => {
  const StartNode: React.FC<any> | undefined = getNode(NodeType.StartNode)
  const CreateNode: React.FC<any> | undefined = getNode(NodeType.CreateNode)
  const EndNode: React.FC<any> | undefined = getNode(NodeType.EndNode)
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      <div>
        <div id={NodeType.StartNode.toString()} className={classNames(css.graphNode)}>
          {StartNode && <StartNode />}
          {/* {getNode(NodeType.StartNode)?.render?.()} */}
        </div>
      </div>
      {stages?.map((stage, index) => {
        return (
          <PipelineGraphNode
            dropNodeEvent={dropNodeEvent}
            dropLinkEvent={dropLinkEvent}
            selectedNode={selectedNode}
            stage={stage}
            key={stage?.identifier}
            getNode={getNode}
            setSelectedNode={setSelectedNode}
            isNextNodeParallel={!!stages?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!stages?.[index - 1]?.children?.length}
          />
        )
      })}
      <div>{CreateNode && <CreateNode name={'Add Stage'} />}</div>
      <div>
        <div id={NodeType.EndNode.toString()} className={classNames(css.graphNode)}>
          {EndNode && <EndNode />}
        </div>
      </div>
    </div>
  )
}

interface PipelineGraphNode {
  className?: string
  stage: StageElementConfig
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode: (nodeId: string) => void
  isParallelNode?: boolean
  dropLinkEvent: (event: any) => void
  dropNodeEvent: (event: any) => void
  isNextNodeParallel?: boolean
  isPrevNodeParallel?: boolean
  isLastChild?: boolean
}

export const PipelineGraphNode = ({
  className,
  stage,
  getNode,
  setSelectedNode,
  selectedNode,
  isParallelNode,
  dropLinkEvent,
  dropNodeEvent,
  isNextNodeParallel,
  isPrevNodeParallel,
  isLastChild
}: PipelineGraphNode): React.ReactElement | null => {
  const NodeComponent: React.FC<any> | undefined = getNode(stage?.type) || getNode(NodeType.Default)
  const ref = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref, { threshold: 0.98 }, checkIntersectonBottom)
  const [collapseNode, setCollapseNode] = useState(false)

  useEffect(() => {
    throttle(() => setCollapseNode(isIntersecting), 100, { trailing: true })
  }, [isIntersecting])

  return (
    <div
      ref={ref}
      className={classNames(
        { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
        css.node
      )}
    >
      <>
        {NodeComponent && (
          <NodeComponent
            {...stage}
            className={classNames(css.graphNode, className)}
            setSelectedNode={setSelectedNode}
            isSelected={selectedNode === stage?.identifier}
            dropLinkEvent={dropLinkEvent}
            dropNodeEvent={dropNodeEvent}
            isParallelNode={isParallelNode}
            key={stage?.identifier}
            allowAdd={(!stage?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
          />
        )}
        {stage?.children?.map((currentStage, index) => (
          <PipelineGraphNode
            dropLinkEvent={dropLinkEvent}
            dropNodeEvent={dropNodeEvent}
            getNode={getNode}
            key={currentStage?.identifier}
            className={css.parallel}
            stage={currentStage}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            isParallelNode={true}
            isLastChild={index + 1 === stage?.children?.length}
          />
        ))}
      </>
    </div>
  )
}
