/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { Container, Layout, Text, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useGetVariablesList, VariableResponseDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'

import { useStrings } from 'framework/strings'
import {
  RenderColumnDefaultValue,
  RenderColumnType,
  RenderColumnValidation,
  RenderColumnValue,
  RenderColumnVariable
} from '@variables/pages/variables/views/VariableListView'

type ParsedColumnContent = VariableResponseDTO & { identifier: string }
const VariableResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()

  const { data: variableResponse, loading } = useGetVariablesList({
    queryParams: {
      accountIdentifier,
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier
    },
    debounce: 300
  })

  const variableList = variableResponse?.data?.content?.map(dataContent => ({
    identifier: dataContent.variable.identifier,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
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
    []
  )
  if (loading) return <PageSpinner />
  return variableList?.length ? (
    <Container>
      <ResourceHandlerTable
        data={variableList as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        pagination={{
          itemCount: variableResponse?.data?.totalItems || 0,
          pageSize: variableResponse?.data?.pageSize || 10,
          pageCount: variableResponse?.data?.totalPages || -1,
          pageIndex: variableResponse?.data?.pageIndex || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default VariableResourceModalBody
