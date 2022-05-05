/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, TableV2, Text } from '@harness/uicore'

import React, { useMemo } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PageVariableResponseDTO, StringVariableConfigDTO, VariableResponseDTO } from 'services/cd-ng'
import { getValueFromVariableAndValidationType } from '@variables/utils/VariablesUtils'
import css from './VariableListView.module.scss'

interface SecretsListProps {
  variables?: PageVariableResponseDTO
  gotoPage: (pageNumber: number) => void
  refetch?: () => void
}

const VariableListView: React.FC<SecretsListProps> = props => {
  const { variables, gotoPage, refetch } = props
  const variablesList: VariableResponseDTO[] = useMemo(() => variables?.content || [], [variables?.content])
  const { getString } = useStrings()

  const RenderColumnVariable: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Layout.Horizontal>
        <Layout.Vertical>
          <Text color={Color.BLACK} lineClamp={1} width={230}>
            {data.name}
          </Text>

          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} width={230} lineClamp={1}>
            {`${getString('common.ID')}: ${data.identifier}`}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const RenderColumnType: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.BLACK} font={{ variation: FontVariation.BODY }}>
        {data.type}
      </Text>
    )
  }
  const RenderColumnValidation: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.BLACK} font={{ variation: FontVariation.BODY }}>
        {data.spec.valueType}
      </Text>
    )
  }

  const RenderColumnValue: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable

    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.FORM_INPUT_TEXT }}>
        {getValueFromVariableAndValidationType(data)}
      </Text>
    )
  }
  const RenderColumnDefaultValue: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.FORM_INPUT_TEXT }}>
        {(data.spec as StringVariableConfigDTO)?.defaultValue}
      </Text>
    )
  }

  const columns: Column<VariableResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('variableLabel'),
        accessor: row => row.variable.name,
        id: 'name',
        width: '25%',
        Cell: RenderColumnVariable
      },
      {
        Header: getString('typeLabel'),
        accessor: row => row.variable.type,
        id: 'type',
        width: '15%',
        Cell: RenderColumnType
      },
      {
        Header: getString('variables.inputValidation'),
        accessor: row => row.variable.spec.valueType,
        id: 'validation',
        width: '15%',
        Cell: RenderColumnValidation
      },
      {
        Header: getString('valueLabel'),
        accessor: row => row.variable.identifier,
        id: 'value',
        width: '30%',
        Cell: RenderColumnValue
      },
      {
        Header: getString('variables.defaultValue'),
        accessor: row => row.variable.spec,
        id: 'defaultValue',
        width: '15%',
        Cell: RenderColumnDefaultValue
      }
    ],
    [refetch]
  )

  return (
    <TableV2<VariableResponseDTO>
      className={css.table}
      columns={columns}
      data={variablesList}
      name="VariableListView"
      pagination={{
        itemCount: variables?.totalItems || 0,
        pageSize: variables?.pageSize || 10,
        pageCount: variables?.totalPages || -1,
        pageIndex: variables?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default VariableListView
