/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Card, Checkbox, DropDown, Label, Layout, SelectOption, ButtonVariation } from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetOrganizationList } from 'services/cd-ng'
import type { ScopeSelector } from 'services/resourcegroups'
import { getAllProjects, includeProjects } from '@rbac/pages/ResourceGroupDetails/utils'
import OrgSelectionRenderer from './OrgSelectionRenderer'
import css from './ResourceScopeForm.module.scss'

interface AccountCustomScopeProps {
  scopes: ScopeSelector[]
  setIncludedScopes: (scopes: ScopeSelector[]) => void
  selectedScopes: ScopeSelector[][]
  setSelectedScopes: React.Dispatch<React.SetStateAction<ScopeSelector[][]>>
}

const AccountCustomScope: React.FC<AccountCustomScopeProps> = ({
  scopes,
  setIncludedScopes,
  selectedScopes,
  setSelectedScopes
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { data: orgData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })
  const accountScopeOnly: ScopeSelector = {
    accountIdentifier: accountId,
    filter: 'EXCLUDING_CHILD_SCOPES'
  }
  const organizations: SelectOption[] =
    orgData?.data?.content?.map(org => {
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    }) || []

  const includeAccResources = (): boolean => {
    return !!scopes.find(scope => !scope.orgIdentifier && scope.filter === 'EXCLUDING_CHILD_SCOPES')
  }

  return (
    <Layout.Vertical spacing="small" padding={{ top: 'large' }}>
      <Checkbox
        label={getString('rbac.resourceScope.includeAccResources')}
        defaultChecked={includeAccResources()}
        onChange={event => {
          setIncludedScopes(
            produce(scopes, draft => {
              if (event.currentTarget.checked) {
                draft.push(accountScopeOnly)
              } else {
                draft.filter(item => item !== accountScopeOnly)
              }
            })
          )
        }}
      />
      <Layout.Vertical spacing="medium" className={css.orgSelection}>
        {selectedScopes.map((scope, index) => {
          const org = scope?.[0]?.orgIdentifier
          return (
            <Card key={org}>
              <Label>{getString('rbac.resourceScope.selectOrg')}</Label>
              <DropDown
                value={org}
                items={organizations}
                width={200}
                onChange={item => {
                  setSelectedScopes(
                    produce(selectedScopes, draft => {
                      draft[index] = [
                        {
                          filter: 'INCLUDING_CHILD_SCOPES',
                          accountIdentifier: accountId,
                          orgIdentifier: item.value.toString()
                        }
                      ]
                    })
                  )
                }}
              />
              {typeof org === 'string' ? (
                <OrgSelectionRenderer
                  accountIdentifier={accountId}
                  orgIdentifier={org}
                  index={index}
                  includeProjects={includeProjects(selectedScopes[index])}
                  projects={getAllProjects(selectedScopes[index])}
                  setSelectedScopes={setSelectedScopes}
                />
              ) : null}
              <Button
                variation={ButtonVariation.ICON}
                icon="trash"
                className={css.deleteIcon}
                onClick={() => {
                  setSelectedScopes(
                    produce(selectedScopes, draft => {
                      draft.splice(index, 1)
                    })
                  )
                }}
              />
            </Card>
          )
        })}
      </Layout.Vertical>

      <Layout.Horizontal>
        <Button
          text={getString('rbac.resourceScope.selectOrgsandProjects')}
          variation={ButtonVariation.LINK}
          onClick={() => {
            setSelectedScopes(
              produce(selectedScopes, draft => {
                draft.push([])
              })
            )
          }}
          className={css.addOrgs}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default AccountCustomScope
