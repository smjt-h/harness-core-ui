/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { cloneDeep } from 'lodash-es'
import type { PipelineInfoConfig, StageElementWrapperConfig, StageElementConfig } from 'services/cd-ng'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { NodeType } from '../Node'
import {
  getFinalSVGArrowPath,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  INITIAL_ZOOM_LEVEL,
  setupNodeDragEventListener,
  setupDragEventListeners
} from './utils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  dropLinkEvent: (event: any) => void
}

export const getNodeType: Record<string, string> = {
  Deployment: 'default-node',
  CI: 'default-node',
  Pipeline: 'default-node',
  Custom: 'default-node',
  Approval: 'default-node'
}
const PipelineGraph = ({ pipeline, getNode, dropLinkEvent }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<StageElementConfig[]>([])
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const canvasRef = useRef<HTMLDivElement>(null)

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
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

  const refactorStagesIntoTree = (stages: StageElementWrapperConfig[]) => {
    const getIconInfo = (type: string | undefined) => {
      return {
        iconName: stageTypeToIconMap[type || 'Deployment'],
        nodeType: getNodeType[type || 'Deployment']
      }
    }
    let treeData: StageElementConfig[] = []
    stages.forEach((stage: StageElementWrapperConfig) => {
      if (stage?.stage) {
        treeData.push({ ...stage.stage, ...getIconInfo(stage?.stage?.type) } as StageElementConfig)
      } else if (stage?.parallel?.length) {
        const [first, ...rest] = stage.parallel

        treeData.push({
          ...({ ...first.stage, ...getIconInfo(first?.stage?.type) } as StageElementConfig),
          children: refactorStagesIntoTree(rest)
        })
      }
    })
    return treeData
  }

  useLayoutEffect(() => {
    if (pipeline.stages?.length) {
      setState(refactorStagesIntoTree(pipeline.stages))
      // console.log('check tree', refactorStagesIntoTree(pipeline.stages))
    }
  }, [treeRectangle, pipeline])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      // setupNodeDragEventListener(canvasRef)
    }
  }, [state])

  console.log('state', state)

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
      getFinalSVGArrowPath('tree-container', stageData?.identifier as string, NodeType.CreateNode as string),
      getFinalSVGArrowPath('tree-container', NodeType.CreateNode as string, NodeType.EndNode as string)
    ])
  }

  useEffect(() => {
    updateTreeRect()
    // const clearDragListeners = setupDragEventListeners(canvasRef)
    // return () => clearDragListeners()
  }, [])
  const updateSelectedNode = (nodeId: string): void => {
    setSelectedNode(nodeId)
  }
  const handleScaleToFit = (): void => {
    setGraphScale(getScaleToFitValue(canvasRef.current as unknown as HTMLElement))
  }

  return (
    <div id="overlay" className={css.overlay}>
      <>
        <div className={css.graphMain} ref={canvasRef} style={{ transform: `scale(${graphScale})` }}>
          <SVGComponent svgPath={svgPath} />
          <PipelineGraphRecursive
            getNode={getNode}
            stages={state}
            selectedNode={selectedNode}
            setSelectedNode={updateSelectedNode}
            dropLinkEvent={dropLinkEvent}
          />
        </div>
        <GraphActions setGraphScale={setGraphScale} graphScale={graphScale} handleScaleToFit={handleScaleToFit} />
      </>
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
