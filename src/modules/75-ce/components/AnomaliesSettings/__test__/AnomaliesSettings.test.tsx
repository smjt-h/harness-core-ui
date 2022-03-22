/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, queryByText, render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import AnomaliesSettings from '../AnomaliesSettings'

const params = {
  accountId: 'TEST_ACC'
}

describe('test case for anomalies settings drawer', () => {
  test('should be able to render the settings drawer', async () => {
    // const openAnomaliesAlertModal = jest.fn()
    const hideDrawer = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesSettings hideDrawer={hideDrawer} />
      </TestWrapper>
    )

    const createNewAlert = queryByText(container, 'ce.anomalyDetection.settings.newAlertBtn')

    act(() => {
      fireEvent.click(createNewAlert!)
    })
    expect(container).toMatchSnapshot()
  })
})
