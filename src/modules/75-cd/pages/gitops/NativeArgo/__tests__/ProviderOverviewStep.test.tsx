/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, queryByAttribute } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { gitConfigs, sourceCodeManagers, branchStatusMock } from '@connectors/mocks/mock'
import { clickSubmit } from '@common/utils/JestFormHelper'
import * as cdngServices from 'services/cd-ng'
import ConnectorDetailsStep from '../ProviderOverviewStep/ProviderOverviewStep'
import CreateArgoProvider from '../CreateProvider/CreateProvider'

const props = {
  isEditMode: false,
  provider: {
    name: 'Darwin Argo Dev Env',
    identifier: 'DarwinArgoDevEnv',
    baseURL: 'https://34.136.244.5',
    status: 'Active',
    type: 'nativeArgo',
    spec: {},
    tags: {
      demo: 'demo'
    }
  }
}

jest.mock('services/cd-ng', () => ({
  validateProviderIdentifierIsUniquePromise: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: true })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: jest.fn(), loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  }),
  useCreateGitOpsProvider: jest.fn().mockImplementation(() => {
    // Update data with mock response
    return { data: {}, refetch: jest.fn() }
  }),
  useUpdateGitOpsProvider: jest.fn().mockImplementation(() => {
    // Update data with mock response
    return { data: {}, refetch: jest.fn() }
  })
}))

describe('Connector details step', () => {
  test('Test for  create  connector step one required feilds', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )
    // fill step 1
    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot() // Form validation for all required fields in step one
  })

  test('Test for going to next step', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )

    // fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    expect(container).toMatchSnapshot()
  })

  test('should not render git context form for account level connector', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...accountPathProps })}
        pathParams={{
          accountId: 'testAccount'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })

  test('should not render git context form for org level connector', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...orgPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render git context form for a project level connector if gitsync is enabled', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...projectPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          module: 'testModule'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeTruthy()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should not render git context form at project level if connector info is passed and it sets orgIdentifier or projectIdentifier to false value', async () => {
    // const connectorInfo = {
    //   orgIdentifier: undefined,
    //   projectIdentifier: undefined
    // } as ConnectorInfoDTO

    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...projectPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          module: 'testModule'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })

  test('Test for adding required fields and save', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    const adapterUrl = queryByAttribute('name', container, 'spec.adapterUrl')
    expect(adapterUrl).toBeTruthy()
    if (adapterUrl) fireEvent.change(adapterUrl, { target: { value: 'https://34.136.244.5' } })

    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  })
  test('test for opening in edit mode', async () => {
    const { container } = render(
      <TestWrapper>
        <CreateArgoProvider isEditMode={true} provider={props.provider} />
      </TestWrapper>
    )
    const adapterUrl = queryByAttribute('name', container, 'spec.adapterUrl')
    expect(adapterUrl).toBeTruthy()
    if (adapterUrl) fireEvent.change(adapterUrl, { target: { value: 'https://34.136.244.5' } })

    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  })
  test('test for error in response', async () => {
    jest.spyOn(cdngServices, 'validateProviderIdentifierIsUniquePromise').mockImplementation(() => {
      throw new Error('mock error')
    })
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    const adapterUrl = queryByAttribute('name', container, 'spec.adapterUrl')
    expect(adapterUrl).toBeTruthy()
    if (adapterUrl) fireEvent.change(adapterUrl, { target: { value: 'https://34.136.244.5' } })

    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  })
  test('Test for Failed response', async () => {
    jest.spyOn(cdngServices, 'validateProviderIdentifierIsUniquePromise').mockImplementation(() => {
      return { status: 'FAILED', data: false } as any
    })
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    const adapterUrl = queryByAttribute('name', container, 'spec.adapterUrl')
    expect(adapterUrl).toBeTruthy()
    if (adapterUrl) fireEvent.change(adapterUrl, { target: { value: 'https://34.136.244.5' } })

    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  })
  test('Test for data false', async () => {
    jest.spyOn(cdngServices, 'validateProviderIdentifierIsUniquePromise').mockImplementation(() => {
      return { status: 'SUCCESS', data: false } as any
    })
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    const adapterUrl = queryByAttribute('name', container, 'spec.adapterUrl')
    expect(adapterUrl).toBeTruthy()
    if (adapterUrl) fireEvent.change(adapterUrl, { target: { value: 'https://34.136.244.5' } })

    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  })

  test('Test for  loading state', async () => {
    jest.spyOn(cdngServices, 'useCreateGitOpsProvider').mockImplementation(() => {
      return { loading: true, data: {}, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Test for  updating state', async () => {
    jest.spyOn(cdngServices, 'useCreateGitOpsProvider').mockImplementation(() => {
      return { loading: false, data: {}, refetch: jest.fn() } as any
    })
    jest.spyOn(cdngServices, 'useUpdateGitOpsProvider').mockImplementation(() => {
      return { loading: true, data: {}, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
