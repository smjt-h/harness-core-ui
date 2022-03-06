/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import type { TooltipFormatterContextObject } from 'highcharts'
import { Card, Color, Container, Layout, Text, PageError, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getBucketSizeForTimeRange } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { PageSpinner } from '@common/components'
import { handleZeroOrInfinityTrend, renderTrend } from '@common/components/StackedSummaryBar/utils'
import { DeploymentsTimeRangeContext, INVALID_CHANGE_RATE, numberFormatter } from '@cd/components/Services/common'
import DeploymentsEmptyState from '@cd/icons/DeploymentsEmptyState.svg'
import { renderTooltipContent } from '@pipeline/components/LandingDashboardDeploymentsWidget/LandingDashboardDeploymentsWidget'
import { GetServiceDeploymentsInfoQueryParams, useGetServiceDeploymentsInfo } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import { getReadableDateTime } from '@common/utils/dateUtils'
import css from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget.module.scss'

export interface ChangeValue {
  value: string
  change: number
}
interface SummaryCardData {
  title: string
  count: string
  trend: string
}
interface Points {
  deployments: {
    failure: number
    success: number
    total: number
  }
  time: number
}

export interface DeploymentWidgetProps {
  serviceIdentifier?: string
}

const deploymentsTooltip = (currPoint: TooltipFormatterContextObject): string => {
  const custom = currPoint?.series?.userOptions?.custom
  const point: Points = custom?.[currPoint.key]
  const time = getReadableDateTime(point.time)
  let failureRate: string | number = 'Infinity'
  if (point?.deployments?.failure && point.deployments?.total) {
    failureRate = ((point.deployments.failure / point.deployments.total) * 100).toFixed(1) + '%'
  }
  if (point?.deployments?.failure === 0) {
    failureRate = '0'
  }
  return renderTooltipContent({
    time,
    failureRate,
    count: point?.deployments?.total,
    successCount: point?.deployments?.success,
    failureCount: point?.deployments?.failure
  })
}

const summaryCardRenderer = (cardData: SummaryCardData, groupByValue: string): JSX.Element => {
  return (
    <Container className={css.summaryCard} key={cardData.title}>
      <Text font={{ size: 'medium' }} color={Color.GREY_700} className={css.cardTitle}>
        {cardData.title}
      </Text>
      <Layout.Horizontal>
        <Layout.Horizontal className={css.frequencyContainer}>
          <Text color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} className={css.frequencyCount}>
            {cardData.count}
          </Text>
          {cardData.title === 'Deployment Frequency' && (
            <Text color={Color.GREY_700} font={{ size: 'small', weight: 'semi-bold' }} className={css.groupByValue}>
              {`/ ${groupByValue.toLocaleLowerCase()}`}
            </Text>
          )}
        </Layout.Horizontal>
        <Container className={css.trendContainer} flex>
          {cardData.trend === INVALID_CHANGE_RATE + '%' ? (
            <Icon name={'caret-down'} color={Color.RED_500}></Icon>
          ) : isNaN(parseInt(cardData.trend)) ? (
            handleZeroOrInfinityTrend(cardData.trend, cardData.trend.includes('-') ? Color.RED_500 : Color.GREEN_500)
          ) : (
            <Container flex>
              {cardData.trend.includes('-')
                ? renderTrend(cardData.trend, Color.RED_500)
                : renderTrend(cardData.trend, Color.GREEN_500)}
            </Container>
          )}
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export const getSummaryCardRenderers = (summaryCardsData: SummaryCardData[], groupByValue: string): JSX.Element => {
  return (
    <Container className={css.summaryCardsContainer}>
      {summaryCardsData?.map(currData => summaryCardRenderer(currData, groupByValue))}
    </Container>
  )
}

export const DeploymentsWidget: React.FC<DeploymentWidgetProps> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { serviceIdentifier } = props
  const { timeRange } = useContext(DeploymentsTimeRangeContext)

  const queryParams: GetServiceDeploymentsInfoQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId: serviceIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0,
      bucketSizeInDays: getBucketSizeForTimeRange(timeRange?.range)
    }
  }, [accountId, orgIdentifier, projectIdentifier, serviceIdentifier, timeRange])

  const {
    loading,
    data: serviceDeploymentsInfo,
    error,
    refetch
  } = useGetServiceDeploymentsInfo({
    queryParams
  })
  const data = serviceDeploymentsInfo?.data
  const dataList = data?.serviceDeploymentList

  const summaryCardsData: SummaryCardData[] = useMemo(() => {
    return [
      {
        title: getString('deploymentsText'),
        count: numberFormatter(data?.totalDeployments),
        trend: numberFormatter(data?.totalDeploymentsChangeRate) + '%'
      },
      {
        title: getString('common.failureRate'),
        count: numberFormatter(defaultTo(data?.failureRate, 0)) + '%',
        trend: numberFormatter(data?.failureRateChangeRate) + '%'
      },
      {
        title: getString('pipeline.deploymentFrequency'),
        count: numberFormatter(defaultTo(data?.frequency, 0)),
        trend: numberFormatter(data?.frequencyChangeRate) + '%'
      }
    ]
  }, [serviceDeploymentsInfo, getString])

  const chartData = useMemo(() => {
    if (data?.serviceDeploymentList?.length) {
      const successData: number[] = []
      const failureData: number[] = []
      const custom: any = []
      data?.serviceDeploymentList.forEach(val => {
        successData.push(defaultTo(val.deployments?.success, 0))
        failureData.push(defaultTo(val.deployments?.failure, 0))
        custom.push(val)
      })
      const successArr = {
        name: 'Success',
        data: successData,
        color: 'var(--success)',
        custom
      }
      const failureArr = {
        name: 'Failed',
        data: failureData,
        color: 'var(--red-400)',
        custom
      }
      return [successArr, failureArr]
    }
  }, [serviceDeploymentsInfo])

  const DeploymentWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>{children}</Layout.Vertical>
      </Card>
    )
  }

  if (
    loading ||
    error ||
    !serviceDeploymentsInfo?.data ||
    (serviceDeploymentsInfo.data.totalDeployments === 0 && serviceDeploymentsInfo.data.totalDeploymentsChangeRate === 0)
  ) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="deploymentsWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="deploymentsWidgetError" height={'100%'}>
            <PageError onClick={() => refetch()} />
          </Container>
        )
      }
      return (
        <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-test="deploymentsWidgetEmpty">
          <img width="150" height="100" src={DeploymentsEmptyState} style={{ alignSelf: 'center' }} />
          <Text color={Color.GREY_400} margin={{ top: 'medium' }}>
            {getString('cd.serviceDashboard.noDeployments', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <DeploymentWidgetContainer>{component}</DeploymentWidgetContainer>
  }

  return (
    <DeploymentWidgetContainer>
      <div className={css.deploymentsChartContainer}>
        <OverviewChartsWithToggle
          data={defaultTo(chartData, [])}
          summaryCards={getSummaryCardRenderers(summaryCardsData, 'DAY')}
          customChartOptions={{
            chart: { height: 170, spacing: [25, 0, 25, 0] },
            legend: { padding: 0 },
            tooltip: {
              useHTML: true,
              formatter: function () {
                return deploymentsTooltip(this)
              },
              backgroundColor: Color.BLACK,
              outside: true,
              borderColor: 'black'
            },
            xAxis: {
              labels: {
                formatter: function (this) {
                  let time = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                  if (dataList?.length) {
                    const val = dataList?.[this.pos]?.time
                    time = val ? new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : time
                  }
                  return time
                }
              }
            },
            yAxis: {
              title: {
                text: '# of Deployments',
                style: { color: 'var(--grey-400)' }
              }
            }
          }}
        />
      </div>
    </DeploymentWidgetContainer>
  )
}
