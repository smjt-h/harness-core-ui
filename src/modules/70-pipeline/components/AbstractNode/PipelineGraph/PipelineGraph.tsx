/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react'
import classNames from 'classnames'
import Draggable from 'react-draggable'
import { v4 as uuid } from 'uuid'
import {
  getFinalSVGArrowPath,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  INITIAL_ZOOM_LEVEL
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import { NodeIds, PipelineGraphState, PipelineGraphType, SVGPathRecord } from '../types'
import css from './PipelineGraph.module.scss'

interface ControlPosition {
  x: number
  y: number
}

const DEFAULT_POSITION: ControlPosition = { x: 30, y: 60 }
export interface PipelineGraphProps {
  data: PipelineGraphState[]
  fireEvent: (event: any) => void
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  collapseOnIntersect?: boolean
}

const PipelineGraph = ({ data, getNode, fireEvent, collapseOnIntersect }: PipelineGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<PipelineGraphState[]>(data)
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  // const [position, setPosition] = useState<ControlPosition | undefined>(undefined)
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
    setState(data)
  }, [treeRectangle, data])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
    }
  }, [state])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state)
    const lastNode = state?.[state?.length - 1]

    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath(uniqueNodeIds.startNode, state?.[0]?.identifier as string),
      getFinalSVGArrowPath(lastNode?.identifier as string, uniqueNodeIds.createNode as string),
      getFinalSVGArrowPath(uniqueNodeIds.createNode as string, uniqueNodeIds.endNode as string)
    ])
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
    <>
      <Draggable scale={graphScale} defaultPosition={DEFAULT_POSITION} offsetParent={document.body}>
        <div id="overlay" className={css.overlay}>
          <div className={css.graphMain} ref={canvasRef} style={{ transform: `scale(${graphScale})` }}>
            <SVGComponent svgPath={svgPath} />
            <PipelineGraphRecursive
              fireEvent={fireEvent}
              getNode={getNode}
              nodes={state}
              selectedNode={selectedNode}
              setSelectedNode={updateSelectedNode}
              uniqueNodeIds={uniqueNodeIds}
              updateGraphLinks={setSVGLinks}
              startEndNodeStyle={state?.[0]?.graphType === PipelineGraphType.STEP_GRAPH ? { height: '64px' } : {}}
              collapseOnIntersect={collapseOnIntersect}
            />
          </div>
        </div>
      </Draggable>
      <GraphActions setGraphScale={setGraphScale} graphScale={graphScale} handleScaleToFit={handleScaleToFit} />
    </>
  )
}

interface SVGComponentProps {
  svgPath: SVGPathRecord[]
  className?: string
}

export const SVGComponent = ({ svgPath, className }: SVGComponentProps): React.ReactElement => {
  return (
    <svg className={css.common}>
      {svgPath.map((path, idx) => {
        const [[nodeId, pathValue]] = Object.entries(path)
        return <path className={classNames(css.svgArrow, className)} id={`${nodeId}-link`} key={idx} d={pathValue} />
      })}
    </svg>
  )
}

export default PipelineGraph
