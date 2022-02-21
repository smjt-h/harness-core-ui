import React from 'react'
import { queryByAttribute, render, fireEvent, act, queryByText } from '@testing-library/react'
import { TestsCoverageItem } from '@pipeline/pages/execution/ExecutionTestView/TestsCoverageItem'

jest.mock('copy-to-clipboard')
jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))
describe('TestCoverageItem test', () => {
  test('should render TestCoverageItem', async () => {
    const data = {
      name: 'TestCoverageItem',
      coverage: 'passed',
      commitId: 'commitId'
    }
    const { container } = render(<TestsCoverageItem data={data} />)
    expect(container).toMatchSnapshot()
  })
  test('test copy2clipboard', async () => {
    const data = {
      name: 'Copy2Clipboard',
      coverage: 'failed',
      commitId: 'commitId'
    }
    const { container } = render(<TestsCoverageItem data={data} />)
    const clipboardIcon = queryByAttribute('icon', container, 'clipboard')
    await act(async () => {
      fireEvent.click(clipboardIcon!)
    })
    // There is no value returned from mock for copy2clipboard, failed toaster must be displayed
    expect(queryByText(document.body, 'clipboardCopyFail')).toBeDefined()
  })
})
