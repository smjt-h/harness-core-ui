/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import { groupBy } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type {
  GroupedCreatedMetrics,
  GroupedMetric
} from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  CustomMappedMetric,
  RemoveMetricInterface,
  CustomSelectedAndMappedMetrics,
  SelectMetricInerface,
  UpdateSelectedMetricsMapInterface,
  CreatedMetricsWithSelectedIndex
} from './CustomMetric.types'
import type { InitCustomFormInterface } from '../../connectors/AppDynamics/AppDHealthSource.types'

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikValues,
  initCustomForm
}: UpdateSelectedMetricsMapInterface): { selectedMetric: string; mappedMetrics: Map<string, CustomMappedMetric> } {
  const updatedMap = new Map(mappedMetrics)

  const duplicateName =
    Array.from(mappedMetrics.keys()).indexOf(formikValues.metricName) > -1 && oldMetric !== formikValues?.metricName
  if (duplicateName) {
    return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
  }

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== formikValues?.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created metric create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, {
      ...{
        _id: uuid(),
        metricName: updatedMetric,
        metricIdentifier: updatedMetric.split(' ').join('_'),
        ...initCustomForm
      }
    } as any)
  }

  // update map with current form data
  updatedMap.set(formikValues.metricName, {
    ...formikValues
  })

  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export const defaultGroupedMetric = (getString: UseStringsReturn['getString']): SelectOption => {
  const createdMetricLabel = getString('cv.addGroupName')
  return { label: createdMetricLabel, value: createdMetricLabel }
}

export const initGroupedCreatedMetrics = (
  mappedMetrics: Map<string, CustomMappedMetric>,
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics =>
  groupBy(getGroupAndMetric(mappedMetrics, getString), function (item) {
    return item?.groupName?.label
  })

export const getGroupAndMetric = (
  mappedMetrics: Map<string, CustomMappedMetric>,
  getString: UseStringsReturn['getString']
): GroupedMetric[] => {
  return Array.from(mappedMetrics?.values()).map(item => {
    return {
      groupName: item.groupName || defaultGroupedMetric(getString),
      metricName: item.metricName
    }
  })
}

export const getGroupedCreatedMetrics = (
  mappedMetrics: Map<string, CustomMappedMetric>,
  getString: UseStringsReturn['getString']
): GroupedCreatedMetrics => {
  const filteredList = Array.from(mappedMetrics?.values()).map((item, index) => {
    return {
      index,
      groupName: item.groupName || defaultGroupedMetric(getString),
      metricName: item.metricName
    }
  })
  return groupBy(filteredList.reverse(), function (item) {
    return item?.groupName?.label
  })
}

export const getMappedMetrics = (
  mappedMetrics: Map<string, CustomMappedMetric>,
  formikValues: CustomMappedMetric,
  oldState: CustomSelectedAndMappedMetrics,
  initCustomForm: InitCustomFormInterface
): {
  selectedMetric: string
  mappedMetrics: Map<string, CustomMappedMetric>
} => {
  const duplicateName =
    Array.from(mappedMetrics.keys()).indexOf(formikValues.metricName) > -1 &&
    oldState.selectedMetric !== formikValues?.metricName
  if (duplicateName) {
    return { selectedMetric: oldState.selectedMetric, mappedMetrics: mappedMetrics }
  }

  return updateSelectedMetricsMap({
    updatedMetric: formikValues.metricName,
    oldMetric: oldState.selectedMetric,
    mappedMetrics: oldState.mappedMetrics,
    formikValues,
    initCustomForm
  })
}

export const onRemoveMetric = ({
  removedMetric,
  updatedMetric,
  updatedList,
  smIndex,
  setCreatedMetrics,
  setMappedMetrics,
  formikValues
}: RemoveMetricInterface): void => {
  setMappedMetrics(oldState => {
    const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
    const updatedMap = new Map(oldMappedMetric)

    if (updatedMap.has(removedMetric)) {
      updatedMap.delete(removedMetric)
    } else {
      // handle case where user updates the metric name for current selected metric
      updatedMap.delete(oldMetric)
    }

    // update map with current values
    if (formikValues?.metricName !== removedMetric && formikValues?.metricName === updatedMetric) {
      updatedMap.set(updatedMetric, { ...formikValues } || { metricName: updatedMetric })
    }

    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
    return {
      selectedMetric: updatedMetric,
      mappedMetrics: updatedMap
    }
  })
}

export const onSelectMetric = ({
  newMetric,
  updatedList,
  smIndex,
  setCreatedMetrics,
  setMappedMetrics,
  formikValues,
  initCustomForm
}: SelectMetricInerface): void => {
  setMappedMetrics(oldState => {
    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
    return updateSelectedMetricsMap({
      updatedMetric: newMetric,
      oldMetric: oldState.selectedMetric,
      mappedMetrics: oldState.mappedMetrics,
      formikValues,
      initCustomForm
    })
  })
}

export function initializeCreatedMetrics(
  defaultSelectedMetricName: string,
  selectedMetric: string,
  mappedMetrics: CustomSelectedAndMappedMetrics['mappedMetrics']
): CreatedMetricsWithSelectedIndex {
  return {
    createdMetrics: Array.from(mappedMetrics.keys()) || [defaultSelectedMetricName],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  }
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  initCustomFormData: InitCustomFormInterface,
  mappedServicesAndEnvs?: Map<string, CustomMappedMetric>
): CustomSelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics:
      mappedServicesAndEnvs || new Map([[defaultSelectedMetricName, initCustomFormData as CustomMappedMetric]])
  }
}
