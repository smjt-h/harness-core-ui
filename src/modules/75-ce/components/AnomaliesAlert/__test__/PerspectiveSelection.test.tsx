/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PerspectiveSelection from '../PerspectiveSelection'

const params = {
  accountId: 'TEST_ACC'
}

const props: any = {
  name: '',
  onClose: jest.fn(),
  items: [],
  nextStep: jest.fn(),
  formikProps: {
    values: {
      perspective: '',
      alertList: [
        {
          channelName: '',
          channelUrl: ''
        }
      ]
    },
    setFieldValue: jest.fn()
  }
}

describe('Test case for Anomalies alert perspective selection', () => {
  test('Should be able to load perspective selection screen', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <PerspectiveSelection {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should be able to open next section on submit', async () => {
    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <PerspectiveSelection {...props} />
      </TestWrapper>
    )

    const submitBtn = getByText('saveAndContinue')
    expect(submitBtn).toBeDefined()
    act(() => {
      fireEvent.click(submitBtn!)
    })
  })
})
