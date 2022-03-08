/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react'
import classNames from 'classnames'
import Draggable from 'react-draggable'
import { v4 as uuid } from 'uuid'
import { Event } from '@pipeline/components/Diagram'
import {
  getFinalSVGArrowPath,
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  INITIAL_ZOOM_LEVEL,
  setupDragEventListeners
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import {
  NodeCollapsibleProps,
  NodeDetails,
  NodeIds,
  PipelineGraphState,
  PipelineGraphType,
  SVGPathRecord
} from '../types'
import css from './PipelineGraph.module.scss'

interface ControlPosition {
  x: number
  y: number
}

const DEFAULT_POSITION: ControlPosition = { x: 30, y: 60 }
export interface PipelineGraphProps {
  data: PipelineGraphState[]
  fireEvent: (event: any) => void
  getNode: (type?: string | undefined) => NodeDetails | undefined
  getDefaultNode(): NodeDetails | null
  selectedNodeId?: string
  collapsibleProps?: NodeCollapsibleProps
}

function PipelineGraph({
  data,
  getNode,
  fireEvent,
  collapsibleProps,
  getDefaultNode,
  graphType,
  selectedNodeId = ''
}: PipelineGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<PipelineGraphState[]>(data)
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const canvasRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
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
    setSVGLinks()
  }, [state])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state, undefined, undefined, uniqueNodeIds.createNode)
    const lastNode = state?.[state?.length - 1]
    return state.length === 0
      ? setSvgPath([
          getFinalSVGArrowPath(uniqueNodeIds.startNode, uniqueNodeIds.createNode as string),
          getFinalSVGArrowPath(uniqueNodeIds.createNode as string, uniqueNodeIds.endNode as string)
        ])
      : setSvgPath([
          ...SVGLinks,
          getFinalSVGArrowPath(uniqueNodeIds.startNode, state?.[0]?.id as string),
          getFinalSVGArrowPath(lastNode?.id as string, uniqueNodeIds.createNode as string),
          getFinalSVGArrowPath(uniqueNodeIds.createNode as string, uniqueNodeIds.endNode as string)
        ])
  }

  useEffect(() => {
    updateTreeRect()
    const draggableParent = draggableRef.current
    const overlay = overlayRef.current as HTMLElement
    if (draggableParent && overlay) setupDragEventListeners(draggableParent, overlay)
  }, [])

  const handleScaleToFit = (): void => {
    setGraphScale(getScaleToFitValue(canvasRef.current as unknown as HTMLElement))
  }

  return (
    <div id="draggable-parent" ref={draggableRef}>
      <Draggable scale={graphScale} defaultPosition={DEFAULT_POSITION} offsetParent={document.body}>
        <div
          id="overlay"
          onClick={() => {
            fireEvent({ type: Event.CanvasClick })
          }}
          className={css.overlay}
          ref={overlayRef}
        >
          <div className={css.graphMain} ref={canvasRef} style={{ transform: `scale(${graphScale})` }}>
            <SVGComponent svgPath={svgPath} />
            <PipelineGraphRecursive
              fireEvent={fireEvent}
              getNode={getNode}
              nodes={state}
              selectedNode={selectedNodeId}
              uniqueNodeIds={uniqueNodeIds}
              updateGraphLinks={setSVGLinks}
              shape={graphType === PipelineGraphType.STEP_GRAPH ? css.stepNode : css.stageNode}
              collapsibleProps={collapsibleProps}
              getDefaultNode={getDefaultNode}
            />
          </div>
        </div>
      </Draggable>
      <GraphActions setGraphScale={setGraphScale} graphScale={graphScale} handleScaleToFit={handleScaleToFit} />
    </div>
  )
}

interface SVGComponentProps {
  svgPath: SVGPathRecord[]
  className?: string
}

export function SVGComponent({ svgPath, className }: SVGComponentProps): React.ReactElement {
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
