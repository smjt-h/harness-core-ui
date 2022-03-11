export const service = {
  call: '/cv/api/dynatrace/services?*',
  response: {
    status: 'SUCCESS',
    data: [
      {
        displayName: "Makarovski's Awesome TODO List (/todolist)",
        entityId: 'SERVICE-32128E0279635780',
        serviceMethodIds: ['SERVICE_METHOD-9BAAEEE713315984']
      },
      {
        displayName: 'HealthResource',
        entityId: 'SERVICE-9765BB6389C1E5CB',
        serviceMethodIds: ['SERVICE_METHOD-1E6D9CB42D21E640']
      },
      {
        displayName: "Makarovski's Awesome TODO List (/todolist)",
        entityId: 'SERVICE-BE9F436667EBF701',
        serviceMethodIds: ['SERVICE_METHOD-78DFA31128034B57', 'SERVICE_METHOD-7F192498DA20ADA7']
      },
      {
        displayName: ':4444',
        entityId: 'SERVICE-D739201C4CBBA618',
        serviceMethodIds: ['SERVICE_METHOD-F3988BEE84FF7388']
      }
    ],
    metaData: null,
    correlationId: 'd54afc7a-7cd8-4e14-9304-519e2e0a5cd6'
  }
}

export const metricPack = {
  call: '/cv/api/metric-pack?*',
  response: {
    metaData: {},
    resource: [
      {
        uuid: 'AZsU9qYUQJS8Ju67byKQ_w',
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'SRM_Sanity',
        dataSourceType: 'DYNATRACE',
        identifier: 'Infrastructure',
        category: 'Infrastructure',
        metrics: [
          {
            name: 'CPU per request',
            type: 'INFRA',
            path: 'builtin:service.keyRequest.cpu.perRequest',
            validationPath: 'builtin:service.keyRequest.cpu.perRequest',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          },
          {
            name: 'Time spent in DB calls',
            type: 'INFRA',
            path: 'builtin:service.keyRequest.dbChildCallTime',
            validationPath: 'builtin:service.keyRequest.keyRequest.dbChildCallTime',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          },
          {
            name: 'IO time',
            type: 'INFRA',
            path: 'builtin:service.keyRequest.ioTime',
            validationPath: 'builtin:service.keyRequest.ioTime',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          }
        ],
        thresholds: null
      },
      {
        uuid: '2uZLrkr_TsCTMeR2oJ99eg',
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'SRM_Sanity',
        dataSourceType: 'DYNATRACE',
        identifier: 'Performance',
        category: 'Performance',
        metrics: [
          {
            name: 'Request Count total',
            type: 'THROUGHPUT',
            path: 'builtin:service.keyRequest.count.total',
            validationPath: 'builtin:service.keyRequest.count.total',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          },
          {
            name: 'Number of server side errors',
            type: 'ERROR',
            path: 'builtin:service.keyRequest.errors.server.count',
            validationPath: 'builtin:service.keyRequest.errors.server.count',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          },
          {
            name: 'Method Response time',
            type: 'RESP_TIME',
            path: 'builtin:service.keyRequest.response.time',
            validationPath: 'builtin:service.keyRequest.response.time',
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: true
          }
        ],
        thresholds: null
      }
    ],
    responseMessages: []
  }
}

export const queries = {
  call: '/cv/api/dynatrace/metrics?*',
  response: {
    status: 'SUCCESS',
    data: [
      { displayName: 'CPU time', metricId: 'builtin:service.cpu.perRequest', unit: 'MicroSecond' },
      { displayName: 'Service CPU time', metricId: 'builtin:service.cpu.time', unit: 'MicroSecond' },
      { displayName: 'Failed connections', metricId: 'builtin:service.dbconnections.failure', unit: 'Count' },
      {
        displayName: 'Connection failure rate',
        metricId: 'builtin:service.dbconnections.failureRate',
        unit: 'Percent'
      },
      { displayName: 'Successful connections', metricId: 'builtin:service.dbconnections.success', unit: 'Count' },
      {
        displayName: 'Connection success rate',
        metricId: 'builtin:service.dbconnections.successRate',
        unit: 'Percent'
      },
      { displayName: 'Total number of connections', metricId: 'builtin:service.dbconnections.total', unit: 'Count' },
      { displayName: 'Number of client side errors', metricId: 'builtin:service.errors.client.count', unit: 'Count' },
      {
        displayName: 'Failure rate (client side  errors)',
        metricId: 'builtin:service.errors.client.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  client side errors',
        metricId: 'builtin:service.errors.client.successCount',
        unit: 'Count'
      },
      { displayName: 'Number of HTTP 5xx errors', metricId: 'builtin:service.errors.fivexx.count', unit: 'Count' },
      {
        displayName: 'Failure rate (HTTP 5xx  errors)',
        metricId: 'builtin:service.errors.fivexx.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  HTTP 5xx errors',
        metricId: 'builtin:service.errors.fivexx.successCount',
        unit: 'Count'
      },
      { displayName: 'Number of HTTP 4xx errors', metricId: 'builtin:service.errors.fourxx.count', unit: 'Count' },
      {
        displayName: 'Failure rate (HTTP 4xx  errors)',
        metricId: 'builtin:service.errors.fourxx.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  HTTP 4xx errors',
        metricId: 'builtin:service.errors.fourxx.successCount',
        unit: 'Count'
      },
      { displayName: 'Number of any errors', metricId: 'builtin:service.errors.group.total.count', unit: 'Count' },
      {
        displayName: 'Failure rate (any  errors)',
        metricId: 'builtin:service.errors.group.total.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  any errors',
        metricId: 'builtin:service.errors.group.total.successCount',
        unit: 'Count'
      },
      { displayName: 'Number of server side errors', metricId: 'builtin:service.errors.server.count', unit: 'Count' },
      {
        displayName: 'Failure rate (server side  errors)',
        metricId: 'builtin:service.errors.server.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  server side errors',
        metricId: 'builtin:service.errors.server.successCount',
        unit: 'Count'
      },
      { displayName: 'Number of any errors', metricId: 'builtin:service.errors.total.count', unit: 'Count' },
      { displayName: 'Failure rate (any  errors)', metricId: 'builtin:service.errors.total.rate', unit: 'Percent' },
      {
        displayName: 'Number of calls without  any errors',
        metricId: 'builtin:service.errors.total.successCount',
        unit: 'Count'
      },
      { displayName: 'Request count - client', metricId: 'builtin:service.keyRequest.count.client', unit: 'Count' },
      { displayName: 'Request count - server', metricId: 'builtin:service.keyRequest.count.server', unit: 'Count' },
      { displayName: 'Request count', metricId: 'builtin:service.keyRequest.count.total', unit: 'Count' },
      { displayName: 'CPU per request', metricId: 'builtin:service.keyRequest.cpu.perRequest', unit: 'MicroSecond' },
      { displayName: 'Service method CPU time', metricId: 'builtin:service.keyRequest.cpu.time', unit: 'MicroSecond' },
      {
        displayName: 'Number of client side errors',
        metricId: 'builtin:service.keyRequest.errors.client.count',
        unit: 'Count'
      },
      {
        displayName: 'Failure rate (client side  errors)',
        metricId: 'builtin:service.keyRequest.errors.client.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  client side errors',
        metricId: 'builtin:service.keyRequest.errors.client.successCount',
        unit: 'Count'
      },
      {
        displayName: 'Number of HTTP 5xx errors',
        metricId: 'builtin:service.keyRequest.errors.fivexx.count',
        unit: 'Count'
      },
      {
        displayName: 'Failure rate (HTTP 5xx  errors)',
        metricId: 'builtin:service.keyRequest.errors.fivexx.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  HTTP 5xx errors',
        metricId: 'builtin:service.keyRequest.errors.fivexx.successCount',
        unit: 'Count'
      },
      {
        displayName: 'Number of HTTP 4xx errors',
        metricId: 'builtin:service.keyRequest.errors.fourxx.count',
        unit: 'Count'
      },
      {
        displayName: 'Failure rate (HTTP 4xx  errors)',
        metricId: 'builtin:service.keyRequest.errors.fourxx.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  HTTP 4xx errors',
        metricId: 'builtin:service.keyRequest.errors.fourxx.successCount',
        unit: 'Count'
      },
      {
        displayName: 'Number of server side errors',
        metricId: 'builtin:service.keyRequest.errors.server.count',
        unit: 'Count'
      },
      {
        displayName: 'Failure rate (server side  errors)',
        metricId: 'builtin:service.keyRequest.errors.server.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls without  server side errors',
        metricId: 'builtin:service.keyRequest.errors.server.successCount',
        unit: 'Count'
      },
      {
        displayName: 'Client side response time',
        metricId: 'builtin:service.keyRequest.response.client',
        unit: 'MicroSecond'
      },
      {
        displayName: 'Server side response time',
        metricId: 'builtin:service.keyRequest.response.server',
        unit: 'MicroSecond'
      },
      {
        displayName: 'Method response time',
        metricId: 'builtin:service.keyRequest.response.time',
        unit: 'MicroSecond'
      },
      {
        displayName: 'Success rate (server side)',
        metricId: 'builtin:service.keyRequest.successes.server.rate',
        unit: 'Percent'
      },
      {
        displayName: 'Number of calls to databases',
        metricId: 'builtin:service.keyRequest.dbChildCallCount',
        unit: 'Count'
      },
      {
        displayName: 'Time spent in database calls',
        metricId: 'builtin:service.keyRequest.dbChildCallTime',
        unit: 'MicroSecond'
      },
      { displayName: 'IO time', metricId: 'builtin:service.keyRequest.ioTime', unit: 'MicroSecond' },
      { displayName: 'Lock time', metricId: 'builtin:service.keyRequest.lockTime', unit: 'MicroSecond' },
      {
        displayName: 'Number of calls to other services',
        metricId: 'builtin:service.keyRequest.nonDbChildCallCount',
        unit: 'Count'
      },
      {
        displayName: 'Time spent in calls to other services',
        metricId: 'builtin:service.keyRequest.nonDbChildCallTime',
        unit: 'MicroSecond'
      },
      {
        displayName: 'Total processing time',
        metricId: 'builtin:service.keyRequest.totalProcessingTime',
        unit: 'MicroSecond'
      },
      { displayName: 'Wait time', metricId: 'builtin:service.keyRequest.waitTime', unit: 'MicroSecond' },
      { displayName: 'Request count - client', metricId: 'builtin:service.requestCount.client', unit: 'Count' },
      { displayName: 'Request count - server', metricId: 'builtin:service.requestCount.server', unit: 'Count' },
      { displayName: 'Request count', metricId: 'builtin:service.requestCount.total', unit: 'Count' },
      { displayName: 'Client side response time', metricId: 'builtin:service.response.client', unit: 'MicroSecond' },
      { displayName: 'Server side response time', metricId: 'builtin:service.response.server', unit: 'MicroSecond' },
      { displayName: 'Response time', metricId: 'builtin:service.response.time', unit: 'MicroSecond' },
      { displayName: 'Success rate (server side)', metricId: 'builtin:service.successes.server.rate', unit: 'Percent' },
      { displayName: 'Total processing time', metricId: 'builtin:service.totalProcessingTime', unit: 'MicroSecond' },
      {
        displayName: 'Total processing time',
        metricId: 'builtin:service.totalProcessingTime.group.totalProcessingTime',
        unit: 'MicroSecond'
      },
      { displayName: 'Number of calls to databases', metricId: 'builtin:service.dbChildCallCount', unit: 'Count' },
      { displayName: 'Time spent in database calls', metricId: 'builtin:service.dbChildCallTime', unit: 'MicroSecond' },
      { displayName: 'IO time', metricId: 'builtin:service.ioTime', unit: 'MicroSecond' },
      { displayName: 'Lock time', metricId: 'builtin:service.lockTime', unit: 'MicroSecond' },
      {
        displayName: 'Number of calls to other services',
        metricId: 'builtin:service.nonDbChildCallCount',
        unit: 'Count'
      },
      {
        displayName: 'Time spent in calls to other services',
        metricId: 'builtin:service.nonDbChildCallTime',
        unit: 'MicroSecond'
      },
      { displayName: 'Wait time', metricId: 'builtin:service.waitTime', unit: 'MicroSecond' }
    ],
    metaData: null,
    correlationId: '74417c2b-fb27-436c-922a-839ffa6aba2a'
  }
}
