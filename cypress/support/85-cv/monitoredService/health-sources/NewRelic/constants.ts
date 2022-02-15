export const metricPackCall = '/cv/api/metric-pack?*'
export const metricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: 'QDbpj4lhQv-KpUQdxAQx9w',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'Deepesh_CVNG',
      dataSourceType: 'NEW_RELIC',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.error.count`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'SELECT rate(count(apm.service.transaction.duration), 1 minute) FROM Metric',
          validationPath: 'SELECT rate(count(apm.service.duration), 1 minute) FROM Metric',
          responseJsonPath: 'results.[0].result',
          validationResponseJsonPath: 'total.results.[0].result',
          thresholds: [],
          included: true
        },
        {
          name: 'Apdex',
          type: 'APDEX',
          path: 'SELECT apdex(`apm.service.transaction.apdex`) FROM Metric',
          validationPath: 'SELECT apdex(`apm.service.apdex`) FROM Metric',
          responseJsonPath: 'results.[0].score',
          validationResponseJsonPath: 'total.results.[0].score',
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'SELECT average(`apm.service.transaction.duration`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.duration`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

export const applicationCall = '/cv/api/newrelic/applications?*'
export const applicationResponse = {
  status: 'SUCCESS',
  data: [{ applicationName: 'My Application', applicationId: 107019083 }],
  metaData: null,
  correlationId: '9a99314c-862e-4fb8-a22f-93f569c2cec1'
}

export const metricDataCall = '/cv/api/newrelic/metric-data?*'
export const metricDataResponse = {
  status: 'SUCCESS',
  data: {
    metricValidationResponses: [
      { metricName: 'Errors per Minute', value: 0.0, status: 'SUCCESS' },
      { metricName: 'Average Response Time (ms)', value: null, status: 'NO_DATA' },
      { metricName: 'Apdex', value: 0.71, status: 'SUCCESS' },
      { metricName: 'Calls per Minute', value: 0.0, status: 'SUCCESS' }
    ],
    metricPackName: 'Performance',
    overallStatus: 'SUCCESS'
  },
  metaData: null,
  correlationId: '94b95f7c-a7ac-4d24-a04b-7b160121a91d'
}

export const sampleDataCall = '/cv/api/newrelic/fetch-sample-data?*'
export const sampleDataResponse = {
  status: 'SUCCESS',
  data: {
    total: {
      results: [{ average: 0.05695108273372631 }],
      beginTimeSeconds: 1.6443399e9,
      endTimeSeconds: 1.6443417e9,
      inspectedCount: 60.0
    },
    timeSeries: [
      {
        results: [{ average: 0.054782525154009255 }],
        beginTimeSeconds: 1.6443399e9,
        endTimeSeconds: 1.64433996e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.06009513289840133 }],
        beginTimeSeconds: 1.64433996e9,
        endTimeSeconds: 1.64434002e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05675376029241653 }],
        beginTimeSeconds: 1.64434002e9,
        endTimeSeconds: 1.64434008e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.06136552118528583 }],
        beginTimeSeconds: 1.64434008e9,
        endTimeSeconds: 1.64434014e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.061249303605191596 }],
        beginTimeSeconds: 1.64434014e9,
        endTimeSeconds: 1.6443402e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05430210700401893 }],
        beginTimeSeconds: 1.6443402e9,
        endTimeSeconds: 1.64434026e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.0601213770764464 }],
        beginTimeSeconds: 1.64434026e9,
        endTimeSeconds: 1.64434032e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05930295578046651 }],
        beginTimeSeconds: 1.64434032e9,
        endTimeSeconds: 1.64434038e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05239982392462515 }],
        beginTimeSeconds: 1.64434038e9,
        endTimeSeconds: 1.64434044e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05642612040543757 }],
        beginTimeSeconds: 1.64434044e9,
        endTimeSeconds: 1.6443405e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05957349049562664 }],
        beginTimeSeconds: 1.6443405e9,
        endTimeSeconds: 1.64434056e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.0550195525674259 }],
        beginTimeSeconds: 1.64434056e9,
        endTimeSeconds: 1.64434062e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.06530883745089044 }],
        beginTimeSeconds: 1.64434062e9,
        endTimeSeconds: 1.64434068e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05635175787406284 }],
        beginTimeSeconds: 1.64434068e9,
        endTimeSeconds: 1.64434074e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05669484290600484 }],
        beginTimeSeconds: 1.64434074e9,
        endTimeSeconds: 1.6443408e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.056504122689046574 }],
        beginTimeSeconds: 1.6443408e9,
        endTimeSeconds: 1.64434086e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.054640709025367405 }],
        beginTimeSeconds: 1.64434086e9,
        endTimeSeconds: 1.64434092e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05443241341349559 }],
        beginTimeSeconds: 1.64434092e9,
        endTimeSeconds: 1.64434098e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.056036397770794444 }],
        beginTimeSeconds: 1.64434098e9,
        endTimeSeconds: 1.64434104e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05885828950979414 }],
        beginTimeSeconds: 1.64434104e9,
        endTimeSeconds: 1.6443411e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05493481483685195 }],
        beginTimeSeconds: 1.6443411e9,
        endTimeSeconds: 1.64434116e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05818038940429687 }],
        beginTimeSeconds: 1.64434116e9,
        endTimeSeconds: 1.64434122e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.054361721985322194 }],
        beginTimeSeconds: 1.64434122e9,
        endTimeSeconds: 1.64434128e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05122990788940786 }],
        beginTimeSeconds: 1.64434128e9,
        endTimeSeconds: 1.64434134e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05089217160655334 }],
        beginTimeSeconds: 1.64434134e9,
        endTimeSeconds: 1.6443414e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05506327357227446 }],
        beginTimeSeconds: 1.6443414e9,
        endTimeSeconds: 1.64434146e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.06317621995674719 }],
        beginTimeSeconds: 1.64434146e9,
        endTimeSeconds: 1.64434152e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.05437240326147285 }],
        beginTimeSeconds: 1.64434152e9,
        endTimeSeconds: 1.64434158e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.0588234117027319 }],
        beginTimeSeconds: 1.64434158e9,
        endTimeSeconds: 1.64434164e9,
        inspectedCount: 2.0
      },
      {
        results: [{ average: 0.057325664175463205 }],
        beginTimeSeconds: 1.64434164e9,
        endTimeSeconds: 1.6443417e9,
        inspectedCount: 2.0
      }
    ],
    performanceStats: {
      inspectedCount: 60.0,
      omittedCount: 0.0,
      matchCount: 60.0,
      wallClockTime: 64.0,
      matchedFromFileRead: 0.0,
      matchedViaCache: 0.0
    },
    metadata: {
      accounts: [1805869.0],
      eventTypes: ['Metric'],
      eventType: 'Metric',
      timeAggregations: ['raw metrics'],
      openEnded: false,
      beginTime: '2022-02-08T17:05:00Z',
      endTime: '2022-02-08T17:35:00Z',
      beginTimeMillis: 1.6443399e12,
      endTimeMillis: 1.6443417e12,
      rawSince: '1644339900000',
      rawUntil: '1644341700000',
      rawCompareWith: '',
      bucketSizeMillis: 60000.0,
      guid: '37a447ed-ccbb-9bef-4ea7-e1377ab87990',
      routerGuid: '37a447ed-ccbb-9bef-4ea7-e1377ab87990',
      messages: [],
      timeSeries: {
        messages: [],
        contents: [{ function: 'average', attribute: 'apm.service.transaction.duration', simple: true }]
      }
    }
  },
  metaData: null,
  correlationId: '351ddfd6-5b5c-4f90-822b-d21aba3a2777'
}
