import { DiagramType, Event } from '@pipeline/components/Diagram'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import { NodeIds, PipelineGraphState, PipelineGraphType, SVGPathRecord } from '../../types'
import CreateNode from '../CreateNode/CreateNode'
import css from './StepGroupGraph.module.scss'
interface StepGroupGraphProps {
  data?: any[]
  getNode: (type?: string | undefined) => React.FC<any> | undefined
  selectedNode?: string
  uniqueNodeIds?: NodeIds
  fireEvent: (event: any) => void
  setSelectedNode?: (nodeId: string) => void
  startEndNodeNeeded?: boolean
  updateSVGLinks?: (svgPath: string[]) => void
  prevNodeIdentifier?: string
  identifier?: string
  renderer?: boolean
}

interface LayoutStyles {
  height: string
  width: string
  marginLeft?: string
}
const getCalculatedStyles = (data: PipelineGraphState[]): LayoutStyles => {
  let width = 0
  let maxChildLength = 0
  data.forEach(node => {
    width += 170
    maxChildLength = Math.max(maxChildLength, node?.children?.length || 0)
  })
  return { height: `${(maxChildLength + 1) * 100}px`, width: `${width - 80}px` }
}

const StepGroupGraph = (props: StepGroupGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 'auto', width: 'auto' })
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)
  const updateSelectedNode = (nodeId: string): void => {
    setSelectedNode(nodeId)
  }

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    props?.data?.length && setState(getPipelineGraphData(props.data!))
  }, [treeRectangle, props.data])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      setLayoutStyles(getCalculatedStyles(state))
    }
  }, [state, props?.renderer])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
    }
  }, [layoutStyles])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state)
    const firstNodeIdentifier = state?.[0]?.identifier
    const lastNodeIdentifier = state?.[state?.length - 1]?.identifier
    const parentElement = graphRef.current?.querySelector('#tree-container') as HTMLDivElement

    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath(props?.identifier, firstNodeIdentifier as string, {
        direction: 'ltl',
        parentElement
      }),
      getFinalSVGArrowPath(lastNodeIdentifier as string, props?.identifier, {
        direction: 'rtr',
        parentElement
      })
    ])
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  return (
    <div className={css.main} style={layoutStyles} ref={graphRef}>
      <SVGComponent svgPath={svgPath} className={css.stepGroupSvg} />
      {props?.data?.length ? (
        <PipelineGraphRecursive
          parentIdentifier={props?.identifier}
          fireEvent={props.fireEvent}
          getNode={props.getNode}
          nodes={state}
          selectedNode={selectedNode}
          setSelectedNode={updateSelectedNode}
          startEndNodeNeeded={false}
        />
      ) : (
        <CreateNode
          identifier={props?.identifier}
          graphType={PipelineGraphType.STEP_GRAPH}
          onClick={(event: any) => {
            props?.fireEvent({
              type: Event.ClickNode,
              identifier: props?.identifier,
              parentIdentifier: props?.identifier,
              entityType: DiagramType.CreateNew,
              node: props,
              target: event.target
            })
          }}
        />
      )}
    </div>
  )
}

export default StepGroupGraph
