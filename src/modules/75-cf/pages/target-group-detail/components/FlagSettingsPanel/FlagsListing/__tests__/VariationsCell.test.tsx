/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { mockFeatures } from '@cf/pages/target-group-detail/__tests__/mocks'
import VariationsCell, { VariationsCellProps } from '../VariationsCell'

const renderComponent = (props: Partial<VariationsCellProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <VariationsCell flag={mockFeatures[0]} fieldPrefix="flags[0]" {...props} />
    </TestWrapper>
  )

describe('VariationsCell', () => {
  test('it should display the variation select', async () => {
    renderComponent()

    const input = screen.getByPlaceholderText('- cf.segmentDetail.selectVariation -')
    expect(input).toBeInTheDocument()

    userEvent.click(input)

    await waitFor(() => {
      mockFeatures[0].variations.forEach(({ name, identifier }) => {
        expect(screen.getByText(name || identifier)).toBeInTheDocument()
      })
    })
  })

  test('it should prefix the field name with the fieldPrefix', async () => {
    const fieldPrefix = 'PREFIX'

    renderComponent({ fieldPrefix })

    expect(screen.getByRole('textbox')).toHaveAttribute('name', expect.stringMatching(new RegExp(`^${fieldPrefix}\\.`)))
  })
})
