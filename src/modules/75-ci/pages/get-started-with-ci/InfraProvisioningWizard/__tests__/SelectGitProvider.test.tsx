/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { SelectGitProvider } from '../SelectGitProvider'
import { AllGitProviders, InfraProvisiongWizardStepId } from '../Constants'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

jest.useFakeTimers()

describe('Test SelectGitProvider component', () => {
  test('Initial render', async () => {
    const { container, getByText } = render(<SelectGitProvider />)
    const gitProviderCards = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(gitProviderCards.length).toBe(AllGitProviders.length)

    // Clicking on Github Git Provider card should select it
    expect(gitProviderCards[0].classList.contains('Card--selected')).not.toBe(true)
    await act(async () => {
      fireEvent.click(gitProviderCards[0])
    })
    expect(gitProviderCards[0].classList.contains('Card--selected')).toBe(true)

    // All other git provider cards except Github should be disabled
    gitProviderCards.map((card, index) => index !== 0 && expect(card.className).toContain('Card--disabled'))

    // OAuth button lookup fails
    try {
      expect(getByText('ci.getStartedWithCI.oAuthLabel'))
    } catch (e) {
      expect(e).toBeTruthy()
    }
    // Access button lookup fails
    try {
      expect(getByText('ci.getStartedWithCI.accessTokenLabel'))
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('Render with a git provider already selected by the user', async () => {
    const { container, getByText } = render(<SelectGitProvider selectedGitProvider={AllGitProviders[0]} />)

    // Access token field should be visible only for Access Token auth method
    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.oAuthLabel'))
    })
    expect(container.querySelector('span[data-tooltip-id="accessToken"]')).not.toBeTruthy()
    // Test Connection button look up should fail
    try {
      getByText('common.smtp.testConnection')
    } catch (e) {
      expect(e).toBeTruthy()
    }

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.accessTokenLabel'))
    })

    expect(container.querySelector('span[data-tooltip-id="accessToken"]')).toBeTruthy()
    const testConnectionBtn = getByText('common.smtp.testConnection')
    expect(testConnectionBtn).toBeInTheDocument()

    // Clicking Test Connection button without access token field set should not show "in progress" view for Test Connection button
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    try {
      getByText('common.test.inProgress')
    } catch (e) {
      expect(e).toBeTruthy()
    }

    // Schema validation error should show up for Access Token field if it's not filled
    const accessTokenValidationError = container.querySelector(
      'div[class*="FormError--errorDiv"][data-name="accessToken"]'
    )
    expect(accessTokenValidationError).toBeInTheDocument()
    expect(getByText('fieldRequired')).toBeTruthy()

    await waitFor(() =>
      fillAtForm([
        {
          container,
          fieldId: 'accessToken',
          type: InputTypes.TEXTFIELD,
          value: 'sample-access-token'
        }
      ])
    )

    expect(container.querySelector('input[name="accessToken"]')).toHaveValue('sample-access-token')
    expect(accessTokenValidationError).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })

    expect(getByText('common.test.inProgress')).toBeTruthy()

    act(() => {
      jest.runOnlyPendingTimers()
    })

    // Test Connection should show success eventually
    expect(getByText('common.test.connectionSuccessful')).toBeTruthy()
  })

  test('Render SelectGitProvider inside InfraProvisioningWizard', async () => {
    const { container, getByText } = render(
      <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectGitProvider} />
    )
    const nextBtn = getByText('next: ci.getStartedWithCI.selectRepo')
    await act(async () => {
      fireEvent.click(nextBtn)
    })

    // Schema validation error should show up for if Git Provider is not selected
    expect(container.querySelector('div[class*="FormError--errorDiv"][data-name="gitProvider"]')).toBeInTheDocument()
    expect(getByText('fieldRequired')).toBeTruthy()

    const gitProviderCards = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]

    await act(async () => {
      fireEvent.click(gitProviderCards[0])
    })

    await act(async () => {
      fireEvent.click(nextBtn)
    })

    await act(async () => {
      fireEvent.click(nextBtn)
    })

    // Schema validation error should show up for if Git Authentication method is not selected
    expect(
      container.querySelector('div[class*="FormError--errorDiv"][data-name="gitAuthenticationMethod"]')
    ).toBeInTheDocument()
    expect(getByText('fieldRequired')).toBeTruthy()
  })
})
