/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Page } from '@harness/uicore'
import ChangesTable from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ServiceDetails from './views/ServiceDetails'
import type { DetailsPanelProps } from './DetailsPanel.types'
import SLOCardContent from '../../SLOCard/SLOCardContent'
import css from './DetailsPanel.module.scss'

const DetailsPanel: React.FC<DetailsPanelProps> = ({ loading, errorMessage, retryOnError, sloDashboardWidget }) => {
  const [sliderTimeRange, setSliderTimeRange] = useState<{ startTime: number; endTime: number }>()

  const { startTime, endTime } = sliderTimeRange ?? { startTime: 0, endTime: 0 }

  return (
    <Page.Body
      loading={loading}
      error={errorMessage}
      retryOnError={retryOnError}
      noData={{
        when: () => !sloDashboardWidget
      }}
      className={css.pageBody}
    >
      {sloDashboardWidget && (
        <Container padding="xlarge">
          <ServiceDetails sloDashboardWidget={sloDashboardWidget} />
          <SLOCardContent
            isCardView
            sliderTimeRange={sliderTimeRange}
            setSliderTimeRange={setSliderTimeRange}
            serviceLevelObjective={sloDashboardWidget}
          />
          <Container padding={{ bottom: 'xlarge' }} />
          <ChangesTable
            hasChangeSource
            startTime={startTime || sloDashboardWidget.currentPeriodStartTime}
            endTime={endTime || sloDashboardWidget.currentPeriodEndTime}
            monitoredServiceIdentifier={sloDashboardWidget.monitoredServiceIdentifier}
          />
        </Container>
      )}
    </Page.Body>
  )
}

export default DetailsPanel
