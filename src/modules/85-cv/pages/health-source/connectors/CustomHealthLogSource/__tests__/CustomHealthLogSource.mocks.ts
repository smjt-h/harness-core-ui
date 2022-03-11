/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CustomHealthLogSetupSource } from '../CustomHealthLogSource.types'

export const customHealthLogSetupSource: CustomHealthLogSetupSource = {
  timestampJsonPath: '$[*].metric.timestamp',
  queryValueJsonPath: '$[*].metric.logMessage',
  queryName: 'query1',
  requestMethod: 'GET',
  startTime: {
    placeholder: 'startTime',
    timestampFormat: 'SECONDS'
  },
  endTime: {
    placeholder: 'endTime',
    timestampFormat: 'SECONDS'
  },
  serviceInstanceJsonPath: '$[0].*',
  pathURL: 'http://appd.com?start-time=startTime&end-time=endTime'
}

export const setupSource: CustomHealthLogSetupSource[] = [
  {
    queryName: 'customLog',
    query: '',
    requestMethod: 'GET',
    queryValueJsonPath: '$.[*].metricValues.[*].current',
    serviceInstanceJsonPath: '$.[*].metricName',
    timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
    startTime: { placeholder: 'startTime', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    endTime: { placeholder: 'endTime', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    pathURL:
      'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json'
  },
  {
    queryName: 'customLog5',
    query: '',
    requestMethod: 'GET',
    queryValueJsonPath: '$.[*].metricValues.[*].value',
    serviceInstanceJsonPath: '$.[*].metricName',
    timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
    startTime: { placeholder: 'start___time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    endTime: { placeholder: 'end___time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    pathURL:
      'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json'
  },
  {
    queryName: 'customLog_2',
    query: '',
    requestMethod: 'GET',
    queryValueJsonPath: '$.[*].metricValues.[*].value',
    serviceInstanceJsonPath: '$.[*].metricName',
    timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
    startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
    pathURL:
      'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json'
  }
]

export const setupSourceToHealthSourceMock = {
  identifier: 'customLog',
  name: 'customAppd',
  spec: {
    connectorRef: 'account.appd',
    logDefinitions: [
      {
        logMessageJsonPath: '$.[*].metricValues.[*].current',
        queryName: 'customLog',
        requestDefinition: {
          endTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'endTime',
            timestampFormat: 'MILLISECONDS'
          },
          method: 'GET',
          requestBody: '',
          startTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'startTime',
            timestampFormat: 'MILLISECONDS'
          },
          urlPath:
            'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json'
        },
        serviceInstanceJsonPath: '$.[*].metricName',
        timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
      },
      {
        logMessageJsonPath: '$.[*].metricValues.[*].value',
        queryName: 'customLog5',
        requestDefinition: {
          endTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'end___time',
            timestampFormat: 'MILLISECONDS'
          },
          method: 'GET',
          requestBody: '',
          startTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'start___time',
            timestampFormat: 'MILLISECONDS'
          },
          urlPath:
            'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json'
        },
        serviceInstanceJsonPath: '$.[*].metricName',
        timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
      },
      {
        logMessageJsonPath: '$.[*].metricValues.[*].value',
        queryName: 'customLog_2',
        requestDefinition: {
          endTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'end_time',
            timestampFormat: 'MILLISECONDS'
          },
          method: 'GET',
          requestBody: '',
          startTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'start_time',
            timestampFormat: 'MILLISECONDS'
          },
          urlPath:
            'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json'
        },
        serviceInstanceJsonPath: '$.[*].metricName',
        timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
      }
    ]
  },
  type: 'CustomHealthLog'
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'customLog',
      identifier: 'customLog',
      type: 'CustomHealthLog',
      spec: {
        connectorRef: 'customAppd5',
        logDefinitions: [
          {
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json',
              requestBody: null,
              method: 'GET',
              startTimeInfo: { placeholder: 'startTime', timestampFormat: 'MILLISECONDS', customTimestampFormat: null },
              endTimeInfo: { placeholder: 'endTime', timestampFormat: 'MILLISECONDS', customTimestampFormat: null }
            },
            logMessageJsonPath: '$.[*].metricValues.[*].current',
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
            serviceInstanceJsonPath: '$.[*].metricName',
            queryName: 'customLog'
          },
          {
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json',
              requestBody: null,
              method: 'GET',
              startTimeInfo: {
                placeholder: 'start___time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: null
              },
              endTimeInfo: { placeholder: 'end___time', timestampFormat: 'MILLISECONDS', customTimestampFormat: null }
            },
            logMessageJsonPath: '$.[*].metricValues.[*].value',
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
            serviceInstanceJsonPath: '$.[*].metricName',
            queryName: 'customLog5'
          },
          {
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
              requestBody: null,
              method: 'GET',
              startTimeInfo: {
                placeholder: 'start_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: null
              },
              endTimeInfo: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: null }
            },
            logMessageJsonPath: '$.[*].metricValues.[*].value',
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis',
            serviceInstanceJsonPath: '$.[*].metricName',
            queryName: 'customLog_2'
          }
        ]
      }
    }
  ],
  serviceRef: 'delegate',
  environmentRef: 'prod',
  monitoredServiceRef: { name: 'delegate_prod', identifier: 'delegate_prod' },
  existingMetricDetails: {},
  healthSourceName: 'customLog',
  healthSourceIdentifier: 'customLog',
  sourceType: 'CustomHealth',
  connectorRef: 'customAppd5',
  product: { label: 'Custom Health Log', value: 'logs' }
}

export const mappedQueries = new Map([
  [
    'customLog',
    {
      baseURL: 'https://harness-test.saas.appdynamics.com/controller/',
      endTime: {
        customTimestampFormat: null,
        placeholder: 'endTime',
        timestampFormat: 'MILLISECONDS'
      },
      pathURL:
        'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json',
      query: null,
      queryName: 'customLog',
      queryValueJsonPath: '$.[*].metricValues.[*].current',
      requestMethod: 'GET',
      serviceInstanceJsonPath: '$.[*].metricName',
      startTime: {
        customTimestampFormat: null,
        placeholder: 'startTime',
        timestampFormat: 'MILLISECONDS'
      },
      timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
    }
  ],
  [
    'customLog5',
    {
      endTime: {
        customTimestampFormat: null,
        placeholder: 'end___time',
        timestampFormat: 'MILLISECONDS'
      },
      pathURL:
        'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json',
      query: null,
      queryName: 'customLog5',
      queryValueJsonPath: '$.[*].metricValues.[*].value',
      requestMethod: 'GET',
      serviceInstanceJsonPath: '$.[*].metricName',
      startTime: {
        customTimestampFormat: null,
        placeholder: 'start___time',
        timestampFormat: 'MILLISECONDS'
      },
      timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
    }
  ],
  [
    'customLog_2',
    {
      endTime: {
        customTimestampFormat: null,
        placeholder: 'end_time',
        timestampFormat: 'MILLISECONDS'
      },
      pathURL:
        'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
      query: null,
      queryName: 'customLog_2',
      queryValueJsonPath: '$.[*].metricValues.[*].value',
      requestMethod: 'GET',
      serviceInstanceJsonPath: '$.[*].metricName',
      startTime: {
        customTimestampFormat: null,
        placeholder: 'start_time',
        timestampFormat: 'MILLISECONDS'
      },
      timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
    }
  ]
])

export const onSubmitMock = [
  {
    connectorRef: 'customAppd5',
    environmentRef: 'prod',
    existingMetricDetails: {},
    healthSourceIdentifier: 'customLog',
    healthSourceList: [
      {
        identifier: 'customLog',
        name: 'customLog',
        spec: {
          connectorRef: 'customAppd5',
          logDefinitions: [
            {
              logMessageJsonPath: '$.[*].metricValues.[*].current',
              queryName: 'customLog',
              requestDefinition: {
                endTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'endTime',
                  timestampFormat: 'MILLISECONDS'
                },
                method: 'GET',
                requestBody: null,
                startTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'startTime',
                  timestampFormat: 'MILLISECONDS'
                },
                urlPath:
                  'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json'
              },
              serviceInstanceJsonPath: '$.[*].metricName',
              timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
            },
            {
              logMessageJsonPath: '$.[*].metricValues.[*].value',
              queryName: 'customLog5',
              requestDefinition: {
                endTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'end___time',
                  timestampFormat: 'MILLISECONDS'
                },
                method: 'GET',
                requestBody: null,
                startTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'start___time',
                  timestampFormat: 'MILLISECONDS'
                },
                urlPath:
                  'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json'
              },
              serviceInstanceJsonPath: '$.[*].metricName',
              timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
            },
            {
              logMessageJsonPath: '$.[*].metricValues.[*].value',
              queryName: 'customLog_2',
              requestDefinition: {
                endTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'end_time',
                  timestampFormat: 'MILLISECONDS'
                },
                method: 'GET',
                requestBody: null,
                startTimeInfo: {
                  customTimestampFormat: null,
                  placeholder: 'start_time',
                  timestampFormat: 'MILLISECONDS'
                },
                urlPath:
                  'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json'
              },
              serviceInstanceJsonPath: '$.[*].metricName',
              timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
            }
          ]
        },
        type: 'CustomHealthLog'
      }
    ],
    healthSourceName: 'customLog',
    isEdit: true,
    monitoredServiceRef: {
      identifier: 'delegate_prod',
      name: 'delegate_prod'
    },
    product: {
      label: 'Custom Health Log',
      value: 'logs'
    },
    serviceRef: 'delegate',
    sourceType: 'CustomHealth'
  },
  {
    identifier: 'customLog',
    name: 'customLog',
    spec: {
      connectorRef: 'customAppd5',
      logDefinitions: [
        {
          logMessageJsonPath: '$.[*].metricValues.[*].current',
          queryName: 'customLog',
          requestDefinition: {
            endTimeInfo: { customTimestampFormat: null, placeholder: 'endTime', timestampFormat: 'MILLISECONDS' },
            method: 'GET',
            requestBody: null,
            startTimeInfo: { customTimestampFormat: null, placeholder: 'startTime', timestampFormat: 'MILLISECONDS' },
            urlPath:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json'
          },
          serviceInstanceJsonPath: '$.[*].metricName',
          timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
        },
        {
          logMessageJsonPath: '$.[*].metricValues.[*].value',
          queryName: 'customLog5',
          requestDefinition: {
            endTimeInfo: { customTimestampFormat: null, placeholder: 'end___time', timestampFormat: 'MILLISECONDS' },
            method: 'GET',
            requestBody: null,
            startTimeInfo: {
              customTimestampFormat: null,
              placeholder: 'start___time',
              timestampFormat: 'MILLISECONDS'
            },
            urlPath:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json'
          },
          serviceInstanceJsonPath: '$.[*].metricName',
          timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
        },
        {
          logMessageJsonPath: '$.[*].metricValues.[*].value',
          queryName: 'customLog_2',
          requestDefinition: {
            endTimeInfo: { customTimestampFormat: null, placeholder: 'end_time', timestampFormat: 'MILLISECONDS' },
            method: 'GET',
            requestBody: null,
            startTimeInfo: { customTimestampFormat: null, placeholder: 'start_time', timestampFormat: 'MILLISECONDS' },
            urlPath:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json'
          },
          serviceInstanceJsonPath: '$.[*].metricName',
          timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
        }
      ]
    },
    type: 'CustomHealthLog'
  }
]
