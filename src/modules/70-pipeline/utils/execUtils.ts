// import type { PipelineGraphState } from '@pipeline/components/AbstractNode/types'
import { isEmpty } from 'lodash-es'
import type { PipelineGraphState } from '@pipeline/components/AbstractNode/types'
import type { ExecutionGraph } from 'services/pipeline-ng'
import {
  StepGroupRollbackIdentifier,
  NodeType,
  RollbackContainerCss,
  getIconDataBasedOnType,
  LITE_ENGINE_TASK,
  getExecutionPipelineNodeType,
  processLiteEngineTask,
  RollbackIdentifier,
  TopLevelNodes,
  hasOnlyLiteEngineTask
} from './executionUtils'
import type { ExecutionStatus } from './statusHelpers'

export const processExecutionDataV1 = (graph?: ExecutionGraph): Array<PipelineGraphState> => {
  const items: Array<PipelineGraphState> = []

  /* istanbul ignore else */
  if (graph?.nodeAdjacencyListMap && graph?.rootNodeId) {
    const nodeAdjacencyListMap = graph.nodeAdjacencyListMap
    const rootNode = graph.rootNodeId
    // Ignore the graph when its fqn is pipeline, as this doesn't render pipeline graph
    if (graph?.nodeMap?.[rootNode].baseFqn === 'pipeline') {
      return items
    }
    let nodeId = nodeAdjacencyListMap[rootNode].children?.[0]
    while (nodeId && nodeAdjacencyListMap[nodeId]) {
      const nodeData = graph?.nodeMap?.[nodeId]
      /* istanbul ignore else */
      if (nodeData) {
        const isRollback = nodeData.name?.endsWith(StepGroupRollbackIdentifier) ?? false
        if (nodeData.stepType && (TopLevelNodes.indexOf(nodeData.stepType as NodeType) > -1 || isRollback)) {
          // NOTE: exception if we have only lite task engine in Execution group
          if (hasOnlyLiteEngineTask(nodeAdjacencyListMap[nodeId].children, graph)) {
            const liteTaskEngineId = nodeAdjacencyListMap?.[nodeId]?.children?.[0] || ''
            processLiteEngineTask(graph?.nodeMap?.[liteTaskEngineId], items, nodeData)
          } else if (!isEmpty(nodeAdjacencyListMap[nodeId].children)) {
            if (nodeData.identifier === 'execution') {
              items.push(
                ...processNodeDataV1(
                  nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                  graph?.nodeMap,
                  graph?.nodeAdjacencyListMap,
                  items
                )
              )
            } else {
              items.push({
                group: {
                  name: nodeData.name || /* istanbul ignore next */ '',
                  identifier: nodeId,
                  data: nodeData,
                  skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
                  when: nodeData.nodeRunInfo,
                  containerCss: {
                    ...(RollbackIdentifier === nodeData.identifier || isRollback ? RollbackContainerCss : {})
                  },
                  status: nodeData.status as ExecutionStatus,
                  isOpen: true,
                  ...getIconDataBasedOnType(nodeData),
                  items: processNodeDataV1(
                    nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                    graph?.nodeMap,
                    graph?.nodeAdjacencyListMap,
                    items
                  )
                }
              })
            }
          }
        } else if (nodeData.stepType === NodeType.FORK) {
          items.push({
            parallel: processNodeDataV1(
              nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
              graph?.nodeMap,
              graph?.nodeAdjacencyListMap,
              items
            )
          })

          processParallelNodeData({ items, id: nodeId, rootNodes, nodeAdjacencyListMap, nodeMap: graph.nodeMap })
        } else {
          processSingleItem({
            items,
            id: nodeId,
            nodeMap: graph?.nodeMap,
            showInLabel: nodeData.stepType === NodeType.SERVICE || nodeData.stepType === NodeType.INFRASTRUCTURE
          })
        }
      }
      nodeId = nodeAdjacencyListMap[nodeId].nextIds?.[0]
    }
  }
  return items
}

export const processNodeDataV1 = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: Array<PipelineGraphState>
): Array<PipelineGraphState> => {
  const items: Array<PipelineGraphState> = []
  children?.forEach(item => {
    const nodeData = nodeMap?.[item]
    const isRollback = nodeData?.name?.endsWith(StepGroupRollbackIdentifier) ?? false

    if (nodeData?.stepType === NodeType.FORK) {
      processParallelNodeData({ items, id: item, nodeAdjacencyListMap, nodeMap, rootNodes })
    } else if (
      nodeData?.stepType === NodeType.STEP_GROUP ||
      nodeData?.stepType === NodeType.NG_SECTION ||
      (nodeData && isRollback)
    ) {
      processGroupItem({ items, id: item, isRollbackNext: isRollback, nodeMap, nodeAdjacencyListMap, rootNodes })
    } else {
      if (nodeData?.stepType === LITE_ENGINE_TASK) {
        const parentNodeId =
          Object.entries(nodeAdjacencyListMap || {}).find(([_, val]) => {
            return (val?.children?.indexOf(nodeData.uuid!) ?? -1) >= 0
          })?.[0] || ''
        processLiteEngineTask(nodeData, rootNodes, nodeMap?.[parentNodeId])
      } else {
        processSingleItem({ id: item, items, nodeMap, nodeAdjacencyListMap })
      }
    }
    const nextIds = nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ []
    nextIds.forEach(id => {
      const nodeDataNext = nodeMap?.[id]
      const isRollbackNext = nodeDataNext?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
      if (nodeDataNext?.stepType === NodeType.FORK) {
        processParallelNodeData({ items, id, nodeAdjacencyListMap, nodeMap, rootNodes })
      } else if (nodeDataNext?.stepType === NodeType.STEP_GROUP || (isRollbackNext && nodeDataNext)) {
        processGroupItem({ items, id, isRollbackNext, nodeMap, nodeAdjacencyListMap, rootNodes })
      } else {
        processSingleItem({ id, items, nodeMap, nodeAdjacencyListMap })
      }
      const nextLevels = nodeAdjacencyListMap?.[id].nextIds
      if (nextLevels) {
        items.push(...processNodeDataV1(nextLevels, nodeMap, nodeAdjacencyListMap, rootNodes))
      }
    })
  })
  return items
}

interface ProcessParalellNodeArgs {
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
  items: Array<PipelineGraphState>
  id: string
}
const processParallelNodeData = ({
  items,
  nodeMap,
  nodeAdjacencyListMap,
  id,
  rootNodes
}: ProcessParalellNodeArgs): void => {
  const [parentNodeId, ...childNodeIds] = nodeAdjacencyListMap?.[id].children as string[]
  const parentNodeData = nodeMap?.[parentNodeId]
  const iconData = getIconDataBasedOnType(parentNodeData)
  if (parentNodeData?.stepType === NodeType.STEP_GROUP) {
    console.log(nodeMap, parentNodeData, 'Parallel', nodeAdjacencyListMap?.[id].children)
    childNodeIds.map(childId => ({ step: nodeMap?.[childId] }))
  }
  items.push({
    name: parentNodeData?.name as string,
    identifier: parentNodeData?.identifier as string,
    id: parentNodeData?.uuid as string,
    nodeType: getExecutionPipelineNodeType(parentNodeData?.stepType),
    type: parentNodeData?.stepType as string,
    icon: iconData.icon,
    data: {
      ...(parentNodeData?.stepType === NodeType.STEP_GROUP
        ? {
            stepGroup: {
              name: parentNodeData?.name || /* istanbul ignore next */ '',
              ...iconData,
              identifier: parentNodeData?.identifier,
              skipCondition: parentNodeData?.skipInfo?.evaluatedCondition
                ? parentNodeData.skipInfo.skipCondition
                : undefined,
              when: parentNodeData?.nodeRunInfo,
              status: parentNodeData?.status as ExecutionStatus,
              type: getExecutionPipelineNodeType(parentNodeData?.stepType),
              data: parentNodeData,
              steps: childNodeIds.map(childId => ({ step: nodeMap?.[childId] }))
            }
          }
        : {
            name: parentNodeData?.name || /* istanbul ignore next */ '',
            ...iconData,
            identifier: parentNodeData?.identifier,
            skipCondition: parentNodeData?.skipInfo?.evaluatedCondition
              ? parentNodeData.skipInfo.skipCondition
              : undefined,
            when: parentNodeData?.nodeRunInfo,
            status: parentNodeData?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(parentNodeData?.stepType),
            data: parentNodeData
          })
    },
    children: processNodeDataV1(childNodeIds || /* istanbul ignore next */ [], nodeMap, nodeAdjacencyListMap, rootNodes)
  })
}
interface ProcessSingleItemArgs {
  nodeMap: ExecutionGraph['nodeMap']
  items: Array<PipelineGraphState>
  id: string
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  showInLabel?: boolean
}
const processSingleItem = ({ items, id, nodeMap, showInLabel, nodeAdjacencyListMap }: ProcessSingleItemArgs): void => {
  const nodeData = nodeMap?.[id]
  const childNodeIds = nodeAdjacencyListMap?.[id].children
  if (nodeData?.stepType === NodeType.STEP_GROUP) {
    console.log(nodeMap, nodeData, 'Parallel')
    childNodeIds.map(childId => ({ step: nodeMap?.[childId] }))
  }
  if (!nodeData) return
  const iconData = getIconDataBasedOnType(nodeData)
  items.push({
    name: nodeData?.name as string,
    identifier: nodeData?.identifier as string,
    id: nodeData?.uuid as string,
    nodeType: getExecutionPipelineNodeType(nodeData?.stepType),
    type: nodeData?.stepType as string,
    icon: iconData.icon,
    data: {
      //   name: nodeData?.name || /* istanbul ignore next */ '',
      //   ...iconData,
      //   identifier: id,
      //   skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
      //   when: nodeData?.nodeRunInfo,
      //   status: nodeData?.status as ExecutionStatus,
      //   type: getExecutionPipelineNodeType(nodeData?.stepType),
      //   data: nodeData,
      //   showInLabel
      // }

      ...(nodeData?.stepType === NodeType.STEP_GROUP
        ? {
            stepGroup: {
              name: nodeData?.name || /* istanbul ignore next */ '',
              ...iconData,
              identifier: nodeData?.identifier,
              skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
              when: nodeData?.nodeRunInfo,
              status: nodeData?.status as ExecutionStatus,
              type: getExecutionPipelineNodeType(nodeData?.stepType),
              showInLabel,
              data: nodeData,
              steps: childNodeIds?.map(childId => ({ step: nodeMap?.[childId] }))
            }
          }
        : {
            name: nodeData?.name || /* istanbul ignore next */ '',
            ...iconData,
            identifier: nodeData?.identifier,
            skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
            when: nodeData?.nodeRunInfo,
            status: nodeData?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeData?.stepType),
            data: nodeData,
            showInLabel
          })
    }
  })
}

interface ProcessGroupItemArgs {
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
  items: Array<PipelineGraphState>
  id: string
  isRollbackNext?: boolean
}
const processGroupItem = ({
  items,
  id,
  nodeMap,
  nodeAdjacencyListMap,
  rootNodes,
  isRollbackNext
}: ProcessGroupItemArgs): void => {
  const nodeData = nodeMap?.[id]
  if (!nodeData) return
  const iconData = getIconDataBasedOnType(nodeData)
  if (nodeData?.stepType === NodeType.STEP_GROUP) {
    console.log(nodeMap, nodeData, 'group')
    const childNodeIds = nodeAdjacencyListMap?.[id].children
    childNodeIds.map(childId => ({ step: nodeMap?.[childId] }))
  }
  items.push({
    id: nodeData.uuid as string,
    identifier: nodeData?.identifier as string,
    name: nodeData?.name as string,
    type: 'STEP_GROUP',
    nodeType: 'STEP_GROUP',
    icon: iconData.icon,
    data: {
      stepgroup: {
        name: nodeData.name || /* istanbul ignore next */ '',
        identifier: id,
        data: nodeData,
        containerCss: {
          ...(isRollbackNext ? RollbackContainerCss : {})
        },
        skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
        when: nodeData.nodeRunInfo,
        status: nodeData.status as ExecutionStatus,
        isOpen: true,
        ...iconData
      }
    },
    children: processNodeDataV1(
      nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
      nodeMap,
      nodeAdjacencyListMap,
      rootNodes
    )
  })
}
