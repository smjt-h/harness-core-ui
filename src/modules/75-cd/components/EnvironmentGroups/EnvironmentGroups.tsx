/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'

import {
  ButtonVariation,
  Dialog,
  ExpandingSearchInput,
  HarnessDocTooltip,
  Heading,
  Page,
  SelectOption,
  Container,
  Layout,
  Text,
  DropDown,
  Pagination
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { useGetEnvironmentGroupList } from 'services/cd-ng'

import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import CreateEnvironmentGroupModal from './CreateEnvironmentGroupModal'
import EnvironmentGroupsList from './EnvironmentGroupsList'
import NoEnvironmentGroups from './NoEnvironmentGroups'
import EnvironmentTabs from '../Environments/EnvironmentTabs'
import { Sort, SortFields } from './utils'

import css from './EnvironmentGroups.module.scss'

export default function EnvironmentGroupsPage(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')

  const [pageIndex, setPageIndex] = useState(0)
  const sortOptions: SelectOption[] = [
    {
      label: getString('lastUpdatedSort'),
      value: SortFields.LastUpdatedAt
    },
    {
      label: getString('AZ09'),
      value: SortFields.AZ09
    },
    {
      label: getString('ZA90'),
      value: SortFields.ZA90
    }
  ]
  const [sort, setSort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.ASC])
  const [sortOption, setSortOption] = useState<SelectOption>(sortOptions[0])

  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex,
      pageSize: 10,
      searchTerm,
      sortOrders: sort
    }),
    [accountId, orgIdentifier, projectIdentifier, pageIndex, searchTerm, sort]
  )

  const { data, loading, error, refetch } = useGetEnvironmentGroupList({
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const response = data?.data
  const hasContent = Boolean(!loading && !response?.empty)
  const emptyContent = Boolean(!loading && response?.empty)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideModal}
        title={getString('common.environmentGroup.createNew')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStyles)}
      >
        <CreateEnvironmentGroupModal closeModal={hideModal} />
      </Dialog>
    ),
    [orgIdentifier, projectIdentifier]
  )

  return (
    <>
      <Page.Header
        size={'standard'}
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
        title={
          <Heading level={4} font={{ variation: FontVariation.H4 }} data-tooltip-id={'ff_env_group_heading'}>
            {getString('common.environmentGroups.label')}
            <HarnessDocTooltip tooltipId={'ff_env_group_heading'} useStandAlone />
          </Heading>
        }
        toolbar={<EnvironmentTabs />}
      />
      <Page.SubHeader>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          data-testid="add-environment-group"
          icon="plus"
          text={getString('common.environmentGroup.new')}
          onClick={showModal}
          permission={{
            permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP,
            resource: {
              resourceType: ResourceType.ENVIRONMENT_GROUP
            }
          }}
        />
        <ExpandingSearchInput
          alwaysExpanded
          width={200}
          placeholder={getString('search')}
          onChange={setSearchTerm}
          throttle={200}
        />
      </Page.SubHeader>
      <Page.Body error={error?.message} retryOnError={() => refetch()} loading={loading}>
        {hasContent && (
          <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
                {getString('total')}: {response?.totalItems}
              </Text>
              <DropDown
                items={sortOptions}
                value={sortOption.value.toString()}
                filterable={false}
                width={180}
                icon={'main-sort'}
                iconProps={{ size: 16, color: Color.GREY_400 }}
                onChange={item => {
                  if (item.value === SortFields.AZ09) {
                    setSort([SortFields.Name, Sort.ASC])
                  } else if (item.value === SortFields.ZA90) {
                    setSort([SortFields.Name, Sort.DESC])
                  } else if (item.value === SortFields.LastUpdatedAt) {
                    setSort([SortFields.LastUpdatedAt, Sort.ASC])
                  }
                  setPageIndex(0)
                  setSortOption(item)
                }}
              />
            </Layout.Horizontal>
            <EnvironmentGroupsList environmentGroups={response?.content} refetch={refetch} />
            <Pagination
              itemCount={defaultTo(response?.totalItems, 0)}
              pageSize={defaultTo(response?.pageSize, 10)}
              pageCount={defaultTo(response?.totalPages, -1)}
              pageIndex={defaultTo(response?.pageIndex, 0)}
              gotoPage={setPageIndex}
            />
          </Container>
        )}
        {emptyContent && <NoEnvironmentGroups searchTerm={searchTerm} showModal={showModal} />}
      </Page.Body>
      )
    </>
  )
}
