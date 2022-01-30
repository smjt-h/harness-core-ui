/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, findByText, act } from '@testing-library/react'
import type { MultiSelectOption } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { useCreateService } from 'services/cd-ng'
import { EnvironmentMultiSelectOrCreate, EnvironmentMultiSelectOrCreateProps } from '../EnvironmentMultiSelectAndEnv'

jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>
useCreateServiceMock.mockImplementation(() => {
  return {
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    })
  }
})

const onNewCreated = jest.fn()

const Wrapper = (props: EnvironmentMultiSelectOrCreateProps): JSX.Element => {
  return (
    <TestWrapper>
      <EnvironmentMultiSelectOrCreate {...props} />
    </TestWrapper>
  )
}

describe('EnvironmentSelectOrCreate', () => {
  test('Should render multi selct option dropdown', async () => {
    const { getByTestId, getByText } = render(
      <Wrapper options={[{ value: 'env101', label: 'env101' }]} onSelect={jest.fn()} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('sourceFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('env101')).toBeTruthy())
  })

  test('Should render multi selct option dropdown dsadsadasd', async () => {
    const options = [
      { value: 'env101', label: 'env101' },
      { value: 'env102', label: 'env102' }
    ]
    const onSelect = (selectProps: MultiSelectOption[]) => {
      expect(selectProps).toMatchObject([options[1]])
    }
    const { getByTestId, getByText, container } = render(
      <Wrapper options={options} onSelect={onSelect} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('sourceFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('env102')).toBeTruthy())

    const typeToSelect = await findByText(container, 'env102')

    expect(typeToSelect).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.click(typeToSelect!)
    })
  })

  test('Should render multi selct option dropdowndsadasdas', async () => {
    const options = [
      { value: 'env101', label: 'env101' },
      { value: 'env102', label: 'env102' }
    ]
    const onSelect = jest.fn()
    const { container, getByTestId, getByText } = render(
      <Wrapper options={options} onSelect={onSelect} onNewCreated={onNewCreated} />
    )
    const sourcesDropdown = getByTestId('sourceFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(sourcesDropdown!)
    })
    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
    await waitFor(() => expect(getByText('env102')).toBeTruthy())
    await waitFor(() => expect(getByText('env101')).toBeTruthy())

    const typeToSelect = await findByText(container, 'env102')
    expect(typeToSelect).toBeInTheDocument()

    act(() => {
      fireEvent.click(typeToSelect)
    })
    const typeToSelect2 = await findByText(container, 'env101')
    expect(typeToSelect2).toBeInTheDocument()

    act(() => {
      fireEvent.click(typeToSelect2)
    })
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenNthCalledWith(1, [options[1]])
    expect(onSelect).toHaveBeenLastCalledWith([options[0]])
  })
})
