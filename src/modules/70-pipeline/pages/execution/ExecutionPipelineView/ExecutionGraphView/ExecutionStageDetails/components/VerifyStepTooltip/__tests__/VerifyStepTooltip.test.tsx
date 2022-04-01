/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VerifyStepTooltip from '../VerifyStepTooltip'
import type { VerifyStepTooltipProps } from '../VerifyStepTooltip.types'

describe('VerifyStepTooltip tests', () => {
  const verifyStepTooltipProps = {
    failureInfo: {
      message: '',
      responseMessages: [
        { message: 'Montored service is not present for selected service and env' },
        { message: 'Health source is not present for selected service and env' }
      ]
    }
  }

  test('should be able to render multiple messages when multiple messages are present in the failure Info', () => {
    const props: VerifyStepTooltipProps = verifyStepTooltipProps
    const { getByText } = render(
      <TestWrapper>
        <VerifyStepTooltip {...props} />
      </TestWrapper>
    )

    for (const responseMessage of verifyStepTooltipProps.failureInfo.responseMessages) {
      expect(getByText(responseMessage.message)).toBeInTheDocument()
    }
  })

  test('should be able to take the priority of message first over response messages when message in present in failureInfo ', () => {
    const newProps: VerifyStepTooltipProps = {
      failureInfo: { ...verifyStepTooltipProps.failureInfo, message: 'Verify step is skipped' }
    }
    const { getByText, queryByText } = render(
      <TestWrapper>
        <VerifyStepTooltip {...newProps} />
      </TestWrapper>
    )

    expect(getByText(newProps.failureInfo.message)).toBeInTheDocument()
    for (const responseMessage of newProps.failureInfo.responseMessages) {
      expect(queryByText(responseMessage.message)).not.toBeInTheDocument()
    }
  })

  test('should not render anything when neither message nor response messages are present', () => {
    const newProps: VerifyStepTooltipProps = {
      failureInfo: { ...verifyStepTooltipProps.failureInfo, message: '', responseMessages: [] }
    }
    const { queryByText } = render(
      <TestWrapper>
        <VerifyStepTooltip {...newProps} />
      </TestWrapper>
    )

    for (const responseMessage of newProps.failureInfo.responseMessages) {
      expect(queryByText(responseMessage.message)).not.toBeInTheDocument()
    }
  })
})
