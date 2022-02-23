import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import type { NodeIds, PipelineGraphState } from '../../types'
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
  return { height: `${(maxChildLength + 1) * 100}px`, width: `${width}px`, marginLeft: '40px' }
}
const StepGroupGraph = (props: StepGroupGraphProps): React.ReactElement => {
  const [svgPath, setSvgPath] = useState<string[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 'auto', width: 'auto' })
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    props?.data?.length && setState(getPipelineGraphData(props.data!))
    setSVGLinks()
  }, [treeRectangle, props.data])

  useLayoutEffect(() => {
    if (state?.length) {
      setLayoutStyles(getCalculatedStyles(state))
    }
  }, [state])

  const setSVGLinks = (): void => {
    const parentElement = (graphRef?.current as HTMLDivElement)?.closest('#tree-container') as HTMLDivElement
    const SVGLinks = getSVGLinksFromPipeline(state)

    return setSvgPath([...SVGLinks])
  }

  const mergeSVGLinks = (updatedLinks: string[]): void => {
    setSvgPath([...svgPath, ...updatedLinks])
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  return (
    <div className={css.main} style={layoutStyles} ref={graphRef}>
      <SVGComponent svgPath={svgPath} />
      <PipelineGraphRecursive
        fireEvent={props.fireEvent}
        getNode={props.getNode}
        stages={state}
        selectedNode={selectedNode}
        mergeSVGLinks={mergeSVGLinks}
        startEndNodeNeeded={false}
      />
    </div>
  )
}

export default StepGroupGraph
