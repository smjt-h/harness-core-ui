/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VariableResourceModalBody from '../VariableResourceModalBody'
import { VariableSuccessResponseWithData } from '@variables/pages/variables/__tests__/mock/variableResponse'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/cd-ng', () => ({
  useGetVariablesList: jest.fn().mockImplementation(() => {
    return { data: VariableSuccessResponseWithData, loading: false }
  })
}))
describe('Secret Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <VariableResourceModalBody {...props}></VariableResourceModalBody>
      </TestWrapper>
    )
    await waitFor(() => getByText('variableLabel'))
    expect(container).toMatchSnapshot()
  })
})
