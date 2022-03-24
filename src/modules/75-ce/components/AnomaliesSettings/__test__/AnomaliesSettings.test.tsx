/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import React from 'react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import AnomaliesSettings from '../AnomaliesSettings'

const params = {
  accountId: 'TEST_ACC'
}

describe('test case for anomalies settings drawer', () => {
  test('should be able to open alert creation modal', async () => {
    const hideDrawer = jest.fn()

    const { container, getByText, getAllByText } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesSettings hideDrawer={hideDrawer} />
      </TestWrapper>
    )

    const createNewAlert = queryByText(container, 'ce.anomalyDetection.settings.newAlertBtn')

    act(() => {
      fireEvent.click(createNewAlert!)
    })
    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    await waitFor(() => {
      expect(getByText('ce.anomalyDetection.notificationAlerts.heading')).toBeDefined()
      expect(getAllByText('ce.anomalyDetection.notificationAlerts.overviewStep')).toBeDefined()
    })

    expect(modal).toMatchSnapshot()
  })
})
