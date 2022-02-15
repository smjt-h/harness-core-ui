/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { cloneDeep, defaultTo } from 'lodash-es'
import classNames from 'classnames'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { Node, NodeType } from '../Node'
import { getFinalSVGArrowPath, getSVGLinksFromPipeline, setupDragEventListeners } from './utils'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  getNode: (type?: string | undefined) => Node | undefined
}
const PipelineGraph = ({ pipeline, getNode }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<StageElementWrapperConfig[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  const getNodeType: Record<string, string> = {
    Deployment: 'default-node',
    CI: 'default-node',
    Pipeline: 'default-node',
    Custom: 'default-node',
    Approval: 'default-node'
  }

  const addInfoToStageData = (data: StageElementWrapperConfig[]) => {
    const clonedData = cloneDeep(data)
    clonedData?.forEach((stage: StageElementWrapperConfig) => {
      if (stage.stage) {
        const stageInstance = stage.stage
        stage.stage = {
          ...stageInstance,
          iconName: stageTypeToIconMap[stageInstance.type || 'Deployment'],
          nodeType: getNodeType[stageInstance.type || 'Deployment']
        }
      } else {
        stage.parallel = addInfoToStageData(stage.parallel as StageElementWrapperConfig[])
      }
    })
    return clonedData
  }

  useLayoutEffect(() => {
    if (pipeline.stages?.length) {
      setState(addInfoToStageData(pipeline.stages))
    }
  }, [treeRectangle, pipeline.stages])

  useLayoutEffect(() => {
    state?.length && setSVGLinks()
  }, [state])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(pipeline.stages)
    const lastNode = pipeline.stages?.[pipeline?.stages?.length - 1]
    const stageData = lastNode?.parallel ? lastNode.parallel[0].stage : lastNode?.stage
    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath(
        'tree-container',
        NodeType.StartNode as string,
        pipeline?.stages?.[0].stage?.identifier as string
      ),
      getFinalSVGArrowPath('tree-container', stageData?.identifier as string, NodeType.EndNode as string)
    ])
  }

  useEffect(() => {
    updateTreeRect()
    const clearDragListeners = setupDragEventListeners(canvasRef)
    return () => clearDragListeners()
  }, [])

  return (
    <div id="overlay" className={css.overlay}>
      <div className={css.graphMain} ref={canvasRef}>
        <PipelineGraphRecursive getNode={getNode} stages={state} />
        <SVGComponent svgPath={svgPath} />
      </div>
    </div>
  )
}

interface SVGComponentProps {
  svgPath: string[]
}

const SVGComponent = ({ svgPath }: SVGComponentProps): React.ReactElement => (
  <svg className={css.common}>
    {svgPath.map((path, idx) => (
      <path className={css.svgArrow} key={idx} d={path} />
    ))}
  </svg>
)

const PipelineGraphRecursive = ({
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
const PipelineGraphNode = ({ className, stage, getNode }: PipelineGraphNode): React.ReactElement => {
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
export default PipelineGraph
