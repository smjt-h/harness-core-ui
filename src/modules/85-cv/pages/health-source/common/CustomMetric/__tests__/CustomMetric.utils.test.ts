/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { initAppDCustomFormValue } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.utils'
import { updateSelectedMetricsMap } from '../CustomMetric.utils'
import { mappedMetricsMap, formikValues, expectedMappedMetrics } from './CustomMetric.mock'

const getString = (value: string) => value
describe('Validate  utils functions', () => {
  const initCustomForm = initAppDCustomFormValue(getString)
  test('should validate updateSelectedMetricsMap', () => {
    const { selectedMetric, mappedMetrics } = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric new',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues,
      initCustomForm
    })
    expect(selectedMetric).toEqual('appdMetric new')
    expect(mappedMetrics).toEqual(expectedMappedMetrics)
  })
})
