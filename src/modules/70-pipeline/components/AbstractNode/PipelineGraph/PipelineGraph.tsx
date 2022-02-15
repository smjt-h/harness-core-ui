/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { cloneDeep } from 'lodash-es'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { Node, NodeType } from '../Node'
import { getFinalSVGArrowPath, getSVGLinksFromPipeline, INITIAL_ZOOM_LEVEL, setupDragEventListeners } from './utils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  getNode: (type?: string | undefined) => Node | undefined
}
const PipelineGraph = ({ pipeline, getNode }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<StageElementWrapperConfig[]>([])
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
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
      <GraphActions
        setGraphScale={setGraphScale}
        graphScale={graphScale}
        handleScaleToFit={function (): void {
          throw new Error('Function not implemented.')
        }}
      />
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

export default PipelineGraph
