/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import TestConnection from '@connectors/components/CreateConnector/PdcConnector/StepDetails/TestConnection'

const onCloseFn = jest.fn()
const gotoStep = jest.fn()
jest.mock('services/portal', () => ({
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(
      ({ queryParams }) =>
        new Promise(resolve => {
          resolve(
            queryParams?.accountId === 'pass'
              ? {
                  data: {
                    status: 'SUCCESS'
                  }
                }
              : {
                  data: {
                    errors: [
                      {
                        reason: 'Failed',
                        message: 'Error connectiong'
                      }
                    ]
                  }
                }
          )
        })
    )
  }))
}))

describe('Test TestConnection component', () => {
  test('Render component with pass api request', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <TestConnection onClose={onCloseFn} gotoStep={gotoStep} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(onCloseFn).toBeCalled()
  })
})
