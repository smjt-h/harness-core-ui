/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, FontVariation, Heading, Icon, PageError } from '@harness/uicore'
import { useGetSLODetails } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SLOTargetChart } from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart.utils'
import { getSLOAndErrorBudgetGraphOptions } from '@cv/pages/slos/CVSLOListingPage.utils'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import { SLOCardToggleViews, SLOTargetChartWrapperProps } from './SLOAndErrorBudget.types'
import css from './SLOAndErrorBudget.module.scss'

const SLOTargetChartWrapper: React.FC<SLOTargetChartWrapperProps> = ({ type, selectedSLO, startTime, endTime }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { data, loading, error, refetch } = useGetSLODetails({
    identifier: selectedSLO.identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      startTime,
      endTime
    }
  })

  const serviceLevelObjective = data?.data?.sloDashboardWidget

  const { sloPerformanceTrend = [], errorBudgetBurndown = [] } = serviceLevelObjective ?? {}

  const { dataPoints, minXLimit, maxXLimit } = useMemo(
    () => getDataPointsWithMinMaxXLimit(type === SLOCardToggleViews.SLO ? sloPerformanceTrend : errorBudgetBurndown),
    [type, sloPerformanceTrend, errorBudgetBurndown]
  )

  return (
    <Container height={250}>
      <Heading level={2} font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
        {selectedSLO.title}
      </Heading>
      {loading && (
        <Container height="100%" flex={{ justifyContent: 'center' }}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )}
      {!loading && error && <PageError message={getErrorMessage(error)} onClick={() => refetch()} />}
      {!loading && !error && serviceLevelObjective && (
        <>
          <SLOTargetChart
            dataPoints={dataPoints}
            customChartOptions={getSLOAndErrorBudgetGraphOptions({
              isCardView: true,
              type,
              startTime,
              endTime,
              minXLimit,
              maxXLimit,
              serviceLevelObjective
            })}
          />
          <TimelineBar startDate={startTime} endDate={endTime} columnWidth={50} className={css.timelineBar} />
        </>
      )}
    </Container>
  )
}

export default SLOTargetChartWrapper
