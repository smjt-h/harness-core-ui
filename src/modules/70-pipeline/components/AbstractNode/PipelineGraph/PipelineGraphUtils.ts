import { defaultTo, get } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { PipelineGraphState } from '../types'
import { PipelineGraphType } from '../types'
import stepsJSON from './steps.json'
const INITIAL_ZOOM_LEVEL = 1
const ZOOM_INC_DEC_LEVEL = 0.1
const getFinalSVGArrowPath = (parentId: string, id1 = '', id2 = '', isParallelNode = false): string => {
  if (!parentId) {
    return ''
  }
  const node1 = getComputedPosition(parentId, id1)
  const node2 = getComputedPosition(parentId, id2)
  if (!node1 || !node2) {
    return ''
  }

  const node1VerticalMid = node1.top + node1.height / 2
  const node2VerticalMid = node2.top + node2.height / 2

  const startPoint = `${node1.right},${node1VerticalMid}`
  const horizontalMid = Math.abs((node1.right + node2.left) / 2)
  const endPoint = `${node2.left},${node2VerticalMid}`

  if (node2.y < node1.y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`
    return `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`
  } else if (node1.y === node2.y) {
    // both nodes are at same level vertically
    return `M${startPoint}  L${endPoint} `
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`

    if (isParallelNode) {
      const updatedStart = node1.left - 45 // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${node1VerticalMid + 20} `
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`

      return `M${parallelLinkStart} 
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
    }
    return `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`
  }
}

const getComputedPosition = (parentId: string, childId: string): DOMRect | null => {
  try {
    const parentPos = document.getElementById(parentId)?.getBoundingClientRect() as DOMRect
    const childPos = document.getElementById(childId)?.getBoundingClientRect() as DOMRect

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

const getSVGLinksFromPipeline = (states?: PipelineGraphState[], resultArr: string[] = []): string[] => {
  let prevElement: PipelineGraphState
  states?.forEach(state => {
    if (state?.children?.length) {
      getParallelNodeLinks(state?.children, state, resultArr)
    }
    if (prevElement) {
      resultArr.push(getFinalSVGArrowPath('tree-container', prevElement.identifier, state.identifier, false))
    }
    prevElement = state
  })
  return resultArr
}

const getParallelNodeLinks = (
  stages: PipelineGraphState[],
  firstStage: PipelineGraphState | undefined,
  resultArr: string[] = []
): void => {
  stages?.forEach(stage => {
    resultArr.push(getFinalSVGArrowPath('tree-container', firstStage?.identifier as string, stage?.identifier, true))
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
  ref: MutableRefObject<Element | null>,
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
    setElement(ref.current)
  }, [ref])

  useEffect(() => {
    if (!element) return
    cleanOb()
    const ob = (observer.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = typeof compareFn === 'function' ? compareFn(entry) : entry.isIntersecting
        isElementIntersecting !== isIntersecting && setIsIntersecting(isElementIntersecting)
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

const checkIntersectonBottom = (entry: IntersectionObserverEntry): boolean =>
  entry.boundingClientRect.bottom >= (entry.rootBounds as DOMRect)?.bottom

const NodeTypeToNodeMap: Record<string, string> = {
  Deployment: 'default-node',
  CI: 'default-node',
  Pipeline: 'default-node',
  Custom: 'default-node',
  Approval: 'default-node'
}

const getPipelineGraphData = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphState[] => {
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
      const { nodeType, iconName } = getNodeInfo(stage.stage.type)
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
      const { nodeType, iconName } = getNodeInfo(first?.stage?.type)
      finalData.push({
        identifier: first?.stage?.identifier as string,
        name: first?.stage?.name as string,
        nodeType: nodeType as string,
        type: first?.stage?.type as string,
        icon: iconName,
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
      const { nodeType, iconName } = getNodeInfo(step.step.type)
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
      const { nodeType, iconName } = getNodeInfo(first?.step?.type)
      finalData.push({
        identifier: first?.step?.identifier as string,
        name: first?.step?.name as string,
        type: first?.step?.type as string,
        nodeType: nodeType as string,
        icon: iconName,
        data: step,
        children: trasformStepsData(rest, graphType)
      })
    } else {
      const { iconName } = getNodeInfo('')
      finalData.push({
        identifier: step.stepGroup?.identifier as string,
        name: step.stepGroup?.name as string,
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: iconName,
        data: step,
        children: trasformStepsData(step.stepGroup?.steps as StageElementWrapperConfig[], graphType)
      })
    }
  })
  return finalData
}

const getNodeInfo = (type: string | undefined): { iconName: IconName; nodeType: string } => {
  return {
    iconName: stageTypeToIconMap[type || 'Deployment'],
    nodeType: NodeTypeToNodeMap[type || 'Deployment']
  }
}
const getPipelineGraphDataType = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphType => {
  const hasStageData = defaultTo(get(data, '[0].parallel.stage'), get(data, '[0].stage'))
  if (hasStageData) {
    return PipelineGraphType.STAGE_GRAPH
  }
  return PipelineGraphType.STEP_GRAPH
}
console.log(getPipelineGraphData(stepsJSON))
export {
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  NodeTypeToNodeMap,
  getFinalSVGArrowPath,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  getScaleToFitValue,
  useIntersectionObserver,
  checkIntersectonBottom,
  getPipelineGraphData
}
