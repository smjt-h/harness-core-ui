/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { NodeType } from '../Node'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  INITIAL_ZOOM_LEVEL,
  setupDragEventListeners
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import type { PipelineGraphState } from '../types'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  fireEvent: (event: any) => void
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  dropLinkEvent: (event: any) => void
  dropNodeEvent: (event: any) => void
}

const PipelineGraph = ({
  pipeline,
  getNode,
  dropLinkEvent,
  dropNodeEvent,
  fireEvent
}: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<PipelineGraphState[]>([])
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const canvasRef = useRef<HTMLDivElement>(null)

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    if (pipeline.stages?.length) {
      setState(getPipelineGraphData(pipeline.stages as StageElementWrapperConfig[]))
    }
  }, [treeRectangle, pipeline])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      // setupNodeDragEventListener(canvasRef)
    }
  }, [state])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state)
    const lastNode = state?.[state?.length - 1]
    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath('tree-container', NodeType.StartNode as string, state?.[0]?.identifier as string),
      getFinalSVGArrowPath('tree-container', lastNode?.identifier as string, NodeType.CreateNode as string),
      getFinalSVGArrowPath('tree-container', NodeType.CreateNode as string, NodeType.EndNode as string)
    ])
  }

  useEffect(() => {
    updateTreeRect()
    const clearDragListeners = setupDragEventListeners(canvasRef)
    return () => clearDragListeners()
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
            fireEvent={fireEvent}
            getNode={getNode}
            stages={state}
            selectedNode={selectedNode}
            setSelectedNode={updateSelectedNode}
            dropLinkEvent={dropLinkEvent}
            dropNodeEvent={dropNodeEvent}
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
