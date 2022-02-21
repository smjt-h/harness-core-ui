/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'
import type { DeploymentMetricsAnalysisRowProps } from '../DeploymentMetricsAnalysisRow'

export const InputData: DeploymentMetricsAnalysisRowProps[] = [
  {
    controlData: [
      [
        { x: 1623184440000, y: 2.6666666666666665 },
        { x: 1623184568571, y: 3 },
        { x: 1623184697142, y: 3 },
        { x: 1623184825713, y: 2.6666666666666665 },
        { x: 1623184954284, y: 3 }
      ],
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.UNHEALTHY,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.HEALTHY,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.NEED_ATTENTION,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.OBSERVE,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.HEALTHY,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      },
      {
        points: [
          { x: 1623184440000, y: 144.66666666666666 },
          { x: 1623184568571, y: 171.33333333333334 },
          { x: 1623184697142, y: 171.33333333333334 },
          { x: 1623184825713, y: 172 },
          { x: 1623184954284, y: 170.66666666666666 }
        ],
        risk: RiskValues.NEED_ATTENTION,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'Internal Server Error : 500',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 4.666666666666667 },
          { x: 1623185340000, y: 6 },
          { x: 1623186240000, y: 6 },
          { x: 1623187140000, y: 6 },
          { x: 1623188040000, y: 5.333333333333333 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'ConcurrentModificationException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 2.6666666666666665 },
          { x: 1623185340000, y: 3 },
          { x: 1623186240000, y: 3 },
          { x: 1623187140000, y: 3 },
          { x: 1623188040000, y: 2.6666666666666665 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'RuntimeException : FileSystemException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 2.6666666666666665 },
          { x: 1623185340000, y: 3.3333333333333335 },
          { x: 1623186240000, y: 3.3333333333333335 },
          { x: 1623187140000, y: 3.6666666666666665 },
          { x: 1623188040000, y: 3.6666666666666665 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'SocketTimeoutException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 2.6666666666666665 },
          { x: 1623185340000, y: 3 },
          { x: 1623186240000, y: 3 },
          { x: 1623187140000, y: 2.6666666666666665 },
          { x: 1623188040000, y: 3 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'RuntimeException : FileNotFoundException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 1.6666666666666667 },
          { x: 1623185340000, y: 1 },
          { x: 1623186240000, y: 1 },
          { x: 1623187140000, y: 1 },
          { x: 1623188040000, y: 1 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: '/todolist/requestLogin',
    metricName: 'Average Response Time (ms)',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 2.6666666666666665 },
          { x: 1623185340000, y: 3 },
          { x: 1623186240000, y: 2.6666666666666665 },
          { x: 1623187140000, y: 3 },
          { x: 1623188040000, y: 3 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'RuntimeException : IOException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 138.33333333333334 },
          { x: 1623185340000, y: 148 },
          { x: 1623186240000, y: 152.33333333333334 },
          { x: 1623187140000, y: 145.66666666666666 },
          { x: 1623188040000, y: 152.66666666666666 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: '/todolist/inside',
    metricName: 'Calls per Minute',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 2.3333333333333335 },
          { x: 1623185340000, y: 3 },
          { x: 1623186240000, y: 3 },
          { x: 1623187140000, y: 3 },
          { x: 1623188040000, y: 3 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: 'RuntimeException : InterruptedException',
    metricName: 'Number of Errors',
    healthSourceType: 'APP_DYNAMICS'
  },
  {
    controlData: [[]],
    testData: [
      {
        points: [
          { x: 1623184440000, y: 0 },
          { x: 1623185340000, y: 0 },
          { x: 1623186240000, y: 0 },
          { x: 1623187140000, y: 0 },
          { x: 1623188040000, y: 0 }
        ],
        risk: RiskValues.NO_DATA,
        name: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx'
      }
    ],
    transactionName: '/todolist/inside',
    metricName: 'Stall Count',
    healthSourceType: 'APP_DYNAMICS'
  }
]

const data1 = [
  { x: 1642941960000, y: 1000.9333333333334 },
  { x: 1642942020000, y: 805.1999999999999 },
  { x: 1642942080000, y: 879.7999999999998 },
  { x: 1642942140000, y: 864.098 }
]

const testData = [
  { x: 1642941960000, y: 456.6666666666667 },
  { x: 1642942020000, y: 386.6666666666667 },
  { x: 1642942080000, y: 466.6666666666667 },
  { x: 1642942140000, y: 702 }
]

export const seriesMock = [
  {
    type: 'spline',
    data: data1,
    color: 'var(--primary-7)',
    name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
    connectNulls: true,
    marker: { enabled: true, lineWidth: 1, symbol: 'circle', fillColor: 'var(--white)', lineColor: 'var(--primary-7)' },
    lineWidth: 1,
    dashStyle: 'Dash',
    baseData: data1,
    actualTestData: {
      points: testData,
      risk: 'HEALTHY',
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
    }
  },
  {
    type: 'spline',
    data: testData,
    color: 'var(--green-500)',
    name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
    connectNulls: true,
    marker: { enabled: true, lineWidth: 1, symbol: 'circle', fillColor: 'var(--white)', lineColor: 'var(--green-500)' },
    lineWidth: 1,
    baseData: data1,
    actualTestData: {
      points: testData,
      risk: 'HEALTHY',
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
    }
  }
]

export const testDataMock = {
  points: [
    { x: 1642941960000, y: 456.6666666666667 },
    { x: 1642942020000, y: 386.6666666666667 },
    { x: 1642942080000, y: 466.6666666666667 },
    { x: 1642942140000, y: 702 }
  ],
  risk: 'HEALTHY',
  name: 'harness-deployment-canary-56b5cc7c5b-9rpq7'
}

export const expectedChartConfigData = {
  chart: { height: 120, type: 'spline', width: 312.5806451612903 },
  credits: undefined,
  legend: { enabled: false },
  plotOptions: { series: { lineWidth: 3, stickyTracking: false, turboThreshold: 50000 } },
  series: [
    {
      actualTestData: {
        name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
        points: testData,
        risk: 'HEALTHY'
      },
      baseData: data1,
      color: 'var(--primary-7)',
      connectNulls: true,
      dashStyle: 'Dash',
      data: data1,
      lineWidth: 1,
      marker: {
        enabled: true,
        fillColor: 'var(--white)',
        lineColor: 'var(--primary-7)',
        lineWidth: 1,
        symbol: 'circle'
      },
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
      type: 'spline'
    },
    {
      actualTestData: {
        name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
        points: testData,
        risk: 'HEALTHY'
      },
      baseData: data1,
      color: 'var(--green-500)',
      connectNulls: true,
      data: testData,
      lineWidth: 1,
      marker: {
        enabled: true,
        fillColor: 'var(--white)',
        lineColor: 'var(--green-500)',
        lineWidth: 1,
        symbol: 'circle'
      },
      name: 'harness-deployment-canary-56b5cc7c5b-9rpq7',
      type: 'spline'
    }
  ],
  subtitle: undefined,
  title: { text: '' },
  tooltip: { formatter: expect.any(Function), outside: true },
  xAxis: {
    labels: { enabled: false },
    tickLength: 0,
    title: { align: 'low', text: 'harness-deployment-canary-56b5cc7c5b-9rpq7' }
  },
  yAxis: { gridLineWidth: 0, labels: { enabled: false }, title: { text: '' } }
}
