/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineStages } from '../PipelineStages'

const pipelineStagesProps = {
  children: [],
  templateTypes: {},
  setTemplateTypes: jest.fn(),
  openTemplateSelector: jest.fn(),
  closeTemplateSelector: jest.fn()
}

const onUseTemplate = jest.fn()

describe('Add Stage View', () => {
  test('AccountSideNav simple snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineStages {...pipelineStagesProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Open template selector should be getting called', () => {
    const { queryByText } = render(
      <TestWrapper>
        <PipelineStages {...pipelineStagesProps} />
      </TestWrapper>
    )
    const rbacButton = queryByText('common.useTemplate')
    expect(rbacButton).toBeDefined()
    if (rbacButton) {
      act(() => {
        fireEvent.click(rbacButton)
      })
      expect(pipelineStagesProps.openTemplateSelector).toHaveBeenCalledWith({ templateType: 'Stage', onUseTemplate })
    }
  })
})
