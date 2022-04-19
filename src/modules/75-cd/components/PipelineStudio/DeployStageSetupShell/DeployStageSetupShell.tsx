/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Tabs, Tab, Button, Icon, ButtonVariation } from '@wings-software/uicore'
import cx from 'classnames'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import { Expander, IconName } from '@blueprintjs/core'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import type { ValidationError } from 'yup'
import YAML from 'yaml'
import produce from 'immer'
import { StageElementConfig, useGetFailureStrategiesYaml } from 'services/cd-ng'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import { StageType } from '@pipeline/utils/stageHelpers'
import { getCDStageValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import DeployInfraSpecifications from '../DeployInfraSpecifications/DeployInfraSpecifications'
import DeployServiceSpecifications from '../DeployServiceSpecifications/DeployServiceSpecifications'
import DeployStageSpecifications from '../DeployStageSpecifications/DeployStageSpecifications'
import DeployAdvancedSpecifications from '../DeployAdvancedSpecifications/DeployAdvancedSpecifications'
import css from './DeployStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'approval-stage-icon',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom'
}

const TabsOrder = [
  DeployTabs.OVERVIEW,
  DeployTabs.SERVICE,
  DeployTabs.INFRASTRUCTURE,
  DeployTabs.EXECUTION,
  DeployTabs.ADVANCED
]

const iconNames = { tick: 'tick' as IconName }

export default function DeployStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const isTemplatesEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const pipelineContext = usePipelineContext()
  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStageId, selectedStepId },
      templateTypes
    },
    contextType,
    stagesMap,
    isReadonly,
    stepsFactory,
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId,
    getStagePathFromPipeline,
    setSelectedSectionId
  } = pipelineContext
  const [incompleteTabs, setIncompleteTabs] = React.useState<{ [key in DeployTabs]?: boolean }>({})
  const [selectedTabId, setSelectedTabId] = React.useState<DeployTabs>(
    selectedStepId ? DeployTabs.EXECUTION : DeployTabs.SERVICE
  )
  const query = useQueryParams()
  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && TabsOrder.includes(sectionId)) {
      setSelectedTabId(sectionId)
    } else {
      setSelectedSectionId(DeployTabs.SERVICE)
    }
  }, [])

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(DeployTabs.EXECUTION)
    }
  }, [selectedStepId])

  const { checkErrorsForTab } = React.useContext(StageErrorContext)

  const handleTabChange = (nextTab: DeployTabs): void => {
    checkErrorsForTab(selectedTabId).then(_ => {
      setSelectedTabId(nextTab)
      setSelectedSectionId(nextTab)
    })
  }

  React.useEffect(() => {
    /* istanbul ignore else */
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  const { stage: data } = getStageFromPipeline(selectedStageId || '')

  const { data: stageYamlSnippet, loading, refetch } = useGetFailureStrategiesYaml({ lazy: true })
  React.useEffect(() => {
    // do the following one if it is a new stage
    if (!loading && data?.stage && isEmpty(data?.stage?.spec?.execution)) {
      if (!stageYamlSnippet?.data) {
        // fetch data on first load of new stage
        refetch()
      } else {
        // update the new stage with the fetched data
        updateStage(
          produce(data?.stage as StageElementConfig, draft => {
            const jsonFromYaml = YAML.parse(defaultTo(stageYamlSnippet?.data, '')) as StageElementConfig
            if (!draft.failureStrategies) {
              draft.failureStrategies = jsonFromYaml.failureStrategies
            }
          })
        )
      }
    }
  }, [stageYamlSnippet])

  const validate = React.useCallback(() => {
    try {
      getCDStageValidationSchema(getString, contextType).validateSync(data?.stage, {
        abortEarly: false,
        context: data?.stage
      })
      setIncompleteTabs({})
    } catch (error) {
      if (error.name !== 'ValidationError') {
        return
      }
      const response = error.inner.reduce((errors: ValidationError, currentError: ValidationError) => {
        errors = set(errors, currentError.path, currentError.message)
        return errors
      }, {})
      const newIncompleteTabs: { [key in DeployTabs]?: boolean } = {}
      if (!isEmpty(response.name) || !isEmpty(response.identifier) || !isEmpty(response.variables)) {
        newIncompleteTabs[DeployTabs.OVERVIEW] = true
      }
      if (!isEmpty(get(response.spec, 'serviceConfig'))) {
        newIncompleteTabs[DeployTabs.SERVICE] = true
      }
      if (!isEmpty(get(response.spec, 'infrastructure'))) {
        newIncompleteTabs[DeployTabs.INFRASTRUCTURE] = true
      }
      if (!isEmpty(get(response.spec, 'execution'))) {
        newIncompleteTabs[DeployTabs.EXECUTION] = true
      }
      if (!isEmpty(response.failureStrategies)) {
        newIncompleteTabs[DeployTabs.ADVANCED] = true
      }
      setIncompleteTabs(newIncompleteTabs)
    }
  }, [setIncompleteTabs, data?.stage])

  React.useEffect(() => {
    if (selectedTabId === DeployTabs.EXECUTION) {
      /* istanbul ignore else */
      if (data?.stage && data?.stage.type === StageType.DEPLOY) {
        if (!data?.stage?.spec?.execution) {
          const stageType = data?.stage?.type
          const openExecutionStrategy = stageType ? stagesMap[stageType].openExecutionStrategy : true
          // if !data?.stage?.spec?.execution and openExecutionStrategy===true show ExecutionStrategy drawer
          if (openExecutionStrategy) {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.ExecutionStrategy,
                hasBackdrop: true
              }
            })
          }
        } else {
          // set default (empty) values
          // NOTE: this cannot be set in advance as data.stage.spec.execution===undefined is a trigger to open ExecutionStrategy for CD stage
          /* istanbul ignore else */
          if (data?.stage?.spec?.execution) {
            if (!data.stage.spec.execution.steps) {
              data.stage.spec.execution.steps = []
            }
            if (!data.stage.spec.execution.rollbackSteps) {
              data.stage.spec.execution.rollbackSteps = []
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedTabId, selectedStageId])

  React.useEffect(() => {
    validate()
  }, [JSON.stringify(data)])

  const selectedStage = selectedStageId
    ? getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId).stage
    : undefined
  const originalStage = selectedStageId ? getStageFromPipeline(selectedStageId, originalPipeline).stage : undefined
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })

  const navBtns = (
    <Layout.Horizontal className={css.navigationBtns}>
      {selectedTabId !== DeployTabs.OVERVIEW && (
        <Button
          text={getString('previous')}
          variation={ButtonVariation.SECONDARY}
          icon="chevron-left"
          onClick={() => {
            handleTabChange(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])
          }}
        />
      )}
      {selectedTabId !== DeployTabs.ADVANCED && (
        <Button
          text={selectedTabId === DeployTabs.EXECUTION ? getString('save') : getString('next')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === DeployTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              handleTabChange(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
            }
          }}
        />
      )}
    </Layout.Horizontal>
  )

  return (
    <section ref={layoutRef} key={selectedStageId} className={cx(css.setupShell)}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          id={DeployTabs.OVERVIEW}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.OVERVIEW]}>
              <Icon name={incompleteTabs[DeployTabs.OVERVIEW] ? 'cd-main' : iconNames.tick} size={16} />
              {getString('overview')}
            </span>
          }
          data-testid="overview"
        />
        <Tab
          id={DeployTabs.SERVICE}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.SERVICE]}>
              <Icon name={incompleteTabs[DeployTabs.SERVICE] ? 'services' : iconNames.tick} size={16} />
              {getString('service')}
            </span>
          }
          panel={<DeployServiceSpecifications>{navBtns}</DeployServiceSpecifications>}
          data-testid="service"
        />
        <Tab
          id={DeployTabs.INFRASTRUCTURE}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.INFRASTRUCTURE]}>
              <Icon name={incompleteTabs[DeployTabs.INFRASTRUCTURE] ? 'infrastructure' : iconNames.tick} size={16} />
              {getString('infrastructureText')}
            </span>
          }
          panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
          data-testid="infrastructure"
        />
        <Tab
          id={DeployTabs.EXECUTION}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.EXECUTION]}>
              <Icon name={incompleteTabs[DeployTabs.EXECUTION] ? 'execution' : iconNames.tick} size={16} />
              {getString('executionText')}
            </span>
          }
          className={css.fullHeight}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              isReadonly={isReadonly}
              hasDependencies={false}
              stepsFactory={stepsFactory}
              originalStage={originalStage}
              ref={executionRef}
              pathToStage={`${stagePath}.stage.spec.execution`}
              templateTypes={templateTypes}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stage={selectedStage!}
              updateStage={stageData => {
                if (stageData.stage) updateStage(stageData.stage)
              }}
              onAddStep={(event: ExecutionGraphAddStepEvent) => {
                if (event.isTemplate) {
                  addTemplate(event)
                } else {
                  updatePipelineView({
                    ...pipelineView,
                    isDrawerOpened: true,
                    drawerData: {
                      type: DrawerTypes.AddStep,
                      data: {
                        paletteData: {
                          entity: event.entity,
                          stepsMap: event.stepsMap,
                          onUpdate: executionRef.current?.stepGroupUpdated,
                          // isAddStepOverride: true,
                          isRollback: event.isRollback,
                          isParallelNodeClicked: event.isParallel,
                          hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                        }
                      }
                    }
                  })
                }
              }}
              onEditStep={(event: ExecutionGraphEditStepEvent) => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.StepConfig,
                    data: {
                      stepConfig: {
                        node: event.node as any,
                        stepsMap: event.stepsMap,
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        isStepGroup: event.isStepGroup,
                        isUnderStepGroup: event.isUnderStepGroup,
                        addOrEdit: event.addOrEdit,
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                      }
                    }
                  }
                })
              }}
              onSelectStep={(stepId: string) => {
                setSelectedStepId(stepId)
              }}
              selectedStepId={selectedStepId}
            />
          }
          data-testid="execution"
        />
        <Tab
          id={DeployTabs.ADVANCED}
          title={
            <span className={css.title} data-completed={!incompleteTabs[DeployTabs.ADVANCED]}>
              <Icon name={incompleteTabs[DeployTabs.ADVANCED] ? 'advanced' : iconNames.tick} size={16} />
              Advanced
            </span>
          }
          className={css.fullHeight}
          panel={<DeployAdvancedSpecifications>{navBtns}</DeployAdvancedSpecifications>}
          data-testid="advanced"
        />
        {contextType === PipelineContextType.Pipeline && isTemplatesEnabled && selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton
              data={selectedStage.stage}
              type={'Stage'}
              buttonProps={{
                margin: { right: 'medium' },
                disabled: !!selectedStage.stage.spec?.serviceConfig?.useFromStage
              }}
            />
          </>
        )}
      </Tabs>
    </section>
  )
}
