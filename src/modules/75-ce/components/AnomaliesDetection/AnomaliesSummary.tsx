/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Layout, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import {
  HorizontalLayout,
  LEGEND_LIMIT,
  ListType,
  Stats,
  TableList
} from '@ce/components/OverviewPage/OverviewPageLayout'
import { CE_COLOR_CONST } from '@ce/components/CEChart/CEChartOptions'
import formatCost from '@ce/utils/formatCost'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

interface AnomaliesOverviewProps {
  costData: Record<string, any>
  perspectiveAnomaliesData: Record<string, any>[]
  cloudProvidersWiseData: Record<string, any>[]
  statusWiseData: Record<string, any>[]
  allDefaultProviders: Record<string, any>
}

const map: Record<string, string> = {
  AZURE: 'defaultAzurePerspectiveId',
  AWS: 'defaultAwsPerspectiveId',
  GCP: 'defaultGcpPerspectiveId'
}

const transformCloudCost = (data: Record<string, any>[] = [], providers: Record<string, any>): Stats[] => {
  return data.map((d, idx) => {
    return {
      label: d.name as string,
      value: d.actualCost,
      count: d.count,
      trend: 0,
      legendColor: CE_COLOR_CONST[idx % CE_COLOR_CONST.length],
      linkId: providers[map[d.name as string]]
    }
  })
}

const perspectiveAnomaliesCost = (data: Record<string, any>[] = []): Stats[] => {
  return data.map((d, idx) => {
    return {
      label: `Perspective ${idx + 1}`,
      value: d.actualCost,
      count: d.count,
      trend: 0,
      legendColor: CE_COLOR_CONST[idx % CE_COLOR_CONST.length],
      linkId: d.name
    }
  })
}

const AnomaliesSummary: React.FC<AnomaliesOverviewProps> = ({
  costData,
  perspectiveAnomaliesData,
  cloudProvidersWiseData,
  statusWiseData,
  allDefaultProviders
}) => {
  const { getString } = useStrings()
  // const availableProviders = Object.keys(allDefaultProviders).filter(ap => allDefaultProviders[ap])

  const cloudProviderChartData = useMemo(
    () => transformCloudCost(cloudProvidersWiseData, allDefaultProviders),
    [cloudProvidersWiseData]
  )

  const perspectiveWiseChartData = useMemo(
    () => perspectiveAnomaliesCost(perspectiveAnomaliesData),
    [perspectiveAnomaliesData]
  )

  const statusWiseChartData = useMemo(() => transformCloudCost(statusWiseData, allDefaultProviders), [statusWiseData])

  return (
    <Layout.Horizontal spacing="medium">
      <Layout.Vertical spacing="small">
        <Container padding="medium" background={Color.GREY_100} border={{ color: Color.GREY_100, radius: 4 }}>
          <Text color={Color.GREY_600} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.totalCountText')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            {costData?.count}
          </Text>
        </Container>
        <Container
          padding="medium"
          background={Color.RED_100}
          border={{ color: Color.RED_100, radius: 4 }}
          intent="danger"
        >
          <Text color={Color.RED_500} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.costImpacted')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            {formatCost(costData?.actualCost)}
          </Text>
          <p></p>
        </Container>
      </Layout.Vertical>
      <Container className={css.summaryCharts}>
        <HorizontalLayout
          title={getString('ce.anomalyDetection.summary.perspectiveWise').toUpperCase()}
          chartData={perspectiveWiseChartData}
          showTrendInChart={false}
          totalCost={{ label: '', value: 0, trend: 0, legendColor: '' }}
          chartSize={120}
          headingSize={'small'}
          showGist={false}
          sideBar={
            <TableList
              data={perspectiveWiseChartData.slice(0, LEGEND_LIMIT)}
              type={ListType.KEY_VALUE}
              classNames={css.rowGap8}
            />
          }
        />
      </Container>
      <Container className={css.summaryCharts}>
        <HorizontalLayout
          title={getString('ce.anomalyDetection.summary.cloudProvidersWise')}
          chartData={cloudProviderChartData}
          showTrendInChart={false}
          totalCost={{ label: '', value: 0, trend: 0, legendColor: '' }}
          chartSize={120}
          headingSize={'small'}
          showGist={false}
          sideBar={
            <TableList
              data={cloudProviderChartData.slice(0, LEGEND_LIMIT)}
              type={ListType.KEY_VALUE}
              classNames={css.rowGap8}
            />
          }
        />
      </Container>
      <Container className={css.summaryCharts}>
        <HorizontalLayout
          title={getString('ce.anomalyDetection.summary.statusWise')}
          chartData={statusWiseChartData}
          showTrendInChart={false}
          totalCost={{ label: '', value: 0, trend: 0, legendColor: '' }}
          chartSize={120}
          headingSize={'small'}
          showGist={false}
          sideBar={
            <TableList
              data={statusWiseChartData.slice(0, LEGEND_LIMIT)}
              type={ListType.KEY_VALUE}
              classNames={css.rowGap8}
              showCost={false}
            />
          }
        />
      </Container>
    </Layout.Horizontal>
  )
}

export default AnomaliesSummary
