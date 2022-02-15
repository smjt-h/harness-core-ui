/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { defaultTo } from 'lodash-es'
import classNames from 'classnames'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { getSVGLinksFromPipeline, setupDragEventListeners } from './utils'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  getNode?: (type?: string | undefined) => Node | undefined
}
const PipelineGraph = ({ pipeline }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  // const [translate, setTranslate] = useState("");
  // const [scale, setScale] = useState(1);
  console.log(pipeline)
  const canvasRef = useRef<HTMLDivElement>(null)

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    setSVGLinks()
  }, [treeRectangle])

  const setSVGLinks = (): void => {
    return setSvgPath(getSVGLinksFromPipeline(pipeline.stages))
  }

  useEffect(() => {
    updateTreeRect()
    const clearDragListeners = setupDragEventListeners(canvasRef)
    return () => clearDragListeners()
  }, [])

  return (
    <div id="overlay" className={css.overlay}>
      <div className={css.graphMain} ref={canvasRef}>
        <PipelineGraphRecursive stages={pipeline.stages} />
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

const PipelineGraphRecursive = ({ stages }: { stages?: StageElementWrapperConfig[] }): React.ReactElement => {
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {stages?.map((stage, index) => {
        return (
          <PipelineGraphNode
            stage={stage.parallel ? stage.parallel : stage}
            key={stage.stage ? stage.stage?.identifier : index}
          />
        )
      })}
    </div>
  )
}

interface PipelineGraphNode {
  className?: string
  stage: StageElementWrapperConfig | StageElementWrapperConfig[]
}
const PipelineGraphNode = ({ className, stage }: PipelineGraphNode): React.ReactElement => {
  const hasParallelStages = Array.isArray(stage)
  let firstStage, restStages
  if (hasParallelStages) {
    ;[firstStage, ...restStages] = stage
  }
  const stageDetails = defaultTo(firstStage, stage) as StageElementWrapperConfig
  return (
    <div>
      <div id={stageDetails?.stage?.identifier} className={classNames(css.graphNode, className)}>
        {stageDetails?.stage?.name}
      </div>

      <>
        {restStages?.map(currentStage => (
          <PipelineGraphNode key={currentStage.stage?.identifier} className={css.parallel} stage={currentStage} />
        ))}
      </>
    </div>
  )
}
export default PipelineGraph
