/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { servicesGridView } from '@cd/mock'
import { ServicesListPage } from '../ServicesListPage/ServicesListPage'

jest.mock('services/pipeline-ng', () => {
  return {
    useGetSchemaYaml: jest.fn(() => ({ data: null }))
  }
})

describe('ServicesListPage', () => {
  test('ServicesListPage should render data correctly', async () => {
    mockImport('services/cd-ng', {
      useGetServiceList: () => ({
        data: servicesGridView,
        loading: false,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesListPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should open Add-ServiceModal, grid and list view on click', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesListPage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-testid="add-service"]') as HTMLElement)
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()
    fireEvent.click(container.querySelector('[icon="grid-view"]') as HTMLElement)
    fireEvent.click(container.querySelector('[icon="list"]') as HTMLElement)
    expect(container).toMatchSnapshot()
  })
})
