/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react'

import Draggable from 'react-draggable'
import { v4 as uuid } from 'uuid'
import { get } from 'lodash-es'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { ExecutionWrapperConfig } from 'services/ci'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  INITIAL_ZOOM_LEVEL
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import type { NodeIds, PipelineGraphState } from '../types'
import css from './PipelineGraph.module.scss'

export interface PipelineGraphProps {
  pipeline: PipelineInfoConfig
  fireEvent: (event: any) => void
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  dropLinkEvent: (event: any) => void
  dropNodeEvent: (event: any) => void
}

const PipelineGraph = ({ pipeline, getNode, fireEvent }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [childLinks, setChildLinks] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<PipelineGraphState[]>([])
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const canvasRef = useRef<HTMLDivElement>(null)
  const uniqueNodeIds = useMemo(
    (): NodeIds => ({
      startNode: uuid(),
      endNode: uuid(),
      createNode: uuid()
    }),
    []
  )

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    const stepData = get(pipeline, 'stage.spec.execution.steps')
    if (stepData) {
      setState(getPipelineGraphData(stepData as ExecutionWrapperConfig[]))
      return
    }
    if (pipeline.stages?.length) {
      setState(getPipelineGraphData(pipeline.stages as StageElementWrapperConfig[]))
    }
  }, [treeRectangle, pipeline])

  useLayoutEffect(() => {
    if (state?.length) {
      setTimeout(setSVGLinks, 500)
    }
  }, [state])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state)
    const lastNode = state?.[state?.length - 1]

    const stepData = get(pipeline, 'stage.spec.execution.steps')
    if (stepData) {
      console.log({ childLinks })
    }
    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath(uniqueNodeIds.startNode, state?.[0]?.identifier as string),
      getFinalSVGArrowPath(lastNode?.identifier as string, uniqueNodeIds.createNode as string),
      getFinalSVGArrowPath(uniqueNodeIds.createNode as string, uniqueNodeIds.endNode as string),
      ...childLinks
    ])
  }
  const mergeSVGLinks = (updatedLinks: string[]): void => {
    console.log([...childLinks, ...updatedLinks])
    setChildLinks([...childLinks, ...updatedLinks])
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  const updateSelectedNode = (nodeId: string): void => {
    setSelectedNode(nodeId)
  }
  const handleScaleToFit = (): void => {
    setGraphScale(getScaleToFitValue(canvasRef.current as unknown as HTMLElement))
  }

  return (
    <Draggable scale={graphScale}>
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
              uniqueNodeIds={uniqueNodeIds}
              mergeSVGLinks={mergeSVGLinks}
            />
          </div>
          <GraphActions setGraphScale={setGraphScale} graphScale={graphScale} handleScaleToFit={handleScaleToFit} />
        </>
      </div>
    </Draggable>
  )
}

interface SVGComponentProps {
  svgPath: string[]
}

export const SVGComponent = ({ svgPath }: SVGComponentProps): React.ReactElement => {
  return (
    <svg className={css.common}>
      {svgPath.map((path, idx) => (
        <path className={css.svgArrow} key={idx} d={path} />
      ))}
    </svg>
  )
}

export default PipelineGraph
