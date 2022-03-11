/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import RecommendationTabs from '../RecommendationTabs'
import { RecommendationType } from '../constants'

describe('test cases for recommendation tabs', () => {
  test('should be able to render recommendation tabs', async () => {
    const { container } = render(
      <TestWrapper>
        <RecommendationTabs
          selectedRecommendation={RecommendationType.CostOptimized}
          setSelectedRecommendation={jest.fn()}
          setCPUReqVal={jest.fn()}
          setMemReqVal={jest.fn()}
          setMemLimitVal={jest.fn()}
          costOptimizedSavings={100}
          performanceOptimizedSavings={200}
          currentSavings={50}
          isPerfOptimizedCustomized={false}
          isCostOptimizedCustomized={false}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
