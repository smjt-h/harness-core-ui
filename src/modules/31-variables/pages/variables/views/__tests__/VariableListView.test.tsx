/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import VariableListView from '../VariableListView'
import { VariableSuccessResponseWithData } from '../../__tests__/mock/variableResponse'

jest.useFakeTimers()

describe('Variables Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('render page at account level', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView variables={VariableSuccessResponseWithData.data as any} gotoPage={jest.fn()} />
      </TestWrapper>
    )

    await waitFor(() => getByText('CUSTOM_VARIABLE'))
    expect(container).toMatchSnapshot()
  })
})
