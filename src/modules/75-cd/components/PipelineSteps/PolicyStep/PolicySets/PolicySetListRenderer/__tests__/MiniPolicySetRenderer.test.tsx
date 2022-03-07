/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { MiniPolicySetRenderer } from '../MiniPolicySetRenderer'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('services/pm', () => ({
  useGetPolicySet: jest.fn().mockImplementation((props: any) => {
    if (props.policyset === 'account.test') {
      return {
        data: {
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
      }
    } else if (props.policyset === 'org.test') {
      return {
        data: {
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
      }
    } else {
      return {
        data: {
          name: 'policy set 3',
          policies: []
        },
        loading: props.policyset === 'loadingId'
      }
    }
  })
}))

describe('Mini Policy Set Renderer', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        {['account.test', 'org.test', 'test', 'loadingId'].map(policySetId => (
          <MiniPolicySetRenderer policySetId={policySetId} key={policySetId} />
        ))}
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
