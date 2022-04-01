/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React, { useEffect } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import FlagSettingsPanel, { FlagSettingsPanelProps } from '../FlagSettingsPanel'
import type { FlagSettingsFormProps } from '../FlagSettingsForm'
import { mockFeatures, mockSegmentFlags, mockTargetGroup } from '../../../__tests__/mocks'
import type { AddFlagsToTargetGroupDialogProps } from '../AddFlagsToTargetGroupDialog/AddFlagsToTargetGroupDialog'

jest.mock('../FlagSettingsForm', () => ({
  __esModule: true,
  default: ({ onChange, openAddFlagDialog }: Pick<FlagSettingsFormProps, 'onChange' | 'openAddFlagDialog'>) => (
    <div data-testid="flag-settings-form">
      <button onClick={() => onChange()}>Trigger onChange</button>
      <button onClick={() => openAddFlagDialog()}>Trigger openAddFlagDialog</button>
    </div>
  )
}))

jest.mock('../AddFlagsToTargetGroupDialog/AddFlagsToTargetGroupDialog', () => ({
  __esModule: true,
  default: function AddFlagsToTargetGroupDialog({ onChange }: Pick<AddFlagsToTargetGroupDialogProps, 'onChange'>) {
    useEffect(() => {
      onChange()
    }, [onChange])

    return null
  }
}))

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const renderComponent = (props: Partial<FlagSettingsPanelProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FlagSettingsPanel targetGroup={mockTargetGroup} {...props} />
    </TestWrapper>
  )

describe('FlagSettingsPanel', () => {
  const getSegmentFlagsMock = jest.spyOn(cfServices, 'useGetSegmentFlags')
  const getAllFeaturesMock = jest.spyOn(cfServices, 'useGetAllFeatures')

  beforeEach(() => {
    jest.resetAllMocks()

    getSegmentFlagsMock.mockReturnValue({
      data: mockSegmentFlags,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    getAllFeaturesMock.mockReturnValue({
      data: { features: mockFeatures },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('it should display the loading indicator when the segment flags are loading', async () => {
    getSegmentFlagsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
  })

  test('it should display the error message when an error occurs', async () => {
    const message = 'TEST ERROR'
    const refetchMock = jest.fn()

    getSegmentFlagsMock.mockReturnValue({
      data: null,
      loading: false,
      error: { message },
      refetch: refetchMock
    } as any)

    renderComponent()

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(refetchMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(refetchMock).toHaveBeenCalled())
  })

  test('it should display the form when there are flags to display', async () => {
    renderComponent()

    expect(screen.getByTestId('flag-settings-form')).toBeInTheDocument()
  })

  test('it should display the empty state screen when there are no flags to display', async () => {
    getSegmentFlagsMock.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.queryByTestId('flag-settings-form')).not.toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.noFlags')).toBeInTheDocument()
  })

  test('it should display a success message and refetch target group flags when a new flag is added', async () => {
    const refetchMock = jest.fn()
    getSegmentFlagsMock.mockReturnValue({
      data: mockSegmentFlags,
      loading: false,
      error: null,
      refetch: refetchMock
    } as any)

    renderComponent()

    expect(refetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText('cf.segmentDetail.flagsAddedSuccessfully')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'Trigger openAddFlagDialog' }))

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled()
      expect(screen.getByText('cf.segmentDetail.flagsAddedSuccessfully')).toBeInTheDocument()
    })
  })

  test('it should display a success message and refetch target group flags when existing flags are updated', async () => {
    const refetchMock = jest.fn()
    getSegmentFlagsMock.mockReturnValue({
      data: mockSegmentFlags,
      loading: false,
      error: null,
      refetch: refetchMock
    } as any)

    renderComponent()

    expect(refetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText('cf.segmentDetail.updateSuccessful')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'Trigger onChange' }))

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled()
      expect(screen.getByText('cf.segmentDetail.updateSuccessful')).toBeInTheDocument()
    })
  })
})
