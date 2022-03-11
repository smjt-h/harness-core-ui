/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RecommendationDetailsSavingsCard, RecommendationDetailsSpendCard } from '../RecommendationDetailsSummaryCards'

describe('test cases for recommendation summary cards', () => {
  test('should be able to render recommendation spend card', async () => {
    const { container } = render(
      <TestWrapper>
        <RecommendationDetailsSpendCard
          spentBy="(by Feb 13)"
          title="Potential Monthly Spend"
          withRecommendationAmount="$36.39"
          withoutRecommendationAmount="$135.17"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render recommendation savings card', async () => {
    const { container } = render(
      <TestWrapper>
        <RecommendationDetailsSavingsCard
          amount="$98.78"
          title="Potential Monthly Savings"
          amountSubTitle="(73%)"
          subTitle="Feb 07 - Feb 13"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
