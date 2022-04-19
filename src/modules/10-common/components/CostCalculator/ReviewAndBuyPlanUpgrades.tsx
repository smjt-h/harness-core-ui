import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import type { Editions } from '@common/constants/SubscriptionTypes'
import type { PlanType } from '@common/components/CostCalculator/CostCalculatorUtils'
import css from '@common/components/CostCalculator/CostCalculator.module.scss'

interface ReviewPageParams {
  previousEdition: Editions
  previousPlan?: PlanType
  newEdition: Editions
  newPlan: PlanType
  previousDevelopers: number
  previousMau: number
  newDevelopers: number
  developerCost: number
  newMau: number
  mauCost: number
  supportCost: number
  total: number
  backButtonClick: () => void
}

export const ReviewPage = ({
  previousEdition,
  previousPlan,
  newEdition,
  newPlan,
  previousDevelopers,
  previousMau,
  newDevelopers,
  developerCost,
  newMau,
  mauCost,
  supportCost,
  total,
  backButtonClick
}: ReviewPageParams) => {
  const reviewTitle = `Feature Flag ${newEdition} Subscription`

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Text
        icon={'ff-solid'}
        iconProps={{ size: 24 }}
        font={{ variation: FontVariation.H3 }}
        className={cx(css.textwrap)}
      >
        {reviewTitle}
      </Text>
      <Layout.Horizontal>
        <Layout.Vertical>
          <Container className={cx(css.reviewContainer)}>
            <Text font={{ variation: FontVariation.H4 }} className={cx(css.currentPlanContainer)}>
              {`Current Plan (${previousEdition},${previousPlan})`}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.currentDeveloperPlan, css.reviewText)}>
              Developers
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.currentDeveloperPlan, css.reviewItems)}>
              {previousDevelopers}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.currentMauPlan, css.reviewText)}>
              MAUs
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.currentMauPlan, css.reviewItems)}>
              {previousMau}
            </Text>
            <Text font={{ variation: FontVariation.H4 }} className={cx(css.changingText)}>
              {`Changing to ${newEdition},${newPlan}`}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.changedDevelopers, css.reviewText)}>
              Developers
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.changedDevelopers, css.reviewItems)}>
              {newDevelopers}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.developerUnitPrice, css.reviewText)}>
              Unit price
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.developerUnitPrice, css.reviewItems)}>
              {developerCost / newDevelopers}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.changedMaus, css.reviewText)}>
              MAUs
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.changedMaus, css.reviewItems)}>
              {newMau}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.mauUnitPrice, css.reviewText)}>
              Unit price
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.mauUnitPrice, css.reviewItems)}>
              {mauCost / newMau}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.premiumSupport, css.reviewText)}>
              Support
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.premiumSupport, css.reviewItems)}>
              {supportCost}
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.tax, css.reviewText)}>
              Tax
            </Text>
            <Text font={{ size: 'medium' }} className={cx(css.tax, css.reviewItems)}>
              {supportCost}
            </Text>
            <Text font={{ size: 'medium', weight: 'bold' }} className={cx(css.newRate, css.reviewText)}>
              New total
            </Text>
            <Text font={{ size: 'medium', weight: 'bold' }} className={cx(css.newRate, css.reviewItems)}>
              {total}
            </Text>
          </Container>

          <Button variation={ButtonVariation.SECONDARY} onClick={backButtonClick}>
            Back
          </Button>
        </Layout.Vertical>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.H4 }} className={cx(css.textwrap)}>
            Payment Methods
          </Text>
          <Text font={{ size: 'medium' }}>Charge the credit card on file</Text>
          <Layout.Horizontal>
            <Text font={{ variation: FontVariation.BLOCKQUOTE }} background={Color.PRIMARY_6} color={Color.WHITE}>
              visa
            </Text>
            <Text font={{ size: 'medium' }}>****1423</Text>
          </Layout.Horizontal>

          <div style={{ height: '100%' }} />
          <Button variation={ButtonVariation.PRIMARY}>Make a Payment</Button>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
