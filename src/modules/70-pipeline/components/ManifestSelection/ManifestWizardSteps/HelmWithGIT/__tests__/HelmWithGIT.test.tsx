import React from 'react'
import { render, fireEvent, act, queryByAttribute, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithGIT from '../HelmWithGIT'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}
describe('helm with GIT tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      branch: '',
      folderPath: '',
      helmVersion: '',
      repoName: '',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      branch: 'master',
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      branch: 'master',
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'identifier',
      gitFetchType: 'Commit',
      commitId: 'sgdnkkjhhsfafaa',
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: 'Template', flag: 'flag', id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload when gitfetchtype is branch', async () => {
    const initialValues = {
      identifier: '',
      branch: '',
      gitFetchType: '',
      folderPath: './',
      helmVersion: '',
      skipResourceVersioning: false,
      repoName: ''
    }

    const prevStepData = {
      connectorRef: {
        connector: {
          spec: {
            connectionType: 'Account',
            url: 'accounturl-test'
          }
        }
      },
      store: 'Git'
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} prevStepData={prevStepData} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: undefined,
                folderPath: 'test-path',
                gitFetchType: 'Branch',
                repoName: 'repo-name'
              },
              type: 'Git'
            },
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
