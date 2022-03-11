/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import JsonPathSelection from '../JsonPathSelection'

describe('unit tests for jsonpathselection', () => {
  test('ensure value is displayed for fields that have a value', async () => {
    const valueForQueryValueJsonPath = '$.metric[0].value'
    const valueForTimestampJsonPath = '$.metric[1].val'
    const { getByText } = render(
      <TestWrapper>
        <JsonPathSelection
          valueForQueryValueJsonPath={valueForQueryValueJsonPath}
          valueForTimestampJsonPath={valueForTimestampJsonPath}
          disableFields={false}
          onChange={jest.fn()}
          sampleRecord={{ think: 'solo-dolo', 'bing-bong': 'were-first' }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText(valueForQueryValueJsonPath)).not.toBeNull())
    waitFor(() => expect(getByText(valueForTimestampJsonPath)).not.toBeNull())
  })

  test('ensure banner is displayed when fields are disabled', async () => {
    const valueForQueryValueJsonPath = '$.metric[0].value'
    const valueForTimestampJsonPath = '$.metric[1].val'
    const { container, getByText } = render(
      <TestWrapper>
        <JsonPathSelection
          valueForQueryValueJsonPath={valueForQueryValueJsonPath}
          valueForTimestampJsonPath={valueForTimestampJsonPath}
          disableFields={true}
          onChange={jest.fn()}
          sampleRecord={{ think: 'solo-dolo', 'bing-bong': 'were-first' }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText(valueForQueryValueJsonPath)).not.toBeNull())
    waitFor(() => expect(getByText(valueForTimestampJsonPath)).not.toBeNull())
    expect(container.querySelector('[class*="errorBanner"]')).not.toBeNull()
  })

  test('ensure sendng null is handled', async () => {
    const { container } = render(
      <TestWrapper>
        <JsonPathSelection disableFields={false} onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="errorBanner"]')).toBeNull()
  })
})
