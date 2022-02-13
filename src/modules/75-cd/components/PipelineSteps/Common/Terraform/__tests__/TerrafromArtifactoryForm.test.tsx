/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { TFArtifactoryForm } from '../Editview/TerraformArtifactoryForm'

const props = {
  onSubmitCallBack: jest.fn(),
  prevStepData: {},
  previousStep: jest.fn(),
  isConfig: false,
  isTerraformPlan: false
}

const connectorMock = {
  data: {}
}

jest.mock('services/cd-ng', () => ({
  useGetRepositoriesDetailsForArtifactory: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  }),
  useGetArtifactsBuildsDetailsForArtifactory: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))
describe('Terraform artifactory tests', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <TFArtifactoryForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('loads config data correctly', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <TFArtifactoryForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('loads terraform config data correctly', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <TFArtifactoryForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
