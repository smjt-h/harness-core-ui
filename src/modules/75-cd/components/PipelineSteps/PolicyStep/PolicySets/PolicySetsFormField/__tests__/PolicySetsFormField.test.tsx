/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import PolicySetsFormField from '../PolicySetsFormField'

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn()
}))

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('services/pm', () => ({
  GetPolicySet: ({ children }: any) => {
    const MockComponent = () => {
      return children(
        {
          name: 'test',
          policies: ['ptest1']
        },
        { loading: false, error: {} }
      )
    }

    return <MockComponent />
  },
  useGetPolicySetList: jest.fn().mockImplementation(() => ({
    error: 'Bad Modal'
  }))
}))

describe('Test Policy Sets Form Field', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetsFormField
          name="dummy"
          formikProps={
            {
              values: {
                spec: {
                  policySets: ['acc.test', 'org.test', 'test']
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const addOrModifyButton = screen.getByText('common.policiesSets.addOrModifyPolicySet')
    await waitFor(() => expect(addOrModifyButton).toBeDefined())

    act(() => {
      fireEvent.click(addOrModifyButton)
    })

    await waitFor(() => expect(screen.getByText('common.policiesSets.selectPolicySet')).toBeDefined())
  })

  test('renders error', () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetsFormField name="dummy" error={'Failed to validate'} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
