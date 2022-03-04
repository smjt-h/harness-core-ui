/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { ServicesList } from '@cd/components/Services/ServicesList/ServicesList'
import mockImport from 'framework/utils/mockImport'
import { serviceDetails } from '@cd/mock'
import type { ServiceDetailsDTO } from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)
jest.mock('services/cd-ng', () => {
  return {
    useGetDeploymentsByServiceId: jest.fn(() => ({ data: null })),
    useDeleteServiceV2: jest.fn(() => ({ data: null })),
    useUpsertServiceV2: jest.fn(() => ({ loading: false, data: null }))
  }
})

describe('ServicesList', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesList
          loading={false}
          error={false}
          data={serviceDetails.data.serviceDeploymentDetailsList as unknown as ServiceDetailsDTO[]}
          refetch={noop}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should go to latest execution after click', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <ServicesList
          loading={false}
          error={false}
          data={serviceDetails.data.serviceDeploymentDetailsList as unknown as ServiceDetailsDTO[]}
          refetch={noop}
        />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-testid="executionId"]') as HTMLElement)
    expect(container.querySelector('[data-testid="executionId"]')).toBeDefined()
    fireEvent.click(container.querySelector('.lastDeploymentText') as HTMLElement)
    expect(container).toMatchSnapshot()
  })

  test('Should go to editModal by clicking edit', async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesList
          loading={false}
          error={false}
          data={serviceDetails.data.serviceDeploymentDetailsList as unknown as ServiceDetailsDTO[]}
          refetch={noop}
        />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)
    expect(container).toMatchSnapshot()
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()

    expect(getByText(document.body, 'cancel')).toBeDefined()
    fireEvent.click(getByText(document.body, 'cancel') as HTMLButtonElement)
    expect(findDialogContainer()).toBeFalsy()
  })

  test('Should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cd-ng', {
      useDeleteServiceV2: () => ({
        mutate
      })
    })

    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesList
          loading={false}
          error={false}
          data={serviceDetails.data.serviceDeploymentDetailsList as unknown as ServiceDetailsDTO[]}
          refetch={noop}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()
    expect(getByText(document.body, 'confirm')).toBeDefined()
    fireEvent.click(getByText(document.body, 'confirm') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)
    form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(getByText(document.body, 'cancel')).toBeDefined()
    fireEvent.click(getByText(document.body, 'cancel') as HTMLButtonElement)
    expect(findDialogContainer()).toBeFalsy()
  })
})
