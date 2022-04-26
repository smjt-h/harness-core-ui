import React, {useState} from 'react'
import {Button, ButtonSize, ButtonVariation, Container, Layout, Text, TextInput} from '@harness/uicore'
import cx from 'classnames'
import {Color, FontVariation} from '@harness/design-system'
import {NumericInput} from "@blueprintjs/core";
import {DropDown} from "@wings-software/uicore";
import {parseInt} from "lodash-es";
import { loadStripe } from "@stripe/stripe-js";
import type {PlanType} from '@common/components/CostCalculator/CostCalculatorUtils'
import type {Editions} from '@common/constants/SubscriptionTypes'
import {useStrings} from "framework/strings";
import css from '@common/components/CostCalculator/CostCalculator.module.scss'
import {Elements} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_live_51IykZ0Iqk5P9Eha39LKDxAE4molfPO3dN5ucM9MqiIBIohtP9F80QNOqxT2YUej1d4N6J6hfCK4uUEmoCQx2tkQ300TajVoKTt');

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


// const JustStripeData = () => {
//
//   const CL = 'pk_test_51IykZ0Iqk5P9Eha3uhZUAnFuUWzaLLSa2elWpGBCF7uGpDU5rOcuX8PQew7hI947J9Lefh4qmQniY11HyXcUyBXD00aayEoMmU';
//   const options = {
//     // passing the client secret obtained from the server
//     clientSecret: CL,
//   };
//
//   return (
//       <Elements stripe={stripePromise} options={options}>
//         <CheckoutForm />
//       </Elements>
//   );
//
//
//
// }



const CreditCardDetails = () => {

  const getStrings = useStrings();

  const monthRanges = [1,2,3,4,5,6,7,8,9,10,11,12];
  const currentYear : number = (new Date()).getFullYear();
  const yearRanges = monthRanges.map(x => currentYear + x - 1);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expMonth, setExpMonth] = useState<number>(monthRanges[0]);
  const [expYear, setExpYear] = useState<number>(yearRanges[0]);
  const [cvv,setCvv] = useState<number>();




  return (
      <Layout.Vertical>
        <Layout.Vertical>
          <Text font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
            Email
          </Text>
          <TextInput value={email} onChange={emailProvided => setEmail(emailProvided as string)} name={'cardEmail'}/>
        </Layout.Vertical>

        <Layout.Vertical>
          <Text icon={'info'} iconProps={{color: Color.PRIMARY_7, width: 10, height: 10}} font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
            This card will be in charge of all future Harness transactions.
          </Text>
        </Layout.Vertical>

        <Layout.Vertical>
          <Text font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
            Name on card
          </Text>
          <TextInput value={name} onChange={nameProvided => setName(nameProvided as string)} name={'cardName'} placeholder={'First name / Last name'}/>
        </Layout.Vertical>

        <Layout.Vertical>
          <Text font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
            Card Number
          </Text>
          <NumericInput value={cardNumber}  onValueChange={(_cvvProvided, value) => setCardNumber(value)} buttonPosition={'none'}/>
          <TextInput value={name} onChange={nameProvided => setName(nameProvided as string)} name={'cardName'}/>
        </Layout.Vertical>
        <Layout.Horizontal>
          <Layout.Vertical>
            <Text font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
              Expiration Date
            </Text>
            <Layout.Horizontal>
              <DropDown value={`${expMonth}`} onChange={ optionSelected => setExpMonth(parseInt(optionSelected.value as string,10))} items={monthRanges.map(mon => { return {label: `${mon}`, value: `${mon}`};})} />
              <DropDown value={`${expYear}`} onChange={ optionSelected => setExpYear(parseInt(optionSelected.value as string,10))} items={yearRanges.map(probableYears => { return {label: `${probableYears}`, value: `${probableYears}`};})} />
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Vertical>
            <Text rightIcon={'info'} rightIconProps={{color: Color.PRIMARY_7, width: 10, height: 10}} font={{variation: FontVariation.SMALL_SEMI}} color={Color.GREY_600}>
              CVV
            </Text>
            <NumericInput value={cvv} min={0} max={999} onValueChange={(cvvProvided) => setCvv(cvvProvided)} buttonPosition={'none'}/>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Button intent={'primary'} variation={ButtonVariation.PRIMARY} size={ButtonSize.MEDIUM}>
          Add a card
        </Button>
      </Layout.Vertical>

  );
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
  const reviewTitle = `Feature Flag Subscription`

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
