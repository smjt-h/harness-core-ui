import type { SetStateAction } from 'react'
import type { FormikErrors, FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { Intent } from '@blueprintjs/core'

import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import type {
  RetryFailureActionConfig,
  IgnoreFailureActionConfig,
  ManualInterventionFailureActionConfig,
  AbortFailureActionConfig,
  StepGroupFailureActionConfig,
  MarkAsSuccessFailureActionConfig,
  StageRollbackFailureActionConfig,
  FailureStrategyConfig,
  OnFailureConfig
} from 'services/cd-ng'

export type AllActions =
  | RetryFailureActionConfig
  | IgnoreFailureActionConfig
  | ManualInterventionFailureActionConfig
  | AbortFailureActionConfig
  | StepGroupFailureActionConfig
  | MarkAsSuccessFailureActionConfig
  | StageRollbackFailureActionConfig

export interface AllFailureStrategyConfig extends FailureStrategyConfig {
  onFailure: OnFailureConfig & { action: AllActions }
}

export function isDefaultStageStrategy(mode: Modes, stageType: StageType, selectedStrategyNum: number): boolean {
  return mode === Modes.STAGE && stageType === StageType.DEPLOY && selectedStrategyNum === 0
}

export function hasItems<T>(data?: T[]): boolean {
  return Array.isArray(data) && data.length > 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findTabWithErrors(errors?: FormikErrors<any>): number {
  const fsErrors = errors?.failureStrategies

  return Array.isArray(fsErrors)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fsErrors.findIndex((err: any) => !isEmpty(err))
    : -1
}

export interface FormState {
  failureStrategies?: AllFailureStrategyConfig[]
}

export interface HandleChangeInStrategiesProps {
  formValues: FormState
  selectedStrategyNum: number
  setSelectedStrategyNum: (value: SetStateAction<number>) => void
  setFormikState: FormikProps<FormState>['setFormikState']
}

export function handleChangeInStrategies({
  formValues,
  selectedStrategyNum,
  setSelectedStrategyNum,
  setFormikState
}: HandleChangeInStrategiesProps): void {
  const fs = formValues.failureStrategies
  /* istanbul ignore else */
  if (Array.isArray(fs)) {
    /* istanbul ignore else */
    if (selectedStrategyNum >= fs.length) {
      // select the new last tab, if the last tab was deleted
      setSelectedStrategyNum(Math.max(0, fs.length - 1))
    }

    /* istanbul ignore else */
    if (fs.length === 0) {
      // reset errors when all the tabs are deleted
      setFormikState({ errors: {}, submitCount: 0 })
    }
  }
}

export function getTabIntent(i: number, selectedStrategyNum: number): Intent {
  return i === selectedStrategyNum ? Intent.PRIMARY : Intent.NONE
}
