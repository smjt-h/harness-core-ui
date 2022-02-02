export const servicesCall =
  '/ng/api/services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1'

export const environmentsCall =
  '/ng/api/environments?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1'

export const servicesResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'Service_101',
        orgIdentifier: 'default',
        projectIdentifier: 'TestHealth',
        name: 'Service 101',
        description: null,
        deleted: false,
        tags: {},
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '8fc77312-0015-4665-be3d-f66527ae209f'
}

export const environmentResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        orgIdentifier: 'default',
        projectIdentifier: 'TestHealth',
        identifier: 'QA',
        name: 'QA',
        description: '',
        color: '#0063F7',
        type: 'PreProduction',
        deleted: false,
        tags: {},
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '76f1288e-9bd0-47c0-82d9-6a3df8084603'
}
