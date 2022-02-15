/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getOptionsForChart, initNewRelicCustomFormValue } from '../NewRelicCustomMetricForm.utils'

describe('Validate utils', () => {
  test('should ', () => {
    expect(
      getOptionsForChart([
        {
          metricName: 'new relic metric',
          metricValue: 10,
          timestamp: 0,
          txnName: 'newrelic'
        }
      ])
    ).toEqual([[0, 10]])
  })

  test('should validate initNewRelicCustomFormValue', () => {
    expect(initNewRelicCustomFormValue(val => val)).toEqual({
      continuousVerification: false,
      groupName: {
        label: 'cv.addGroupName',
        value: 'cv.addGroupName'
      },
      healthScore: false,
      metricValue: '',
      query: '',
      serviceInstanceIdentifier: '',
      sli: false,
      timestamp: '',
      timestampFormat: ''
    })
  })
})
