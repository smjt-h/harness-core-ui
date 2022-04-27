/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, throttle } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/cd-ng'
import {
  isCustomGeneratedString,
  StepTypeToPipelineIconMap
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { stageTypeToIconMap } from '@pipeline/utils/constants'
import type { DependencyElement } from 'services/ci'
import { getDefaultBuildDependencies } from '@pipeline/utils/stageHelpers'
import type { KVPair } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { NodeType, PipelineGraphState, SVGPathRecord, PipelineGraphType } from '../types'

const INITIAL_ZOOM_LEVEL = 1
const ZOOM_INC_DEC_LEVEL = 0.1
const toFixed = (num: number): number => Number(num.toFixed(2))
const getScaledValue = (value: number, scalingFactor: number): number => {
  let finalValue
  const mulFactor = 1 / scalingFactor
  const valueMultiplied = value * mulFactor

  if (scalingFactor === 1.0) {
    finalValue = value
  } else if (scalingFactor > 1) {
    finalValue = value / scalingFactor
  } else {
    finalValue = valueMultiplied + mulFactor
  }
  return toFixed(finalValue)
}
interface DrawSVGPathOptions {
  isParallelNode?: boolean
  parentElement?: HTMLDivElement
  direction?: 'rtl' | 'ltl' | 'rtr'
  styles?: React.CSSProperties
  nextNode?: string
  parentNode?: string
  scalingFactor?: number
}
/**
 * Direction of SVG Path (Only supported for straight horizontal lines)
 * 'rtl' ---> Right of Element1 to Left of Element2
 * 'ltl' ---> Left of Element1 to Left of Element2
 * 'rtr' ---> Left of Element1 to Right of Element2
 **/
const getFinalSVGArrowPath = (id1 = '', id2 = '', options?: DrawSVGPathOptions): SVGPathRecord => {
  const scalingFactor = defaultTo(options?.scalingFactor, 1)
  const node1 = getComputedPosition(id1, options?.parentElement)
  const node2 = getComputedPosition(id2, options?.parentElement)
  if (!node1 || !node2) {
    return { [id1]: { pathData: '' } }
  }
  let finalSVGPath = ''
  const node1VerticalMid = getScaledValue(node1.top + node1.height / 2, scalingFactor)
  const node2VerticalMid = getScaledValue(node2.top + node2.height / 2, scalingFactor)

  const startPoint = `${getScaledValue(node1.right, scalingFactor)},${node1VerticalMid}`
  const horizontalMid = Math.abs((node1.right + node2.left) / 2)
  const endPoint = `${getScaledValue(node2.left, scalingFactor)},${node2VerticalMid}`
  const node1Y = Math.round(node1.y * 10) / 10
  const node2Y = Math.round(node2.y * 10) / 10

  if (node2Y < node1Y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`
    finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`
  } else if (node1Y === node2Y) {
    // both nodes are at same level vertically
    if (options?.direction === 'ltl') {
      const startPointLeft = `${node1.left},${node1VerticalMid}`
      finalSVGPath = `M${startPointLeft}  L${endPoint}`
    } else if (options?.direction === 'rtr') {
      const endPointRight = `${node2.right},${node2VerticalMid}`
      finalSVGPath = `M${startPoint}  L${endPointRight}`
    } else {
      finalSVGPath = `M${startPoint}  L${endPoint}`
    }
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`

    if (options?.isParallelNode) {
      const updatedStart = getScaledValue(node1.left, scalingFactor) - 45 // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${node1VerticalMid + 20} `
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`

      const firstCurve = `M${parallelLinkStart} 
      ${curveLBparallel} 
      L${updatedStart + 20},${node2VerticalMid - 20} 
      ${curveTRparallel} 
      L${getScaledValue(node1.left, scalingFactor)},${node2VerticalMid}`

      let secondCurve = ''
      if (options?.nextNode && options?.parentNode) {
        const nextNode = getComputedPosition(options.nextNode, options?.parentElement)
        const parentNode = getComputedPosition(options.parentNode, options?.parentElement)
        if (!nextNode || !parentNode) {
          return { [id1]: { pathData: '' } }
        }
        const childEl = document.getElementById(options.parentNode)
        const parentGraphNodeContainer = getComputedPosition(
          childEl?.closest('.pipeline-graph-node') as HTMLElement,
          options?.parentElement
        ) as DOMRect
        const newRight = getScaledValue(
          parentGraphNodeContainer?.right > node2.right ? parentGraphNodeContainer?.right : node2.right,
          scalingFactor
        )
        const nextNodeVerticalMid = getScaledValue(nextNode.top + nextNode.height / 2, scalingFactor)

        secondCurve = `M${getScaledValue(node2.right, scalingFactor)},${node2VerticalMid}
        L${newRight + 10},${node2VerticalMid}
        Q${newRight + 25},${node2VerticalMid} ${newRight + 25},${node2VerticalMid - 20}
        L${newRight + 25},${nextNodeVerticalMid + 20}
        Q${newRight + 25},${nextNodeVerticalMid} ${newRight + 40},${nextNodeVerticalMid}`
      } else {
        secondCurve = `M${getScaledValue(node2.right, scalingFactor)},${node2VerticalMid}
        L${getScaledValue(node2.right, scalingFactor) + 10},${node2VerticalMid}
        Q${getScaledValue(node2.right, scalingFactor) + 25},${node2VerticalMid} ${
          getScaledValue(node2.right, scalingFactor) + 25
        },${node2VerticalMid - 20}
        L${getScaledValue(node2.right, scalingFactor) + 25},${node1VerticalMid + 20}
        Q${getScaledValue(node2.right, scalingFactor) + 25},${node1VerticalMid} ${
          getScaledValue(node2.right, scalingFactor) + 40
        },${node1VerticalMid}`
      }
      finalSVGPath = firstCurve + secondCurve
    } else {
      finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`
    }
  }
  return { [id1]: { pathData: finalSVGPath } }
}

const getComputedPosition = (childId: string | HTMLElement, parentElement?: HTMLDivElement): DOMRect | null => {
  try {
    const childEl = typeof childId === 'string' ? (document.getElementById(childId) as HTMLDivElement) : childId
    const childPos = childEl?.getBoundingClientRect() as DOMRect
    const parentPos = defaultTo(parentElement, childEl.closest('#tree-container'))?.getBoundingClientRect() as DOMRect

    const updatedTop = childPos.top - parentPos.top

    const updatedLeft = childPos.left - parentPos.left

    const updatedRight = updatedLeft + childPos.width

    const updatedBottom = updatedTop + childPos.height

    const updatedPos: DOMRect = {
      ...childPos,
      left: getScaledValue(updatedLeft, 1),
      top: getScaledValue(updatedTop, 1),
      right: getScaledValue(updatedRight, 1),
      bottom: updatedBottom,
      width: childPos.height, // getScaledValue(childPos.width, scalingFactor),
      height: childPos.height, // getScaledValue(childPos.height, scalingFactor),
      x: childPos.x,
      y: childPos.y
    }
    return updatedPos
  } catch (e) {
    return null
  }
}

export const scrollZoom = (
  container: HTMLElement,
  max_scale: number,
  factor: number,
  callback: (newScale: number) => void
): void => {
  let scale = 1
  container.style.transformOrigin = '0 0'
  container.onwheel = scrolled

  function scrolled(e: any): void {
    e.preventDefault()
    let delta = e.delta || e.wheelDelta
    if (delta === undefined) {
      //we are on firefox
      delta = e.detail
    }
    delta = Math.max(-1, Math.min(1, delta)) // cap the delta to [-1,1] for cross browser consistency
    // apply zoom
    scale += delta * factor * scale
    scale = Math.min(max_scale, scale)
    callback(scale)
  }
}

const setupDragEventListeners = (draggableParent: HTMLElement, overlay: HTMLElement): void => {
  draggableParent.onmousedown = function (event) {
    if (event?.target !== draggableParent) {
      return
    }
    const initialX = event.pageX
    const initialY = event.pageY
    const overlayPosition = getComputedPosition(overlay, draggableParent as HTMLDivElement) as DOMRect
    const moveAt = (pageX: number, pageY: number): void => {
      const newX = overlayPosition?.left + pageX - initialX
      const newY = overlayPosition?.top + pageY - initialY
      overlay.style.transform = `translate(${newX}px,${newY}px)`
    }

    const onMouseMove = throttle((e: MouseEvent): void => {
      moveAt(e.pageX, e.pageY)
    }, 100)

    draggableParent.addEventListener('mousemove', onMouseMove)
    draggableParent.onmouseup = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove)
      draggableParent.onmouseup = null
    }
    draggableParent.onmouseleave = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove)
    }
  }
}

const getSVGLinksFromPipeline = (
  states?: PipelineGraphState[],
  parentElement?: HTMLDivElement,
  resultArr: SVGPathRecord[] = [],
  endNodeId?: string,
  scalingFactor?: number
): SVGPathRecord[] => {
  let prevElement: PipelineGraphState
  states?.forEach((state, index) => {
    if (state?.children?.length) {
      const nextNodeId = states?.[index + 1]?.id || endNodeId
      getParallelNodeLinks(state?.children, state, resultArr, parentElement, nextNodeId, state.id, scalingFactor)
    }
    if (prevElement) {
      resultArr.push(
        getFinalSVGArrowPath(prevElement.id, state.id, { isParallelNode: false, parentElement, scalingFactor })
      )
    }
    prevElement = state
  })
  return resultArr
}

const getParallelNodeLinks = (
  stages: PipelineGraphState[],
  firstStage: PipelineGraphState | undefined,
  resultArr: SVGPathRecord[] = [],
  parentElement?: HTMLDivElement,
  nextNode?: string,
  parentNode?: string,
  scalingFactor?: number
): void => {
  stages?.forEach(stage => {
    resultArr.push(
      getFinalSVGArrowPath(firstStage?.id as string, stage?.id, {
        isParallelNode: true,
        parentElement,
        nextNode,
        parentNode,
        scalingFactor
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

const NodeTypeToNodeMap: Record<string, string> = {
  Deployment: NodeType.Default,
  CI: NodeType.Default,
  Pipeline: NodeType.Default,
  Custom: NodeType.Default,
  Approval: NodeType.Default
}

const getPipelineGraphData = (
  data: StageElementWrapperConfig[] | ExecutionWrapperConfig[] = [],
  templateTypes?: KVPair,
  serviceDependencies?: DependencyElement[] | undefined
): PipelineGraphState[] => {
  let graphState: PipelineGraphState[] = []
  const pipGraphDataType = getPipelineGraphDataType(data)
  if (pipGraphDataType === PipelineGraphType.STAGE_GRAPH) {
    graphState = trasformStageData(data, pipGraphDataType, templateTypes)
  } else {
    graphState = trasformStepsData(data, pipGraphDataType, templateTypes)

    if (Array.isArray(serviceDependencies)) {
      //CI module
      const dependencyStepGroup = getDefaultBuildDependencies(serviceDependencies)
      graphState.unshift(dependencyStepGroup)
    }
  }

  return graphState
}

const trasformStageData = (
  stages: StageElementWrapperConfig[],
  graphType: PipelineGraphType,
  templateTypes?: KVPair
): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []

  stages.forEach((stage: StageElementWrapperConfig) => {
    if (stage?.stage) {
      const templateRef = getIdentifierFromValue(stage.stage?.template?.templateRef as string)
      const type = templateRef ? (templateTypes?.[templateRef] as string) : (stage.stage.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: stage.stage.identifier as string,
        name: stage.stage.name as string,
        type: type,
        nodeType: nodeType as string,
        icon: iconName,
        data: {
          graphType,
          ...stage,
          conditionalExecutionEnabled: stage.stage.when
            ? stage.stage.when?.pipelineStatus !== 'Success' || !!stage.stage.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        }
      })
    } else if (stage?.parallel?.length) {
      const [first, ...rest] = stage.parallel
      const templateRef = getIdentifierFromValue(first.stage?.template?.templateRef as string)
      const type = templateRef ? (templateTypes?.[templateRef] as string) : (first?.stage?.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: first?.stage?.identifier as string,
        name: first?.stage?.name as string,
        nodeType: nodeType as string,
        type,
        icon: iconName,
        data: {
          graphType,
          ...stage,
          conditionalExecutionEnabled: first?.stage?.when
            ? first?.stage?.when?.pipelineStatus !== 'Success' || !!first?.stage.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        },
        children: trasformStageData(rest, graphType, templateTypes)
      })
    }
  })
  return finalData
}

const getuniqueIdForStep = (step: ExecutionWrapperConfig): string =>
  defaultTo(get(step, 'step.uuid') || get(step, 'step.id'), uuid() as string)

const trasformStepsData = (
  steps: ExecutionWrapperConfig[],
  graphType: PipelineGraphType,
  templateTypes?: KVPair
): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  steps.forEach((step: ExecutionWrapperConfig) => {
    if (step?.step) {
      const templateRef = getIdentifierFromValue(
        (step?.step as unknown as TemplateStepNode)?.template?.templateRef as string
      )
      const type = templateRef ? (templateTypes?.[templateRef] as string) : (step?.step?.type as string)
      const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)

      finalData.push({
        id: getuniqueIdForStep(step),
        identifier: step.step.identifier as string,
        name: step.step.name as string,
        type,
        nodeType: nodeType as string,
        icon: iconName,
        data: {
          graphType,
          ...step,
          isInComplete: isCustomGeneratedString(step.step.identifier),
          conditionalExecutionEnabled: step.step?.when
            ? step.step?.when?.stageStatus !== 'Success' || !!step.step?.when?.condition?.trim()
            : false,
          isTemplateNode: Boolean(templateRef)
        }
      })
    } else if (step?.parallel?.length) {
      const [first, ...rest] = step.parallel
      if (first.stepGroup) {
        const { iconName } = getNodeInfo('', graphType)
        finalData.push({
          id: getuniqueIdForStep(first),
          identifier: first.stepGroup?.identifier as string,
          name: first.stepGroup?.name as string,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          icon: iconName,
          data: {
            ...first,
            isInComplete: isCustomGeneratedString(first.stepGroup?.identifier),
            graphType
          },
          children: trasformStepsData(rest as ExecutionWrapperConfig[], graphType, templateTypes)
        })
      } else {
        const templateRef = getIdentifierFromValue(
          (first?.step as unknown as TemplateStepNode)?.template?.templateRef as string
        )
        const type = templateRef ? (templateTypes?.[templateRef] as string) : (first?.step?.type as string)
        const { nodeType, iconName } = getNodeInfo(defaultTo(type, ''), graphType)
        finalData.push({
          id: getuniqueIdForStep(first),
          identifier: first?.step?.identifier as string,
          name: first?.step?.name as string,
          type,
          nodeType: nodeType as string,
          icon: iconName,
          data: {
            ...first,
            isInComplete: isCustomGeneratedString(first?.step?.identifier as string),
            conditionalExecutionEnabled: first.step?.when
              ? first.step?.when?.stageStatus !== 'Success' || !!first.step?.when?.condition?.trim()
              : false,
            isTemplateNode: Boolean(templateRef),
            graphType
          },
          children: trasformStepsData(rest, graphType, templateTypes)
        })
      }
    } else {
      const { iconName } = getNodeInfo('', graphType)
      finalData.push({
        id: getuniqueIdForStep(step),
        identifier: step.stepGroup?.identifier as string,
        name: step.stepGroup?.name as string,
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: iconName,
        data: {
          ...step,
          graphType,
          isInComplete: isCustomGeneratedString(step.stepGroup?.identifier as string)
        }
      })
    }
  })
  return finalData
}

const getNodeInfo = (type: string, graphType: PipelineGraphType): { iconName: IconName; nodeType: string } => {
  return graphType === PipelineGraphType.STEP_GRAPH
    ? {
        iconName: StepTypeToPipelineIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
    : {
        iconName: stageTypeToIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
}

const getPipelineGraphDataType = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphType => {
  const hasStageData = defaultTo(get(data, '[0].parallel.[0].stage'), get(data, '[0].stage'))
  if (hasStageData) {
    return PipelineGraphType.STAGE_GRAPH
  }
  return PipelineGraphType.STEP_GRAPH
}
const getTerminalNodeLinks = ({
  firstNodeId = '',
  lastNodeId = '',
  createNodeId,
  startNodeId,
  endNodeId,
  readonly = false,
  scalingFactor
}: {
  startNodeId: string
  endNodeId: string
  firstNodeId?: string
  lastNodeId?: string
  createNodeId?: string
  readonly?: boolean
  scalingFactor?: number
}): SVGPathRecord[] => {
  const finalNodeLinks: SVGPathRecord[] = []
  if (firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, firstNodeId, { scalingFactor }),
        getFinalSVGArrowPath(lastNodeId, createNodeId, { scalingFactor }),
        getFinalSVGArrowPath(createNodeId, endNodeId, { scalingFactor })
      ]
    )
  }
  if (firstNodeId && readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, firstNodeId, { scalingFactor }),
        getFinalSVGArrowPath(lastNodeId, endNodeId, { scalingFactor })
      ]
    )
  }
  if (!firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, createNodeId, { scalingFactor }),
        getFinalSVGArrowPath(createNodeId, endNodeId, { scalingFactor })
      ]
    )
  }
  return finalNodeLinks
}
export interface RelativeBounds {
  top: number
  right: number
  bottom: number
  left: number
}

const getRelativeBounds = (parentElement: HTMLElement, targetElement: HTMLElement): RelativeBounds => {
  const parentPos = parentElement.getBoundingClientRect()
  const childPos = targetElement.getBoundingClientRect()
  const relativePos: RelativeBounds = { top: 0, right: 0, bottom: 0, left: 0 }

  relativePos.top = childPos.top - parentPos.top
  relativePos.right = childPos.right - parentPos.right
  relativePos.bottom = childPos.bottom - parentPos.bottom
  relativePos.left = childPos.left - parentPos.left
  return relativePos
}

export {
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  NodeTypeToNodeMap,
  getScaleToFitValue,
  getComputedPosition,
  getFinalSVGArrowPath,
  getPipelineGraphData,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  getTerminalNodeLinks,
  getRelativeBounds
}
