/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// import { Container, Dialog, Formik } from '@harness/uicore'
import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { AnomalyAlertDialog } from '../AnomaliesAlertDialog'

describe('Test case for anomalies new alert creation', () => {
  test('Anomalies alert dialog should open', async () => {
    const hideAnomaliesAlertModal = jest.fn()
    const handleSubmit = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <AnomalyAlertDialog hideAnomaliesAlertModal={hideAnomaliesAlertModal} handleSubmit={handleSubmit} />
      </TestWrapper>
    )

    expect(getByText('ce.anomalyDetection.notificationAlerts.selectPerspectiveLabel')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
