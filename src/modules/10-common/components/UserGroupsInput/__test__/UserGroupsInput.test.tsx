import React from 'react'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

jest.mock('services/cd-ng', () => ({
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Rendering', () => {
  let container: HTMLElement
  let findByText: RenderResult['findByText']
  beforeEach(() => {
    const renderObj = render(
      <TestWrapper>
        <UserGroupsInput name="userGroups" label={'testing'} />
      </TestWrapper>
    )
    container = renderObj.container
    findByText = renderObj.findByText
  })
  test('should render', () => {
    expect(container).toMatchSnapshot()
  })
  test('should render Modal', async () => {
    const selectBtn = await findByText('common.selectUserGroups')
    expect(selectBtn).toBeTruthy()
    fireEvent.click(selectBtn)
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    expect(findDialogContainer()).toMatchSnapshot()
  })
  test('Modal should close on clicking cross', async () => {
    const selectBtn = await findByText('common.selectUserGroups')
    expect(selectBtn).toBeTruthy()
    fireEvent.click(selectBtn)
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    expect(findDialogContainer()).toMatchSnapshot()
    const modal = document.getElementsByClassName('bp3-dialog')[0]
    const closeButton = modal.querySelector("button[class*='bp3-dialog-close-button']") as Element
    fireEvent.click(closeButton)
    expect(findDialogContainer()).toBeFalsy()
  })
})
