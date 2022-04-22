/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Container } from '@harness/uicore'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import AnomaliesCard from '@cv/pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import { calculateStartAndEndTimes } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { SLOTargetChart } from '../components/SLOTargetChart/SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '../components/SLOTargetChart/SLOTargetChart.utils'
import { SLOTargetChartWithChangeTimelineProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import { getSLOAndErrorBudgetGraphOptions, getTimeFormatForAnomaliesCard } from '../CVSLOListingPage.utils'
import css from '../CVSLOsListingPage.module.scss'

const SLOTargetChartWithChangeTimeline: React.FC<SLOTargetChartWithChangeTimelineProps> = ({
  type,
  isCardView,
  sliderTimeRange,
  setSliderTimeRange,
  serviceLevelObjective
}) => {
  const {
    sloPerformanceTrend,
    errorBudgetBurndown,
    currentPeriodStartTime,
    monitoredServiceIdentifier,
    serviceIdentifier,
    environmentIdentifier
  } = serviceLevelObjective

  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  const startTime = currentPeriodStartTime
  const SLOEndTime = sloPerformanceTrend[sloPerformanceTrend.length - 1]?.timestamp
  const errorBudgetEndTime = errorBudgetBurndown[errorBudgetBurndown.length - 1]?.timestamp
  const endTime = (type === SLOCardToggleViews.SLO ? SLOEndTime : errorBudgetEndTime) ?? startTime
  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)

  const onFocusTimeRange = useCallback(
    (_startTime: number, _endTime: number) => {
      setSliderTimeRange?.({ startTime: _startTime, endTime: _endTime })
    },
    [setSliderTimeRange]
  )

  const onSliderDragEnd = useCallback(
    ({ startXPercentage, endXPercentage }) => {
      const startAndEndTime = calculateStartAndEndTimes(startXPercentage, endXPercentage, [startTime, endTime])
      /* istanbul ignore else */ if (startAndEndTime) {
        onFocusTimeRange(startAndEndTime[0], startAndEndTime[1])
      }
    },
    [onFocusTimeRange, startTime, endTime]
  )

  const resetSlider = useCallback(() => {
    setSliderTimeRange?.()
    setShowTimelineSlider(false)
  }, [setSliderTimeRange])

  const { dataPoints, minXLimit, maxXLimit } = useMemo(
    () => getDataPointsWithMinMaxXLimit(type === SLOCardToggleViews.SLO ? sloPerformanceTrend : errorBudgetBurndown),
    [type, sloPerformanceTrend, errorBudgetBurndown]
  )

  return (
    <Container
      style={{ position: 'relative' }}
      className={css.flexGrowOne}
      onClick={() => setShowTimelineSlider(true)}
      data-testid="timeline-slider-container"
    >
      <Container padding={{ left: isCardView ? 'huge' : 'none' }}>
        <SLOTargetChart
          dataPoints={dataPoints}
          customChartOptions={getSLOAndErrorBudgetGraphOptions({
            type,
            isCardView,
            startTime,
            endTime,
            minXLimit,
            maxXLimit,
            serviceLevelObjective
          })}
        />
      </Container>
      {isCardView && (
        <TimelineSlider
          minSliderWidth={75}
          maxSliderWidth={300}
          initialSliderWidth={75}
          leftContainerOffset={85}
          resetFocus={resetSlider}
          hideSlider={!showTimelineSlider}
          className={css.timelineSlider}
          infoCard={
            <AnomaliesCard
              showOnlyChanges
              timeFormat={getTimeFormatForAnomaliesCard(sliderTimeRange)}
              timeRange={sliderTimeRange}
              changeTimelineSummary={changeTimelineSummary ?? []}
              monitoredServiceIdentifier={monitoredServiceIdentifier}
              serviceIdentifier={serviceIdentifier}
              environmentIdentifier={environmentIdentifier}
            />
          }
          onSliderDragEnd={onSliderDragEnd}
        />
      )}
      <ChangeTimeline
        selectedTimeRange={{ startTime, endTime }}
        startTime={sliderTimeRange?.startTime}
        endTime={sliderTimeRange?.endTime}
        hideTimeline={!isCardView}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        onSliderMoved={setChangeTimelineSummary}
      />
    </Container>
  )
}

export default SLOTargetChartWithChangeTimeline
