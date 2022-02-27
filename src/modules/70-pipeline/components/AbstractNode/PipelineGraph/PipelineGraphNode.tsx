import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { NodeType } from '../Node'
import { checkIntersectionBottom, useIntersectionObserver } from './PipelineGraphUtils'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import { NodeIds, PipelineGraphState, PipelineGraphType } from '../types'
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
  parentIdentifier?: string
  updateGraphLinks?: () => void
}
export const PipelineGraphRecursive = ({
  nodes,
  getNode,
  selectedNode,
  fireEvent,
  setSelectedNode,
  uniqueNodeIds,
  startEndNodeNeeded = true,
  startEndNodeStyle,
  parentIdentifier,
  updateGraphLinks
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
            parentIdentifier={parentIdentifier}
            fireEvent={fireEvent}
            selectedNode={selectedNode}
            data={node}
            key={node?.identifier}
            getNode={getNode}
            setSelectedNode={setSelectedNode}
            isNextNodeParallel={!!nodes?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!nodes?.[index - 1]?.children?.length}
            prevNodeIdentifier={nodes?.[index - 1]?.identifier}
            nextNode={nodes?.[index + 1]}
            prevNode={nodes?.[index - 1]}
            updateGraphLinks={updateGraphLinks}
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
  parentIdentifier?: string
  nextNode?: PipelineGraphState
  prevNode?: PipelineGraphState
  updateGraphLinks?: () => void
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
  isPrevNodeParallel,
  parentIdentifier,
  prevNode,
  nextNode,
  updateGraphLinks
}: PipelineGraphNode): React.ReactElement | null => {
  const NodeComponent: React.FC<any> | undefined = getNode?.(data?.nodeType) || getNode?.(NodeType.Default)
  const ref = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(
    ref,
    { threshold: 0.98, root: document.getElementsByClassName('Pane1')[0] },
    checkIntersectionBottom
  )
  const [intersectingIndex, setIntersectingIndex] = useState<number>(-1)

  useEffect(() => {
    if (isIntersecting) {
      const indexToGroupFrom = Number(ref.current?.dataset.index || -1) as unknown as number
      Number.isInteger(indexToGroupFrom) && setIntersectingIndex(indexToGroupFrom)
    }
  }, [isIntersecting])

  useLayoutEffect(() => {
    updateGraphLinks?.()
  }, [intersectingIndex])

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

  return (
    <div
      className={classNames(
        { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
        css.node
      )}
    >
      <>
        {NodeComponent && (
          <NodeComponent
            parentIdentifier={parentIdentifier}
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
            prevNodeIdentifier={prevNodeIdentifier}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        )}
        {data?.children?.map((currentStage, index) => {
          const ChildNodeComponent: React.FC<any> | undefined = getNode?.(data?.nodeType) || getNode?.(NodeType.Default)
          const refIndex =
            intersectingIndex > -1 && index === intersectingIndex - 1 ? index : (data?.children?.length || 0) - 1
          return (
            <div
              ref={refIndex === index ? ref : null}
              data-index={index}
              id={`fiv_${currentStage?.identifier}`}
              key={currentStage?.identifier}
            >
              {index === intersectingIndex - 1 ? (
                <GroupNode
                  {...data}
                  fireEvent={fireEvent}
                  className={classNames(css.graphNode, className)}
                  setSelectedNode={setSelectedNode}
                  isSelected={selectedNode === data?.identifier}
                  isParallelNode={isParallelNode}
                  key={data?.identifier}
                  allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
                  prevNodeIdentifier={prevNodeIdentifier}
                  identifier={currentStage.identifier}
                  intersectingIndex={intersectingIndex}
                />
              ) : index > intersectingIndex - 1 && intersectingIndex !== -1 ? null : (
                ChildNodeComponent && (
                  <ChildNodeComponent
                    parentIdentifier={parentIdentifier}
                    {...currentStage}
                    getNode={getNode}
                    fireEvent={fireEvent}
                    className={classNames(css.graphNode, className)}
                    setSelectedNode={setSelectedNode}
                    isSelected={selectedNode === data?.identifier}
                    isParallelNode={isParallelNode}
                    key={currentStage?.identifier}
                    // allowAdd={(!currentStage?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
                    isFirstParallelNode={true}
                    prevNodeIdentifier={prevNodeIdentifier}
                    prevNode={prevNode}
                    nextNode={nextNode}
                  />
                )
              )}
            </div>
          )

          //   (
          //   <PipelineGraphNode
          //     parentIdentifier={parentIdentifier}
          //     fireEvent={fireEvent}
          //     getNode={getNode}
          //     key={`${id}-${currentStage?.identifier}`}
          //     className={css.parallel}
          //     data={currentStage}
          //     selectedNode={selectedNode}
          //     setSelectedNode={setSelectedNode}
          //     isParallelNode={true}
          //     isLastChild={index + 1 === data?.children?.length}
          //     prevNodeIdentifier={prevNodeIdentifier}
          //   />
          // )
        })}
      </>
    </div>
  )
}

const PipelineGraphNode = React.memo(PipelineGraphNodeBasic)
export { PipelineGraphNode }
