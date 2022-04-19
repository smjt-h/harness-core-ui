/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Layout, Text, Card } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
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

const transformCloudCost = (data: Record<string, any>[], providers: Record<string, any>): Stats[] => {
  return data.map((d, idx) => {
    return {
      label: d.name as string,
      value: d.anomalousCost,
      count: d.count,
      trend: 0,
      legendColor: CE_COLOR_CONST[idx % CE_COLOR_CONST.length],
      linkId: providers[map[d.name as string]]
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

  const cloudProviderChartData = useMemo(
    () => transformCloudCost(cloudProvidersWiseData, allDefaultProviders),
    [cloudProvidersWiseData]
  )

  const perspectiveWiseChartData = useMemo(
    () => transformCloudCost(perspectiveAnomaliesData, allDefaultProviders),
    [perspectiveAnomaliesData]
  )

  const statusWiseChartData = useMemo(() => transformCloudCost(statusWiseData, allDefaultProviders), [statusWiseData])

  return (
    <Layout.Horizontal spacing="medium">
      <Layout.Vertical spacing="small">
        <Card className={css.countCard}>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.anomalyDetection.summary.totalCountText')}
          </Text>
          <Text color={Color.RED_600} font={{ variation: FontVariation.H4 }}>
            {costData?.count}
          </Text>
        </Card>
        <Card className={css.costCard}>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.anomalyDetection.summary.costImpacted')}
          </Text>
          <Text color={Color.RED_500} font={{ variation: FontVariation.H4 }}>
            {formatCost(costData?.anomalousCost || 0)}
          </Text>
        </Card>
      </Layout.Vertical>
      <Container className={css.summaryCharts}>
        <HorizontalLayout
          title={getString('ce.anomalyDetection.summary.perspectiveWise')}
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
