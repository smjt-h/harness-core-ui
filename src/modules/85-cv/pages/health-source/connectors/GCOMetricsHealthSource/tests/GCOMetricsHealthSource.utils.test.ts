/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getSelectedDashboards } from '../GCOMetricsHealthSource.utils'
import { sourceData } from './GCOMetricsHealthSource.mock'

describe('Test Utils', () => {
  test('should validate getSelectedDashboards', () => {
    // No data case sourceData
    expect(getSelectedDashboards({})).toEqual([])
    // with dashboard + manual
    expect(getSelectedDashboards(sourceData)).toEqual([
      {
        id: 'projects/7065288960/dashboards/883f5f4e-02e3-44f6-a64e-7f6915d093cf',
        name: 'CPU limit utilization [MEAN]'
      },
      {
        id: '',
        name: ''
      }
    ])
    // with dashboard only
    sourceData.healthSourceList[0].spec.metricDefinitions =
      sourceData.healthSourceList[0].spec.metricDefinitions.filter(item => item.identifier !== 'Manual GGCO')

    expect(getSelectedDashboards(sourceData)).toEqual([
      {
        id: 'projects/7065288960/dashboards/883f5f4e-02e3-44f6-a64e-7f6915d093cf',
        name: 'CPU limit utilization [MEAN]'
      }
    ])
    // with manual only
    sourceData.healthSourceList[0].spec.metricDefinitions =
      sourceData.healthSourceList[0].spec.metricDefinitions.filter(item => item.identifier === 'Manual GGCO')

    expect(getSelectedDashboards(sourceData)).toEqual([])
  })
})
