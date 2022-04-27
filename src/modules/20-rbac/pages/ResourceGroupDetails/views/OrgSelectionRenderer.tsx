/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { Color, Layout, PageSpinner, Table, Tag, TagsPopover, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { groupBy } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ResourceGroupDetailsPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { ScopeSelector } from 'services/resourcegroups'
import { Organization, useGetOrganizationList, useGetProjectList } from 'services/cd-ng'
import DescriptionPopover from '@common/components/DescriptionPopover.tsx/DescriptionPopover'
import { getAllProjects, includeProjects } from '../utils'

interface OrgSelectionRendererProps {
  includedScopes: ScopeSelector[]
}
interface OrgSelector {
  organization?: Organization
  scopes: ScopeSelector[]
}

const RenderColumnProject: Renderer<CellProps<OrgSelector>> = ({ row }) => {
  const { accountId } = useParams<ResourceGroupDetailsPathProps & ModulePathParams>()
  const hasProjects = includeProjects(row.original.scopes)
  const projects = getAllProjects(row.original.scopes)

  const { data, refetch } = useGetProjectList({
    lazy: true
  })
  const { getString } = useStrings()
  useEffect(() => {
    if (hasProjects) {
      refetch({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: row.original.organization?.identifier,
          identifiers: projects
        }
      })
    }
  }, [hasProjects])

  if (!hasProjects) return <></>
  return projects.length ? (
    <Layout.Horizontal spacing="xsmall">
      {data?.data?.content?.map(({ project }) => (
        <Tag key={project.identifier}>{`${project.name} (${getString('idLabel', { id: project.identifier })})`}</Tag>
      ))}
    </Layout.Horizontal>
  ) : (
    <Text>{`${getString('rbac.scopeItems.allProjects')} (${data?.data?.content?.length})`}</Text>
  )
}

const RenderColumnOrg: Renderer<CellProps<OrgSelector>> = ({ row }) => {
  const data = row.original.organization
  const { getString } = useStrings()

  return data ? (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
        <Layout.Horizontal spacing="small">
          <Text color={Color.BLACK} lineClamp={1}>
            {data.name}
          </Text>
          {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null}
          {data.description && <DescriptionPopover text={data.description} />}
        </Layout.Horizontal>
        <Text color={Color.GREY_600} lineClamp={1} font={{ size: 'small' }}>
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

const OrgSelectionRenderer: React.FC<OrgSelectionRendererProps> = ({ includedScopes }) => {
  const { accountId } = useParams<ResourceGroupDetailsPathProps & ModulePathParams>()
  const scopeGroup = groupBy(includedScopes, 'orgIdentifier')
  const { getString } = useStrings()

  const { data: organizations, loading } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId,
      identifiers: Object.keys(scopeGroup)
    }
  })

  const data: OrgSelector[] = Object.entries(scopeGroup)
    .filter(([org, _scopes]) => !!org)
    .map(([org, scopes]) => ({
      organization: organizations?.data?.content
        ?.filter(res => res.organization.identifier === org)
        .map(res => res.organization)?.[0],
      scopes
    }))

  const columns: Column<OrgSelector>[] = useMemo(
    () => [
      {
        Header: getString('orgsText'),
        accessor: 'organization',
        id: 'organization',
        width: '20%',
        Cell: RenderColumnOrg
      },
      {
        Header: getString('projectsText'),
        accessor: 'scopes',
        id: 'projects',
        width: '80%',
        Cell: RenderColumnProject
      }
    ],
    [data, includedScopes, scopeGroup]
  )

  return (
    <>
      <Table<OrgSelector> columns={columns} data={data} bpTableProps={{ bordered: false }} />
      {loading ? <PageSpinner /> : null}
    </>
  )
}

export default OrgSelectionRenderer
