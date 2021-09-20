import React, { useCallback, useEffect, useMemo } from 'react'
import { Color, Container, Icon, Pagination, Select, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import { useGetHealthSources } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ClusterChart from './components/ClusterChart/ClusterChart'
import type { LogAnalysisProps, LogAnalysisRowData } from './LogAnalysis.types'
import { LogAnalysisRow } from './components/LogAnalysisRow/LogAnalysisRow'
import { getClusterTypes, mapClusterType } from './LogAnalysis.utils'
import { HealthSourceDropDown } from '../HealthSourcesDropdown/HealthSourcesDropdown'
import styles from './LogAnalysis.module.scss'

export default function LogAnalysis(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    setSelectedClusterType,
    onChangeHealthSource,
    activityId
  } = props
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()

  const {
    data: healthSourcesData,
    error: healthSourcesError,
    loading: healthSourcesLoading,
    refetch: fetchHealthSources
  } = useGetHealthSources({
    queryParams: { accountId },
    activityId: activityId as string,
    lazy: true
  })

  useEffect(() => {
    if (activityId) {
      fetchHealthSources()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  const logAnalysisData = useMemo((): LogAnalysisRowData[] => {
    return (
      data?.resource?.content?.map(d => ({
        clusterType: mapClusterType(d.clusterType!),
        count: d.count!,
        message: d.message!,
        messageFrequency: [
          {
            name: 'testData',
            type: 'line',
            color: getRiskColorValue(d.risk),
            data: d!.testFrequencyData
          },
          {
            name: 'controlData',
            type: 'line',
            color: 'var(--grey-350)',
            data: d!.controlFrequencyData
          }
        ],
        riskScore: d.score!,
        riskStatus: d.risk!
      })) ?? []
    )
  }, [data])

  const renderLogsData = useCallback(() => {
    if (logsLoading) {
      return (
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!logAnalysisData.length) {
      return (
        <Container className={styles.noData}>
          <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
        </Container>
      )
    } else {
      return <LogAnalysisRow className={styles.logAnalysisRow} data={logAnalysisData} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisData.length])

  const renderChartCluster = useCallback(() => {
    if (clusterChartLoading) {
      return (
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!clusterChartData?.resource?.length) {
      return (
        <Container className={styles.noData}>
          <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
        </Container>
      )
    } else {
      return <ClusterChart data={clusterChartData?.resource || []} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterChartData?.resource?.length, clusterChartLoading])

  return (
    <Container className={styles.logsTab}>
      <Container className={styles.panel}>
        <Text font={{ weight: 'bold' }}>{getString('pipeline.verification.logs.logCluster')}</Text>
        {renderChartCluster()}
      </Container>
      <Container className={styles.filters}>
        <Select
          items={getClusterTypes(getString)}
          defaultSelectedItem={getClusterTypes(getString)[0]}
          className={styles.clusterTypeFilter}
          inputProps={{ placeholder: getString('pipeline.verification.logs.filterByClusterType') }}
          onChange={setSelectedClusterType}
        />
        <HealthSourceDropDown
          data={healthSourcesData}
          loading={healthSourcesLoading}
          error={healthSourcesError}
          onChange={onChangeHealthSource}
          className={styles.logsAnalysisFilters}
          verificationType={VerificationType.LOG}
        />
      </Container>
      <Container className={styles.tableContent}>{renderLogsData()}</Container>
      {!!data?.resource?.totalPages && (
        <Pagination
          pageSize={data.resource.pageSize as number}
          pageCount={data.resource.totalPages + 1}
          itemCount={data.resource.totalItems as number}
          pageIndex={data.resource.pageIndex}
          gotoPage={goToPage}
        />
      )}
    </Container>
  )
}
