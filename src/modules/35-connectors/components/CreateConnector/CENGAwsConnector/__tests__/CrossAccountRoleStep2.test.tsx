/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'

import { useStrings } from 'framework/strings'
import CrossAccountRoleStep2 from '../steps/CrossAccountRoleStep2'

jest.mock('services/ce/index', () => ({
  useAwsaccountconnectiondetail: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  }))
}))

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

describe('Create CE AWS Connector Create Cross Account Role Step', () => {
  test('should render form', async () => {
    window.open = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <CrossAccountRoleStep2 name={result.current.getString('connectors.ceAws.steps.roleARN')} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('connectors.ceAws.crossAccountRoleStep2.launchTemplate'))
    })

    act(() => {
      fireEvent.click(getByText('previous'))
    })
  })
})
