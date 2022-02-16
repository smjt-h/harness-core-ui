import React from 'react'
import classNames from 'classnames'
import { defaultTo } from 'lodash-es'
import { Icon, Color } from '@harness/uicore'
import type { StageElementWrapperConfig } from 'services/cd-ng'
import { Node, NodeType } from '../Node'
import css from './PipelineGraph.module.scss'

export const PipelineGraphRecursive = ({
  stages,
  getNode,
  selectedNode,
  setSelectedNode
}: {
  stages?: StageElementWrapperConfig[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode: (nodeId: string) => void
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
            selectedNode={selectedNode}
            stage={stage.parallel ? stage.parallel : stage}
            key={stage.stage ? stage.stage?.identifier : index}
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
  stage: StageElementWrapperConfig | StageElementWrapperConfig[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode: string
  setSelectedNode: (nodeId: string) => void
  isParallelNode?: boolean
}
export const PipelineGraphNode = ({
  className,
  stage,
  getNode,
  setSelectedNode,
  selectedNode,
  isParallelNode
}: PipelineGraphNode): React.ReactElement => {
  const hasParallelStages = Array.isArray(stage)
  let firstStage, restStages
  if (hasParallelStages) {
    ;[firstStage, ...restStages] = stage
  }
  const stageDetails = defaultTo(firstStage, stage) as StageElementWrapperConfig
  const NodeComponent: React.FC<any> | undefined = getNode(stageDetails?.stage?.type)
  return (
    <div>
      {NodeComponent && (
        <NodeComponent
          {...stageDetails?.stage}
          className={classNames(css.graphNode, className)}
          setSelectedNode={setSelectedNode}
          isSelected={selectedNode === stageDetails?.stage?.identifier}
        />
      )}{' '}
      {!isParallelNode && (
        <div className={css.addNodeIcon}>
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {/* {getNode(stageDetails?.stage?.nodeType)?.render?.()} */}
      {/* <div className={classNames(css.graphNode, className)}>{stageDetails?.stage?.name}</div> */}
      <>
        {restStages?.map(currentStage => (
          <PipelineGraphNode
            getNode={getNode}
            key={currentStage.stage?.identifier}
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
