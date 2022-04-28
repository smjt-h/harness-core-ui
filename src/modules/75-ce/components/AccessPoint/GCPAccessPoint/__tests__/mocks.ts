/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

export const initialLoadBalancer = {
  account_id: params.accountId, // eslint-disable-line
  project_id: params.projectIdentifier, // eslint-disable-line
  org_id: params.orgIdentifier, // eslint-disable-line
  metadata: {
    security_groups: [] // eslint-disable-line
  },
  type: 'gcp'
}

export const mockedRegion = { label: 'us-central-1', name: 'us-central-1' }
export const mockedZone = 'us-central-1a'
export const mockedVpn = { name: 'testvpn', id: 'testvpn' }
export const mockedSubnet = { name: 'subnet-test', id: 'subnet-test' }
export const mockedMachine = { name: 'a2-highgpu-1g', is_default: true }
export const mockedSecurityGroup = { name: 'http-server', id: 'http-server' }

export const mockedRegionResponse = { response: [mockedRegion] }
export const mockedVpnResponse = { response: [mockedVpn] }
export const mockedZonesResponse = { response: [mockedZone] }
export const mockedSubnetsResponse = { response: [mockedSubnet] }
export const mockedMachineResponse = { response: [mockedMachine] }
export const mockedSecurityGroupsResponse = { response: [mockedSecurityGroup] }

export const mockObj = { response: { id: 'mock' } }
