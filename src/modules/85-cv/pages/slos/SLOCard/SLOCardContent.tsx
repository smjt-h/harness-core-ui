/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Container, Heading, PillToggle, PillToggleProps, Text, Card } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { getErrorBudgetGaugeOptions } from '../CVSLOListingPage.utils'
import { SLOCardContentProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import ErrorBudgetGauge from './ErrorBudgetGauge'
import SLOTargetChartWithChangeTimeline from './SLOTargetChartWithChangeTimeline'
import css from '../CVSLOsListingPage.module.scss'

const SLOCardContent: React.FC<SLOCardContentProps> = props => {
  const { getString } = useStrings()
  const { isCardView, serviceLevelObjective, setSliderTimeRange } = props
  const { sloPerformanceTrend, sloTargetPercentage } = serviceLevelObjective

  const [toggle, setToggle] = useState(SLOCardToggleViews.SLO)

  const toggleProps: PillToggleProps<SLOCardToggleViews> = {
    options: [
      {
        label: getString('cv.SLO'),
        value: SLOCardToggleViews.SLO
      },
      {
        label: getString('cv.errorBudget'),
        value: SLOCardToggleViews.ERROR_BUDGET
      }
    ],
    onChange: view => {
      setToggle(view)
      setSliderTimeRange?.()
    },
    selectedView: toggle,
    className: css.pillToggle
  }

  const SLOAndErrorBudgetChartContainer = isCardView ? Card : Container
  const stylesSLOAndSLICard = isCardView ? css.cardSloAndSliForCardView : css.cardSloAndSli
  const headingVariation = isCardView ? FontVariation.SMALL_BOLD : FontVariation.FORM_LABEL

  return (
    <Layout.Vertical
      spacing="large"
      margin={{ top: 'medium' }}
      padding={{ top: 'medium' }}
      border={{ color: isCardView ? Color.WHITE : Color.GREY_100, top: true }}
    >
      <Container flex={{ justifyContent: 'center' }}>
        <PillToggle {...toggleProps} />
      </Container>

      <SLOAndErrorBudgetChartContainer style={{ position: 'relative' }}>
        {toggle === SLOCardToggleViews.SLO && (
          <>
            <Container flex>
              <Heading level={2} font={{ variation: headingVariation }} data-tooltip-id={'SLOPerformanceTrend'}>
                {getString('cv.SLOPerformanceTrend')}
              </Heading>
              {serviceLevelObjective.recalculatingSLI && (
                <PageSpinner className={css.sloCardSpinner} message={getString('cv.sloRecalculationInProgress')} />
              )}
            </Container>
            <Layout.Horizontal spacing="medium">
              <Layout.Vertical spacing="medium" margin={{ top: 'large' }}>
                <Container background={Color.GREY_100} className={stylesSLOAndSLICard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'SLO' }}>
                    {getString('cv.SLO')}
                  </Text>
                  <Heading level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {(Number(sloTargetPercentage) || 0).toFixed(2)}%
                  </Heading>
                </Container>
                <Container background={Color.GREY_100} className={stylesSLOAndSLICard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'SLI' }}>
                    {getString('cv.slos.sli')}
                  </Text>
                  <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {sloPerformanceTrend[sloPerformanceTrend.length - 1]?.value?.toFixed(2) ?? 0}%
                  </Heading>
                </Container>
              </Layout.Vertical>
              <SLOTargetChartWithChangeTimeline {...props} type={SLOCardToggleViews.SLO} />
            </Layout.Horizontal>
          </>
        )}
        {toggle === SLOCardToggleViews.ERROR_BUDGET && (
          <Layout.Horizontal spacing="medium">
            {serviceLevelObjective.recalculatingSLI && (
              <PageSpinner
                className={css.sloCardSpinner}
                message={getString('cv.errorBudgetRecalculationInProgress')}
              />
            )}
            <Container height={200} className={css.errorBudgetGaugeContainer}>
              <Heading font={{ variation: headingVariation }} data-tooltip-id={'errorBudgetRemaining'}>
                {getString('cv.errorBudgetRemainingWithMins')}
              </Heading>
              <ErrorBudgetGauge customChartOptions={getErrorBudgetGaugeOptions(serviceLevelObjective)} />
              <Text font={{ variation: FontVariation.SMALL }} className={css.errorBudgetRemaining} width={175}>
                {serviceLevelObjective.errorBudgetRemaining}
                <span style={{ display: 'block' }}>{getString('cv.minutesRemaining')}</span>
              </Text>
            </Container>
            <Container className={css.flexGrowOne}>
              <Heading font={{ variation: headingVariation }} data-tooltip-id={'errorBudgetBurnDown'}>
                {getString('cv.errorBudgetBurnDown')}
              </Heading>
              <SLOTargetChartWithChangeTimeline {...props} type={SLOCardToggleViews.ERROR_BUDGET} />
            </Container>
          </Layout.Horizontal>
        )}
      </SLOAndErrorBudgetChartContainer>
    </Layout.Vertical>
  )
}

export default SLOCardContent
