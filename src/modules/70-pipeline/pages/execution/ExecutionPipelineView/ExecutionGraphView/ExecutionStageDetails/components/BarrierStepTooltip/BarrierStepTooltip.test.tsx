/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import BarrierStepTooltip from './BarrierStepTooltip'

describe('BarrierStepTooltip', () => {
  test('if loading', () => {
    const { container } = render(
      <TestWrapper>
        <BarrierStepTooltip loading={true} />
      </TestWrapper>
    )
    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeTruthy()
  })

  test('basic snapshot after loading', async () => {
    const { container } = render(
      <TestWrapper>
        <BarrierStepTooltip loading={false} startTs={0} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('if startTs at greater than 0', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <BarrierStepTooltip
          loading={false}
          startTs={3}
          data={[
            {
              name: 'Barrier name',
              identifier: 'Barrier identifier'
            }
          ]}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText('pipeline.barriers.tooltips.barrierWaiting')).toBeTruthy())
  })
})
