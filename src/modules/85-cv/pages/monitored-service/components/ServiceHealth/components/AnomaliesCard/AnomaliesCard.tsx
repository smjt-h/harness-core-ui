import { Spinner } from '@blueprintjs/core'
import { Color, Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getTimeFormatMoment } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAnomaliesSummary } from 'services/cv'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { areAnomaliesAvailable, mapHealthBarRiskStatusToColor } from './AnomaliesCard.utils'
import type { AnomaliesCardProps } from './Anomalies.types'
import css from './AnomaliesCard.module.scss'

export default function AnomaliesCard(props: AnomaliesCardProps): JSX.Element {
  const {
    timeRange,
    timeFormat,
    lowestHealthScoreBarForTimeRange,
    serviceIdentifier,
    environmentIdentifier,
    monitoredServiceIdentifier
  } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { showError, clear } = useToaster()
  const { getString } = useStrings()

  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime: timeRange?.startTime as number,
      endTime: timeRange?.endTime as number
    }
  }, [
    accountId,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier,
    serviceIdentifier,
    timeRange?.endTime,
    timeRange?.startTime
  ])

  // api for fetching anomaliesData
  const {
    data: anomaliesData,
    refetch: fetchAnomaliesData,
    loading: anomaliesLoading,
    error: anomaliesError
  } = useGetAnomaliesSummary({
    queryParams,
    lazy: true,
    identifier: monitoredServiceIdentifier as string,
    pathParams: {
      identifier: monitoredServiceIdentifier as string
    }
  })

  const {
    isTimeSeriesAnomaliesAvailable,
    isLogsAnomaliesAvailable,
    isTotalAnomaliesAvailable,
    isLowestHealthScoreAvailable
  } = areAnomaliesAvailable(anomaliesData, lowestHealthScoreBarForTimeRange?.healthScore)
  const momentTimeformat = getTimeFormatMoment(timeFormat)

  useEffect(() => {
    if (timeRange?.startTime || timeRange?.endTime) {
      fetchAnomaliesData({
        queryParams: { ...queryParams, startTime: timeRange?.startTime, endTime: timeRange?.endTime }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange?.startTime, timeRange?.endTime, queryParams])

  useEffect(() => {
    if (anomaliesError) {
      clear()
      showError(getErrorMessage(anomaliesError), 7000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anomaliesError])

  const renderAnomaliesData = useCallback(() => {
    if (anomaliesLoading) {
      return (
        <Container padding={{ left: 'medium', right: 'medium', top: 'medium', bottom: 'large' }}>
          <Spinner size={Spinner.SIZE_SMALL} />
        </Container>
      )
    } else {
      return (
        <Container padding={{ right: 'small', left: 'small' }}>
          {isTimeSeriesAnomaliesAvailable && (
            <Text padding={{ top: 'medium' }} color={Color.WHITE} font={{ size: 'xsmall', weight: 'bold' }}>
              {`${getString('pipeline.verification.analysisTab.metrics')} ${
                anomaliesData?.resource?.timeSeriesAnomalies
              }`}
            </Text>
          )}
          {isLogsAnomaliesAvailable && (
            <Text
              padding={{ top: 'small', bottom: 'small' }}
              color={Color.WHITE}
              font={{ size: 'xsmall', weight: 'bold' }}
            >
              {`${getString('pipeline.verification.analysisTab.logs')} ${anomaliesData?.resource?.logsAnomalies}`}
            </Text>
          )}
        </Container>
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    anomaliesData?.resource?.logsAnomalies,
    anomaliesData?.resource?.timeSeriesAnomalies,
    anomaliesLoading,
    isLogsAnomaliesAvailable,
    isTimeSeriesAnomaliesAvailable
  ])

  return (
    <>
      <Container className={css.cardRow}>
        <Text padding={{ left: 'small', top: 'small' }} color={Color.WHITE} font={{ size: 'xsmall' }}>
          {`${moment(timeRange?.startTime).format(momentTimeformat)} - ${moment(timeRange?.endTime).format(
            momentTimeformat
          )}`}
        </Text>
        {!anomaliesLoading && isTotalAnomaliesAvailable && (
          <Text
            padding={{ right: 'small', top: 'small' }}
            color={Color.WHITE}
            font={{ size: 'xsmall', weight: 'bold' }}
          >
            {`${getString('cv.monitoredServices.serviceHealth.anamolies')}: ${anomaliesData?.resource?.totalAnomalies}`}
          </Text>
        )}
      </Container>
      <hr className={css.seperator} />
      <Container className={css.cardRow}>
        {isLowestHealthScoreAvailable && (
          <Container className={css.cardColumn} padding={{ left: 'small', right: 'small' }}>
            <Text padding={{ top: 'small' }} color={Color.WHITE} font={{ size: 'xsmall' }}>
              {getString('cv.monitoredServices.serviceHealth.lowestHealthScore')}
            </Text>
            <Text
              padding={{ top: 'xsmall', bottom: 'xxsmall' }}
              color={mapHealthBarRiskStatusToColor(lowestHealthScoreBarForTimeRange?.riskStatus as string)}
              font={{ size: 'large', weight: 'bold' }}
            >
              {lowestHealthScoreBarForTimeRange?.healthScore}
            </Text>
          </Container>
        )}
        <Container className={css.cardColumn}>{renderAnomaliesData()}</Container>
      </Container>
    </>
  )
}
