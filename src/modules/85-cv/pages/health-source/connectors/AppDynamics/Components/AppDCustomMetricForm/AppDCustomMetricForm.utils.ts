/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import { AppDynamicsMonitoringSourceFieldNames } from '../../AppDHealthSource.constants'
import type { BasePathData } from '../BasePath/BasePath.types'
import type { MetricPathData } from '../MetricPath/MetricPath.types'
import type { SetServiceInstanceInterface } from './AppDCustomMetricForm.types'

export function initializeGroupNames(
  mappedMetrics: Map<string, any>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics?.entries())
    .map(metric => {
      const { groupName } = metric?.[1] || {}
      return groupName || null
    })
    .filter(groupItem => groupItem !== null) as SelectOption[]
  return [{ label: getString('cv.addNew'), value: '' }, ...groupNames]
}

export const getBasePathValue = (basePath: BasePathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}

export const getMetricPathValue = (basePath: MetricPathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}

export const setServiceIntance = ({
  serviceInsanceData,
  formikValues,
  formikSetField
}: SetServiceInstanceInterface): void => {
  if (
    serviceInsanceData &&
    formikValues?.continuousVerification &&
    formikValues?.serviceInstanceMetricPath !== serviceInsanceData.data
  ) {
    formikSetField(AppDynamicsMonitoringSourceFieldNames.SERVICE_INSTANCE_METRIC_PATH, serviceInsanceData?.data)
  }
}
