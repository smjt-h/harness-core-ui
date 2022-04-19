import React, { useCallback, useMemo } from 'react'
import { Container, Icon, NoDataCard, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost'
import { useStrings } from 'framework/strings'
import type { LogAnalysisRadarChartProps } from './LogAnalysisRadarChart.types'
import MultiRangeSlider from './MinMaxSlider'
import getLogAnalysisSpiderChartOptions, { getRadarChartSeries } from './LogAnalysisRadarChart.utils'
import styles from '../LogAnalysis.module.scss'

Boost(Highcharts)

const LogAnalysisRadarChart: React.FC<LogAnalysisRadarChartProps> = ({
  clusterChartLoading,
  clusterChartData,
  handleAngleChange,
  filteredAngle,
  onRadarPointClick
}) => {
  const radarChartSeries = getRadarChartSeries(clusterChartData?.resource || [])

  const filteredSeries = useMemo(
    () =>
      radarChartSeries?.filter(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data => data?.data[0].x >= filteredAngle.min && data?.data[0].x <= filteredAngle.max
      ),
    [filteredAngle, radarChartSeries]
  )

  const { getString } = useStrings()

  const handleRadarPointClick = useCallback((pointClusterId: string) => {
    onRadarPointClick(pointClusterId)
  }, [])

  if (clusterChartLoading) {
    return (
      <Container className={styles.loading} data-testid="RadarChart_loading">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  } else if (!clusterChartData?.resource?.length) {
    return (
      <Container className={styles.noData} data-testid="RadarChart_noData">
        <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
      </Container>
    )
  } else {
    return (
      <>
        <HighchartsReact
          highcharts={Highcharts}
          options={getLogAnalysisSpiderChartOptions(filteredSeries, filteredAngle, handleRadarPointClick)}
        />
        <MultiRangeSlider min={0} max={360} step={30} onChange={handleAngleChange} />
        <Layout.Horizontal>
          <Icon margin={{ right: 'small' }} name="main-issue" color={Color.PRIMARY_7} />
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
            {getString('cv.logs.radarChartInfo')}
          </Text>
        </Layout.Horizontal>
      </>
    )
  }
}

export default React.memo(LogAnalysisRadarChart)
