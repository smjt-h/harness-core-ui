import React, {useState} from 'react'
import {Color, FontVariation} from '@harness/design-system'
import {Button, ButtonSize, Layout, PillToggle, Text} from '@harness/uicore'
import cx from 'classnames'
import {Classes, Dialog, IDialogProps, NumericInput, Slider} from '@blueprintjs/core'
import {useModalHook} from '@harness/use-modal'
import {ButtonVariation, Container} from '@wings-software/uicore'
import {Editions} from '@common/constants/SubscriptionTypes'
import {calculateCostTotal, PlanType} from "@common/components/CostCalculator/CostCalculatorUtils";
import recommendedIcon from './images/recommendedbig.png'
import usageIcon from './images/usagebig.png'
import plannedUsageIcon from './images/currentbig.png'
import css from './CostCalculator.module.scss'
import {ReviewPage} from "@common/components/CostCalculator/ReviewAndBuyPlanUpgrades";

interface InfoBoxParams {
  title: string
  planned?: number
  units?: string
  recommended: number
  using: number
};

const InfoBox = ({ title, units, using, recommended, planned }: InfoBoxParams) => {
  const newUnits = units ? units : '';


  return (
    <Layout.Vertical
      padding={{ top: 'medium', bottom: 'medium', left: 'xlarge', right: 'xlarge' }}
      className={cx(css.infocard)}
    >
      <Text
        font={{ variation: FontVariation.H4 }}
        className={cx(css.textwrap)}
        padding={{ bottom: 'medium' }}
        color={Color.GREY_600}
      >
        {title}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'space-around' }} padding={{ bottom: 'xxlarge' }}>
        {planned && (
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.SMALL }}>Current</Text>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              className={cx(css.infocardItemIcongap)}
            >
              <img src={plannedUsageIcon} height={'10px'} width={'10px'} />
              <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
                {planned + newUnits}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.SMALL }}>Usage</Text>
          <Layout.Horizontal
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            className={cx(css.infocardItemIcongap)}
          >
            <img src={usageIcon} height={'10px'} width={'10px'} />
            <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
              {using + newUnits}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.SMALL }} rightIcon={'info'}>Recommended</Text>
          <Layout.Horizontal
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            className={cx(css.infocardItemIcongap)}
          >
            <img src={recommendedIcon} height={'15px'} width={'12px'} />
            <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
              {recommended + newUnits}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}



interface CostSliderParams {
  title: string
  summary: string
  plannedUsage?: number
  currentUsage: number
  recommended: number
  currentSliderValue: number
  minVal: number
  maxVal: number
  tickSize: number
  labelTickSize: number
  onSliderChange: (newSlider: number) => void
  labelSuffix: string
  labelSummary: string
}

const CostSlider = (costSliderParms: CostSliderParams) => {
  const [thumbMoved, setThumbMoved] = useState<boolean>(false)

  return (
    <Layout.Vertical padding={{ top: 'xlarge' }}>
      <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ bottom: 'xxlarge' }}>
        <Text font={{ size: 'normal' }} color={Color.GREY_600}>
          {costSliderParms.title}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {costSliderParms.summary}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal>
        <NumericInput
            className={cx(css.textInputWidth)}
            value={costSliderParms.currentSliderValue}
            onValueChange={valueProvided => costSliderParms.onSliderChange(valueProvided)}
            // intent={errorText !== '' ?  'danger' : 'none'}
            buttonPosition={'none'}
            min={costSliderParms.minVal}
            max={costSliderParms.maxVal}
            minorStepSize={costSliderParms.tickSize}
            stepSize={costSliderParms.tickSize}
            majorStepSize={costSliderParms.labelTickSize}
        />
      </Layout.Horizontal>

      <Container className={css.topSliderDots}>
        {costSliderParms.plannedUsage &&
            <Container width={`${costSliderParms.plannedUsage * 100 / costSliderParms.maxVal}`} className={css.sliderDotContainer}>
          <img src={plannedUsageIcon} height={'10px'} width={'10px'} />
        </Container>
        }
        <Container width={`${costSliderParms.currentUsage * 100 / costSliderParms.maxVal}`} className={css.sliderDotContainer}>
          <img src={usageIcon} height={'10px'} width={'10px'} />
        </Container>
        <Container width={`${costSliderParms.recommended * 100 / costSliderParms.maxVal}`} className={css.sliderDotContainer}>
          <img src={recommendedIcon} height={'10px'} width={'10px'} />
        </Container>
      </Container>
      <Slider
        className={cx(css.bp3SliderHandle, css.bp3SliderLabel)}
        min={costSliderParms.minVal}
        max={costSliderParms.maxVal}
        stepSize={costSliderParms.tickSize}
        onChange={x => {
          costSliderParms.onSliderChange(x)
          setThumbMoved(true)
        }}
        onRelease={() => setThumbMoved(false)}
        labelStepSize={costSliderParms.labelTickSize}
        value={costSliderParms.currentSliderValue}
        labelRenderer={providedValue => {
          if (!thumbMoved) {
            return `${providedValue}`
          }
          if (
            providedValue === costSliderParms.minVal ||
            providedValue === costSliderParms.maxVal ||
            (providedValue - costSliderParms.minVal) % costSliderParms.labelTickSize === 0
          ) {
            return `${providedValue}${costSliderParms.labelSuffix}`
            // return     (
            //     <div style={{display: 'flex', flexDirection: 'column', height: '64px' ,width: '106px'}} >
            //     <Text font={{variation: FontVariation.SMALL_SEMI}} className={cx(css.labelItem)}>
            //     {`${providedValue}${costSliderParms.labelSuffix}`}
            // </Text>
            //     </div>
            // );
          }
          return `${providedValue}${costSliderParms.labelSuffix} \n ${costSliderParms.labelSummary}`
          // return (
          //     <div style={{display: 'flex', flexDirection: 'column', height: '64px' ,width: '106px'}} >
          //         <Text font={{variation: FontVariation.SMALL_SEMI}} className={cx(css.labelItem)}>
          //             {`${providedValue}${costSliderParms.labelSuffix}`}
          //         </Text>
          //         <Text font={{variation: FontVariation.SMALL_SEMI}} className={cx(css.labelItem)}>
          //             {costSliderParms.labelSummary}
          //         </Text>
          //     </div>
          // );
        }}
      />
    </Layout.Vertical>
  )
}

export enum Mode {
  BUY = 'BUY',
  CHECK_USAGE = 'CHECK_USAGE'
}

// const CostCalculatorDiv = () => {
//
//
//   return (
//       // margin={{top: '45px', left:'68px', bottom: '44px', right: '68px'}}
//       <div style={{ margin: '0 68px 44px 68px' }}>
//         <Layout.Horizontal id={'title'} flex={{ justifyContent: 'space-around' }} padding={{ bottom: 'xxlarge' }}>
//           <Text icon={'ff-solid'} iconProps={{size : 24}} font={{ variation: FontVariation.H3 }} className={cx(css.textwrap)}>
//             {title}
//           </Text>
//           <div style={{width: '100%'}}/>
//           <Text
//               font={{ variation: FontVariation.SMALL }}
//               className={cx(css.textwrap, css.linkDecoration)}
//               padding={{ right: 'large' }}
//           >
//             <a>Compare features</a>
//           </Text>
//           <PillToggle
//               onChange={editionClick => setEditionSelected(editionClick)}
//               options={[
//                 { label: 'Team', value: Editions.TEAM },
//                 {
//                   label: 'Enterprise',
//                   value: Editions.ENTERPRISE
//                 }
//               ]}
//               selectedView={editionSelected}
//           />
//         </Layout.Horizontal>
//         <Container>
//           <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ top: 'xsmall', bottom: 'xxlarge' }}>
//             <Layout.Vertical>
//               <InfoBox
//                   title={'Developer Seats'}
//                   recommended={developerRecommendedSeats}
//                   using={developerUsageSeats}
//                   planned={developerPlannedSeats}
//               />
//               <CostSlider
//                   title={'Developers'}
//                   summary={`1 developer = $ ${developerRate}/ ${monthYear}`}
//                   currentUsage={developerUsageSeats}
//                   recommended={developerRecommendedSeats}
//                   currentSliderValue={developerSelected}
//                   minVal={1}
//                   maxVal={50}
//                   tickSize={1}
//                   labelTickSize={49}
//                   onSliderChange={x => setDeveloperSelected(x)}
//                   labelSuffix={' developers'}
//                   labelSummary={`$ ${totalDeveloperRate}/ ${monthYear}`}
//               />
//             </Layout.Vertical>
//             <Layout.Vertical>
//               <InfoBox
//                   title={'MAUs Usage'}
//                   units={'k'}
//                   recommended={mauRecommendedSeats}
//                   using={mauUsageSeats}
//                   planned={mauPlannedSeats}
//               />
//               <CostSlider
//                   title={'MAUs Usage'}
//                   summary={`25k MAUs = $ ${mauRate}/ ${monthYear} `}
//                   currentUsage={mauUsageSeats}
//                   recommended={mauRecommendedSeats}
//                   currentSliderValue={mausSelected}
//                   minVal={0}
//                   maxVal={1000}
//                   tickSize={25}
//                   labelTickSize={250}
//                   onSliderChange={x => setMausSelected(x)}
//                   labelSuffix={'k MAUs'}
//                   labelSummary={`$ ${totalMauRate}/ ${monthYear}`}
//               />
//             </Layout.Vertical>
//           </Layout.Horizontal>
//         </Container>
//         <Layout.Horizontal padding={{ top: 'xxxlarge', bottom: 'xxxlarge' }} className={cx(css.pillboxgap)}>
//           <PillToggle
//               onChange={planFrequency => setPaymentFrequencySelected(planFrequency)}
//               options={[
//                 {
//                   label: 'Yearly',
//                   value: PlanType.YEARLY
//                 },
//                 { label: 'Monthly', value: PlanType.MONTHLY }
//               ]}
//               selectedView={paymentFrequencySelected}
//           />
//           {paymentFrequencySelected === PlanType.MONTHLY && (
//               <Text font={{ variation: FontVariation.SMALL }}>{`Save $ ${moneySavedYearly} paying yearly`}</Text>
//           )}
//         </Layout.Horizontal>
//         <Layout.Horizontal>
//           <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
//             <Layout.Vertical>
//               <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
//                 {'Developer Seats'}
//               </Text>
//               <Layout.Horizontal flex={{ alignItems: 'baseline' }} padding={{ top: 'small' }}>
//                 <Text font={{ size: 'medium' }} padding={{ bottom: 'xsmall' }}>
//                   {`⨉ $ ${developerRate}`}
//                 </Text>
//               </Layout.Horizontal>
//             </Layout.Vertical>
//             <Layout.Vertical
//                 flex={{ justifyContent: 'center' }}
//                 padding={{ left: 'small', right: 'small', top: 'small' }}
//             >
//               <Text font={{ size: 'medium' }}>{`+`}</Text>
//             </Layout.Vertical>
//           </Layout.Horizontal>
//           <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
//             <Layout.Vertical>
//               <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
//                 {'MAUs Usage'}
//               </Text>
//               <Layout.Horizontal flex={{ alignItems: 'baseline' }} padding={{ top: 'small' }}>
//                 <Text font={{ size: 'medium' }}>{`$ ${mauRate}`}</Text>
//               </Layout.Horizontal>
//             </Layout.Vertical>
//             <Layout.Vertical
//                 flex={{ justifyContent: 'center' }}
//                 padding={{ left: 'small', right: 'small', top: 'small' }}
//             >
//               <Text font={{ size: 'medium' }}>{`+`}</Text>
//             </Layout.Vertical>
//           </Layout.Horizontal>
//           <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
//             <Layout.Vertical>
//               <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
//                 {'Support'}
//               </Text>
//               <Layout.Horizontal flex={{ alignItems: 'baseline' }} className={cx(css.supportInfoBoxText)}>
//                 <Text font={{ size: 'medium' }}>{`$ ${supportCost}`}</Text>
//               </Layout.Horizontal>
//               <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }}>
//                 {'Premium 24x7 Change'}
//               </Text>
//             </Layout.Vertical>
//             <Layout.Vertical
//                 flex={{ justifyContent: 'center' }}
//                 padding={{ left: 'small', right: 'small', top: 'small' }}
//             >
//               <Text font={{ size: 'medium' }}>{`=`}</Text>
//             </Layout.Vertical>
//           </Layout.Horizontal>
//           <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
//             <Layout.Vertical>
//               <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
//                 {'Next Payment'}
//               </Text>
//               <Layout.Horizontal flex={{ alignItems: 'baseline' }} className={cx(css.nextPaymentPadding)}>
//                 <Text font={{ size: 'medium' }}>
//                   {`$ ${totalCost} per ${frequencyString(paymentFrequencySelected)} `}
//                 </Text>
//               </Layout.Horizontal>
//             </Layout.Vertical>
//           </Layout.Horizontal>
//           <div style={{width: '100%'}}/>
//           <Layout.Horizontal className={cx(css.pricingdisplayItem, css.duetodaybox)}>
//             <Layout.Vertical>
//               <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
//                 {'Due Today'}
//               </Text>
//               <Layout.Horizontal className={cx(css.dueTodayPadding)}>
//                 <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
//                   {`$ ${dueTodayCost}`}
//                 </Text>
//               </Layout.Horizontal>
//             </Layout.Vertical>
//           </Layout.Horizontal>
//         </Layout.Horizontal>
//         <Layout.Horizontal padding={{ top: 'xxlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
//           <Button text={'Review Changes'} variation={ButtonVariation.PRIMARY} size={ButtonSize.LARGE} />
//           <Layout.Horizontal padding={{ left: 'xlarge' }}>
//             <Text>Or</Text>
//             <Text padding={{ left: 'small' }} className={cx(css.linkDecoration)}>
//               <a>Contact Sales</a>
//             </Text>
//           </Layout.Horizontal>
//         </Layout.Horizontal>
//       </div>
//   )
// }

enum CalcPage {
  Calculator,
  Review
}

export const CostCalculator = ({ edition}: { edition: Editions }): JSX.Element => {
  // const currentPaymentFrequency = TIME_TYPE.MONTHLY;
  const frequencyString = (time: PlanType) => (time === PlanType.MONTHLY ? 'month' : 'year')
  const developerUsageSeats = 1
  const developerPlannedSeats = edition !== Editions.FREE ? 2 : undefined
  const developerRecommendedSeats = 3
  const developerCostYearly = 180
  const developerCostMonthly = Math.round(developerCostYearly / 12 / 0.8)

  const mauUsageSeats = 25
  const mauPlannedSeats = edition !== Editions.FREE ? 50 : undefined
  const mauRecommendedSeats = 75
  const mauCostYearly = 900
  const mauCostMonthly = Math.round(mauCostYearly / 12 / 0.8)

  const [paymentFrequencySelected, setPaymentFrequencySelected] = useState<PlanType>(PlanType.YEARLY)
  const [editionSelected, setEditionSelected] = useState<Editions>(Editions.TEAM)
  const [developerSelected, setDeveloperSelected] = useState<number>(developerRecommendedSeats)
  const [mausSelected, setMausSelected] = useState<number>(mauRecommendedSeats)
  const [shownPage, setShownPage] = useState<CalcPage>(CalcPage.Calculator);


  const currentDeveloperUsageCost = calculateCostTotal(
    developerUsageSeats,
    developerCostMonthly,
    developerPlannedSeats,
    0.2
  )
  const currentMauUsageCost = calculateCostTotal(mauUsageSeats, mauCostMonthly, mauPlannedSeats, 0.2)

  const developerRate = paymentFrequencySelected === PlanType.MONTHLY ? developerCostMonthly : developerCostYearly
  const mauRate = paymentFrequencySelected === PlanType.MONTHLY ? mauCostMonthly : mauCostYearly
  const totalDeveloperRate = developerRate * developerSelected
  const totalMauRate = mauRate * mausSelected
  const moneySavedYearly =
    paymentFrequencySelected === PlanType.MONTHLY
      ? developerSelected * (developerRate * 12 - developerCostYearly) + mausSelected * (mauRate * 12 - mauCostYearly)
      : 0
  const supportCost = 160
  const totalCost = totalDeveloperRate + totalMauRate + supportCost
  const dueTodayCost = edition !== Editions.FREE ? currentDeveloperUsageCost + currentMauUsageCost : totalCost

  const editionChecked = edition !== Editions.FREE ? edition : editionSelected
  const titleString = editionChecked === Editions.TEAM ? 'Team' : 'Enterprise'
  const title = `Feature Flag ${titleString} Subscription`
  const monthYear = frequencyString(paymentFrequencySelected)

  return (
    // margin={{top: '45px', left:'68px', bottom: '44px', right: '68px'}}
      <div>
        {shownPage === CalcPage.Calculator &&
            <div style={{margin: '0 68px 44px 68px'}}>
              <Layout.Horizontal id={'title'} flex={{justifyContent: 'space-around'}} padding={{bottom: 'xxlarge'}}>
                <Text icon={'ff-solid'} iconProps={{size: 24}} font={{variation: FontVariation.H3}}
                      className={cx(css.textwrap)}>
                  {title}
                </Text>
                <div style={{width: '100%'}}/>
                <Text
                    font={{variation: FontVariation.SMALL}}
                    className={cx(css.textwrap, css.linkDecoration)}
                    padding={{right: 'large'}}
                >
                  <a>Compare features</a>
                </Text>
                <PillToggle
                    onChange={editionClick => setEditionSelected(editionClick)}
                    options={[
                      {label: 'Team', value: Editions.TEAM},
                      {
                        label: 'Enterprise',
                        value: Editions.ENTERPRISE
                      }
                    ]}
                    selectedView={editionSelected}
                />
              </Layout.Horizontal>
              <Container>
                <Layout.Horizontal flex={{justifyContent: 'space-between'}}
                                   padding={{top: 'xsmall', bottom: 'xxlarge'}}>
                  <Layout.Vertical>
                    <InfoBox
                        title={'Developer Seats'}
                        recommended={developerRecommendedSeats}
                        using={developerUsageSeats}
                        planned={developerPlannedSeats}
                    />
                    <CostSlider
                        title={'Developers'}
                        summary={`1 developer = $ ${developerRate}/ ${monthYear}`}
                        currentUsage={developerUsageSeats}
                        recommended={developerRecommendedSeats}
                        currentSliderValue={developerSelected}
                        minVal={1}
                        maxVal={50}
                        tickSize={1}
                        labelTickSize={49}
                        onSliderChange={x => setDeveloperSelected(x)}
                        labelSuffix={' developers'}
                        labelSummary={`$ ${totalDeveloperRate}/ ${monthYear}`}
                    />
                  </Layout.Vertical>
                  <Layout.Vertical>
                    <InfoBox
                        title={'MAUs Usage'}
                        units={'k'}
                        recommended={mauRecommendedSeats}
                        using={mauUsageSeats}
                        planned={mauPlannedSeats}
                    />
                    <CostSlider
                        title={'MAUs Usage'}
                        summary={`25k MAUs = $ ${mauRate}/ ${monthYear} `}
                        currentUsage={mauUsageSeats}
                        recommended={mauRecommendedSeats}
                        currentSliderValue={mausSelected}
                        minVal={0}
                        maxVal={1000}
                        tickSize={25}
                        labelTickSize={250}
                        onSliderChange={x => setMausSelected(x)}
                        labelSuffix={'k MAUs'}
                        labelSummary={`$ ${totalMauRate}/ ${monthYear}`}
                    />
                  </Layout.Vertical>
                </Layout.Horizontal>
              </Container>
              <Layout.Horizontal padding={{top: 'xxxlarge', bottom: 'xxxlarge'}} className={cx(css.pillboxgap)}>
                <PillToggle
                    onChange={planFrequency => setPaymentFrequencySelected(planFrequency)}
                    options={[
                      {
                        label: 'Yearly',
                        value: PlanType.YEARLY
                      },
                      {label: 'Monthly', value: PlanType.MONTHLY}
                    ]}
                    selectedView={paymentFrequencySelected}
                />
                {paymentFrequencySelected === PlanType.MONTHLY && (
                    <Text font={{variation: FontVariation.SMALL}}>{`Save $ ${moneySavedYearly} paying yearly`}</Text>
                )}
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
                  <Layout.Vertical>
                    <Text font={{variation: FontVariation.H5}} color={Color.GREY_700}>
                      {'Developer Seats'}
                    </Text>
                    <Layout.Horizontal flex={{alignItems: 'baseline'}} padding={{top: 'small'}}>
                      <Text font={{size: 'medium'}} padding={{bottom: 'xsmall'}}>
                        {`⨉ $ ${developerRate}`}
                      </Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                  <Layout.Vertical
                      flex={{justifyContent: 'center'}}
                      padding={{left: 'small', right: 'small', top: 'small'}}
                  >
                    <Text font={{size: 'medium'}}>{`+`}</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
                  <Layout.Vertical>
                    <Text font={{variation: FontVariation.H5}} color={Color.GREY_700}>
                      {'MAUs Usage'}
                    </Text>
                    <Layout.Horizontal flex={{alignItems: 'baseline'}} padding={{top: 'small'}}>
                      <Text font={{size: 'medium'}}>{`$ ${mauRate}`}</Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                  <Layout.Vertical
                      flex={{justifyContent: 'center'}}
                      padding={{left: 'small', right: 'small', top: 'small'}}
                  >
                    <Text font={{size: 'medium'}}>{`+`}</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
                  <Layout.Vertical>
                    <Text font={{variation: FontVariation.H5}} color={Color.GREY_700}>
                      {'Support'}
                    </Text>
                    <Layout.Horizontal flex={{alignItems: 'baseline'}} className={cx(css.supportInfoBoxText)}>
                      <Text font={{size: 'medium'}}>{`$ ${supportCost}`}</Text>
                    </Layout.Horizontal>
                    <Text font={{variation: FontVariation.SMALL}} padding={{top: 'small'}}>
                      {'Premium 24x7 Change'}
                    </Text>
                  </Layout.Vertical>
                  <Layout.Vertical
                      flex={{justifyContent: 'center'}}
                      padding={{left: 'small', right: 'small', top: 'small'}}
                  >
                    <Text font={{size: 'medium'}}>{`=`}</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
                  <Layout.Vertical>
                    <Text font={{variation: FontVariation.H5}} color={Color.GREY_700}>
                      {'Next Payment'}
                    </Text>
                    <Layout.Horizontal flex={{alignItems: 'baseline'}} className={cx(css.nextPaymentPadding)}>
                      <Text font={{size: 'medium'}}>
                        {`$ ${totalCost} per ${frequencyString(paymentFrequencySelected)} `}
                      </Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <div style={{width: '100%'}}/>
                <Layout.Horizontal className={cx(css.pricingdisplayItem, css.duetodaybox)}>
                  <Layout.Vertical>
                    <Text font={{variation: FontVariation.H5}} color={Color.GREY_700}>
                      {'Due Today'}
                    </Text>
                    <Layout.Horizontal className={cx(css.dueTodayPadding)}>
                      <Text font={{size: 'medium', weight: 'bold'}} color={Color.BLACK}>
                        {`$ ${dueTodayCost}`}
                      </Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal padding={{top: 'xxlarge'}} flex={{alignItems: 'center', justifyContent: 'flex-start'}}>
                <Button text={'Review Changes'} variation={ButtonVariation.PRIMARY} size={ButtonSize.LARGE} onClick={() => setShownPage(CalcPage.Review)}/>
                <Layout.Horizontal padding={{left: 'xlarge'}}>
                  <Text>Or</Text>
                  <Text padding={{left: 'small'}} className={cx(css.linkDecoration)}>
                    <a>Contact Sales</a>
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>
            </div>
        }
  {  shownPage ===CalcPage.Review &&
        <ReviewPage
            previousEdition={edition}
            previousPlan={PlanType.MONTHLY}
            newEdition={editionSelected}
            newPlan={paymentFrequencySelected}
            previousDevelopers={developerPlannedSeats ? developerPlannedSeats : developerUsageSeats}
            previousMau={mauPlannedSeats ? mauPlannedSeats : mauUsageSeats}
            newDevelopers={developerSelected}
            developerCost={totalDeveloperRate}
            newMau={mausSelected}
            mauCost={totalMauRate}
            supportCost={160}
            total={totalCost + supportCost + 160}
            backButtonClick={() => setShownPage(CalcPage.Calculator)}
        />
}
      </div>
  )
}

export const ExampleModal = () => {
  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    // enforceFocus: true,
    title: '',
    className: Classes.DIALOG,
    style: { width: 1056, height: 750 }
  }
  //let modalErrorHander: ModalErrorHandlerBinding

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <CostCalculator edition={Editions.TEAM} />
    </Dialog>
  ))

  return (
    <React.Fragment>
      <Button text="Open Modal" onClick={openModal} />
    </React.Fragment>
  )
}
