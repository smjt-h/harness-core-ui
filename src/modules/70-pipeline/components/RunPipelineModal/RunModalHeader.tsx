/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react'
import cx from 'classnames'
import { parse } from 'yaml'
import {
  Heading,
  Color,
  HarnessDocTooltip,
  MultiSelectDropDown,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  SelectOption
} from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'

import type { FormikErrors } from 'formik'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type {
  ResponseInputSetTemplateWithReplacedExpressionsResponse,
  ResponseListStageExecutionResponse,
  ResponsePMSPipelineResponseDTO
} from 'services/pipeline-ng'
import {
  ALL_STAGE_VALUE,
  getAllStageData,
  getAllStageItem,
  SelectedStageData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { InputSetDTO } from '@pipeline/utils/types'

import GitPopover from '../GitPopover/GitPopover'
import { ErrorsStrip } from '../ErrorsStrip/ErrorsStrip'

import css from './RunPipelineForm.module.scss'

export interface RunModalHeaderProps {
  pipelineExecutionId?: string
  selectedStageData: StageSelectionData
  setSelectedStageData: Dispatch<SetStateAction<StageSelectionData>>
  setSkipPreFlightCheck: Dispatch<SetStateAction<boolean>>
  selectedView: SelectedView
  setSelectedView: Dispatch<SetStateAction<SelectedView>>
  setCurrentPipeline: Dispatch<
    SetStateAction<
      | {
          pipeline?: PipelineInfoConfig
        }
      | undefined
    >
  >
  runClicked: boolean
  yamlHandler?: YamlBuilderHandlerBinding
  executionView?: boolean
  pipelineResponse: ResponsePMSPipelineResponseDTO | null
  getTemplateFromPipeline(): Promise<void> | undefined
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  formRefDom: React.MutableRefObject<HTMLElement | undefined>
  formErrors: FormikErrors<InputSetDTO>
  stageExecutionData: ResponseListStageExecutionResponse | null
  executionStageList: SelectOption[]
}

export default function RunModalHeader(props: RunModalHeaderProps): React.ReactElement | null {
  const {
    pipelineExecutionId,
    selectedStageData,
    setSelectedStageData,
    setSkipPreFlightCheck,
    setSelectedView,
    runClicked,
    setCurrentPipeline,
    yamlHandler,
    executionView,
    selectedView,
    pipelineResponse,
    getTemplateFromPipeline,
    template,
    formRefDom,
    formErrors,
    stageExecutionData,
    executionStageList
  } = props
  const { isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()
  const stageSelectionRef = useRef(false)

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const presentPipeline = parse(defaultTo(yamlHandler?.getLatestYaml(), '')) as { pipeline: PipelineInfoConfig }
        setCurrentPipeline(presentPipeline)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )

  const isStageExecutionDisabled = (): boolean => {
    //stageExecutionData?.data is empty array when allowStageExecution is set to false in advanced tab
    return Boolean(pipelineExecutionId) || isEmpty(stageExecutionData?.data)
  }

  const stageExecutionDisabledTooltip = isStageExecutionDisabled() ? 'stageExecutionDisabled' : undefined

  const onStageSelect = (items: SelectOption[]): void => {
    stageSelectionRef.current = true
    const allStagesSelected = items.find(item => item.value === ALL_STAGE_VALUE)
    const updatedSelectedStages: SelectedStageData[] = []
    const hasOnlyAllStagesUnChecked =
      items.length === stageExecutionData?.data?.length &&
      !items.find(item => item.value === getAllStageItem(getString).value)
    if (
      (!selectedStageData.allStagesSelected && allStagesSelected) ||
      hasOnlyAllStagesUnChecked ||
      items?.length === 0
    ) {
      const updatedSelectedStageItems = []
      updatedSelectedStageItems.push(getAllStageItem(getString))
      updatedSelectedStages.push(getAllStageData(getString))

      setSelectedStageData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: updatedSelectedStageItems,
        allStagesSelected: true
      })
    } else {
      const newItems = items.filter((option: SelectOption) => {
        const stageDetails = stageExecutionData?.data?.find(stageData => stageData.stageIdentifier === option.value)
        stageDetails && updatedSelectedStages.push(stageDetails)
        return option.value !== ALL_STAGE_VALUE
      })
      setSelectedStageData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: newItems,
        allStagesSelected: false
      })
    }
    setSkipPreFlightCheck(true)
  }

  if (executionView) {
    return null
  }

  return (
    <>
      <div className={css.runModalHeader}>
        <Heading
          level={2}
          font={{ weight: 'bold' }}
          color={Color.BLACK_100}
          className={css.runModalHeaderTitle}
          data-tooltip-id="runPipelineFormTitle"
        >
          {getString('runPipeline')}
          <HarnessDocTooltip tooltipId="runPipelineFormTitle" useStandAlone={true} />
        </Heading>
        {isGitSyncEnabled && (
          <GitSyncStoreProvider>
            <GitPopover
              data={pipelineResponse?.data?.gitDetails ?? {}}
              iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
            />
          </GitSyncStoreProvider>
        )}

        <div data-tooltip-id={stageExecutionDisabledTooltip}>
          <MultiSelectDropDown
            popoverClassName={css.disabledStageDropdown}
            hideItemCount={selectedStageData.allStagesSelected}
            disabled={isStageExecutionDisabled()}
            buttonTestId={'stage-select'}
            onChange={onStageSelect}
            onPopoverClose={() => {
              if (stageSelectionRef.current) {
                getTemplateFromPipeline()?.then(() => {
                  stageSelectionRef.current = false
                })
              }
            }}
            value={selectedStageData.selectedStageItems}
            items={executionStageList}
            minWidth={150}
            usePortal={true}
            placeholder={selectedStageData.allStagesSelected ? getString('pipeline.allStages') : getString('stages')}
            className={cx({ [css.stagesDropdown]: isGitSyncEnabled })}
          />
          <HarnessDocTooltip tooltipId={stageExecutionDisabledTooltip} useStandAlone={true} />
        </div>

        <div className={css.optionBtns}>
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
            disableToggle={!template?.data?.inputSetTemplateYaml}
          />
        </div>
      </div>
      {runClicked ? <ErrorsStrip domRef={formRefDom} formErrors={formErrors} /> : null}
    </>
  )
}
