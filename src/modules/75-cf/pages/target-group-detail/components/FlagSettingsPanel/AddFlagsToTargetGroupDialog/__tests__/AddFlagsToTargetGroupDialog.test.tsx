/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { mockFeatures, mockTargetGroup } from '@cf/pages/target-group-detail/__tests__/mocks'
import AddFlagsToTargetGroupDialog, { AddFlagsToTargetGroupDialogProps } from '../AddFlagsToTargetGroupDialog'

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const renderComponent = (props: Partial<AddFlagsToTargetGroupDialogProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: mockTargetGroup.identifier
      }}
    >
      <AddFlagsToTargetGroupDialog
        targetGroup={mockTargetGroup}
        onChange={jest.fn()}
        hideModal={jest.fn()}
        existingFlagIds={[]}
        {...props}
      />
    </TestWrapper>
  )

describe('AddFlagsToTargetGroupDialog', () => {
  const useGetAllFeaturesMock = jest.spyOn(cfServices, 'useGetAllFeatures')
  const usePatchSegmentMock = jest.spyOn(cfServices, 'usePatchSegment')

  function getSelects(): HTMLElement[] {
    return screen.getAllByPlaceholderText(`- cf.segmentDetail.selectVariation -`)
  }

  async function doSubmit(): Promise<{ resolvePatch: (value: any) => void; rejectPatch: (reason: any) => void }> {
    let resolvePatch
    let rejectPatch

    const submissionPromise = new Promise((resolve, reject) => {
      resolvePatch = resolve
      rejectPatch = reject
    })

    usePatchSegmentMock.mockReturnValue({
      mutate: jest.fn().mockReturnValue(submissionPromise)
    } as any)

    userEvent.click(screen.getAllByRole('checkbox')[0])

    await waitFor(() => {
      const selects = getSelects()
      expect(selects[0]).toBeEnabled()
      userEvent.click(selects[0])
    })

    await waitFor(() => {
      const opt = screen.getByText(mockFeatures[0].variations[0].name as string)
      expect(opt).toBeInTheDocument()
      userEvent.click(opt)
    })

    userEvent.click(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' }))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return { resolvePatch, rejectPatch }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    useGetAllFeaturesMock.mockReturnValue({
      data: {
        features: mockFeatures,
        pageSize: CF_DEFAULT_PAGE_SIZE,
        pageIndex: 0,
        itemCount: mockFeatures.length,
        pageCount: Math.ceil(mockFeatures.length / CF_DEFAULT_PAGE_SIZE)
      },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    usePatchSegmentMock.mockReturnValue({
      mutate: jest.fn().mockResolvedValue(true)
    } as any)
  })

  test('it should call the hideModal callback when the cancel button is clicked', async () => {
    const hideModalMock = jest.fn()
    renderComponent({ hideModal: hideModalMock })

    expect(hideModalMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => expect(hideModalMock).toHaveBeenCalled())
  })

  test('it should pass the existing feature IDs as excludedFeatures to API endpoint correctly', async () => {
    const existingFlagIds = ['Flag1', 'Flag2']

    renderComponent({ existingFlagIds })

    expect(useGetAllFeaturesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryParams: expect.objectContaining({
          excludedFeatures: existingFlagIds.join(',')
        })
      })
    )
  })

  describe('state: ok', () => {
    test('it should disable all variation selects until a flag is selected', async () => {
      renderComponent()

      for (const select of getSelects()) {
        expect(select).toBeDisabled()
      }

      userEvent.click(screen.getAllByRole('checkbox')[0])

      await waitFor(() => {
        const selects = getSelects()
        expect(selects[0]).toBeEnabled()

        for (const select of selects.slice(1)) {
          expect(select).toBeDisabled()
        }
      })

      userEvent.click(screen.getAllByRole('checkbox')[0])

      await waitFor(() => {
        for (const select of getSelects()) {
          expect(select).toBeDisabled()
        }
      })
    })

    test('it should disable the submit button when there are no flags selected and enable when there are flags selected', async () => {
      renderComponent()

      expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeDisabled()

      userEvent.click(screen.getAllByRole('checkbox')[0])
      expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeEnabled()

      userEvent.click(screen.getAllByRole('checkbox')[0])
      expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeDisabled()
    })
  })

  describe('state: noFlags', () => {
    beforeEach(() => {
      useGetAllFeaturesMock.mockReturnValue({
        data: {
          features: [],
          pageSize: CF_DEFAULT_PAGE_SIZE,
          pageIndex: 0,
          itemCount: 0,
          pageCount: 1
        },
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)
    })

    test('it should hide the search and pagination when there are no flags', async () => {
      renderComponent()

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
      expect(document.querySelector('[class*="Pagination"]')).not.toBeInTheDocument()
    })

    test('it should show no flags available', async () => {
      renderComponent()

      expect(screen.getByText('cf.segmentDetail.noFlagsAvailable'))
    })
  })

  describe('state: noSearchResults', () => {
    async function doSearch(): Promise<void> {
      useGetAllFeaturesMock.mockReturnValue({
        data: {
          features: [],
          pageSize: CF_DEFAULT_PAGE_SIZE,
          pageIndex: 0,
          itemCount: 0,
          pageCount: 1
        },
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      await userEvent.type(screen.getByRole('searchbox'), 'search term')
    }

    test('it should display no results match search', async () => {
      renderComponent()

      await doSearch()

      await waitFor(() => expect(screen.getByText('cf.noResultMatch')).toBeInTheDocument())
    })

    test('it should maintain the submit button state', async () => {
      renderComponent()

      userEvent.click(screen.getAllByRole('checkbox')[0])

      await waitFor(() => expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeEnabled())

      await doSearch()

      await waitFor(() => expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeEnabled())
    })
  })

  describe('state: initialLoading', () => {
    beforeEach(() => {
      useGetAllFeaturesMock.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      } as any)
    })

    test('it should hide the search and pagination', async () => {
      renderComponent()

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
      expect(document.querySelector('[class*="Pagination"]')).not.toBeInTheDocument()
    })

    test('it should display the loading indicator', async () => {
      renderComponent()

      expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
    })
  })

  describe('state: loading', () => {
    async function doSearch(): Promise<void> {
      useGetAllFeaturesMock.mockReturnValue({
        data: {
          features: mockFeatures,
          pageSize: CF_DEFAULT_PAGE_SIZE,
          pageIndex: 0,
          itemCount: mockFeatures.length,
          pageCount: Math.ceil(mockFeatures.length / CF_DEFAULT_PAGE_SIZE)
        },
        loading: true,
        error: null,
        refetch: jest.fn()
      } as any)

      await userEvent.type(screen.getByRole('searchbox'), 'search term', { delay: 50 })
    }

    test('it should show the search and pagination', async () => {
      renderComponent()

      await doSearch()

      expect(screen.getByRole('searchbox')).toBeInTheDocument()
      expect(document.querySelector('[class*="Pagination"]')).toBeInTheDocument()
    })

    test('it should display the loading indicator', async () => {
      renderComponent()

      expect(screen.queryByTestId('container-spinner')).not.toBeInTheDocument()

      await doSearch()

      await waitFor(() => expect(screen.getByTestId('container-spinner')).toBeInTheDocument())
    })
  })

  describe('state: submitting', () => {
    test('it should disable the submit button and display a spinner', async () => {
      renderComponent()

      const { resolvePatch } = await doSubmit()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'cf.segmentDetail.addFlags' })).toBeDisabled()
        expect(screen.getByTestId('saving-spinner')).toBeInTheDocument()
      })

      resolvePatch(true)
    })

    test('it should call the onChange and hideModal callbacks when submission succeeds', async () => {
      const onChangeMock = jest.fn()
      const hideModalMock = jest.fn()

      renderComponent({ onChange: onChangeMock, hideModal: hideModalMock })

      const { resolvePatch } = await doSubmit()

      expect(onChangeMock).not.toHaveBeenCalled()
      expect(hideModalMock).not.toHaveBeenCalled()

      resolvePatch(true)

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalled()
        expect(hideModalMock).toHaveBeenCalled()
      })
    })
  })

  describe('state: error', () => {
    test('it should display the error message and retry button when the flags call fails', async () => {
      const refetchMock = jest.fn()
      const message = 'ERROR MESSAGE'

      useGetAllFeaturesMock.mockReturnValue({
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
  })
})
