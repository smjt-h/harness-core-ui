/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Heading, Card, NoDataCard, Button, ButtonVariation } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import { useStrings } from 'framework/strings'
import LogAnalysis from '@cv/components/LogsAnalysis/LogAnalysis'
import { useLogContentHook } from '@cv/hooks/useLogContentHook/useLogContentHook'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import type { MetricsAndLogsProps } from './MetricsAndLogs.types'
import MetricsAnalysisContainer from './components/MetricsAnalysisContainer/MetricsAnalysisContainer'
import css from './MetricsAndLogs.module.scss'

const MetricsAndLogs: React.FC<MetricsAndLogsProps> = props => {
  const { getString } = useStrings()

  const { startTime, endTime, showTimelineSlider } = props

  const { openLogContentHook } = useLogContentHook({
    monitoredServiceStartTime: startTime,
    monitoredServiceEndTime: endTime,
    serviceName: props.serviceIdentifier,
    envName: props.environmentIdentifier,
    monitoredServiceIdentifier: props.monitoredServiceIdentifier,
    showTimelineSlider
  })

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Card className={css.header}>
        <Heading level={2} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'small' }}>
          {getString('cv.monitoredServices.serviceHealth.metricsAndLogs')}
        </Heading>
        <Layout.Horizontal>
          <Button
            icon="api-docs"
            withoutCurrentColor
            iconProps={{ color: Color.BLACK, size: 20 }}
            text={getString('cv.externalAPICalls')}
            variation={ButtonVariation.LINK}
            onClick={() => openLogContentHook(LogTypes.ApiCallLog)}
          />
          <Button
            icon="audit-trail"
            withoutCurrentColor
            iconProps={{ size: 20 }}
            text={getString('cv.executionLogs')}
            variation={ButtonVariation.LINK}
            onClick={() => openLogContentHook(LogTypes.ExecutionLog)}
          />
        </Layout.Horizontal>
      </Card>
      {startTime && endTime ? (
        <Layout.Horizontal data-testid="analysis-view" spacing="medium">
          <Card className={css.metricsAndLogsCard}>
            <MetricsAnalysisContainer {...props} startTime={startTime} endTime={endTime} />
          </Card>
          <Card className={css.metricsAndLogsCard}>
            <LogAnalysis {...props} startTime={startTime} endTime={endTime} />
          </Card>
        </Layout.Horizontal>
      ) : (
        <Card className={css.noServiceImageCard} data-testid="analysis-image-view">
          <NoDataCard
            image={noServiceAvailableImage}
            message={getString('cv.monitoredServices.serviceHealth.selectTimeline')}
            containerClassName={css.noDataCardContainer}
            className={css.noDataCard}
            imageClassName={css.noServiceImage}
          />
        </Card>
      )}
    </Container>
  )
}

export default MetricsAndLogs
