import { defaultTo, get } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { StepTypeToPipelineIconMap } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { PipelineGraphState } from '../types'
import { PipelineGraphType } from '../types'

const INITIAL_ZOOM_LEVEL = 1
const ZOOM_INC_DEC_LEVEL = 0.1
interface DrawSVGPathOptions {
  isParallelNode?: boolean
  parentElement?: HTMLDivElement
  direction?: 'rtl' | 'ltl' | 'rtr'
  styles?: React.CSSProperties
}
/**
 * Direction of SVG Path (Only supported for straight horizontal lines)
 * 'rtl' ---> Right of Element1 to Left of Element2
 * 'ltl' ---> Left of Element1 to Left of Element2
 * 'rtr' ---> Left of Element1 to Right of Element2
 **/
const getFinalSVGArrowPath = (id1 = '', id2 = '', options?: DrawSVGPathOptions): { [key: string]: string } => {
  const node1 = getComputedPosition(id1, options?.parentElement)
  const node2 = getComputedPosition(id2, options?.parentElement)
  if (!node1 || !node2) {
    return { [id1]: '' }
  }
  let finalSVGPath = ''
  const node1VerticalMid = node1.top + node1.height / 2
  const node2VerticalMid = node2.top + node2.height / 2

  const startPoint = `${node1.right},${node1VerticalMid}`
  const horizontalMid = Math.abs((node1.right + node2.left) / 2)
  const endPoint = `${node2.left},${node2VerticalMid}`

  if (node2.y < node1.y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`
    finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`
  } else if (node1.y === node2.y) {
    // both nodes are at same level vertically
    if (options?.direction === 'ltl') {
      const startPointLeft = `${node1.left},${node1VerticalMid}`
      finalSVGPath = `M${startPointLeft}  L${endPoint}`
    } else if (options?.direction === 'rtr') {
      const endPointRight = `${node2.right},${node2VerticalMid}`
      finalSVGPath = `M${startPoint}  L${endPointRight}`
    } else finalSVGPath = `M${startPoint}  L${endPoint}`
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`

    if (options?.isParallelNode) {
      const updatedStart = node1.left - 45 // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${node1VerticalMid + 20} `
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`

      finalSVGPath = `M${parallelLinkStart} 
      ${curveLBparallel} 
      L${updatedStart + 20},${node2VerticalMid - 20} 
      ${curveTRparallel} 
      L${node2.left},${node2VerticalMid} 
      M${node2.right},${node2VerticalMid} 
      L${node2.right + 10},${node2VerticalMid}
      Q${node2.right + 25},${node2VerticalMid} ${node2.right + 25},${node2VerticalMid - 20}      
      L${node2.right + 25},${node1VerticalMid + 20}
      Q${node2.right + 25},${node1VerticalMid} ${node2.right + 40},${node1VerticalMid}
      `
    } else {
      finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`
    }
  }
  return { [id1]: finalSVGPath }
}

const getComputedPosition = (childId: string, parentElement?: HTMLDivElement): DOMRect | null => {
  try {
    const childEl = document.getElementById(childId) as HTMLDivElement
    const childPos = childEl?.getBoundingClientRect() as DOMRect
    const parentPos = defaultTo(parentElement, childEl.closest('#tree-container'))?.getBoundingClientRect() as DOMRect

    const updatedTop = childPos.top - parentPos.top
    const updatedLeft = childPos.left - parentPos.left
    const updatedRight = updatedLeft + childPos.width
    const updatedBottom = updatedTop + childPos.height
    const updatedPos: DOMRect = {
      ...childPos,
      left: updatedLeft,
      top: updatedTop,
      right: updatedRight,
      bottom: updatedBottom,
      width: childPos.width,
      height: childPos.height,
      x: childPos.x,
      y: childPos.y
    }
    return updatedPos
  } catch (e) {
    return null
  }
}

const setupDragEventListeners = (canvasRef: RefObject<HTMLDivElement>): (() => void) => {
  let offset = [0, 0]
  const divOverlay = (canvasRef.current as HTMLDivElement).parentElement as HTMLDivElement
  const canvas = canvasRef.current as HTMLDivElement
  let isDown = false

  const onMouseMove = (e: any): void => {
    e.preventDefault()
    if (isDown) {
      canvas.style.left = e.clientX + offset[0] + 'px'
      canvas.style.top = e.clientY + offset[1] + 'px'
    }
  }

  const onMouseDown = (e: any): void => {
    isDown = true
    offset = [canvas.offsetLeft - e.clientX, canvas.offsetTop - e.clientY]
  }
  const onMouseUp = (): void => {
    isDown = false
  }

  divOverlay.addEventListener('mousedown', onMouseDown, true)
  document.addEventListener('mouseup', onMouseUp, true)
  document.addEventListener('mousemove', onMouseMove, true)
  return () => {
    divOverlay.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)
  }
}

const getSVGLinksFromPipeline = (
  states?: PipelineGraphState[],
  parentElement?: HTMLDivElement,
  resultArr: { [key: string]: string }[] = []
): { [key: string]: string }[] => {
  let prevElement: PipelineGraphState
  states?.forEach(state => {
    if (state?.children?.length) {
      getParallelNodeLinks(state?.children, state, resultArr, parentElement)
    }
    if (prevElement) {
      resultArr.push(
        getFinalSVGArrowPath(prevElement.identifier, state.identifier, { isParallelNode: false, parentElement })
      )
    }
    prevElement = state
  })
  return resultArr
}

const getParallelNodeLinks = (
  stages: PipelineGraphState[],
  firstStage: PipelineGraphState | undefined,
  resultArr: { [key: string]: string }[] = [],
  parentElement?: HTMLDivElement
): void => {
  stages?.forEach(stage => {
    resultArr.push(
      getFinalSVGArrowPath(firstStage?.identifier as string, stage?.identifier, {
        isParallelNode: true,
        parentElement
      })
    )
  })
}

const getScaleToFitValue = (elm: HTMLElement, paddingFromBottom = 20): number => {
  return (
    1 /
    Math.max(
      elm.clientWidth / window.innerWidth,
      elm.clientHeight / (window.innerHeight - elm.offsetTop - paddingFromBottom)
    )
  )
}

const useIntersectionObserver = (
  ref: MutableRefObject<Element | null> | null,
  options: IntersectionObserverInit = {},
  compareFn?: (data: IntersectionObserverEntry) => boolean
): boolean => {
  const [element, setElement] = useState<Element | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observer = useRef<null | IntersectionObserver>(null)

  const cleanOb = (): void => {
    if (observer.current) {
      observer.current.disconnect()
    }
  }
  useEffect(() => {
    ref?.current && setElement(ref.current)
  }, [ref])

  useEffect(() => {
    if (!element) return
    cleanOb()
    const ob = (observer.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = typeof compareFn === 'function' ? compareFn(entry) : entry.isIntersecting

        setIsIntersecting(isElementIntersecting)
      },
      { ...options }
    ))
    ob.observe(element)
    return () => {
      cleanOb()
    }
  }, [element, options])

  return isIntersecting
}

const checkIntersectionBottom = (entry: IntersectionObserverEntry): boolean => {
  return entry.boundingClientRect.bottom >= (entry.rootBounds as DOMRect)?.bottom
}

const NodeTypeToNodeMap: Record<string, string> = {
  Deployment: 'default-node',
  CI: 'default-node',
  Pipeline: 'default-node',
  Custom: 'default-node',
  Approval: 'default-node'
}

const getPipelineGraphData = (
  data: StageElementWrapperConfig[] | ExecutionWrapperConfig[] = []
): PipelineGraphState[] => {
  let graphState: PipelineGraphState[] = []
  const pipGraphDataType = getPipelineGraphDataType(data)
  if (pipGraphDataType === PipelineGraphType.STAGE_GRAPH) {
    graphState = trasformStageData(data, pipGraphDataType)
  } else {
    graphState = trasformStepsData(data, pipGraphDataType)
  }

  return graphState
}

const trasformStageData = (stages: StageElementWrapperConfig[], graphType: PipelineGraphType): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  stages.forEach((stage: StageElementWrapperConfig) => {
    if (stage?.stage) {
      const { nodeType, iconName } = getNodeInfo(stage.stage.type, graphType)
      finalData.push({
        identifier: stage.stage.identifier as string,
        name: stage.stage.name as string,
        type: stage.stage.type as string,
        nodeType: nodeType as string,
        icon: iconName,
        graphType,
        data: stage
      })
    } else if (stage?.parallel?.length) {
      const [first, ...rest] = stage.parallel
      const { nodeType, iconName } = getNodeInfo(first?.stage?.type, graphType)
      finalData.push({
        identifier: first?.stage?.identifier as string,
        name: first?.stage?.name as string,
        nodeType: nodeType as string,
        type: first?.stage?.type as string,
        icon: iconName,
        graphType,
        data: stage,
        children: trasformStageData(rest, graphType)
      })
    }
  })
  return finalData
}

const trasformStepsData = (steps: ExecutionWrapperConfig[], graphType: PipelineGraphType): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  steps.forEach((step: ExecutionWrapperConfig) => {
    if (step?.step) {
      const { nodeType, iconName } = getNodeInfo(step.step.type, graphType)
      finalData.push({
        identifier: step.step.identifier as string,
        name: step.step.name as string,
        type: step.step.type as string,
        nodeType: nodeType as string,
        icon: iconName,
        graphType,
        data: step
      })
    } else if (step?.parallel?.length) {
      const [first, ...rest] = step.parallel
      if (first.stepGroup) {
        const { iconName } = getNodeInfo('', graphType)
        finalData.push({
          identifier: first.stepGroup?.identifier as string,
          name: first.stepGroup?.name as string,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          icon: iconName,
          data: first,
          children: trasformStepsData(rest as ExecutionWrapperConfig[], graphType),
          graphType
        })
      } else {
        const { nodeType, iconName } = getNodeInfo(first?.step?.type, graphType)
        finalData.push({
          identifier: first?.step?.identifier as string,
          name: first?.step?.name as string,
          type: first?.step?.type as string,
          nodeType: nodeType as string,
          icon: iconName,
          data: first,
          children: trasformStepsData(rest, graphType),
          graphType
        })
      }
    } else {
      const { iconName } = getNodeInfo('', graphType)
      finalData.push({
        identifier: step.stepGroup?.identifier as string,
        name: step.stepGroup?.name as string,
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: iconName,
        data: step,
        graphType

        // children: trasformStepsData(step.stepGroup?.steps as ExecutionWrapperConfig[], graphType)
      })
    }
  })
  return finalData
}

const getNodeInfo = (
  type: string | undefined,
  graphType: PipelineGraphType
): { iconName: IconName; nodeType: string } => {
  return graphType === PipelineGraphType.STEP_GRAPH
    ? {
        iconName: StepTypeToPipelineIconMap[type as StepType],
        nodeType: NodeTypeToNodeMap[type as string]
      }
    : {
        iconName: stageTypeToIconMap[type as string],
        nodeType: NodeTypeToNodeMap[type as string]
      }
}

const getPipelineGraphDataType = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphType => {
  const hasStageData = defaultTo(get(data, '[0].parallel.[0].stage'), get(data, '[0].stage'))
  if (hasStageData) {
    return PipelineGraphType.STAGE_GRAPH
  }
  return PipelineGraphType.STEP_GRAPH
}
export {
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  NodeTypeToNodeMap,
  getFinalSVGArrowPath,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  getScaleToFitValue,
  useIntersectionObserver,
  checkIntersectionBottom,
  getPipelineGraphData
}
