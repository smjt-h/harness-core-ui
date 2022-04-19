/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, getErrorInfoFromErrorObject, Layout, Text } from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceScope } from 'services/cd-ng'
import type { ErrorHandlerProps } from '../utils'
import css from '@rbac/components/RBACTooltip/RBACTooltip.module.scss'

interface RbacErrorReturn {
  getRBACErrorMessage: (error: ErrorHandlerProps) => React.ReactElement
}

const useRBACError = (): RbacErrorReturn => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()

  const getProjectScopeSuffix = (resourceScope: ResourceScope): string => {
    /* istanbul ignore else */
    if (selectedProject && [resourceScope.projectIdentifier, projectIdentifier].includes(selectedProject.identifier)) {
      return selectedProject.name
    } else {
      return resourceScope.projectIdentifier || projectIdentifier
    }
  }

  const getScopeSuffix = (currentScope: Scope, resourceScope: ResourceScope): string => {
    const currentScopeLabel = getString(`rbac.${currentScope}` as keyof StringsMap)
    switch (currentScope) {
      case Scope.PROJECT: {
        return `${currentScopeLabel} "${getProjectScopeSuffix(resourceScope)}"`
      }
      case Scope.ORG: {
        return `${currentScopeLabel} "${resourceScope.orgIdentifier || orgIdentifier}"`
      }
      default: {
        return getString('rbac.accountScope')
      }
    }
  }

  const getRBACErrorMessage = (error: ErrorHandlerProps): React.ReactElement => {
    const err = error?.data
    if (err && err.code === 'NG_ACCESS_DENIED' && err.failedPermissionChecks?.length) {
      const { permission, resourceType, resourceScope } = err.failedPermissionChecks[0]
      /* istanbul ignore else */
      if (permission && resourceType && resourceScope) {
        const resourceTypeHandler = RbacFactory.getResourceTypeHandler(resourceType as ResourceType)
        const currentScope = getScopeFromDTO(
          defaultTo(resourceScope, {
            projectIdentifier,
            orgIdentifier,
            accountIdentifier: accountId
          })
        )
        let permissionLabel = resourceTypeHandler?.permissionLabels?.[permission as PermissionIdentifier] || permission
        /* istanbul ignore else */
        if (typeof permissionLabel !== 'string') {
          permissionLabel = getString(permissionLabel.props.stringID)
        }
        return (
          <Layout.Vertical padding="small" spacing="small" className={css.main}>
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800}>
              {`${getString('rbac.youAreNotAuthorizedTo')} `}
              <span className={css.textToLowercase}>{permissionLabel}</span>
              <span className={css.textToLowercase}>
                {` ${resourceTypeHandler?.label && getString(resourceTypeHandler?.label)}.`}
              </span>
            </Text>
            <Text font={{ size: 'small' }} color={Color.GREY_800}>
              {getString('rbac.youAreMissingTheFollowingPermission')}
            </Text>
            <Text font={{ size: 'small' }} color={Color.GREY_800}>
              {'"'}
              {permissionLabel}
              <span className={css.textToLowercase}>
                {` ${resourceTypeHandler?.label && getString(resourceTypeHandler?.label)}`}
              </span>
              {'"'}
              <span>{` ${getString('rbac.in')} ${getScopeSuffix(currentScope, resourceScope)}`}</span>
            </Text>
          </Layout.Vertical>
        )
      }
    }
    return <>{getErrorInfoFromErrorObject(error)}</>
  }
  return {
    getRBACErrorMessage
  }
}

export default useRBACError
