/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { setUpCI } from '@common/utils/GetStartedWithCIUtil'
import WelcomePage from '../WelcomePage'

jest.mock('services/cd-ng', () => ({
  useUpdateAccountDefaultExperienceNG: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve({ status: 'SUCCESS', data: { defaultExperience: 'NG' } }) }
  })
}))

jest.mock('@common/utils/GetStartedWithCIUtil', () => ({
  setUpCI: jest.fn()
}))

const featureFlags = {
  CDNG_ENABLED: true,
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true
}

describe('Welcome Page', () => {
  test('Select Module Page Rendering', () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    expect(() => getByText('common.purpose.selectAModule'))
    expect(container).toMatchSnapshot()
  })

  test('Should go to module home page when select non cd module and continue', async () => {
    const { container, getByText, getByTestId, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('ci'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('common.purpose.ci.description')).not.toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('With CIE_HOSTED_BUILDS feature flag enabled', async () => {
    ;(setUpCI as jest.Mock).mockImplementation(() => true)
    const { getByText, getByTestId } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { ...featureFlags, CIE_HOSTED_BUILDS: true } }}>
        <WelcomePage />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('ci'))
    await waitFor(() => {
      fireEvent.click(getByText('continue'))
    })
    expect(setUpCI).toBeCalled()
  })
})
