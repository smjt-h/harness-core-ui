/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Container, Text, Checkbox, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { CellProps, useTable, Column } from 'react-table'
import cx from 'classnames'
import { flatten } from 'lodash-es'
import { Action, ACTIONS, IState } from '@ce/components/NodeRecommendation/constants'

import css from './InstanceFamiliesModalTab.module.scss'

enum CheckboxStatus {
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  INDETERMINATE = 'indeterminate'
}

interface TabProps {
  data?: Record<string, string[]>
  state: IState
  dispatch: React.Dispatch<Action>
}

export const InstanceFamiliesModalTab: React.FC<TabProps> = ({ data, state, dispatch }) => {
  const categoryData = data || {}

  const series = Object.keys(categoryData).sort()
  const types = flatten(Object.values(categoryData))

  const getTypeCheckboxStatus = (val: string): CheckboxStatus => {
    if (state.includeTypes.includes(val)) {
      return CheckboxStatus.CHECKED
    } else if (state.excludeTypes.includes(val)) {
      return CheckboxStatus.INDETERMINATE
    } else {
      return CheckboxStatus.UNCHECKED
    }
  }

  const getSeriesCheckboxStatus = (val: string): CheckboxStatus => {
    if (state.includeSeries.includes(val)) {
      return CheckboxStatus.CHECKED
    } else if (state.excludeSeries.includes(val)) {
      return CheckboxStatus.INDETERMINATE
    } else {
      return CheckboxStatus.UNCHECKED
    }
  }

  const formatData = (seriesList: string[], typesList: string[]): Record<string, boolean>[] => {
    const formattedData: Record<string, boolean>[] = []

    seriesList.map(() => {
      const d: Record<string, boolean> = {}

      typesList.map(t => (d[t] = state.includeTypes.includes(t)))

      formattedData.push(d)
    })

    return formattedData
  }

  const handleInstanceTypeCheckbox = (status: CheckboxStatus, type: string) => {
    if (status === CheckboxStatus.UNCHECKED) {
      dispatch({ type: ACTIONS.INCLUDE_TYPES, data: type })
    } else if (status === CheckboxStatus.CHECKED) {
      dispatch({ type: ACTIONS.INCLUDE_TYPES, data: type })
      dispatch({ type: ACTIONS.EXCLUDE_TYPES, data: type })
    } else {
      dispatch({ type: ACTIONS.EXCLUDE_TYPES, data: type })
    }
  }

  const handleInstanceSeriesCheckbox = (status: CheckboxStatus, type: string) => {
    if (status === CheckboxStatus.UNCHECKED) {
      dispatch({ type: ACTIONS.INCLUDE_SERIES, data: type })
    } else if (status === CheckboxStatus.CHECKED) {
      dispatch({ type: ACTIONS.INCLUDE_SERIES, data: type })
      dispatch({ type: ACTIONS.EXCLUDE_SERIES, data: type })
    } else {
      dispatch({ type: ACTIONS.EXCLUDE_SERIES, data: type })
    }
  }

  const SeriesCell = ({ row }: CellProps<Record<string, boolean>>) => {
    const val = series[row.index]
    const status = getSeriesCheckboxStatus(val)

    return (
      <Layout.Horizontal className={css.rowHeader} padding="small" style={{ alignItems: 'center' }}>
        <Container className={css.rowCheckboxContainer}>
          <Container className={cx(css.rowCheckbox, { [css.rowCheckboxVisible]: status !== CheckboxStatus.UNCHECKED })}>
            <Checkbox
              className={css.overrideLabelPadding}
              checked={status === CheckboxStatus.CHECKED}
              indeterminate={status === CheckboxStatus.INDETERMINATE}
              onClick={() => handleInstanceSeriesCheckbox(status, val)}
              data-testid={`series-checkbox-${val}`}
            />
          </Container>
        </Container>
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>{val}</Text>
      </Layout.Horizontal>
    )
  }

  const columns: Column<Record<string, boolean>>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'series',
        Cell: SeriesCell
      },
      ...types.map(type => ({
        Header: type,
        accessor: type,
        id: type,
        Cell: ({ row }: CellProps<Record<string, boolean>>) => {
          const status = getTypeCheckboxStatus(type)

          if (!categoryData[series[row.index]].includes(type)) {
            return null
          }

          return (
            <Container flex={{ justifyContent: 'center', alignItems: 'center' }}>
              <Checkbox
                checked={status === CheckboxStatus.CHECKED}
                indeterminate={status === CheckboxStatus.INDETERMINATE}
                onClick={() => handleInstanceTypeCheckbox(status, type)}
                data-testid={`type-checkbox-${type}`}
              />
            </Container>
          )
        }
      }))
    ],
    [state]
  )

  return (
    <Container flex className={css.gridContainer}>
      <Grid
        data={formatData(series, types)}
        columns={columns}
        handleInstanceTypeCheckbox={handleInstanceTypeCheckbox}
        getTypeCheckboxStatus={getTypeCheckboxStatus}
      />
    </Container>
  )
}

interface GridProps {
  columns: Column<Record<string, boolean>>[]
  data: Record<string, boolean>[]
  getTypeCheckboxStatus: (val: string) => CheckboxStatus
  handleInstanceTypeCheckbox: (status: CheckboxStatus, val: string) => void
}

const Grid: React.FC<GridProps> = ({ columns, data, getTypeCheckboxStatus, handleInstanceTypeCheckbox }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  })
  const [columnHoverIndex, setColumnHoverIndex] = useState(0)

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr className={css.headerGroup} {...headerGroup.getHeaderGroupProps()} key={index}>
            {headerGroup.headers.map((column, headerIndex) => {
              const status = getTypeCheckboxStatus(column.render('Header')?.toString() || '')

              return (
                <th
                  {...column.getHeaderProps()}
                  key={headerIndex}
                  onMouseEnter={() => setColumnHoverIndex(headerIndex)}
                  onMouseLeave={() => setColumnHoverIndex(0)}
                  className={cx({ [css.hoverBackground]: headerIndex === columnHoverIndex && columnHoverIndex !== 0 })}
                >
                  <Layout.Horizontal style={{ alignItems: 'center' }}>
                    {column.render('Header') ? (
                      <Container
                        className={cx(css.columnCheckbox, {
                          [css.visible]: headerIndex === columnHoverIndex && columnHoverIndex !== 0
                        })}
                      >
                        <Checkbox
                          checked={status === CheckboxStatus.CHECKED}
                          indeterminate={status === CheckboxStatus.INDETERMINATE}
                          onClick={() => handleInstanceTypeCheckbox(status, column.render('Header')?.toString() || '')}
                          data-testid={`type-header-checkbox-${column.render('Header')}`}
                        />
                      </Container>
                    ) : null}
                    <Text className={css.tableHeader} font={{ variation: FontVariation.SMALL_BOLD }}>
                      {column.render('Header')}
                    </Text>
                  </Layout.Horizontal>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()} key={i}>
              {row.cells.map((cell, cellIndex) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    key={cellIndex}
                    onMouseEnter={() => setColumnHoverIndex(cellIndex)}
                    onMouseLeave={() => setColumnHoverIndex(0)}
                    className={cx({ [css.hoverBackground]: cellIndex === columnHoverIndex && columnHoverIndex !== 0 })}
                  >
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
