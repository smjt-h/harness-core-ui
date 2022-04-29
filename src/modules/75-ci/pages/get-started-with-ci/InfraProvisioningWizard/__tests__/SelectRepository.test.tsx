/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'

jest.mock('services/pipeline-ng', () => ({
  createPipelineV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        identifier: 'Default_Pipeline'
      }
    })
  )
}))

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

describe('Test SelectRepository component', () => {
  test('Initial render', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
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

  const routesToPipelineStudio = jest.spyOn(routes, 'toPipelineStudio')
  test('Should create a pipeline if a repository is selected and user clicks on next', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )

    const testRepository = getByText('wings-software/monaco')
    expect(testRepository).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(testRepository)
    })
    const createPipelineBtn = getByText('ci.getStartedWithCI.createPipeline')
    await act(async () => {
      fireEvent.click(createPipelineBtn)
    })
    expect(routesToPipelineStudio).toHaveBeenCalled()
  })
})
