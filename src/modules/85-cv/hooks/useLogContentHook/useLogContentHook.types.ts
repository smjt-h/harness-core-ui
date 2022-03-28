/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { State, UseActionCreatorReturn } from './views/ExecutionLog/ExecutionLog.types'

export interface UseLogContentHookProps {
  verifyStepExecutionId?: string
  sloIdentifier?: string
  serviceName?: string
  envName?: string
}

export interface UseLogContentHookReturn {
  openLogContentHook: () => void
  closeLogContentHook: () => void
}

export interface VerifyStepLogProps {
  verifyStepExecutionId: string
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
}

export interface SLOLogProps {
  identifier: string
  serviceName?: string
  envName?: string
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
}

export enum TimeRangeTypes {
  LAST_1_HOUR = 'LAST_1_HOUR',
  LAST_4_HOURS = 'LAST_4_HOURS',
  LAST_12_HOUR = 'LAST_12_HOURS',
  LAST_24_HOUR = 'LAST_24_HOURS'
}

export interface ExecutionLogHeaderProps {
  verifyStepExecutionId?: string
  serviceName?: string
  envName?: string
  healthSource?: SelectOption
  setHealthSource?: (healthSource: SelectOption) => void
  timeRange?: SelectOption
  setTimeRange?: (timeRange: SelectOption) => void
  errorLogsOnly: boolean
  setErrorLogsOnly: (errorLogsOnly: boolean) => void
  actions: UseActionCreatorReturn
  setPageNumber: (pageNumber: number) => void
}

export interface ExecutionLogToolbarProps {
  state: State
  actions: UseActionCreatorReturn
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
  isVerifyStep: boolean
  timeRange?: SelectOption
}

export enum LogTypes {
  ApiCallLog = 'ApiCallLog',
  ExecutionLog = 'ExecutionLog'
}
