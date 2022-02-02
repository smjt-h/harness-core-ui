/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import TemplateResourceRenderer from '../TemplateResourceRenderer'
import mockData from './templateResourceMockData.json'

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd'
}

const props = {
  identifiers: [],
  resourceScope: {
    accountIdentifier: params.accountId,
    orgIdentifier: params.orgIdentifier,
    projectIdentifier: params.projectIdentifier
  },
  resourceType: ResourceType.TEMPLATE,
  onResourceSelectionChange: jest.fn()
}

const mockGetCallFunction = jest.fn()
jest.useFakeTimers()
jest.mock('services/template-ng', () => ({
  useGetTemplateList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(mockData)), cancel: jest.fn(), loading: false }
  })
}))

describe('<TemplateResourceRenderer /> Tests', () => {
  test('snapshot test', async () => {
    const { getByText, container } = render(
      <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <TemplateResourceRenderer {...props} />
      </TestWrapper>
    )
    // This text is the name of the first template present in the mock data
    await waitFor(() => getByText('CI Stage Template 2'))
    jest.runOnlyPendingTimers()

    expect(container).toMatchSnapshot()
  })
})
