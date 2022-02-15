import React from 'react'
import classNames from 'classnames'
import { defaultTo } from 'lodash-es'
import type { StageElementWrapperConfig } from 'services/cd-ng'
import { Node, NodeType } from '../Node'
import css from './PipelineGraph.module.scss'

export const PipelineGraphRecursive = ({
  stages,
  getNode
}: {
  stages?: StageElementWrapperConfig[]
  getNode: (type?: string | undefined) => Node | undefined
}): React.ReactElement => {
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      <div>
        <div id={NodeType.StartNode.toString()} className={classNames(css.graphNode)}>
          {getNode(NodeType.StartNode)?.render?.()}
        </div>
      </div>
      {stages?.map((stage, index) => {
        return (
          <PipelineGraphNode
            stage={stage.parallel ? stage.parallel : stage}
            key={stage.stage ? stage.stage?.identifier : index}
            getNode={getNode}
          />
        )
      })}
      <div>
        <div id={NodeType.EndNode.toString()} className={classNames(css.graphNode)}>
          {getNode(NodeType.EndNode)?.render?.()}
        </div>
      </div>
    </div>
  )
}

interface PipelineGraphNode {
  className?: string
  stage: StageElementWrapperConfig | StageElementWrapperConfig[]
  getNode: (type?: string | undefined) => Node | undefined
}
export const PipelineGraphNode = ({ className, stage, getNode }: PipelineGraphNode): React.ReactElement => {
  const hasParallelStages = Array.isArray(stage)
  let firstStage, restStages
  if (hasParallelStages) {
    ;[firstStage, ...restStages] = stage
  }
  const stageDetails = defaultTo(firstStage, stage) as StageElementWrapperConfig
  return (
    <div>
      {getNode(stageDetails?.stage?.nodeType)?.render?.({
        ...stageDetails?.stage,
        className: classNames(css.graphNode, className)
      })}
      {/* <div className={classNames(css.graphNode, className)}>{stageDetails?.stage?.name}</div> */}
      <>
        {restStages?.map(currentStage => (
          <PipelineGraphNode
            getNode={getNode}
            key={currentStage.stage?.identifier}
            className={css.parallel}
            stage={currentStage}
          />
        ))}
      </>
    </div>
  )
}
