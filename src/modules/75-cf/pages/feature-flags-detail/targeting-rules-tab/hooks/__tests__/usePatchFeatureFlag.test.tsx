/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import type { FC } from 'react'
import React from 'react'
import { waitFor, screen } from '@testing-library/react'
import * as uuid from 'uuid'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServicesMock from 'services/cf'
import usePatchFeatureFlag, { UsePatchFeatureFlagProps } from '../usePatchFeatureFlag'
import {
  mockPercentageVariationRollout,
  percentageRolloutAdded,
  percentageRolloutRemoved,
  percentageRolloutUpdated,
  targetAddedFixture,
  targetGroupsAddedFixture,
  targetGroupsRemovedFixture,
  targetRemovedFixture
} from './fixtures/target_groups_and_targets_fixtures'

jest.mock('uuid')

const renderHookUnderTest = (props: Partial<UsePatchFeatureFlagProps> = {}) => {
  const wrapper: FC = ({ children }) => {
    return (
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        {children}
      </TestWrapper>
    )
  }

  return renderHook(
    () =>
      usePatchFeatureFlag({
        featureFlagIdentifier: '',
        initialValues: {
          state: 'off',
          onVariation: 'False',
          formVariationMap: [],
          variationPercentageRollouts: mockPercentageVariationRollout
        },
        refetchFlag: jest.fn(),
        ...props
      }),
    { wrapper }
  )
}

describe('usePatchFeatureFlag', () => {
  const mutateMock = jest.fn()
  beforeAll(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue('UUID')
    jest.spyOn(cfServicesMock, 'usePatchFeature').mockReturnValue({
      mutate: mutateMock.mockResolvedValueOnce({}),
      cancel: jest.fn(),
      error: null,
      loading: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Flag State/Default Serve', () => {
    test('it should send correct values when values different', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({ refetchFlag: refetchFlagMock.mockResolvedValueOnce({}) })

      const newValues = {
        state: 'on',
        onVariation: 'True',
        formVariationMap: [],
        variationPercentageRollouts: mockPercentageVariationRollout
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith({
        instructions: [
          {
            kind: 'setFeatureFlagState',
            parameters: {
              state: 'on'
            }
          },
          {
            kind: 'updateDefaultServe',
            parameters: {
              variation: 'True'
            }
          }
        ]
      })

      await waitFor(() => expect(screen.getByText('cf.messages.flagUpdated')).toBeInTheDocument())
      expect(refetchFlagMock).toBeCalled()
    })

    test('it should send correct values when values are the same', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({ refetchFlag: refetchFlagMock.mockResolvedValueOnce({}) })

      const newValues = {
        state: 'off',
        onVariation: 'False',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: []
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).not.toBeCalledWith()
      expect(refetchFlagMock).not.toBeCalled()
    })
  })

  describe('Target Groups and Targets', () => {
    test('it should send correct values when Target Group added', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: mockPercentageVariationRollout,
          formVariationMap: targetGroupsAddedFixture.initialFormVariationMap
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: targetGroupsAddedFixture.newFormVariationMap
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(targetGroupsAddedFixture.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })

    test('it should send correct values when Target Group removed', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: mockPercentageVariationRollout,
          formVariationMap: targetGroupsRemovedFixture.initialFormVariationMap
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: targetGroupsRemovedFixture.newFormVariationMap
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(targetGroupsRemovedFixture.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })

    test('it should send correct values when Target added', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: mockPercentageVariationRollout,
          formVariationMap: targetAddedFixture.initialFormVariationMap
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: targetAddedFixture.newFormVariationMap
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(targetAddedFixture.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })

    test('it should send correct values when Target removed', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: mockPercentageVariationRollout,
          formVariationMap: targetRemovedFixture.initialFormVariationMap
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: targetRemovedFixture.newFormVariationMap
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(targetRemovedFixture.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })
  })

  describe('Percentage Rollout', () => {
    test('it should send correct values when Percentage Rollout added', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: [],
          formVariationMap: []
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: [percentageRolloutAdded.newPercentageRolloutAdded],
        formVariationMap: []
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(percentageRolloutAdded.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })
    test('it should send correct values when Percentage Rollout updated', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: [percentageRolloutUpdated.initialVariationPercentageRollout],
          formVariationMap: []
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: [percentageRolloutUpdated.newPercentageRolloutAdded],
        formVariationMap: []
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(percentageRolloutUpdated.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })
    test('it should send correct values when Percentage Rollout removed', async () => {
      const refetchFlagMock = jest.fn()

      const { result } = renderHookUnderTest({
        refetchFlag: refetchFlagMock.mockResolvedValueOnce({}),
        initialValues: {
          onVariation: 'true',
          state: 'on',
          variationPercentageRollouts: [percentageRolloutRemoved.initialVariationPercentageRollout],
          formVariationMap: []
        }
      })

      const newValues = {
        state: 'on',
        onVariation: 'true',
        variationPercentageRollouts: [],
        formVariationMap: []
      }
      result.current.saveChanges(newValues)

      expect(mutateMock).toBeCalledWith(percentageRolloutRemoved.expected)
      await waitFor(() => expect(refetchFlagMock).toBeCalled())
    })
  })

  describe('Error Handling', () => {
    test('it should handle exception and show toast correctly', async () => {
      const mutatePatchMock = jest.fn()
      jest.spyOn(cfServicesMock, 'usePatchFeature').mockReturnValue({
        mutate: mutatePatchMock.mockRejectedValueOnce({ data: { message: 'ERROR FROM MOCK' } }),
        cancel: jest.fn(),
        error: null,
        loading: false
      })

      const { result } = renderHookUnderTest()

      const newValues = {
        state: 'on',
        onVariation: 'True',
        variationPercentageRollouts: mockPercentageVariationRollout,
        formVariationMap: []
      }
      result.current.saveChanges(newValues)

      await waitFor(() => expect(screen.getByText('ERROR FROM MOCK')).toBeInTheDocument())
    })
  })
})
