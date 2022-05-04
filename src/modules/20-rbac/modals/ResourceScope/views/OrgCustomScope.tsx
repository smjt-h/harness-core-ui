/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Checkbox, Layout, RadioButtonGroup, MultiSelect, MultiSelectOption } from '@harness/uicore'
import React, { FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetProjectList } from 'services/cd-ng'
import type { ScopeSelector } from 'services/resourcegroups'
import { getAllProjects } from '@rbac/pages/ResourceGroupDetails/utils'
import { SelectionType } from '@rbac/utils/utils'

interface OrgCustomScopeProps {
  selectedScopes: ScopeSelector[][]
  setSelectedScopes: React.Dispatch<React.SetStateAction<ScopeSelector[][]>>
  hasCurrentScope: boolean
  setHasCurrentScope: React.Dispatch<React.SetStateAction<boolean>>
}

const OrgCustomScope: React.FC<OrgCustomScopeProps> = ({
  selectedScopes,
  setSelectedScopes,
  hasCurrentScope,
  setHasCurrentScope
}) => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const projects = getAllProjects(selectedScopes[0])
  const { data } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      searchTerm
    },
    debounce: 300
  })

  const [projectSelection, setProjectSelection] = useState<SelectionType>(
    projects?.length ? SelectionType.SPECIFIED : SelectionType.ALL
  )
  const projectOpts: MultiSelectOption[] =
    data?.data?.content?.map(res => ({
      label: res.project.name,
      value: res.project.identifier
    })) || []

  const selectedProjects = data?.data?.content?.reduce((acc: MultiSelectOption[], curr) => {
    if (projects?.includes(curr.project.identifier)) {
      acc.push({
        label: curr.project.name,
        value: curr.project.identifier
      })
    }
    return acc
  }, [])

  return (
    <Layout.Vertical spacing="small" padding={{ top: 'large' }}>
      <Checkbox
        label={getString('rbac.resourceScope.includeOrgResources')}
        defaultChecked={hasCurrentScope}
        onChange={event => {
          setHasCurrentScope(event.currentTarget.checked)
        }}
      />

      <Layout.Vertical spacing="small">
        <RadioButtonGroup
          name="project-selection"
          inline={true}
          selectedValue={projectSelection}
          onChange={(e: FormEvent<HTMLInputElement>) => {
            setProjectSelection(e.currentTarget.value as SelectionType)
          }}
          options={[
            { label: getString('rbac.scopeItems.allProjects'), value: SelectionType.ALL },
            { label: getString('rbac.scopeItems.specificProjects'), value: SelectionType.SPECIFIED }
          ]}
          margin={{ bottom: 'small' }}
        />
        {projectSelection === SelectionType.SPECIFIED && (
          <MultiSelect
            fill
            items={projectOpts}
            value={selectedProjects}
            onQueryChange={item => {
              setSearchTerm(item)
            }}
            onChange={items => {
              setSelectedScopes(oldVal =>
                produce(oldVal, draft => {
                  draft[0] = items.map(item => ({
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier: item.value.toString(),
                    filter: 'EXCLUDING_CHILD_SCOPES'
                  }))
                })
              )
            }}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default OrgCustomScope
