/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const product = 'Cloud Metrics'
export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'GCO manual + Dashboard',
      identifier: 'GCO_manual_Dashboard',
      type: 'Stackdriver',
      spec: {
        connectorRef: 'account.gcpchiplay',
        metricDefinitions: [
          {
            identifier: 'kubernetes.io/container/cpu/limit_utilization',
            metricName: 'kubernetes.io/container/cpu/limit_utilization',
            riskProfile: {
              category: 'Errors',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: true
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'test instance',
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Errors',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: true
            },
            dashboardName: 'CPU limit utilization [MEAN]',
            dashboardPath: 'projects/7065288960/dashboards/883f5f4e-02e3-44f6-a64e-7f6915d093cf',
            jsonMetricDefinition: {
              dataSets: [
                {
                  timeSeriesQuery: {
                    timeSeriesFilter: {
                      filter: '',
                      secondaryAggregation: {
                        alignmentPeriod: '60s'
                      },
                      aggregation: {
                        perSeriesAligner: 'ALIGN_MEAN',
                        alignmentPeriod: '60s'
                      }
                    }
                  }
                }
              ]
            },
            metricTags: ['CPU limit utilization [MEAN]'],
            serviceInstanceField: 'test instance',
            isManualQuery: false
          },
          {
            identifier: 'Manual GGCO',
            metricName: 'Manual GGCO',
            riskProfile: {
              category: 'Performance',
              metricType: 'RESP_TIME',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'test ',
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Performance',
                metricType: 'RESP_TIME',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: false
            },
            dashboardName: '',
            dashboardPath: '',
            jsonMetricDefinition: {
              dataSets: [
                {
                  timeSeriesQuery: {
                    timeSeriesFilter: {
                      filter: '',
                      secondaryAggregation: {
                        alignmentPeriod: '60s'
                      },
                      aggregation: {
                        perSeriesAligner: 'ALIGN_MEAN',
                        alignmentPeriod: '60s'
                      }
                    }
                  }
                }
              ]
            },
            metricTags: ['test', 'manual'],
            serviceInstanceField: 'test ',
            isManualQuery: true
          }
        ],
        feature: product,
        product: {
          label: product,
          value: product
        }
      }
    }
  ],
  serviceRef: 'Service_101',
  environmentRef: 'PRENV',
  monitoredServiceRef: {
    name: 'Service_101_PRENV',
    identifier: 'Service_101_PRENV'
  },
  healthSourceName: 'GCO manual + Dashboard',
  healthSourceIdentifier: 'GCO_manual_Dashboard',
  sourceType: 'Stackdriver',
  connectorRef: 'account.gcpchiplay',
  product: {
    label: product,
    value: product
  }
}
