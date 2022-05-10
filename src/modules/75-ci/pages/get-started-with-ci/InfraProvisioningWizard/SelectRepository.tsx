/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
  FormError,
  Icon
} from '@harness/uicore'
import { useGetAllUserRepos, UserRepoResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectRepositoryRef {
  repository: UserRepoResponse
}

export type SelectRepositoryForwardRef =
  | ((instance: SelectRepositoryRef | null) => void)
  | React.MutableRefObject<SelectRepositoryRef | null>
  | null

interface SelectRepositoryProps {
  selectedRepository?: UserRepoResponse
  showError?: boolean
}

const SelectRepositoryRef = (
  props: SelectRepositoryProps,
  forwardRef: SelectRepositoryForwardRef
): React.ReactElement => {
  const { selectedRepository, showError } = props
  const { getString } = useStrings()
  const [repository, setRepository] = useState<UserRepoResponse | undefined>(selectedRepository)
  const [query, setQuery] = useState<string>('')
  const [repositories, setRepositories] = useState<UserRepoResponse[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data: repoData, loading: fetchingRepositories } = useGetAllUserRepos({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: 'account.github_pat'
    }
  })

  useEffect(() => {
    setRepositories(repoData?.data)
  }, [repoData?.data])

  const debouncedRepositorySearch = useCallback(
    debounce((queryText: string): void => {
      setQuery(queryText)
    }, 500),
    []
  )

  useEffect(() => {
    if (selectedRepository) {
      setRepository(selectedRepository)
    }
  }, [selectedRepository])

  useEffect(() => {
    setLoading(true)
    const repositortiesListClone = [...(repositories || [])]
    if (query) {
      setRepositories(repositortiesListClone.filter(item => item.name?.includes(query)))
    } else {
      setRepositories(repoData?.data)
    }
    setLoading(false)
  }, [query])

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

  const renderView = React.useCallback((): JSX.Element => {
    if (fetchingRepositories || loading) {
      return (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" padding={{ top: 'large' }}>
          <Icon name="steps-spinner" color="primary7" size={25} />
          {fetchingRepositories ? (
            <Text font={{ variation: FontVariation.H6 }}>{getString('ci.getStartedWithCI.fetchingRepos')}</Text>
          ) : null}
        </Layout.Horizontal>
      )
    } else {
      if (repositories && repositories?.length > 0) {
        return <RepositorySelectionTable repositories={repositories} onRowClick={setRepository} />
      } else {
        return (
          <Text flex={{ justifyContent: 'center' }} padding={{ top: 'medium' }}>
            {getString('noSearchResultsFoundPeriod')}
          </Text>
        )
      }
    }
    return <></>
  }, [fetchingRepositories, loading, repositories])

  const showValidationErrorForRepositoryNotSelected = showError && !repository?.name

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.selectYourRepo')}</Text>
      <Text font={{ variation: FontVariation.BODY2 }}>{getString('ci.getStartedWithCI.codebaseHelptext')}</Text>
      <Container padding={{ top: 'small' }} className={cx(css.repositories)}>
        <TextInput
          leftIcon="search"
          placeholder={getString('ci.getStartedWithCI.searchRepo')}
          className={css.repositorySearch}
          leftIconProps={{ name: 'search', size: 18, padding: 'xsmall' }}
          onChange={e => {
            debouncedRepositorySearch((e.currentTarget as HTMLInputElement).value)
          }}
          disabled={loading || fetchingRepositories}
        />
        {renderView()}
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

interface RepositorySelectionTableProps {
  repositories: UserRepoResponse[]
  onRowClick: (repo: UserRepoResponse) => void
}

function RepositorySelectionTable({ repositories, onRowClick }: RepositorySelectionTableProps): React.ReactElement {
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = useState<UserRepoResponse | undefined>(undefined)

  useEffect(() => {
    if (selectedRow) {
      onRowClick(selectedRow)
    }
  }, [selectedRow])

  const columns: Column<UserRepoResponse>[] = React.useMemo(
    () => [
      {
        accessor: 'name',
        width: '100%',
        Cell: ({ row }: CellProps<UserRepoResponse>) => {
          const { name: repositoryName, namespace } = row.original
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
                {namespace && repositoryName ? `${namespace}/${repositoryName}` : repositoryName ?? ''}
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
    <TableV2<UserRepoResponse>
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
