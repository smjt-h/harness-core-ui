/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import GitSyncConfigTab from '../GitSyncConfigTab'
import mockFullSyncFiles from './mockFullSyncFiles.json'

jest.useFakeTimers()

const fetchFullSyncEntities = jest.fn().mockImplementation(() => Promise.resolve(mockFullSyncFiles))
const mockReSync = jest.fn().mockImplementation(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: { isFullSyncTriggered: true },
    metaData: null,
    correlationId: 'correlationId'
  })
)

jest.mock('services/cd-ng', () => ({
  useListFullSyncFiles: jest
    .fn()
    .mockImplementation(() => ({ mutate: fetchFullSyncEntities, loading: false, data: mockFullSyncFiles.data })),
  triggerFullSyncPromise: jest.fn().mockImplementation(() => ({
    data: { isFullSyncTriggered: true },
    loading: false,
    refetch: mockReSync
  }))
}))

describe('Git Sync - Config tab', () => {
  test('rendering full sync entities', async () => {
    const { container, queryByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/config"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncConfigTab />
      </GitSyncTestWrapper>
    )
    act(() => {
      jest.runAllTimers()
    })

    await waitFor(() => expect(queryByText('entity one')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })
})
