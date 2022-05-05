/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Layout, ExpandingSearchInput } from '@harness/uicore'
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
import css from './VariablesPage.module.scss'

const VariablesPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const variableLabel = getString('common.variables')
  useDocumentTitle(variableLabel)

  const { openCreateUpdateVariableModal } = useCreateEditVariableModal({})

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
            onClick={() => openCreateUpdateVariableModal()}
          />
        </Layout.Horizontal>
        <ExpandingSearchInput alwaysExpanded width={200} placeholder={getString('search')} throttle={200} />
      </Layout.Horizontal>

      <Page.Body>{/* TODO */}</Page.Body>
    </>
  )
}

export default VariablesPage
