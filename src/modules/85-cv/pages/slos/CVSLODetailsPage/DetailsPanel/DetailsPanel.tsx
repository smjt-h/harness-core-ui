/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Card, Color, Container, FontVariation, Heading, Page, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import ChangesSourceCard from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesSourceCard/ChangesSourceCard'
import ChangesTable from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ServiceDetails from './views/ServiceDetails'
import type { DetailsPanelProps } from './DetailsPanel.types'
import SLOCardContent from '../../SLOCard/SLOCardContent'
import css from './DetailsPanel.module.scss'

const DetailsPanel: React.FC<DetailsPanelProps> = ({ loading, errorMessage, retryOnError, sloDashboardWidget }) => {
  const { getString } = useStrings()
  const [sliderTimeRange, setSliderTimeRange] = useState<{ startTime: number; endTime: number }>()

  const { currentPeriodStartTime = 0, currentPeriodEndTime = 0 } = sloDashboardWidget ?? {}
  const { startTime, endTime } = sliderTimeRange ?? { startTime: currentPeriodStartTime, endTime: currentPeriodEndTime }

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

          <Card className={css.changesCard}>
            <Heading
              level={2}
              color={Color.GREY_800}
              padding={{ bottom: 'medium' }}
              font={{ variation: FontVariation.CARD_TITLE }}
            >
              {getString('changes')}
            </Heading>
            <ChangesSourceCard
              startTime={startTime}
              endTime={endTime}
              monitoredServiceIdentifier={sloDashboardWidget.monitoredServiceIdentifier}
            />
            <Text
              icon="info"
              color={Color.GREY_600}
              iconProps={{ size: 12, color: Color.PRIMARY_7 }}
              font={{ variation: FontVariation.SMALL }}
              padding={{ top: 'small', bottom: 'small' }}
            >
              {getString('cv.theTrendIsDeterminedForTheSelectedPeriodOverPeriod')}
            </Text>
            <ChangesTable
              isCardView={false}
              hasChangeSource
              startTime={startTime}
              endTime={endTime}
              monitoredServiceIdentifier={sloDashboardWidget.monitoredServiceIdentifier}
            />
          </Card>
        </Container>
      )}
    </Page.Body>
  )
}

export default DetailsPanel
