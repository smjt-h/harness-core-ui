/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import type { Column, CellProps } from 'react-table'
import {
  Text,
  FontVariation,
  Layout,
  TableV2,
  Container,
  RadioButton,
  Color,
  TextInput,
  FormError
} from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { repos } from './mocks/repositories'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectRepositoryRef {
  repository: Repository
}

export type SelectRepositoryForwardRef =
  | ((instance: SelectRepositoryRef | null) => void)
  | React.MutableRefObject<SelectRepositoryRef | null>
  | null

interface SelectRepositoryProps {
  selectedRepository?: Repository
  showError?: boolean
}

const SelectRepositoryRef = (
  props: SelectRepositoryProps,
  forwardRef: SelectRepositoryForwardRef
): React.ReactElement => {
  const { selectedRepository, showError } = props
  const { getString } = useStrings()
  const [repository, setRepository] = useState<Repository | undefined>(selectedRepository)
  const [, setQuery] = useState<string>()

  const debouncedRepositorySearch = useCallback(
    debounce((query: string): void => {
      setQuery(query)
    }, 500),
    []
  )

  useEffect(() => {
    if (selectedRepository) {
      setRepository(selectedRepository)
    }
  }, [selectedRepository])

  useEffect(() => {
    if (!forwardRef) {
      return
    }

    if (typeof forwardRef === 'function') {
      return
    }

    if (repository) {
      forwardRef.current = {
        repository: repository
      }
    }
  })

  const showValidationErrorForRepositoryNotSelected = showError && !repository?.name

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.selectYourRepo')}</Text>
      <Text font={{ variation: FontVariation.BODY2 }}>{getString('ci.getStartedWithCI.codebaseHelptext')}</Text>
      <Container
        padding={{ top: 'small' }}
        className={cx(css.repositories, { [css.repositoriesWithError]: showValidationErrorForRepositoryNotSelected })}
      >
        <TextInput
          leftIcon="search"
          placeholder={getString('ci.getStartedWithCI.searchRepo')}
          className={css.repositorySearch}
          leftIconProps={{ name: 'search', size: 18, padding: 'xsmall' }}
          onChange={e => {
            const queryText = (e.currentTarget as HTMLInputElement).value?.trim()
            if (queryText) {
              debouncedRepositorySearch(queryText)
            }
          }}
        />
        <RepositorySelectionTable repositories={repos} onRowClick={setRepository} />
        {showValidationErrorForRepositoryNotSelected ? (
          <Container padding={{ top: 'xsmall' }}>
            <FormError
              name={'repository'}
              errorMessage={getString('fieldRequired', {
                field: getString('repository')
              })}
            />
          </Container>
        ) : null}
      </Container>
    </Layout.Vertical>
  )
}

interface Repository {
  name: string
}

interface RepositorySelectionTableProps {
  repositories: Repository[]
  onRowClick: (repo: Repository) => void
}

function RepositorySelectionTable({ repositories, onRowClick }: RepositorySelectionTableProps): React.ReactElement {
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = useState<Repository | undefined>(undefined)

  useEffect(() => {
    if (selectedRow) {
      onRowClick(selectedRow)
    }
  }, [selectedRow])

  const columns: Column<Repository>[] = React.useMemo(
    () => [
      {
        accessor: 'name',
        width: '100%',
        Cell: ({ row }: CellProps<Repository>) => {
          const { name: repositoryName } = row.original
          const isRowSelected = repositoryName === selectedRow?.name
          return (
            <Layout.Horizontal
              data-testid={repositoryName}
              className={css.repositoryRow}
              flex={{ justifyContent: 'flex-start' }}
              spacing="small"
            >
              <RadioButton checked={isRowSelected} />
              <Text
                lineClamp={1}
                font={{ variation: FontVariation.BODY2 }}
                color={isRowSelected ? Color.PRIMARY_7 : Color.GREY_900}
              >
                {repositoryName}
              </Text>
            </Layout.Horizontal>
          )
        },
        disableSortBy: true
      }
    ],
    [getString]
  )

  return (
    <TableV2<Repository>
      columns={columns}
      data={repositories || []}
      hideHeaders={true}
      minimal={true}
      resizable={false}
      sortable={false}
      className={css.repositoryTable}
      onRowClick={data => setSelectedRow(data)}
    />
  )
}

export const SelectRepository = React.forwardRef(SelectRepositoryRef)
