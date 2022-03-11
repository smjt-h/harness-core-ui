/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import MultipleContainerHeader from '../MultipleContainerHeader'

const setContainerVisibleMock = jest.fn()

describe('test cases for multiple conatiner header', () => {
  test('Multiple containers/Container visible', async () => {
    const { container } = render(
      <TestWrapper>
        <MultipleContainerHeader
          containerName="Test Container"
          containerVisible={true}
          currentContainer={1}
          totalContainers={10}
          toggleContainerVisble={setContainerVisibleMock}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Single container/Container always visible', async () => {
    const { container } = render(
      <TestWrapper>
        <MultipleContainerHeader
          containerName="Test Container"
          containerVisible={true}
          currentContainer={1}
          totalContainers={1}
          toggleContainerVisble={setContainerVisibleMock}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Multiple containers/Container not visible', async () => {
    const { container } = render(
      <TestWrapper>
        <MultipleContainerHeader
          containerName="Test Container"
          containerVisible={false}
          currentContainer={1}
          totalContainers={10}
          toggleContainerVisble={setContainerVisibleMock}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Single container/Container not visible', async () => {
    const { container } = render(
      <TestWrapper>
        <MultipleContainerHeader
          containerName="Test Container"
          containerVisible={false}
          currentContainer={1}
          totalContainers={1}
          toggleContainerVisble={setContainerVisibleMock}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(container.querySelector('[class*="toggleContainerIcon"]')).toBeNull()
  })
})
