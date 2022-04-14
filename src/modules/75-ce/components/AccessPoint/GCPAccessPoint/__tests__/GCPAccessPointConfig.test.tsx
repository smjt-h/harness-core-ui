/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { AccessPointFormStep } from '@ce/constants'
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
  mockedZonesResponse,
  mockObj,
  params
} from './mocks'
import GCPAccessPointConfig from '../GCPAccessPointConfig'

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
    .mockImplementation(() => ({ data: mockedSecurityGroupsResponse, loading: false, refetch: jest.fn() })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(mockObj) })),
  useEditAccessPoint: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve() }))
}))

describe('GCP DNS mapping screen', () => {
  test('render configuration dialog and fill details', async () => {
    const { container, getByTestId } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointConfig
          cloudAccountId="Test1"
          loadBalancer={initialLoadBalancer}
          mode="create"
          onSave={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput).toBeDefined()
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'GCP AP' } })
    })
    expect(nameInput.value).toBe('GCP AP')

    const domainInput = container.querySelector('input[name="customDomain"]') as HTMLInputElement
    expect(domainInput).toBeDefined()
    act(() => {
      fireEvent.change(domainInput, { target: { value: 'custom.domain.test' } })
    })
    expect(domainInput.value).toBe('custom.domain.test')

    const saveBtn = getByTestId('saveGcpDetails')
    expect(saveBtn).toBeDefined()
    fireEvent.click(saveBtn)

    expect(container).toMatchSnapshot()
  })

  test('Name field should be disabled and should contain load balancer name in case of import/edit', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointConfig
          cloudAccountId="Test1"
          loadBalancer={{ ...initialLoadBalancer, name: 'Mock GCP Load Balancer' }}
          mode="edit"
          onSave={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput.value).toEqual('Mock GCP Load Balancer')
    expect(nameInput.attributes.getNamedItem('disabled')).toBeTruthy()
  })

  test('cancel ap creation', () => {
    const { container, getByTestId } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointConfig
          cloudAccountId="Test1"
          loadBalancer={initialLoadBalancer}
          mode="edit"
          onSave={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )

    const saveBtn = getByTestId('cancelBtn')
    expect(saveBtn).toBeDefined()
    fireEvent.click(saveBtn)

    expect(container).toMatchSnapshot()
  })

  test('render second step', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointConfig
          cloudAccountId="Test1"
          loadBalancer={initialLoadBalancer}
          mode="create"
          onSave={jest.fn()}
          onClose={jest.fn()}
          step={AccessPointFormStep.SECOND}
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

  test('submit second step form', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <GCPAccessPointConfig
          cloudAccountId="Test1"
          loadBalancer={{
            ...initialLoadBalancer,
            name: 'GCP AP mock',
            host_name: 'random.lightwingtest.io',
            region: mockedRegion.label,
            vpc: mockedVpn.name,
            metadata: {
              security_groups: [mockedSecurityGroup.name],
              machine_type: mockedMachine.name,
              subnet_name: mockedSubnet.name
            }
          }}
          mode="create"
          onSave={jest.fn()}
          onClose={jest.fn()}
          step={AccessPointFormStep.SECOND}
        />
      </TestWrapper>
    )

    const target = container.querySelectorAll('button[type="button"]')[1]
    expect(target).toBeDefined()
    if (target) {
      act(() => {
        fireEvent.click(target)
      })
    }
  })
})
