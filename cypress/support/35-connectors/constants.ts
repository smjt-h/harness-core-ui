const projectId = 'project1'
const accountId = 'accountId'
const orgIdentifier = 'default'

export const connectorsListAPI = `/ng/api/connectors/listV2?routingId=${accountId}&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&accountIdentifier=${accountId}&searchTerm=`
export const connectorsCatalogueAPI = `/ng/api/connectors/catalogue?routingId=${accountId}&accountIdentifier=${accountId}`
export const delegatesListAPI = `/api/setup/delegates/delegate-selectors-up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const connectorsRoute = `#/account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/setup/resources/connectors`
