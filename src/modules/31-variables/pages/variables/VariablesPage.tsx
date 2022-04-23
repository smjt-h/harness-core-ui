/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Layout, ExpandingSearchInput, PageSpinner, PageError } from '@harness/uicore'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import RbacButton from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'

import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import useCreateEditVariableModal from '@variables/modals/CreateEditVariableModal/useCreateEditVariableModal'

import { useGetVariablesList } from 'services/cd-ng'
import VariableListView from './views/VariableListView'
import css from './VariablesPage.module.scss'

const VariablesPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const variableLabel = getString('common.variables')
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  useDocumentTitle(variableLabel)

  const { openCreateUpdateVariableModal } = useCreateEditVariableModal({})

  const {
    data: variableResponse,
    loading,
    error,
    refetch
  } = useGetVariablesList({
    queryParams: {
      pageIndex: page,
      pageSize: 10,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      searchTerm
    }
  })
  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: variableLabel,
              [Scope.ORG]: variableLabel,
              [Scope.ACCOUNT]: variableLabel
            }}
          />
        }
      />

      <Layout.Horizontal flex className={css.header}>
        <Layout.Horizontal spacing="small">
          <RbacButton
            variation={ButtonVariation.PRIMARY}
            text={getString('variables.newVariable')}
            icon="plus"
            id="newVariableBtn"
            data-test="newVariableButton"
            onClick={openCreateUpdateVariableModal}
          />
        </Layout.Horizontal>
        <ExpandingSearchInput
          alwaysExpanded
          onChange={text => {
            setSearchTerm(text.trim())
            setPage(0)
          }}
          width={250}
        />
      </Layout.Horizontal>

      <Page.Body className={css.listBody}>
        {loading ? (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        ) : error ? (
          <div style={{ paddingTop: '200px' }}>
            <PageError
              message={(error?.data as Error)?.message || error?.message}
              onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                e.preventDefault()
                e.stopPropagation()
                refetch()
              }}
            />
          </div>
        ) : variableResponse?.data?.content?.length ? (
          <VariableListView
            variables={variableResponse.data}
            gotoPage={pageNumber => setPage(pageNumber)}
            refetch={refetch}
          />
        ) : (
          <Page.NoDataCard
            onClick={openCreateUpdateVariableModal}
            // imageClassName={css.connectorEmptyStateImg}
            buttonText={!searchTerm ? getString('variables.newVariable') : undefined}
            // image={ConnectorsEmptyState}
            message={searchTerm ? getString('variables.noVariableFound') : getString('variables.noVariableExist')}
          />
        )}
      </Page.Body>
    </>
  )
}

export default VariablesPage
