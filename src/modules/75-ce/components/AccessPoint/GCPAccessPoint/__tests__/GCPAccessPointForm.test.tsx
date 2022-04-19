/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import * as lwServices from 'services/lw'
import GCPAccessPointForm from '../GCPAccessPointForm'
import {
  initialLoadBalancer,
  mockedMachine,
  mockedMachineResponse,
  mockedRegion,
  mockedRegionResponse,
  mockedSecurityGroup,
  mockedSecurityGroupsResponse,
  mockedSubnet,
  mockedSubnetsResponse,
  mockedVpn,
  mockedVpnResponse,
  mockedZone,
  mockedZonesResponse,
  params
} from './mocks'

jest.mock('services/lw', () => ({
  useAllRegions: jest.fn().mockImplementation(() => ({
    data: mockedRegionResponse,
    loading: false
  })),
  useAllVPCs: jest.fn().mockImplementation(() => ({
    data: mockedVpnResponse,
    loading: false,
    refetch: jest.fn()
  })),
  useAllSubnets: jest.fn().mockImplementation(() => ({
    data: mockedSubnetsResponse,
    loading: false,
    refetch: jest.fn()
  })),
  useGetMachineListForZone: jest.fn().mockImplementation(() => ({
    data: mockedMachineResponse,
    loading: false,
    refetch: jest.fn()
  })),
  useAllZones: jest.fn().mockImplementation(() => ({
    data: mockedZonesResponse,
    loading: false,
    refetch: jest.fn()
  })),
  useAllSecurityGroups: jest
    .fn()
    .mockImplementation(() => ({ data: mockedSecurityGroupsResponse, loading: false, refetch: jest.fn() }))
}))

describe('GCP AP form', () => {
  test('fill form', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointForm
          cloudAccountId="Test1"
          handlePreviousClick={jest.fn()}
          isSaving={false}
          loadBalancer={{ ...initialLoadBalancer, name: 'GCP AP mock', host_name: 'random.lightwingtest.io' }}
          mode="create"
          handleSubmit={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const regionsDropdown = container.querySelector('input[name="region"]') as HTMLInputElement
    const regionsCaret = container
      .querySelector(`input[name="region"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await act(() => {
      fireEvent.click(regionsCaret!)
    })
    const regionToSelect = await findByText(container, mockedRegion.label)
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe(mockedRegion.label)

    fillAtForm([
      {
        container,
        fieldId: 'zone',
        type: InputTypes.SELECT,
        value: mockedZone
      },
      {
        container,
        fieldId: 'vpc',
        type: InputTypes.SELECT,
        value: mockedVpn.name
      },
      {
        container,
        fieldId: 'subnet_name',
        type: InputTypes.SELECT,
        value: mockedSubnet.name
      },
      {
        container,
        fieldId: 'machine_type',
        type: InputTypes.SELECT,
        value: mockedMachine.name
      }
    ])

    const target = container.querySelectorAll('button[type="button"]')?.[1]
    expect(target).toBeDefined()
    if (target) {
      fireEvent.click(target)
    }
  })

  test('form in edit mode', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointForm
          cloudAccountId="Test1"
          handlePreviousClick={jest.fn()}
          isSaving={false}
          loadBalancer={{
            ...initialLoadBalancer,
            name: 'GCP AP mock',
            host_name: 'random.lightwingtest.io',
            metadata: {
              security_groups: [mockedSecurityGroup.name],
              machine_type: mockedMachine.name,
              subnet_name: mockedSubnet.name
            }
          }}
          mode="edit"
          handleSubmit={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const target = container.querySelector('button[type="button"]')
    expect(target).toBeDefined()
    if (target) {
      act(() => {
        fireEvent.click(target)
      })
    }
  })

  test('form while saving', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointForm
          cloudAccountId="Test1"
          handlePreviousClick={jest.fn()}
          isSaving={true}
          loadBalancer={{
            ...initialLoadBalancer,
            name: 'GCP AP mock',
            host_name: 'random.lightwingtest.io',
            metadata: {
              security_groups: [mockedSecurityGroup.name],
              machine_type: mockedMachine.name,
              subnet_name: mockedSubnet.name
            }
          }}
          mode="edit"
          handleSubmit={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('form with no data', () => {
    jest.spyOn(lwServices, 'useAllZones').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(lwServices, 'useAllVPCs').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(lwServices, 'useAllSubnets').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(lwServices, 'useAllSecurityGroups').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(lwServices, 'useGetMachineListForZone').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )

    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointForm
          cloudAccountId="Test1"
          handlePreviousClick={jest.fn()}
          isSaving={false}
          loadBalancer={{ ...initialLoadBalancer, name: 'GCP AP mock', host_name: 'random.lightwingtest.io' }}
          mode="create"
          handleSubmit={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
