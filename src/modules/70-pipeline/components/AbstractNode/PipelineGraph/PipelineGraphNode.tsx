import React from 'react'
import classNames from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Color } from '@harness/uicore'
import type { StageElementWrapperConfig, StageElementConfig } from 'services/cd-ng'
import { Node, NodeType } from '../Node'
import css from './PipelineGraph.module.scss'

export const PipelineGraphRecursive = ({
  stages,
  getNode,
  selectedNode,
  setSelectedNode,
  dropLinkEvent
}: {
  stages?: StageElementConfig[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode: (nodeId: string) => void
  dropLinkEvent: (event: any) => void
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
      {stages?.map(stage => {
        return (
          <PipelineGraphNode
            dropLinkEvent={dropLinkEvent}
            selectedNode={selectedNode}
            stage={stage}
            key={stage?.identifier}
            getNode={getNode}
            setSelectedNode={setSelectedNode}
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
}

export const PipelineGraphNode = ({
  className,
  stage,
  getNode,
  setSelectedNode,
  selectedNode,
  isParallelNode,
  dropLinkEvent
}: PipelineGraphNode): React.ReactElement => {
  const NodeComponent: React.FC<any> | undefined = getNode(stage?.type)
  return (
    <div>
      {NodeComponent && (
        <NodeComponent
          {...stage}
          className={classNames(css.graphNode, className)}
          setSelectedNode={setSelectedNode}
          isSelected={selectedNode === stage?.identifier}
          dropLinkEvent={dropLinkEvent}
          isParallelNode={isParallelNode}
        />
      )}{' '}
      <>
        {stage?.children?.map(currentStage => (
          <PipelineGraphNode
            dropLinkEvent={dropLinkEvent}
            getNode={getNode}
            key={stage?.identifier}
            className={css.parallel}
            stage={currentStage}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            isParallelNode={true}
          />
        ))}
      </>
    </div>
  )
}
