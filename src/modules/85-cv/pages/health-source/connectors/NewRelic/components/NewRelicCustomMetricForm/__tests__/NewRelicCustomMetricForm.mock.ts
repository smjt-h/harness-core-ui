/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mappedMetricsMap = new Map()
const mapValue = {
  metricName: 'New Relic Metric',
  metricIdentifier: '9a895e7d-ab48-4eaa-a8e3-69c25872925e',
  groupName: { label: 'Group 1', value: 'Group 1' },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].beginTimeSeconds',
  timestamp: '$.timeSeries.[*].endTimeSeconds',
  sli: true,
  continuousVerification: false,
  healthScore: false,
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false
}
mappedMetricsMap.set('New Relic Metric', mapValue)

export const formikValues = {
  name: 'New relic refactor',
  identifier: 'New_relic_refactor',
  connectorRef: 'account.new_relic',
  isEdit: true,
  product: { label: 'apm', value: 'apm' },
  type: 'NewRelic',
  mappedServicesAndEnvs: mappedMetricsMap,
  newRelicApplication: { label: 'My Application', value: 107019083 },
  metricPacks: [{ identifier: 'Performance' }],
  metricData: { Performance: true },
  metricName: 'New Relic Metric',
  metricIdentifier: '9a895e7d-ab48-4eaa-a8e3-69c25872925e',
  groupName: { label: 'Group 1', value: 'Group 1' },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].beginTimeSeconds',
  timestamp: '$.timeSeries.[*].endTimeSeconds',
  sli: true,
  continuousVerification: false,
  healthScore: false,
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  showCustomMetric: true
}

export const existingMetricDetails = {
  name: 'New relic refactor',
  identifier: 'New_relic_refactor',
  type: 'NewRelic',
  spec: {
    connectorRef: 'account.new_relic',
    applicationName: 'My Application',
    applicationId: '107019083',
    feature: 'apm',
    metricPacks: [{ identifier: 'Performance' }],
    newRelicMetricDefinitions: [
      {
        identifier: 'NewRelicMetric',
        metricName: 'New Relic Metric',
        riskProfile: { category: 'Errors', metricType: null, thresholdTypes: [] },
        analysis: {
          liveMonitoring: { enabled: false },
          deploymentVerification: { enabled: false, serviceInstanceFieldName: null, serviceInstanceMetricPath: null },
          riskProfile: { category: 'Errors', metricType: null, thresholdTypes: [] }
        },
        sli: { enabled: true },
        groupName: 'Group 1',
        nrql: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
        responseMapping: {
          metricValueJsonPath: '$.timeSeries.[*].beginTimeSeconds',
          timestampJsonPath: '$.timeSeries.[*].endTimeSeconds',
          serviceInstanceJsonPath: null,
          timestampFormat: null
        }
      }
    ]
  }
}
