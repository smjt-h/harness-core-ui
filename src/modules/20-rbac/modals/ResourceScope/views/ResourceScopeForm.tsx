/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Color, Layout, RadioButtonGroup } from '@harness/uicore'
import React, { FormEvent, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { groupBy, isEqual, uniqWith } from 'lodash-es'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ModulePathParams, ResourceGroupDetailsPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getScopeDropDownItems,
  getSelectedScopeType,
  SelectorScope,
  includesCurrentScope
} from '@rbac/pages/ResourceGroupDetails/utils'
import { useStrings } from 'framework/strings'
import type { ScopeSelector } from 'services/resourcegroups'
import { Scope } from '@common/interfaces/SecretsInterface'
import AccountCustomScope from './AccountCustomScope'
import OrgCustomScope from './OrgCustomScope'
import css from './ResourceScopeForm.module.scss'

interface ResourceScopeFormProps {
  scopes: ScopeSelector[]
  onSubmit: (scopes: ScopeSelector[]) => void
  onCancel: () => void
}
const ResourceScopeForm: React.FC<ResourceScopeFormProps> = ({ scopes, onSubmit, onCancel }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ResourceGroupDetailsPathProps & ModulePathParams>()
  const resourceGroupScope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  const scopeGroup = groupBy(scopes, 'orgIdentifier')
  const [hasCurrentScope, setHasCurrentScope] = useState(includesCurrentScope(scopes, resourceGroupScope))
  const [selectedScopes, setSelectedScopes] = useState(Object.values(scopeGroup))
  const [selectedScope, setSelectedScope] = useState<SelectorScope>(getSelectedScopeType(resourceGroupScope, scopes))
  const { getString } = useStrings()

  const getIncludedScopes = (): ScopeSelector[] => {
    switch (selectedScope) {
      case SelectorScope.CUSTOM:
        return uniqWith(
          [
            ...(hasCurrentScope
              ? [
                  {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier,
                    filter: 'EXCLUDING_CHILD_SCOPES'
                  } as ScopeSelector
                ]
              : []),
            ...selectedScopes.flat()
          ],
          isEqual
        )
      default:
        return [
          {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            filter: selectedScope === SelectorScope.CURRENT ? 'EXCLUDING_CHILD_SCOPES' : 'INCLUDING_CHILD_SCOPES'
          }
        ]
    }
  }
  return (
    <Layout.Vertical>
      <RadioButtonGroup
        name="resourceScope"
        inline={true}
        selectedValue={selectedScope}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          setSelectedScope(e.currentTarget.value as SelectorScope)
        }}
        options={getScopeDropDownItems(resourceGroupScope, getString)}
        margin={{ bottom: 'small' }}
      />
      <Layout.Vertical className={cx(css.main, { [css.custom]: selectedScope === SelectorScope.CUSTOM })}>
        {selectedScope === SelectorScope.CUSTOM && (
          <Layout.Vertical border={{ top: true, color: Color.GREY_200 }}>
            {resourceGroupScope === Scope.ACCOUNT && (
              <AccountCustomScope
                selectedScopes={selectedScopes}
                setSelectedScopes={setSelectedScopes}
                hasCurrentScope={hasCurrentScope}
                setHasCurrentScope={setHasCurrentScope}
              />
            )}
            {resourceGroupScope === Scope.ORG && (
              <OrgCustomScope
                selectedScopes={selectedScopes}
                setSelectedScopes={setSelectedScopes}
                hasCurrentScope={hasCurrentScope}
                setHasCurrentScope={setHasCurrentScope}
              />
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
      <Layout.Horizontal spacing="small">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('common.apply')}
          onClick={() => {
            onSubmit(getIncludedScopes())
          }}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default ResourceScopeForm
