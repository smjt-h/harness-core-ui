/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { environmentModal } from '@cd/mock'
import { NewEditEnvironmentModalYaml } from '../EnvironmentList/EnvironmentsModal'

jest.mock('services/pipeline-ng', () => {
  return {
    useGetSchemaYaml: jest.fn(() => ({ data: null }))
  }
})

describe('Environments', () => {
  test('should render Environments', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <NewEditEnvironmentModalYaml {...environmentModal} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText(document.body, 'save'))
    fireEvent.click(getByText(document.body, 'YAML'))
    fireEvent.click(getByText(document.body, 'save'))
    expect(container).toMatchSnapshot()
  })
})
