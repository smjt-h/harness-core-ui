/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { mockFeatures } from '@cf/pages/target-group-detail/__tests__/mocks'
import FlagsListing, { FlagsListingProps } from '../FlagsListing'

const renderComponent = (props: Partial<FlagsListingProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FlagsListing flags={mockFeatures} {...props} />
    </TestWrapper>
  )

describe('FlagsListing', () => {
  test('it should display a row for each flag', async () => {
    renderComponent()

    expect(screen.getAllByRole('row')).toHaveLength(mockFeatures.length + 1)

    for (const flag of mockFeatures) {
      expect(screen.getByText(flag.name)).toBeInTheDocument()
    }
  })

  describe('includeAddFlagCheckbox', function () {
    test('it should not display the add flag checkbox if includeAddFlagCheckbox is not included', async () => {
      renderComponent()

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    })

    test('it should display the add flag checkbox if includeAddFlagCheckbox is set', async () => {
      renderComponent({ includeAddFlagCheckbox: true })

      expect(screen.queryAllByRole('checkbox')).toHaveLength(mockFeatures.length)
    })
  })

  describe('disableRowVariations', () => {
    test('it should not disable rows when disableRowVariations returns false', async () => {
      renderComponent({ disableRowVariations: jest.fn().mockReturnValue(false) })

      for (const input of document.querySelectorAll('input')) {
        expect(input).toBeEnabled()
      }
    })

    test('it should disable rows when disableRowVariations returns true', async () => {
      renderComponent({ disableRowVariations: jest.fn().mockReturnValue(true) })

      for (const input of document.querySelectorAll('input')) {
        expect(input).toBeDisabled()
      }
    })
  })

  describe('onRowDelete', () => {
    test('it should not show the delete icon when onRowDelete is not passed', async () => {
      renderComponent()

      expect(screen.queryAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(0)
    })

    test('it should show the delete icon when onRowDelete not passed', async () => {
      renderComponent({ onRowDelete: jest.fn() })

      expect(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(mockFeatures.length)
    })
  })
})
