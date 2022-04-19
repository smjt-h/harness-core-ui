/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const projectIdentifier = 'project1'
const newProjectIdentifier = 'project2'
const orgIdentifier = 'default'
const newOrgIdentifier = 'org2'
const healthSource = 'appd_cvng_prod'
const accountId = 'accountId'

export const getUserJourneysCall = `/cv/api/user-journey?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&offset=0&pageSize=100`
export const getUserJourneysCallForNewerProject = `/cv/api/user-journey?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${newOrgIdentifier}&projectIdentifier=${newProjectIdentifier}&offset=0&pageSize=100`
export const listSLOsCall = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4`
export const listSLOsCallForNewerProject = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${newOrgIdentifier}&projectIdentifier=${newProjectIdentifier}&pageNumber=0&pageSize=4`
export const listSLOsCallWithUserJourneyNewOne = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&userJourneyIdentifiers=newone`
export const listSLOsCallWithUserJourneySecondJourney = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&userJourneyIdentifiers=Second_Journey`
export const listSLOsCallWithCVNGProd = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&monitoredServiceIdentifier=cvng_prod&pageNumber=0&pageSize=4`
export const listSLOsCallWithCVNGDev = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&monitoredServiceIdentifier=cvng_prod&pageNumber=0&pageSize=4`
export const listSLOsCallWithCalender = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&targetTypes=Calender`
export const listSLOsCallWithRolling = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&targetTypes=Rolling`
export const listSLOsCallWithAvailability = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&sliTypes=Availability`
export const listSLOsCallWithLatency = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&sliTypes=Latency`
export const listSLOsCallWithUnhealthy = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&errorBudgetRisks=UNHEALTHY`
export const listSLOsCallWithHealthy = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4&errorBudgetRisks=HEALTHY`
export const listMonitoredServices = `/cv/api/monitored-service/all/time-series-health-sources?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const listMonitoredServicesForNewerProject = `/cv/api/monitored-service/all/time-series-health-sources?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${newOrgIdentifier}&projectIdentifier=${newProjectIdentifier}`
export const getSLOMetrics = `/cv/api/monitored-service/cvng_prod/health-source/${healthSource}/slo-metrics?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSliGraph = `/cv/api/monitored-service/cvng_prod/sli/onboarding-graph?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getServiceLevelObjective = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSLODetails = `/cv/api/slo-dashboard/widget/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getServiceLevelObjectiveForNewerProject = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${newOrgIdentifier}&projectIdentifier=${newProjectIdentifier}`
export const getSLORiskCount = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSLORiskCountForNewerProject = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${newOrgIdentifier}&projectIdentifier=${newProjectIdentifier}`
export const getSLORiskCountWithUserJourneyNewOne = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&userJourneyIdentifiers=newone`
export const getSLORiskCountWithUserJourneySecondJourney = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&userJourneyIdentifiers=Second_Journey`
export const getSLORiskCountWithCVNGProd = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&monitoredServiceIdentifier=cvng_prod`
export const getSLORiskCountWithCVNGDev = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&monitoredServiceIdentifier=cvng_dev`
export const getSLORiskCountWithCalender = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&targetTypes=Calender`
export const getSLORiskCountWithRolling = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&targetTypes=Rolling`
export const getSLORiskCountWithAvailability = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&sliTypes=Availability`
export const getSLORiskCountWithLatency = `/cv/api/slo-dashboard/risk-count?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&sliTypes=Latency`
export const getMonitoredService = `/cv/api/monitored-service/cvng_prod?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const deleteSLOData = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const saveSLO = `/cv/api/slo?routingId=${accountId}&accountId=${accountId}`
export const updateSLO = `/cv/api/slo/SLO1?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const errorBudgetResetHistory = `/cv/api/slo/SLO1/errorBudgetResetHistory?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const resetErrorBudget = `/cv/api/slo/SLO1/resetErrorBudget?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`

export const listSLOsCallResponse = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 4, content: [], pageIndex: 0, empty: false },
  metaData: null,
  correlationId: '6a558a73-53e9-4b5a-9700-cbfcd64e87ad'
}

export const listUserJourneysCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        createdAt: 1641461279691,
        lastModifiedAt: 1641461279691,
        userJourney: { identifier: 'newone', name: 'new-one' }
      },
      {
        createdAt: 1641461279691,
        lastModifiedAt: 1641461279691,
        userJourney: { identifier: 'Second_Journey', name: 'Second Journey' }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '241de3a2-d84a-48fa-8e7b-06d7217e489d'
}

export const listMonitoredServicesCallResponse = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'cvng_prod',
      name: 'cvng_prod',
      healthSources: [
        { name: 'appd_manager', identifier: 'appd_manager' },
        { name: healthSource, identifier: healthSource },
        { name: 'New Relic Health source', identifier: 'New_Relic_Health_source' }
      ]
    },
    {
      identifier: 'cvng_dev',
      name: 'cvng_dev',
      healthSources: [{ name: 'appd_cvng_dev', identifier: 'appd_cvng_dev' }]
    }
  ],
  metaData: null,
  correlationId: 'fe6686a2-cd9e-45e1-bca4-2cc86285eb82'
}

export const listSLOMetricsCallResponse = {
  metaData: {},
  resource: [
    { identifier: 'number_of_slow_calls', metricName: 'number_of_slow_calls' },
    { identifier: 'https_errors_per_min', metricName: 'https_errors_per_min' }
  ],
  responseMessages: []
}

export const listRiskCountDataEmptyResponse = {
  status: 'SUCCESS',
  data: {
    totalCount: 0,
    riskCounts: [
      { count: 0, displayName: 'Exhausted', identifier: 'EXHAUSTED' },
      { count: 0, displayName: 'Unhealthy', identifier: 'UNHEALTHY' },
      { count: 0, displayName: 'Need Attention', identifier: 'NEED_ATTENTION' },
      { count: 0, displayName: 'Observe', identifier: 'OBSERVE' },
      { count: 0, displayName: 'Healthy', identifier: 'HEALTHY' }
    ]
  },
  metaData: null,
  correlationId: 'eaada616-a1d7-4246-9c18-1e25cf9ca6be'
}

export const updatedListSLOsCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 4,
    content: [
      {
        sloIdentifier: 'SLO1',
        title: 'SLO-1',
        monitoredServiceIdentifier: 'cvng_prod',
        monitoredServiceName: 'cvng_prod',
        healthSourceIdentifier: healthSource,
        healthSourceName: healthSource,
        serviceIdentifier: 'cvng',
        environmentIdentifier: 'prod',
        environmentName: 'prod',
        serviceName: 'cvng',
        tags: {},
        type: 'Latency',
        burnRate: {
          currentRatePercentage: 138.44167025398193
        },
        timeRemainingDays: 6,
        errorBudgetRemainingPercentage: 100,
        errorBudgetRemaining: 104,
        totalErrorBudget: 104,
        sloTargetType: 'Rolling',
        currentPeriodLengthDays: 7,
        currentPeriodStartTime: 1641364526709,
        currentPeriodEndTime: 1641450926709,
        sloTargetPercentage: 99,
        errorBudgetBurndown: [
          { timestamp: 1641407726709, value: 100 },
          { timestamp: 1641450926709, value: 100 }
        ],
        sloPerformanceTrend: [
          { timestamp: 1641407726709, value: 100 },
          { timestamp: 1641450926709, value: 100 }
        ],
        errorBudgetRisk: 'HEALTHY',
        recalculatingSLI: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '95d58b07-33b2-4501-8d6c-71bfd140bba1'
}

export const getSLODashboardWidgetsAfterEdit = {
  ...updatedListSLOsCallResponse,
  data: {
    ...updatedListSLOsCallResponse.data,
    content: [
      {
        ...updatedListSLOsCallResponse.data.content[0],
        recalculatingSLI: true
      }
    ]
  }
}

export const sloDashboardWidgetResponseForCalender = {
  ...updatedListSLOsCallResponse,
  data: {
    ...updatedListSLOsCallResponse.data,
    content: [
      {
        ...updatedListSLOsCallResponse.data.content[0],
        sloTargetType: 'Calender'
      }
    ]
  }
}

export const getTwoSLODashboardWidgets = {
  ...updatedListSLOsCallResponse,
  data: {
    ...updatedListSLOsCallResponse.data,
    totalItems: 2,
    pageItemCount: 2,
    content: [
      updatedListSLOsCallResponse.data.content[0],
      {
        ...updatedListSLOsCallResponse.data.content[0],
        sloIdentifier: 'SLO2',
        title: 'SLO-2'
      }
    ]
  }
}

export const getSLORiskCountResponse = {
  status: 'SUCCESS',
  data: {
    totalCount: 1,
    riskCounts: [
      {
        count: 1,
        displayName: 'Healthy',
        identifier: 'HEALTHY'
      },
      {
        count: 0,
        displayName: 'Observe',
        identifier: 'OBSERVE'
      },
      {
        count: 0,
        displayName: 'Need Attention',
        identifier: 'NEED_ATTENTION'
      },
      {
        count: 0,
        displayName: 'Unhealthy',
        identifier: 'UNHEALTHY'
      },
      {
        count: 0,
        displayName: 'Exhausted',
        identifier: 'EXHAUSTED'
      }
    ]
  }
}

export const getTwoSLOsRiskCountResponse = {
  status: 'SUCCESS',
  data: {
    totalCount: 2,
    riskCounts: [
      {
        count: 2,
        displayName: 'Healthy',
        identifier: 'HEALTHY'
      },
      {
        count: 0,
        displayName: 'Observe',
        identifier: 'OBSERVE'
      },
      {
        count: 0,
        displayName: 'Need Attention',
        identifier: 'NEED_ATTENTION'
      },
      {
        count: 0,
        displayName: 'Unhealthy',
        identifier: 'UNHEALTHY'
      },
      {
        count: 0,
        displayName: 'Exhausted',
        identifier: 'EXHAUSTED'
      }
    ]
  }
}

export const getServiceLevelObjectiveResponse = {
  status: 'SUCCESS',
  resource: {
    serviceLevelObjective: {
      name: 'SLO-1',
      identifier: 'SLO1',
      tags: {},
      userJourneyRef: 'newone',
      monitoredServiceRef: 'cvng_prod',
      healthSourceRef: healthSource,
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      serviceLevelIndicators: [
        {
          type: 'Latency',
          sliMissingDataType: 'Good',
          spec: {
            type: 'Ratio',
            spec: {
              eventType: 'Good',
              metric1: 'https_errors_per_min',
              metric2: 'number_of_slow_calls',
              thresholdValue: 20,
              thresholdType: '<='
            }
          }
        }
      ],
      target: { type: 'Rolling', sloTargetPercentage: 90, spec: { periodLength: '30d', spec: {} } }
    }
  }
}

export const getServiceLevelObjectiveResponseForNewerProject = {
  status: 'SUCCESS',
  resource: {
    serviceLevelObjective: {
      name: 'SLO-1',
      identifier: 'SLO1',
      tags: {},
      userJourneyRef: 'newone',
      monitoredServiceRef: 'cvng_prod',
      healthSourceRef: healthSource,
      orgIdentifier: newOrgIdentifier,
      projectIdentifier: newProjectIdentifier,
      serviceLevelIndicators: [
        {
          type: 'Latency',
          sliMissingDataType: 'Good',
          spec: {
            type: 'Ratio',
            spec: {
              eventType: 'Good',
              metric1: 'https_errors_per_min',
              metric2: 'number_of_slow_calls',
              thresholdValue: 20,
              thresholdType: '<='
            }
          }
        }
      ],
      target: { type: 'Rolling', sloTargetPercentage: 90, spec: { periodLength: '30d', spec: {} } }
    }
  }
}

export const getMonitoredServiceResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1625571657044,
    lastModifiedAt: 1625627957333,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      identifier: 'cvng_prod',
      name: 'cvng_prod',
      type: 'Application',
      serviceRef: 'cvng',
      environmentRef: 'prod',
      sources: {
        healthSources: [
          {
            name: healthSource,
            identifier: healthSource,
            type: 'AppDynamics',
            spec: {
              connectorRef: 'AppD_Connector_102',
              feature: 'Application Monitoring',
              appdApplicationName: '700712',
              appdTierName: '1181911',
              metricPacks: [
                {
                  identifier: 'Errors'
                }
              ]
            }
          }
        ]
      }
    }
  }
}

export const errorResponse = {
  statusCode: 404,
  body: {
    status: 'ERROR',
    code: 'UNKNOWN_ERROR',
    message: 'Oops, something went wrong on our end. Please contact Harness Support.',
    correlationId: 'ca0bf961-8c50-4967-97fb-fd69f6ca8072',
    metadata: null
  }
}

export const errorResponseSLODuplication = {
  statusCode: 404,
  body: {
    status: 'ERROR',
    code: 'UNKNOWN_ERROR',
    message: 'SLO with identifier SLO1 is already exist.',
    correlationId: 'ca0bf961-8c50-4967-97fb-fd69f6ca8072',
    metadata: null
  }
}

export const errorBudgetResetHistoryResponse = {
  resource: [
    {
      errorBudgetAtReset: 75,
      remainingErrorBudgetAtReset: 60,
      errorBudgetIncrementPercentage: 50,
      createdAt: 1643328000000,
      reason: 'REASON'
    },
    {
      errorBudgetAtReset: 50,
      remainingErrorBudgetAtReset: 60,
      errorBudgetIncrementPercentage: 50,
      createdAt: 1643241600000,
      reason: 'REASON'
    }
  ]
}

export const responseSLODashboardDetail = {
  status: 'SUCCESS',
  data: {
    sloDashboardWidget: updatedListSLOsCallResponse.data.content[0],
    description: '99.9 percent of logins should have <= 50ms latency'
  },
  metaData: undefined,
  correlationId: '0c955a4d-29a2-42ff-90b3-2c629dffac84'
}
