/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { SelectOption } from '@harness/uicore'
import type { ApiCallLogDTO, HealthSourceDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { TimeRangeTypes } from './useLogContentHook.types'
import { RESPONSE_BODY } from './useLogContentHook.constants'

export function isPositiveNumber(index: unknown): index is number {
  return typeof index === 'number' && index >= 0
}

export function getHealthSourceOptions(
  getString: UseStringsReturn['getString'],
  healthSources?: HealthSourceDTO[]
): SelectOption[] {
  const optionAll: SelectOption = { label: getString('all'), value: '' }

  const healthSourcesOptions =
    healthSources?.map(healthSource => ({
      label: healthSource.name ?? '',
      value: healthSource.identifier ?? ''
    })) ?? []

  return [optionAll, ...healthSourcesOptions]
}

export const getTimeRangeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('cv.lastOneHour'),
    value: TimeRangeTypes.LAST_1_HOUR
  },
  {
    label: getString('cv.monitoredServices.serviceHealth.last4Hrs'),
    value: TimeRangeTypes.LAST_4_HOURS
  },
  {
    label: getString('cv.last12Hours'),
    value: TimeRangeTypes.LAST_12_HOUR
  },
  {
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs'),
    value: TimeRangeTypes.LAST_24_HOUR
  }
]

export const startOfSecond = (time: moment.Moment): Date => time.utc().startOf('minute').toDate()

export const getTimeRangeInMilliseconds = (timeRange: TimeRangeTypes): [number, number] => {
  switch (timeRange) {
    case TimeRangeTypes.LAST_1_HOUR:
      return [startOfSecond(moment().subtract(1, 'hour').add(1, 'second')).getTime(), startOfSecond(moment()).getTime()]
    case TimeRangeTypes.LAST_4_HOURS:
      return [
        startOfSecond(moment().subtract(4, 'hours').add(1, 'second')).getTime(),
        startOfSecond(moment()).getTime()
      ]
    case TimeRangeTypes.LAST_12_HOUR:
      return [
        startOfSecond(moment().subtract(12, 'hours').add(1, 'second')).getTime(),
        startOfSecond(moment()).getTime()
      ]
    case TimeRangeTypes.LAST_24_HOUR:
      return [
        startOfSecond(moment().subtract(24, 'hours').add(1, 'second')).getTime(),
        startOfSecond(moment()).getTime()
      ]
    default:
      return [0, 0]
  }
}

export const formatDate = (date?: number): string => (date ? moment(new Date(date)).format('L, LT') : '')

export const getInfoText = (getString: UseStringsReturn['getString'], timeRange?: SelectOption): string => {
  const [_startTime, _endTime] = getTimeRangeInMilliseconds(timeRange?.value as TimeRangeTypes)

  const startTime = formatDate(_startTime)
  const endTime = formatDate(_endTime)

  return `${getString('cv.showingLogsFor')} ${timeRange?.label?.toLowerCase()} from ${startTime} to ${endTime}.`
}

export const getStatusColor = (statusCode = '500'): 'success' | 'error' => {
  const _code = Number(statusCode)

  if (_code >= 200 && _code < 300) {
    return 'success'
  }

  return 'error'
}

export function downloadJson(data: string, fileName: string): void {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(data)}`
  const link = document.createElement('a')

  link.href = jsonString
  link.download = `${fileName}-${moment().format('L-LT')}.json`
  link.click()
}

export function parseResponseBody(data: ApiCallLogDTO[]): ApiCallLogDTO[] {
  return data.map(log => ({
    ...log,
    responses: log.responses?.map(response => {
      if (response.name === RESPONSE_BODY) {
        let value

        try {
          value = response.value && JSON.parse(response.value)
        } catch (e) {
          value = response.value
        }

        return { ...response, value }
      }
      return response
    })
  }))
}
