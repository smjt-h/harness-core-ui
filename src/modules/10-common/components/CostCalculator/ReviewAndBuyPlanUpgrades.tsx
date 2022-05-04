/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement } from '@stripe/react-stripe-js'
import type { PlanType } from '@common/components/CostCalculator/CostCalculatorUtils'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { GetEditionBox } from '@common/components/CostCalculator/CostCalculator'
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
  clientSecret: string
  backButtonClick: () => void
}

const stripePromise = loadStripe(
  'pk_live_51IykZ0Iqk5P9Eha39LKDxAE4molfPO3dN5ucM9MqiIBIohtP9F80QNOqxT2YUej1d4N6J6hfCK4uUEmoCQx2tkQ300TajVoKTt'
)

interface JustStripeDataParams {
  clientSecret: string
}

const JustStripeData = ({ clientSecret }: JustStripeDataParams) => {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <form>
        <PaymentElement />
        <button>Submit</button>
      </form>
    </Elements>
  )
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
  clientSecret,
  backButtonClick
}: ReviewPageParams) => {
  const reviewTitle = `Feature Flag Subscription`

  return (
      <Container className={css.subscriptionReviewContainer}>
    <Layout.Vertical flex={{ justifyContent: 'left', alignItems: 'stretch' }}>
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
            <Layout.Horizontal className={cx(css.currentPlanContainer, css.pillboxgap)}>
              <Text font={{ variation: FontVariation.H4 }}>{`Current Plan`}</Text>
              <GetEditionBox editionType={previousEdition} />
              {previousPlan && <GetEditionBox editionType={previousPlan} />}
            </Layout.Horizontal>
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
            <Layout.Horizontal className={cx(css.changingText, css.pillboxgap)}>
              <Text font={{ variation: FontVariation.H4 }}>{`New plan`}</Text>
              <GetEditionBox editionType={newEdition} />
              <GetEditionBox editionType={newPlan} />
            </Layout.Horizontal>

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
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
        <Layout.Vertical className={cx(css.paymentBox)}>
          {/*<Text font={{ variation: FontVariation.H4 }} className={cx(css.textwrap)}>*/}
          {/*  Payment Methods*/}
          {/*</Text>*/}
          {/*<Text font={{ size: 'medium' }}>Charge the credit card on file</Text>*/}
          {/*<Layout.Horizontal>*/}
          {/*  <Text font={{ variation: FontVariation.BLOCKQUOTE }} background={Color.PRIMARY_6} color={Color.WHITE}>*/}
          {/*    visa*/}
          {/*  </Text>*/}
          {/*  <Text font={{ size: 'medium' }}>****1423</Text>*/}
          {/*</Layout.Horizontal>*/}

          {/*<div style={{ height: '100%' }} />*/}
          {/*<Button variation={ButtonVariation.PRIMARY}>Make a Payment</Button>*/}
          <JustStripeData clientSecret={clientSecret} />
        </Layout.Vertical>
        <Layout.Vertical className={cx(css.backButtonBox)} flex={{alignItems: "flex-start", justifyContent: 'left'}}>
          <Button variation={ButtonVariation.SECONDARY} onClick={backButtonClick}>
            Back
          </Button>
        </Layout.Vertical>

      </Container>
  )
}
