/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { PageCVNGLogDTO } from 'services/cv'

export interface UseLogContentHookProps {
  verifyStepExecutionId?: string
  sloIdentifier?: string
  serviceName?: string
  envName?: string
}

export interface UseLogContentHookReturn {
  openLogContentHook: (logType: LogTypes) => void
  closeLogContentHook: () => void
}

export interface VerifyStepLogContentProps {
  logType: LogTypes
  verifyStepExecutionId: string
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
}

export interface SLOLogContentProps {
  logType: LogTypes
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

export enum LogTypes {
  ApiCallLog = 'ApiCallLog',
  ExecutionLog = 'ExecutionLog'
}

export interface ExecutionAndAPICallLogProps {
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
  verifyStepExecutionId?: string
  serviceName?: string
  envName?: string
  resource?: PageCVNGLogDTO
  loading: boolean
  errorMessage?: string
  refetchLogs: () => Promise<void>
  healthSource?: SelectOption
  setHealthSource?: (healthSource: SelectOption) => void
  timeRange?: SelectOption
  setTimeRange?: (timeRange: SelectOption) => void
  errorLogsOnly: boolean
  setErrorLogsOnly: (errorLogsOnly: boolean) => void
  pageNumber: number
  setPageNumber: (pageNumber: number | ((_pageNumber: number) => number)) => void
  handleDownloadLogs: () => Promise<void>
}
