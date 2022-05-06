/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, waitFor, act, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import VariablesPage from '../VariablesPage'

jest.useFakeTimers()

describe('Variables Page', () => {
  test('render page at account level', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariablesPage />
      </TestWrapper>
    )
    await waitFor(() => getByText('variables.newVariable'))
    expect(getByText('account common.variables')).toBeDefined()
    expect(getByText('variables.newVariable')).toBeDefined()
    const neVarBtn = getByText('variables.newVariable')
    act(() => {
      fireEvent.click(neVarBtn!)
    })

    await waitFor(() => expect(getByText('common.addVariable')))
  })
  test('render page at org level', async () => {
    const { getByText } = render(
      <TestWrapper
        path={routes.toVariables({ ...orgPathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummyOrg' }}
      >
        <VariablesPage />
      </TestWrapper>
    )
    await waitFor(() => getByText('variables.newVariable'))
    expect(getByText('variables.newVariable')).toBeDefined()
    expect(getByText('orgLabel common.variables')).toBeDefined()
    expect(getByText('dummyOrg')).toBeDefined()
  })
  test('render page at project level', async () => {
    const { getByText } = render(
      <TestWrapper
        path={routes.toVariables({ ...projectPathProps, module: 'cd' })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummyOrg', projectIdentifier: 'dummyProject' }}
      >
        <VariablesPage />
      </TestWrapper>
    )
    await waitFor(() => getByText('variables.newVariable'))

    expect(getByText('variables.newVariable')).toBeDefined()
    expect(getByText('projectLabel common.variables')).toBeDefined()
    expect(getByText('dummyProject')).toBeDefined()
  })
})
