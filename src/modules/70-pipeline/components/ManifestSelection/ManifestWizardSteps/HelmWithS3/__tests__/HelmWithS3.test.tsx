import React from 'react'
import { render, queryByAttribute, fireEvent, act, wait } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithS3 from '../HelmWithS3'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: 'test',
      bucketName: 'test-bucket',
      region: { name: '', value: '' },
      folderPath: 'testfolder',
      helmVersion: 'V2',
      chartName: 'testChart',
      chartVersion: 'v1',
      skipResourceVersioning: false
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('load form correctly in edit mode and fill region', () => {
    const initialValues = {
      identifier: 'test',
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'test',
            bucketName: 'test-bucket',
            folderPath: 'testfolder',
            region: 'region1'
          }
        },
        chartName: 'testChart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`submits with the right payload`, async () => {
    const initialValues = {
      identifier: '',
      bucketName: '',
      region: { label: '', value: '' },
      folderPath: '',
      helmVersion: '',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('bucketName')!, { target: { value: 'testbucket' } })
      fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'testFolder' } })
      fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await wait(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          spec: {
            store: {
              spec: {
                bucketName: 'testbucket',
                connectorRef: '',
                folderPath: 'testFolder',
                region: {
                  label: '',
                  value: ''
                }
              },
              type: undefined
            },
            chartName: 'testchart',
            chartVersion: 'v1',
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
