/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import UploadJSON from '@connectors/components/CreateConnector/PdcConnector/components/UploadJSON'

const setJsonValueFn = jest.fn()
const fileValues = [{ hosts: 'localhost' }]

describe('Test TestConnection component', () => {
  test('Render component with pass api request', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )

    const str = JSON.stringify(fileValues)
    const blob = new Blob([str])
    const file = new File([blob], 'values.json', {
      type: 'application/JSON'
    })
    File.prototype.text = jest.fn().mockResolvedValueOnce(str)
    const input = container.querySelector('input')
    act(() => {
      user.upload(input!, file)
    })

    waitFor(() => {
      expect(setJsonValueFn).toBeCalled()
    })
  })
})
