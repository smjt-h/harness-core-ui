/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { PolicySetWithLinkedPolicies } from 'services/pm'

import { TestWrapper } from '@common/utils/testUtils'

import { MiniPolicySetsRenderer } from '../MiniPolicySetsRenderer'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('services/pm', () => ({
  GetPolicySet: jest.fn().mockImplementation((props: any) => {
    const MockComponent = () => {
      let policySet: PolicySetWithLinkedPolicies = {}
      if (props.policyset === 'account.test') {
        policySet = {
          name: 'Policy set 1',
          policies: [
            {
              name: 'Policy 1'
            },
            {
              name: 'Policy 2'
            }
          ]
        }
      } else if (props.policyset === 'org.test') {
        policySet = {
          name: 'policy set 2',
          policies: [
            {
              name: 'policy 3'
            },
            {
              name: 'policy 4'
            },
            {
              name: 'policy 5'
            }
          ]
        }
      } else {
        policySet = {
          name: 'policy set 3',
          policies: []
        }
      }
      return props.children(policySet, {
        loading: props.policyset === 'loadingId',
        error: false
      })
    }

    return <MockComponent {...props} />
  })
}))

describe('Mini Policy Sets Renderer', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <MiniPolicySetsRenderer policySetIds={['account.test', 'org.test', 'test', 'loadingId']} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
