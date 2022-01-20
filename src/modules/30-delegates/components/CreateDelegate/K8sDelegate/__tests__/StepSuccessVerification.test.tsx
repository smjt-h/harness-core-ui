/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import StepSuccessVerifcation from '../StepSuccessVerification/StepSuccessVerifcation'

jest.mock('services/portal', () => ({
  useGetDelegatesHeartbeatDetailsV2: jest
    .fn()
    .mockReturnValue({ data: {}, refetch: jest.fn(), error: null, loading: false }),
  useGetDelegatesInitializationDetailsV2: jest
    .fn()
    .mockReturnValue({ data: {}, refetch: jest.fn(), error: null, loading: false }),
  useCreateDelegateGroup: jest.fn().mockReturnValue({
    mutate: jest.fn().mockReturnValue({
      ok: true
    })
  })
}))
describe('Create Step Verification Script Delegate', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <StepSuccessVerifcation />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click back button', async () => {
    const { container } = render(
      <TestWrapper>
        <StepSuccessVerifcation previousStep={jest.fn()} />
      </TestWrapper>
    )
    const stepReviewScriptBackButton = container?.querySelector('#stepReviewScriptBackButton')
    act(() => {
      fireEvent.click(stepReviewScriptBackButton!)
    })
    await waitFor(() => expect(container).toMatchSnapshot())
  })
  test('Click Done button', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <TestWrapper>
        <StepSuccessVerifcation onClose={onClose} />
      </TestWrapper>
    )
    userEvent.click(getByRole('button', { name: 'done' }))
    await waitFor(() => expect(onClose).toBeCalled())
  })
})
