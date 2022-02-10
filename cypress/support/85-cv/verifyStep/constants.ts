const accountId = 'accountId'

export const deploymentActivitySummaryAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-activity-summary?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&pageNumber=0&pageSize=10`
export const deploymentTimeseriesDataWithNodeFilterAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10`
export const healthSourceAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/healthSources?routingId=${accountId}&accountId=${accountId}`
export const nodeNamesFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-node-names?routingId=${accountId}&accountId=${accountId}`
export const transactionsFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-transaction-names?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataWithFilters = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=true&anomalousNodesOnly=true&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10&healthSources=appd_prod%2Fappdtest&transactionNames=%2Ftodolist%2Fregister`
