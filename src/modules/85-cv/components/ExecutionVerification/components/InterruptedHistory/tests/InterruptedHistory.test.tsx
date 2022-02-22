/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { InterruptEffect } from 'services/pipeline-ng'
import InterruptedHistory from '../InterruptedHistory'
import { interruptedHistories } from './InterruptedHistory.mock'

describe('Unit tests for InterruptedHistory', () => {
  test('should show the selected interruped action taken by User', () => {
    const { getByText } = render(
      <TestWrapper>
        <InterruptedHistory interruptedHistories={interruptedHistories as InterruptEffect[]} />
      </TestWrapper>
    )
    expect(getByText('Set to IGNORE on 22-Feb-2022 2:21:58 AM')).toBeInTheDocument()
  })

  test('should now show the selected interruped action taken by User when there is no interrupted History', () => {
    render(
      <TestWrapper>
        <InterruptedHistory interruptedHistories={[]} />
      </TestWrapper>
    )
    expect(screen.queryByText('Set to IGNORE on 22-Feb-2022 2:21:58 AM')).not.toBeInTheDocument()
  })
})
