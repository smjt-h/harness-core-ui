/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Icon, Pagination, NoDataCard, PageError, MultiSelectOption } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetAllLogsData } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import LogAnalysis from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis'
import noDataImage from '@cv/assets/noData.svg'
import type { LogAnalysisContentProps, LogEvents } from './LogAnalysis.types'
import { PAGE_SIZE } from './LogAnalysis.constants'
import type {
  ClusterTypes,
  MinMaxAngleState
} from '../ExecutionVerification/components/LogAnalysisContainer/LogAnalysisView.container.types'
import { getClusterTypes } from '../ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.utils'
import type { EventTypeFullName } from '../ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.constants'
import LogFilters from './components/LogFilters/LogFilters'
import { RadarChartAngleLimits } from '../ExecutionVerification/components/LogAnalysisContainer/LogAnalysisView.container.constants'
import css from './LogAnalysis.module.scss'

// const ClusterChartContainer: React.FC<LogAnalysisContentProps> = ({
//   monitoredServiceIdentifier,
//   startTime,
//   endTime,
//   logEvent,
//   healthSource
// }) => {
//   const { getString } = useStrings()
//   const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

//   const { data, loading, error, refetch } = useGetAllLogsClusterData({
//     queryParams: {
//       accountId,
//       orgIdentifier,
//       projectIdentifier,
//       monitoredServiceIdentifier,
//       startTime,
//       endTime,
//       ...(logEvent ? { clusterTypes: [logEvent] } : {}),
//       healthSources: healthSource ? [healthSource] : undefined
//     },
//     queryParamStringifyOptions: {
//       arrayFormat: 'repeat'
//     }
//   })

//   if (loading) {
//     return (
//       <Container flex={{ justifyContent: 'center' }} margin={{ top: 'xxxlarge' }}>
//         <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
//       </Container>
//     )
//   }

//   if (error) {
//     return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
//   }

//   if (!data?.resource?.length) {
//     return (
//       <NoDataCard
//         image={noDataImage}
//         imageClassName={css.logClusterNoDataImage}
//         className={css.noData}
//         containerClassName={css.noDataContainer}
//         message={getString('cv.monitoredServices.noAvailableData')}
//       />
//     )
//   }

//   return <ClusterChart data={data.resource} />
// }

export const LogAnalysisContent: React.FC<LogAnalysisContentProps> = ({
  monitoredServiceIdentifier,
  startTime,
  endTime
}) => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  const isFirstFilterCall = useRef(true)

  const [clusterTypeFilters, setClusterTypeFilters] = useState<ClusterTypes>(() => {
    return getClusterTypes(getString).map(i => i.value) as ClusterTypes
  })

  const [logEvent, setLogEvent] = useState<LogEvents>()
  const [minMaxAngle, setMinMaxAngle] = useState({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
  const [selectedHealthSources, setSelectedHealthSources] = useState<MultiSelectOption[]>([])

  const [logsDataQueryParams, setLogsDataQueryParams] = useState(() => {
    return {
      accountId,
      page: 0,
      size: PAGE_SIZE,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier,
      minAngle: minMaxAngle.min,
      maxAngle: minMaxAngle.max,
      startTime,
      endTime,
      // clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
      healthSources: selectedHealthSources.length
        ? (selectedHealthSources.map(item => item.value) as string[])
        : undefined
    }
  })

  // const [radarChartDataQueryParams, setradarChartDataQueryParams] =
  //   useState<GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams>(() => {
  //     return {
  //       accountId,
  //       hostNames: getQueryParamForHostname(hostName),
  //       clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
  //       healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
  //     }
  //   })

  const queryParams = useMemo(() => {
    return {
      page: 0,
      size: PAGE_SIZE,
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier,
      startTime,
      endTime,
      clusterTypes: undefined,
      healthSources: selectedHealthSources.length
        ? (selectedHealthSources.map(item => item.value) as string[])
        : undefined
    }
  }, [
    accountId,
    endTime,
    selectedHealthSources,
    orgIdentifier,
    projectIdentifier,
    monitoredServiceIdentifier,
    startTime
  ])

  const {
    data: logsData,
    refetch: fetchLogAnalysis,
    loading: logsLoading,
    error: logsError
  } = useGetAllLogsData({
    queryParams: logsDataQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      setLogsDataQueryParams({
        ...logsDataQueryParams,
        minAngle: minMaxAngle.min,
        maxAngle: minMaxAngle.max
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minMaxAngle])

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const updatedLogsDataParams = {
        ...logsDataQueryParams,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      }

      // TODO: ADD RADAR CHART PROPS
      // const updatedRadarChartDataParams = {
      //   ...radarChartDataQueryParams,
      //   clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      // }

      setLogsDataQueryParams(updatedLogsDataParams)
      // setradarChartDataQueryParams(updatedRadarChartDataParams)
      setMinMaxAngle({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
    } else {
      isFirstFilterCall.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterTypeFilters])

  const handleClustersFilterChange = useCallback((checked: boolean, filterName: EventTypeFullName): void => {
    setClusterTypeFilters(currentFilters => {
      if (checked) {
        return [...(currentFilters as EventTypeFullName[]), filterName]
      } else {
        return currentFilters?.filter((item: string) => item !== filterName)
      }
    })
  }, [])

  const goToLogsPage = useCallback(
    page => {
      fetchLogAnalysis({
        queryParams: { ...queryParams, page }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryParams]
  )

  const handleHealthSourceChange = useCallback(selectedHealthSourceFitlers => {
    setSelectedHealthSources(selectedHealthSourceFitlers)
  }, [])

  const handleMinMaxChange = useCallback((updatedAngle: MinMaxAngleState): void => {
    setMinMaxAngle({ ...updatedAngle })
  }, [])

  // Radar call
  // const {
  //   data: clusterChartData,
  //   loading: clusterChartLoading,
  //   error: clusterChartError,
  //   refetch: fetchClusterAnalysis
  // } = useGetVerifyStepDeploymentRadarChartLogAnalysisClusters({
  //   verifyStepExecutionId: activityId,
  //   queryParams: radarChartDataQueryParams,
  //   queryParamStringifyOptions: {
  //     arrayFormat: 'repeat'
  //   }
  // })
  // mock data
  const radarChartData = {
    resource: [
      {
        label: 0,
        message: 'projects/chi-play/logs/stdout',
        risk: 'HEALTHY',
        radius: 1.357564536113864,
        angle: 0,
        baseline: {
          label: 0,
          message: 'projects/chi-play/logs/stdout',
          risk: 'NO_ANALYSIS',
          radius: 0.5,
          angle: 0,
          clusterType: 'BASELINE',
          hasControlData: false,
          clusterId: 1
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true,
        clusterId: 1
      },
      {
        label: 2,
        message: 'projects/chi-play/logs/stderr',
        risk: 'HEALTHY',
        radius: 1.8066135269309567,
        angle: 120,
        baseline: {
          label: 2,
          message: 'projects/chi-play/logs/stderr',
          risk: 'NO_ANALYSIS',
          radius: 0.2,
          angle: 120,
          clusterType: 'BASELINE',
          hasControlData: false,
          clusterId: 2
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true,
        clusterId: 2
      },
      {
        label: 1,
        message: 'projects/chi-play/logs/events',
        risk: 'HEALTHY',
        radius: 1.480099986754282,
        angle: 240,
        baseline: {
          label: 1,
          message: 'projects/chi-play/logs/events',
          risk: 'NO_ANALYSIS',
          radius: 0.3698184595475662,
          angle: 240,
          clusterType: 'BASELINE',
          hasControlData: false,
          clusterId: 3
        },
        clusterType: 'KNOWN_EVENT',
        hasControlData: true,
        clusterId: 3
      }
    ]
  }

  const logsListCallResponse = {
    metaData: {},
    resource: {
      totalClusters: 29,
      eventCounts: [
        { clusterType: 'KNOWN_EVENT', count: 24, displayName: 'Known' },
        { clusterType: 'UNKNOWN_EVENT', count: 4, displayName: 'Unknown' },
        { clusterType: 'UNEXPECTED_FREQUENCY', count: 1, displayName: 'Unexpected Frequency' }
      ],
      logAnalysisRadarCharts: {
        totalPages: 3,
        totalItems: 29,
        pageItemCount: 10,
        pageSize: 10,
        content: [
          {
            message: 'Test Message',
            label: 0,
            risk: 'UNHEALTHY',
            clusterType: 'UNEXPECTED_FREQUENCY',
            count: 258,
            frequencyData: [45.0, 74.0, 44.0, 43.0, 52.0],
            baseline: {
              message: '< Transfer-Encoding: chunked\r\n',
              label: 0,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [2.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 1
          },
          {
            message:
              '2022-02-10 07:22:59 UTC | TRACE | INFO | (pkg/trace/info/stats.go:104 in LogStats) | No data received\n',
            label: 30003,
            risk: 'UNHEALTHY',
            clusterType: 'UNKNOWN_EVENT',
            count: 1,
            frequencyData: [1.0],
            baseline: null,
            hasControlData: false,
            clusterId: 2
          },
          {
            message:
              '  A v e r a g e   S p e e d       T i m  e         T i m e        D lToiamde    UCpuload   Trorteanlt \n',
            label: 30001,
            risk: 'UNHEALTHY',
            clusterType: 'UNKNOWN_EVENT',
            count: 1,
            frequencyData: [1.0],
            baseline: null,
            hasControlData: false,
            clusterId: 3
          },
          {
            message:
              '  % Total    % Received % Xferd  Average Spee d   %  TTimoet a  l  T i m e%   R e c eTiivmeed   %C uXrfreerndt \n',
            label: 30002,
            risk: 'UNHEALTHY',
            clusterType: 'UNKNOWN_EVENT',
            count: 1,
            frequencyData: [1.0],
            baseline: null,
            hasControlData: false,
            clusterId: 4
          },
          {
            message:
              '    \r     0          D0l o a d   Up0l o a d    0  T   o0 t a l    S p0e n t     L   e0f t       0S p-e-e:d-\n',
            label: 30000,
            risk: 'UNHEALTHY',
            clusterType: 'UNKNOWN_EVENT',
            count: 1,
            frequencyData: [1.0],
            baseline: null,
            hasControlData: false,
            clusterId: 5
          },
          {
            message: '{ [2938 bytes data]\n',
            label: 11,
            risk: 'HEALTHY',
            clusterType: 'KNOWN_EVENT',
            count: 21,
            frequencyData: [3.0, 6.0, 4.0, 4.0, 4.0],
            baseline: {
              message: '{ [2938 bytes data]\n',
              label: 11,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [38.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 6
          },
          {
            message:
              '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
            label: 98,
            risk: 'HEALTHY',
            clusterType: 'KNOWN_EVENT',
            count: 4,
            frequencyData: [1.0, 1.0, 1.0, 1.0],
            baseline: {
              message:
                '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
              label: 98,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [8.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 7
          },
          {
            message: '< Location: display.jsp\r\n',
            label: 112,
            risk: 'HEALTHY',
            clusterType: 'KNOWN_EVENT',
            count: 3,
            frequencyData: [1.0, 1.0, 1.0],
            baseline: {
              message: '< Location: display.jsp\r\n',
              label: 112,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [4.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 8
          },
          {
            message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
            label: 80,
            risk: 'HEALTHY',
            clusterType: 'KNOWN_EVENT',
            count: 25,
            frequencyData: [5.0, 7.0, 4.0, 4.0, 5.0],
            baseline: {
              message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
              label: 80,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [41.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 9
          },
          {
            message: '* upload completely sent off: 47 out of 47 bytes\n',
            label: 89,
            risk: 'HEALTHY',
            clusterType: 'KNOWN_EVENT',
            count: 10,
            frequencyData: [2.0, 3.0, 2.0, 2.0, 1.0],
            baseline: {
              message: '* upload completely sent off: 47 out of 47 bytes\n',
              label: 89,
              risk: 'NO_ANALYSIS',
              clusterType: 'BASELINE',
              count: 0,
              frequencyData: [16.0],
              baseline: null,
              hasControlData: false
            },
            hasControlData: true,
            clusterId: 10
          }
        ],
        pageIndex: 0,
        empty: false
      }
    },
    responseMessages: []
  }

  const getContents = (): JSX.Element => {
    // TODO: ADD IT WHEN BOTH API LOADS
    // if (logsLoading && clusterChartLoading) {
    //   return (
    //     <Container flex={{ justifyContent: 'center' }} className={css.loadingContainer}>
    //       <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
    //     </Container>
    //   )
    // }

    if (logsError) {
      return <PageError message={getErrorMessage(logsError)} onClick={() => fetchLogAnalysis()} />
    }

    if (!logsData?.resource?.content?.length) {
      return (
        <NoDataCard
          message={getString('cv.monitoredServices.noAvailableData')}
          image={noDataImage}
          containerClassName={css.logsAnalysisNoData}
        />
      )
    }

    const { pageSize = 0, totalPages = 0, totalItems = 0, pageIndex = 0 } = logsData?.resource
    return (
      <>
        <LogAnalysis
          data={logsListCallResponse}
          clusterChartData={radarChartData}
          filteredAngle={minMaxAngle}
          logsLoading={logsLoading}
          logsError={logsError}
          refetchLogAnalysis={fetchLogAnalysis}
          refetchClusterAnalysis={() => null}
          clusterChartError={null}
          clusterChartLoading={false}
          goToPage={goToLogsPage}
          handleAngleChange={handleMinMaxChange}
          isServicePage
        />
        {/* <Pagination
          pageSize={pageSize}
          pageCount={totalPages}
          itemCount={totalItems}
          pageIndex={pageIndex}
          gotoPage={goToLogsPage}
        /> */}
      </>
    )
  }

  return (
    <>
      <LogFilters
        clusterTypeFilters={clusterTypeFilters}
        onFilterChange={handleClustersFilterChange}
        onHealthSouceChange={handleHealthSourceChange}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        selectedHealthSources={selectedHealthSources}
      />
      {getContents()}
    </>
  )
}

// const LogAnalysis: React.FC<LogAnalysisProps> = ({ monitoredServiceIdentifier, startTime, endTime }) => {
//   const { getString } = useStrings()

//   const [logEvent, setLogEvent] = useState<LogEvents>(LogEvents.UNKNOWN)
//   const [healthSource, setHealthSource] = useState<string>()

//   const clusterTypes = getClusterTypes(getString)

//   return (
//     <div className={css.container}>
//       <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
//         <Select
//           items={clusterTypes}
//           defaultSelectedItem={clusterTypes[2]}
//           className={css.logsAnalysisFilters}
//           inputProps={{ placeholder: getString('pipeline.verification.logs.filterByClusterType') }}
//           onChange={item => setLogEvent(item.value as LogEvents)}
//         />
//         <HealthSourceDropDown
//           onChange={setHealthSource}
//           className={css.logsAnalysisFilters}
//           monitoredServiceIdentifier={monitoredServiceIdentifier}
//           verificationType={VerificationType.LOG}
//         />
//       </Layout.Horizontal>

//       <Card className={css.clusterChart}>
//         <Heading level={2} font={{ variation: FontVariation.CARD_TITLE }}>
//           {getString('pipeline.verification.logs.logCluster')}
//         </Heading>
//         <ClusterTypeFiltersForLogs
//           nodeNames={null}
//           clusterTypeFilters={undefined}
//           onFilterChange={() => null}
//           selectedNodeName={[]}
//           handleNodeNameChange={() => null}
//           nodeNamesError={null}
//           nodeNamesLoading={false}
//         />
//         <RadarChartComponent />
//       </Card>

//       <LogAnalysisContent
//         monitoredServiceIdentifier={monitoredServiceIdentifier}
//         startTime={startTime}
//         endTime={endTime}
//         logEvent={logEvent}
//         healthSource={healthSource}
//       />
//     </div>
//   )
// }

// export default LogAnalysis
