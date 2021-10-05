import { highRiskColor, lowRiskColor, mediumRiskColor, noAnalysisColor } from '@common/components/HeatMap/ColorUtils'
import type { ColumnData } from '@cv/components/ColumnChart/ColumnChart.types'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { RiskData } from 'services/cv'

export const mapRiskStatusToColor = (riskStatus: string): string => {
  switch (riskStatus) {
    case RiskValues.LOW:
      return lowRiskColor
    case RiskValues.MEDIUM:
      return mediumRiskColor
    case RiskValues.HIGH:
      return highRiskColor
    default:
      return noAnalysisColor
  }
}

export const getSeriesData = (healthScoreData: RiskData[]): ColumnData[] => {
  const areAllPointsNoData = checkIfAllPointsNoData(healthScoreData)
  const columnData: ColumnData[] = []
  for (const datum of healthScoreData) {
    if (
      !datum?.timeRangeParams ||
      !datum.timeRangeParams.startTime ||
      !datum.timeRangeParams.endTime ||
      !datum.riskStatus
    ) {
      continue
    }
    let healthScoreDataPoint = {
      height: datum.healthScore || 0,
      color: mapRiskStatusToColor(datum.riskStatus as string),
      timeRange: {
        startTime: datum.timeRangeParams.startTime * 1000,
        endTime: datum.timeRangeParams.endTime * 1000
      },
      riskStatus: datum.riskStatus,
      healthScore: datum.healthScore
    }

    if (datum.healthScore === 0) {
      healthScoreDataPoint = { ...healthScoreDataPoint, height: 5 }
    } else if (areAllPointsNoData && datum.riskStatus === RiskValues.NO_DATA) {
      healthScoreDataPoint = { ...healthScoreDataPoint, height: 0 }
    } else if (datum.riskStatus === RiskValues.NO_DATA || isHealthScoreLessThanEqualTo(datum, 8)) {
      healthScoreDataPoint = { ...healthScoreDataPoint, height: 8 }
    }
    columnData.push(healthScoreDataPoint)
  }

  return columnData
}

function checkIfAllPointsNoData(healthScoreData: RiskData[]): boolean {
  return healthScoreData.every(el => el.riskStatus === RiskValues.NO_DATA)
}

function isHealthScoreLessThanEqualTo(el: RiskData, num: number): boolean {
  return !!(el.healthScore && el.healthScore <= num)
}
