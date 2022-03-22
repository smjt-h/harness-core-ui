/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container } from '@harness/uicore'
import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import useAnomaliesAlertDialog from '../AnomaliesAlertDialog'

const CreateAnomaliesAlert = () => {
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog()
  return (
    <Container>
      <button onClick={() => openAnomaliesAlertModal()} />
    </Container>
  )
}

describe('Test case for anomalies new alert creation', () => {
  test('Anomalies alert dialog should open', () => {
    const { container } = render(
      <TestWrapper>
        <CreateAnomaliesAlert />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
