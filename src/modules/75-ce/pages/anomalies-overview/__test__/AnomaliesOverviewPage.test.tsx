/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import AnomaliesOverviewPage from '../AnomaliesOverviewPage'

jest.mock('services/ce', () => ({
  useListAnomalies: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useReportAnomalyFeedback: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  }))
}))

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test case for anomalies detection overview page', () => {
  test('should be able to render the overview dashboard', async () => {
    const setMockState = jest.fn()
    const useStateMock: any = (useState: any) => [useState, setMockState]
    jest.spyOn(React, 'useState').mockImplementation(useStateMock)

    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesOverviewPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
