/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { currentProduct, MockParams } from '@cv/components/MetricsDashboardList/tests/mock'

export const DefaultObject = {
  ...MockParams,
  identifier: 'MyGoogleCloudOperationsSource',
  product: currentProduct,
  name: 'MyGoogleCloudOperationsSource',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  type: 'STACKDRIVER',
  mappedServicesAndEnvs: new Map(),
  isEdit: false
}

export const dashBoardResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 9,
    totalItems: 60,
    pageItemCount: 7,
    pageSize: 7,
    content: [
      {
        name: 'Prod-1 Runtime Workflow Related Mongo Metrics',
        path: 'projects/778566137835/dashboards/026f87a1-9b32-4217-925a-03031769dddc'
      },
      {
        name: 'Delegate Perpetual Tasks - freemium',
        path: 'projects/778566137835/dashboards/081fe911-79e9-4d4e-9875-84b35e3f934d'
      },
      {
        name: 'Prod-2 YAML GitSync Mongo Metrics',
        path: 'projects/778566137835/dashboards/0b37f447-b5c0-4987-b5f2-9ec3095e9d80'
      },
      { name: 'Prod-GCLB', path: 'projects/778566137835/dashboards/10247206022176009448' },
      { name: 'Pod Traffic', path: 'projects/778566137835/dashboards/10875456449297139182' },
      { name: 'Load Balancer', path: 'projects/778566137835/dashboards/11252253440084069447' },
      { name: 'FF Overview Prod 1', path: 'projects/778566137835/dashboards/1248f32e-6d64-45b7-8355-62bd14316242' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '2bfd678a-4341-4a6b-8e58-6e8811015aa9'
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      type: 'Stackdriver',
      identifier: 'CVNG4073',
      name: 'CVNG-4073',
      spec: {
        connectorRef: 'account.GCPProd',
        feature: 'Cloud Metrics',
        metricDefinitions: [
          {
            dashboardName: 'Pod Traffic',
            dashboardPath: 'projects/778566137835/dashboards/10875456449297139182',
            metricName: 'logging.googleapis.com/user/metric_traffic_to_pods_prod_1',
            metricTags: ['Prod-1 traffic to pods'],
            identifier: 'logging.googleapis.com/user/metric_traffic_to_pods_prod_1',
            isManualQuery: false,
            jsonMetricDefinition: {
              dataSets: [
                {
                  timeSeriesQuery: {
                    timeSeriesFilter: {
                      filter: 'metric.type=\\"logging.googleapis.com/user/metric_traffic_to_pods_prod_1\\"',
                      aggregation: {
                        perSeriesAligner: 'ALIGN_RATE',
                        crossSeriesReducer: 'REDUCE_SUM',
                        groupByFields: ['metric.label.\\""upstream_address\\""']
                      }
                    }
                  }
                }
              ]
            },
            riskProfile: {
              metricType: 'null',
              category: 'Errors',
              thresholdTypes: []
            },
            sli: {
              enabled: true
            },
            serviceInstanceField: null,
            analysis: {
              riskProfile: {
                category: 'Errors',
                metricType: 'null',
                thresholdTypes: []
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: false
              }
            }
          }
        ],
        product: {
          label: 'Cloud Metrics',
          value: 'Cloud Metrics'
        }
      }
    },
    {
      name: 'NewRelic Health Source',
      identifier: 'NewRelic_Health_Source',
      type: 'NewRelic',
      spec: {
        connectorRef: 'account.NewRelic123Test',
        applicationName: 'My Application',
        applicationId: '107019083',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance'
          }
        ],
        newRelicMetricDefinitions: []
      }
    },
    {
      name: 'AppD',
      identifier: 'dadadass',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'account.appdtest',
        feature: 'Application Monitoring',
        applicationName: 'Harness-CI-Manager',
        tierName: 'manager',
        metricPacks: [
          {
            identifier: 'Performance'
          },
          {
            identifier: 'Errors'
          }
        ],
        metricDefinitions: [
          {
            identifier: 'appdMetric_101',
            metricName: 'appdMetric 101',
            riskProfile: {
              category: 'Errors',
              metricType: null,
              thresholdTypes: []
            },
            analysis: {
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Errors',
                metricType: null,
                thresholdTypes: []
              }
            },
            sli: {
              enabled: true
            },
            groupName: 'Group 1',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Exceptions per Minute'
          },
          {
            identifier: 'appdMetric_10',
            metricName: 'appdMetric 10',
            riskProfile: {
              category: 'Errors',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: true
              },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Errors',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: true
            },
            groupName: 'Group 2',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Errors per Minute'
          }
        ]
      }
    }
  ],
  serviceRef: 'service1',
  environmentRef: 'env1',
  monitoredServiceRef: {
    name: 'service1_env1',
    identifier: 'service1_env1'
  },
  existingMetricDetails: {
    name: 'CVNG-4073',
    identifier: 'CVNG4073',
    type: 'Stackdriver',
    spec: {
      connectorRef: 'account.GCPProd',
      metricDefinitions: [
        {
          identifier: 'logging.googleapis.com/user/metric_traffic_to_pods_prod_1',
          metricName: 'logging.googleapis.com/user/metric_traffic_to_pods_prod_1',
          riskProfile: {
            category: 'Errors',
            metricType: null,
            thresholdTypes: []
          },
          analysis: {
            liveMonitoring: {
              enabled: false
            },
            deploymentVerification: {
              enabled: false,
              serviceInstanceFieldName: null,
              serviceInstanceMetricPath: null
            },
            riskProfile: {
              category: 'Errors',
              metricType: null,
              thresholdTypes: []
            }
          },
          sli: {
            enabled: true
          },
          dashboardName: 'Pod Traffic',
          dashboardPath: 'projects/778566137835/dashboards/10875456449297139182',
          jsonMetricDefinition: {
            dataSets: [
              {
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter: 'metric.type=\\"logging.googleapis.com/user/metric_traffic_to_pods_prod_1\\"',
                    aggregation: {
                      perSeriesAligner: 'ALIGN_RATE',
                      crossSeriesReducer: 'REDUCE_SUM',
                      groupByFields: ['metric.label.\\""upstream_address\\""']
                    }
                  }
                }
              }
            ]
          },
          metricTags: ['Prod-1 traffic to pods'],
          serviceInstanceField: null,
          isManualQuery: false
        }
      ]
    }
  },
  healthSourceName: 'CVNG-4073',
  healthSourceIdentifier: 'CVNG4073',
  sourceType: 'Stackdriver',
  connectorRef: 'account.GCPProd',
  product: {
    label: 'Cloud Metrics',
    value: 'Cloud Metrics'
  }
}
