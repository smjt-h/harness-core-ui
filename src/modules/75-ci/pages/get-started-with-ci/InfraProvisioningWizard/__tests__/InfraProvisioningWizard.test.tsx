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
    const { container, getByText } = render(
      <SelectBuildLocation selectedBuildLocation={HostedByHarnessBuildLocation} />
    )
    expect(container.getElementsByClassName('div[class*="MultiStepProgressIndicator"]'))

    // All build infra type cards should be visible
    const buildInfraCards = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(buildInfraCards.length).toBe(AllBuildLocations.length)

    // Hosted By Harness build infra card should be selected by default
    expect(buildInfraCards[0].className).toContain('Card--selected')

    // Docker Runner build infra card should be disabled by default
    expect(buildInfraCards[3].className).toContain('Card--disabled')

    // Clicking on Kubernetes build infra cards should select it
    fireEvent.click(getByText('kubernetesText'))
    expect(buildInfraCards[1].className).toContain('Card--selected')
    buildInfraCards.map((card, index) => index !== 1 && expect(card.className).not.toContain('Card--selected'))

    // Similarly, clicking on AWS build infra cards should select it
    fireEvent.click(getByText('common.aws'))
    expect(buildInfraCards[0].className).not.toContain('Card--selected')
    expect(buildInfraCards[1].className).not.toContain('Card--selected')
    expect(buildInfraCards[2].className).toContain('Card--selected')

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
      fireEvent.click(getByText('ci.getStartedWithCI.configInfra'))
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
    expect(container.querySelectorAll('div[class*="MultiStepProgressIndicator--dot"]').length).toBe(2)
  })

  test('Test Wizard Navigation with Select VCS Vendor as first step', async () => {
    const { getByText } = render(
      <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectVCSVendor} />
    )
    expect(getByText('ci.getStartedWithCI.codeRepo')).toBeTruthy()
    expect(getByText('next')).toBeTruthy()
    // Going back to SelectBuildLocation
    await act(async () => {
      fireEvent.click(getByText('back'))
    })
    expect(getByText('ci.getStartedWithCI.buildLocation')).toBeTruthy()
  })

  test('Test Wizard for an unregistered step', async () => {
    const { container } = render(
      <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectCodeRepo} />
    )
    // should render empty div for a step not in the wizard
    expect(container).toMatchInlineSnapshot('<div />')
  })
})
