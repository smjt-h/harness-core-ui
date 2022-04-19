/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, getByText as getByTextBody } from '@testing-library/react'
import { findDialogContainer } from '@common/utils/testUtils'
import { HostedByHarnessBuildLocation, InfraProvisiongWizardStepId, AllBuildLocations } from '../Constants'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { SelectBuildLocation } from '../SelectBuildLocation'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('Render and test InfraProvisioningWizard', () => {
  test('Initial render for SelectBuildLocation', async () => {
    const { container } = render(<SelectBuildLocation selectedBuildLocation={HostedByHarnessBuildLocation} />)
    expect(container.getElementsByClassName('div[class*="MultiStepProgressIndicator"]'))

    // All build infra type cards should be visible
    const buildInfraCards = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(buildInfraCards.length).toBe(AllBuildLocations.length)

    // Hosted By Harness build infra card should be selected by default
    expect(buildInfraCards[0].className).toContain('Card--selected')

    // Docker Runner build infra card should be disabled by default
    buildInfraCards.map((card, index) => index !== 0 && expect(card.className).toContain('Card--disabled'))

    // Only one build infra type card should marked as selected at all times
    expect(container.querySelectorAll('[data-icon="main-tick"]').length).toBe(1)
    expect(container.querySelectorAll('div[class*="Card--selected"]').length).toBe(1)

    // First pill toggle option should be selected by default
    expect(container.querySelector('div[class*="PillToggle--selected"][data-name="toggle-option-one"]')).toBeTruthy()
    await act(async () => {
      fireEvent.click(container.querySelector('div[data-name="toggle-option-two"]')!)
    })
    expect(container.querySelector('div[class*="PillToggle--selected"][data-name="toggle-option-two"]')).toBeTruthy()
  })

  test('Test Wizard Navigation with Select Build Location as first step', async () => {
    const { container, getByText } = render(<InfraProvisioningWizard />)

    // Infra provisioning carousel dialog should not be visible before button click
    let dialog = findDialogContainer() as HTMLElement
    expect(dialog).not.toBeTruthy()

    await act(async () => {
      fireEvent.click(getByText('next: ci.getStartedWithCI.configInfra'))
    })
    // Only SelectBuildLocation step should be in progress with green spinner icon
    expect(
      container.querySelectorAll('span[class*="StyledProps--color-green600"][data-icon="steps-spinner"]').length
    ).toBe(1)
    expect(
      container.querySelector('span[class*="StyledProps--color-green600"][data-icon="steps-spinner"]')
    ).toBeTruthy()

    // Infra provisioning carousel dialog should be visible on button click
    dialog = findDialogContainer() as HTMLElement
    expect(dialog).toBeTruthy()

    expect(getByTextBody(dialog, 'ci.getStartedWithCI.provisionSecureEnv')).toBeTruthy()
    await act(async () => {
      fireEvent.click(dialog.querySelector('[data-icon="Stroke"]')!)
    })
    expect(container.querySelectorAll('span[class*="bp3-icon"][data-icon="success-tick"]').length).toBe(1)
    expect(getByText('ci.getStartedWithCI.codeRepo')).toBeTruthy()

    // Going back to SelectBuildLocation
    await act(async () => {
      fireEvent.click(getByText('back'))
    })

    // Status reverts to initial
    expect(container.querySelectorAll('div[class*="MultiStepProgressIndicator--dot"]').length).toBe(3)
  })

  test('Test Wizard Navigation with Select Git Provider as first step', async () => {
    const { getByText } = render(
      <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectGitProvider} />
    )
    expect(getByText('ci.getStartedWithCI.codeRepo')).toBeTruthy()
    expect(getByText('next: ci.getStartedWithCI.selectRepo')).toBeTruthy()
    // Going back to SelectBuildLocation
    await act(async () => {
      fireEvent.click(getByText('back'))
    })
    expect(getByText('ci.getStartedWithCI.buildLocation')).toBeTruthy()
  })
})
