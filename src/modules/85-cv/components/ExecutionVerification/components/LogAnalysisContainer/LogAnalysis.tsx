/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Container, Icon, NoDataCard } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { LogAnalysisRow } from '@cv/components/LogsAnalysis/components/LogAnalysisRow/LogAnalysisRow'
import type { LogAnalysisProps, LogAnalysisRowData } from './LogAnalysis.types'
import LogAnalysisRadarChartHeader from './components/LogAnalysisRadarChartHeader'
import LogAnalysisRadarChart from './components/LogAnalysisRadarChart'
import { getLogAnalysisData } from './LogAnalysis.utils'
import styles from './LogAnalysis.module.scss'

export default function LogAnalysis(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    isErrorTracking,
    handleAngleChange,
    filteredAngle,
    activityId,
    logsError
  } = props
  const { getString } = useStrings()

  const logAnalysisData = useMemo((): LogAnalysisRowData[] => {
    return getLogAnalysisData(data)
  }, [data])

  const [selectedLog, setSelectedLog] = useState<string | null>(null)

  const handleLogSelection = useCallback((logClusterId: string): void => {
    setSelectedLog(logClusterId)
  }, [])

  const resetSelectedLog = useCallback(() => {
    setSelectedLog(null)
  }, [])

  const renderLogsData = useCallback(() => {
    if (logsLoading) {
      return (
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!logAnalysisData.length) {
      return (
        <Container className={styles.noData} data-testid="LogAnalysisList_NoData">
          <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
        </Container>
      )
    } else {
      return (
        <LogAnalysisRow
          className={styles.logAnalysisRow}
          data={logAnalysisData}
          isErrorTracking={isErrorTracking}
          logResourceData={data?.resource?.logAnalysisRadarCharts}
          goToPage={goToPage}
          selectedLog={selectedLog}
          resetSelectedLog={resetSelectedLog}
          activityId={activityId}
        />
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisData.length, selectedLog])

  return (
    <Container className={styles.logsTab}>
      <Container className={styles.clusterChart}>
        {!clusterChartLoading && !logsError && (
          <LogAnalysisRadarChartHeader
            totalClustersCount={data?.resource?.totalClusters}
            eventsCount={data?.resource?.eventCounts}
          />
        )}
        <LogAnalysisRadarChart
          clusterChartLoading={clusterChartLoading}
          clusterChartData={clusterChartData}
          handleAngleChange={handleAngleChange}
          filteredAngle={filteredAngle}
          onRadarPointClick={handleLogSelection}
        />
      </Container>
      <Container className={styles.tableContent}>{renderLogsData()}</Container>
    </Container>
  )
}
