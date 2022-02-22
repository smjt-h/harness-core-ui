/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import { expectedChartConfigData, seriesMock, testDataMock } from './DeploymentMetricsAnalysisRow.mocks'
import { chartsConfig } from '../DeeploymentMetricsChartConfig'

describe('DeploymentMetricsChartConfig', () => {
  test('it should give correct return data for chartsConfig', () => {
    const getString = (key: StringKeys): string => key

    // eslint-disable-next-line
    // @ts-ignore
    const chartConfigData = chartsConfig(seriesMock, 312.5806451612903, testDataMock, getString)

    expect(chartConfigData).toEqual(expectedChartConfigData)
  })
})
