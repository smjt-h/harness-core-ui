import { flatMap, findIndex, cloneDeep, set, defaultTo, isEmpty, noop } from 'lodash-es'
import { Color, Utils } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import type { NodeModelListener, LinkModelListener, DiagramEngine } from '@projectstorm/react-diagrams-core'
import produce from 'immer'
import { parse } from 'yaml'
import type {
  StageElementWrapperConfig,
  PageConnectorResponse,
  PipelineInfoConfig,
  DeploymentStageConfig
} from 'services/cd-ng'
import type * as Diagram from '@pipeline/components/Diagram'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { SelectorData } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { SplitViewTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { EmptyStageName } from '../PipelineConstants'
import type { PipelineContextInterface, StagesMap } from '../PipelineContext/PipelineContext'
import { getStageFromPipeline } from '../PipelineContext/helpers'
import {
  DefaultNodeEvent,
  DefaultNodeModel,
  DiagramType,
  Event,
  GroupNodeModelOptions
} from '@pipeline/components/Diagram'
import type { MoveDirection, MoveStageDetailsType } from './StageBuilder'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import {
  PopoverData,
  resetDiagram,
  StageState,
  getAffectedDependentStages,
  getStageIndexFromPipeline,
  getStageIndexByIdentifier,
  getDependantStages
} from './StageBuilderUtil'
import { moveStageToFocusDelayed } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'

export const getLinkEventListenersOld = (
  updateStageOnAddLink: (event: any, dropNode: StageElementWrapper | undefined, current: any) => void,
  setSelectionRef,
  confirmDeleteStage: () => void,
  updateDeleteId: (id: string | undefined) => void,

  dynamicPopoverHandler: DynamicPopoverHandlerBinding<PopoverData> | undefined,
  pipelineContext: PipelineContextInterface,
  addStage: (
    newStage: StageElementWrapperConfig,
    isParallel?: boolean,
    event?: Diagram.DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipeline?: PipelineInfoConfig
  ) => void,
  openTemplateSelector: (selectorData: SelectorData) => void,
  closeTemplateSelector: () => void,
  updateMoveStageDetails: (moveStageDetails: MoveStageDetailsType) => void,
  confirmMoveStage: () => void,
  stageMap: Map<string, StageState>,
  engine: DiagramEngine
): NodeModelListener => {
  const {
    state: {
      pipeline,
      pipelineView: {
        isSplitViewOpen,
        splitViewData: { type = SplitViewTypes.StageView }
      },
      pipelineView,
      isInitialized,
      selectionState: { selectedStageId },
      templateTypes
    },
    contextType = 'Pipeline',
    isReadonly,
    stagesMap,
    updatePipeline,
    updatePipelineView,
    renderPipelineStage,
    getStageFromPipeline,
    setSelection,
    setTemplateTypes
  } = pipelineContext
  return {
    // Can not remove this Any because of React Diagram Issue
    [Event.ClickNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      dynamicPopoverHandler?.hide()

      /* istanbul ignore else */ if (eventTemp.entity) {
        if (eventTemp.entity.getType() === DiagramType.CreateNew) {
          setSelectionRef.current({ stageId: undefined, sectionId: undefined })
          dynamicPopoverHandler?.show(
            `[data-nodeid="${eventTemp.entity.getID()}"]`,
            {
              addStage,
              isStageView: false,
              renderPipelineStage,
              stagesMap,
              contextType,
              templateTypes,
              setTemplateTypes,
              openTemplateSelector,
              closeTemplateSelector
            },
            { useArrows: true, darkMode: false, fixedPosition: false }
          )
        } else if (eventTemp.entity.getType() === DiagramType.GroupNode) {
          const parent = getStageFromPipeline(eventTemp.entity.getIdentifier()).parent as StageElementWrapperConfig
          const parallelStages = (eventTemp.entity.getOptions() as GroupNodeModelOptions).parallelNodes
          /* istanbul ignore else */ if (parent?.parallel) {
            dynamicPopoverHandler?.show(
              `[data-nodeid="${eventTemp.entity.getID()}"]`,
              {
                isGroupStage: true,
                groupSelectedStageId: selectedStageId,
                isStageView: false,
                groupStages: parent.parallel.filter(
                  node => parallelStages.indexOf(defaultTo(node.stage?.identifier, '')) > -1
                ),
                onClickGroupStage: (stageId: string) => {
                  dynamicPopoverHandler?.hide()
                  setSelectionRef.current({ stageId })
                  moveStageToFocusDelayed(engine, stageId, true)
                },
                stagesMap,
                renderPipelineStage,
                contextType,
                templateTypes,
                setTemplateTypes,
                openTemplateSelector,
                closeTemplateSelector
              },
              { useArrows: false, darkMode: false, fixedPosition: false }
            )
          }
        } /* istanbul ignore else */ else if (eventTemp.entity.getType() !== DiagramType.StartNode) {
          const data = getStageFromPipeline(eventTemp.entity.getIdentifier()).stage
          if (isSplitViewOpen && data?.stage?.identifier) {
            if (data?.stage?.name === EmptyStageName) {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                `[data-nodeid="${eventTemp.entity.getID()}"]`,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage?.identifier || '', { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    resetDiagram(engine)
                    setSelectionRef.current({ stageId: identifier })
                  },
                  stagesMap,
                  renderPipelineStage,
                  contextType,
                  templateTypes,
                  setTemplateTypes,
                  openTemplateSelector,
                  closeTemplateSelector
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
              setSelectionRef.current({ stageId: undefined, sectionId: undefined })
            } else {
              setSelectionRef.current({ stageId: data?.stage?.identifier, sectionId: undefined })
              moveStageToFocusDelayed(engine, data?.stage?.identifier, true)
            }
          } /* istanbul ignore else */ else if (!isSplitViewOpen) {
            if (stageMap.has(data?.stage?.identifier || '')) {
              setSelectionRef.current({ stageId: data?.stage?.identifier })
              moveStageToFocusDelayed(engine, data?.stage?.identifier || '', true)
            } else {
              // TODO: check if this is unused code
              dynamicPopoverHandler?.show(
                `[data-nodeid="${eventTemp.entity.getID()}"]`,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage?.identifier || '', { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    resetDiagram(engine)
                    setSelectionRef.current({ stageId: identifier })
                  },
                  stagesMap,
                  renderPipelineStage,
                  contextType,
                  templateTypes,
                  setTemplateTypes,
                  openTemplateSelector,
                  closeTemplateSelector
                },
                { useArrows: false, darkMode: false, fixedPosition: false }
              )
            }
          }
        }
      }
    },
    // Can not remove this Any because of React Diagram Issue
    [Event.RemoveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      const stageIdToBeRemoved = eventTemp.entity.getIdentifier()
      updateDeleteId(stageIdToBeRemoved)
      confirmDeleteStage()
    },
    [Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      // dynamicPopoverHandler?.hide()

      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      setSelectionRef.current({ stageId: undefined, sectionId: undefined })

      if (eventTemp.entity) {
        dynamicPopoverHandler?.show(
          `[data-nodeid="${eventTemp.entity.getID()}"] [data-nodeid="add-parallel"]`,
          {
            addStage,
            isParallel: true,
            isStageView: false,
            event: eventTemp,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            setTemplateTypes,
            openTemplateSelector,
            closeTemplateSelector
          },
          { useArrows: false, darkMode: false, fixedPosition: false },
          eventTemp.callback
        )
      }
    },
    [Event.DropLinkEvent]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (event.node?.identifier) {
        const dropNode = getStageFromPipeline(event.node.identifier).stage
        const current = getStageFromPipeline(eventTemp.entity.getIdentifier())
        const dependentStages = getDependantStages(pipeline, dropNode)
        const parentStageId = (dropNode?.stage as DeploymentStageElementConfig)?.spec?.serviceConfig?.useFromStage
          ?.stage
        if (parentStageId?.length) {
          const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)

          const { index: parentIndex } = getStageIndexFromPipeline(pipeline, parentStageId)
          if (stageIndex <= parentIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.AHEAD,
              currentStage: current
            })
            confirmMoveStage()
            return
          }

          return
        } else if (dependentStages?.length) {
          let finalDropIndex = -1
          let firstDependentStageIndex
          const { stageIndex: dependentStageIndex, parallelStageIndex: dependentParallelIndex = -1 } =
            getStageIndexByIdentifier(pipeline, dependentStages[0])

          firstDependentStageIndex = dependentStageIndex

          if (current.parent) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
            firstDependentStageIndex = dependentStageIndex
          } else if (current?.stage) {
            const { stageIndex } = getStageIndexByIdentifier(pipeline, current?.stage?.stage?.identifier)
            finalDropIndex = stageIndex
          }

          finalDropIndex = finalDropIndex === -1 ? pipeline.stages?.length || 0 : finalDropIndex
          const stagesTobeUpdated = getAffectedDependentStages(
            dependentStages,
            finalDropIndex,
            pipeline,
            dependentParallelIndex
          )

          if (finalDropIndex >= firstDependentStageIndex) {
            updateMoveStageDetails({
              event,
              direction: MoveDirection.BEHIND,
              dependentStages: stagesTobeUpdated,
              currentStage: current,
              isLastAddLink: !current.parent
            })

            confirmMoveStage()
            return
          }
        }
        updateStageOnAddLink(event, dropNode, current)
      }
    },
    [Event.MouseEnterNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      const current = getStageFromPipeline(eventTemp.entity.getIdentifier())
      if (current.stage?.stage?.when) {
        const { pipelineStatus, condition } = current.stage.stage.when
        if (pipelineStatus === PipelineOrStageStatus.SUCCESS && isEmpty(condition)) {
          return
        }
        dynamicPopoverHandler?.show(
          `[data-nodeid="${eventTemp.entity.getID()}"]`,
          {
            event: eventTemp,
            data: current.stage,
            isStageView: false,
            isHoverView: true,
            stagesMap,
            renderPipelineStage,
            contextType,
            templateTypes,
            setTemplateTypes,
            openTemplateSelector,
            closeTemplateSelector
          },
          { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' },
          noop,
          true
        )
      }
    },
    [Event.MouseLeaveNode]: (event: any) => {
      const eventTemp = event as DefaultNodeEvent
      eventTemp.stopPropagation()
      if (dynamicPopoverHandler?.isHoverView?.()) {
        dynamicPopoverHandler?.hide()
      }
    }
  }
}
