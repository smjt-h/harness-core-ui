import { render } from '@testing-library/react'
import React from 'react'
import { CostCalculator } from '@common/components/CostCalculator/CostCalculator'
import { ReviewPage } from '@common/components/CostCalculator/ReviewAndBuyPlanUpgrades'
import { Editions } from '@common/constants/SubscriptionTypes'
import { PlanType } from '@common/components/CostCalculator/CostCalculatorUtils'

describe('Cost Calculator Test', () => {
  test('Check CostCalc', async () => {
    const { container } = render(<CostCalculator />)
    expect(container).toMatchSnapshot()
  })

  test('Payment Page', async () => {
    const { container } = render(
      <ReviewPage
        previousEdition={Editions.TEAM}
        newEdition={Editions.ENTERPRISE}
        newPlan={PlanType.YEARLY}
        previousDevelopers={2}
        previousMau={2}
        newDevelopers={3}
        developerCost={400}
        newMau={232}
        mauCost={500}
        supportCost={100}
        total={2233}
        backButtonClick={() => {
          return 1
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
