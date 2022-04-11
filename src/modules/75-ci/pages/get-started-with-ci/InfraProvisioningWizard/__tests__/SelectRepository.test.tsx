/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('Test SelectRepository component', () => {
  test('Initial render', async () => {
    const { container, getByText } = render(
      <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
    )
    const createPipelineBtn = getByText('ci.getStartedWithCI.createPipeline')
    await act(async () => {
      fireEvent.click(createPipelineBtn)
    })
    // Schema validation error should show up for if Repository is not selected
    const repositoryValidationError = container.querySelector(
      'div[class*="FormError--errorDiv"][data-name="repository"]'
    )
    expect(repositoryValidationError).toBeInTheDocument()
    expect(getByText('fieldRequired')).toBeTruthy()

    const testRepository = getByText('wings-software/monaco')
    expect(testRepository).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(testRepository)
    })
    expect(repositoryValidationError).not.toBeInTheDocument()

    const repositorySearch = container.querySelector(
      'input[placeholder="ci.getStartedWithCI.searchRepo"]'
    ) as HTMLInputElement
    expect(repositorySearch).toBeTruthy()
    await act(async () => {
      fireEvent.change(repositorySearch!, { target: { value: 'wings-software/monaco' } })
    })
    expect(getByText('wings-software/monaco')).toBeInTheDocument()
  })
})
