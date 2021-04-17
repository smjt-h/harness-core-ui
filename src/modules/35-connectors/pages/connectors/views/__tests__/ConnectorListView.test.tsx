/* eslint-disable @typescript-eslint/no-extra-semi */
import React from 'react'
import { render, waitFor, queryByText, act, fireEvent } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import {
  connectorsData,
  catalogueData,
  statisticsMockData,
  filters
} from '@connectors/pages/connectors/__tests__/mockData'
import { useGetTestConnectionResult } from 'services/cd-ng'
import ConnectorsListView from '../ConnectorsListView'

jest.mock('react-timeago', () => () => 'dummy date')

const fetchConnectors = () => Promise.resolve(connectorsData)

const testConnectorResultError = {
  status: 'SUCCESS',
  data: {
    status: 'FAILURE',
    errors: [
      {
        reason: ' No Eligible Delegate Found',
        message:
          'No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]\n  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]\n  -  Following delegates were validating but never returned: [  ]\n  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.',
        code: 460
      }
    ],
    errorSummary:
      ' No Eligible Delegate Found (No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]\n  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]\n  -  Following delegates were validating but never returned: [  ]\n  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.)',
    testedAt: 1612265169539,
    delegateId: null
  },
  metaData: null,
  correlationId: 'f2da1511-980f-44e4-bc98-38bb811775a6'
}
const testConnectorResultActive = {
  status: 'SUCCESS',
  data: {
    status: 'SUCCESS',
    errors: null,
    errorSummary: null,
    testedAt: 1612265169539,
    delegateId: null
  },
  metaData: null,
  correlationId: 'f2da1511-980f-44e4-bc98-38bb811775a6'
}

const reloadTestConnection = () => Promise.resolve(testConnectorResultError)
const reloadTestConnectionActive = () => Promise.resolve(testConnectorResultActive)
const reloadTestConnectionFailedAPI = () => {
  return undefined
}

const getEditButton = () => document.body.querySelector('.bp3-menu span[icon="edit"]')
const getDeleteButton = () => document.body.querySelector('.bp3-menu span[icon="trash"]')
const getMenuIcon = (row: Element) => {
  const columns = row.querySelectorAll('[role="cell"]')
  const lastColumn = columns[columns.length - 1]
  return lastColumn.querySelector('[data-icon="Options"]')
}

jest.mock('services/cd-ng', () => ({
  useGetConnectorStatistics: jest.fn().mockImplementation(() => Promise.resolve(statisticsMockData)),
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => Promise.resolve(catalogueData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { data: filters, loading: false }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteConnector: jest.fn().mockImplementation(() => Promise.resolve()),
  useGetTestConnectionResult: jest.fn()
}))

describe('Connectors List Test', () => {
  const props = {
    data: connectorsData.data as any,
    reload: jest.fn(),
    openConnectorModal: jest.fn(),
    gotoPage: jest.fn()
  }

  const setup = (customProps = {}) =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsListView {...{ ...props, ...customProps }} />
      </TestWrapper>
    )

  test('Initial render should match snapshot', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    expect(container).toMatchSnapshot()
  })

  test('Click on Test button with result error', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('Test in progress')).toBeDefined()

    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())
    await waitFor(() => expect(getAllByText('error')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('Click on Test button with result active', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnectionActive }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('Test in progress')).toBeDefined()
    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())

    await waitFor(() => expect(getAllByText('active')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('Click on Test button with result Failed api', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnectionFailedAPI }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('Test in progress')).toBeDefined()
    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('Context menu should be present on each connector row', async () => {
    const { container } = setup()
    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))
    tableRows.shift() // remove header row

    const testRow = async (row: Element) => {
      const menuIcon = getMenuIcon(row)
      // assert that menu icon exists in the last column
      expect(menuIcon).toBeTruthy()
      const checkForMenuState = async (shouldExist = false) => {
        if (shouldExist) {
          await waitFor(() => expect(getEditButton()).toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).toBeTruthy())
        } else {
          await waitFor(() => expect(getEditButton()).not.toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).not.toBeTruthy())
        }
      }
      // menu should not be open by default
      await checkForMenuState()
      act(() => {
        fireEvent.click(menuIcon!)
      })
      // menu should open on clicking the options icon
      await checkForMenuState(true)

      act(() => {
        fireEvent.mouseDown(document)
      })
    }
    for (const tableRow of tableRows) {
      await testRow(tableRow)
    }
  })

  test('Edit and delete methods should be called with correct data', async () => {
    const openConnectorModal = jest.fn()
    const { container } = setup({ openConnectorModal })
    const currentConnector = connectorsData.data.content[0].connector
    const deleteText = `Are you sure you want to delete the Connector `
    const menuIcon = getMenuIcon(container.querySelectorAll('div[role="row"]')[1])
    act(() => {
      fireEvent.click(menuIcon!)
    })
    act(() => {
      fireEvent.click(getDeleteButton()!)
    })
    await waitFor(() => expect(queryByText(document.body, `${deleteText}${currentConnector.name}`)).toBeTruthy())
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'Cancel')!)
    })
    act(() => {
      fireEvent.click(getEditButton()!)
    })
    expect(openConnectorModal).toBeCalledWith(true, currentConnector.type, currentConnector)
  })
})
