/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Heading,
  Layout,
  TabNavigation,
  ButtonVariation,
  GridListToggle,
  Views,
  Container,
  TableV2,
  Text,
  Pagination,
  Dialog
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useStrings, StringKeys } from 'framework/strings'
import { PageEnvironmentGroupResponse, useGetEnvironmentGroupList } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
// import { ModifiedByCell, TypeCell } from '@cf/pages/environments/EnvironmentsPage'
import EmptyContent from '../Environments/EnvironmentList/EmptyContent.svg'
import { EnvironmentName } from '../Environments/EnvironmentsListColumns/EnvironmentsListColumns'
import CreateEnvironmentGroupModal from './CreateEnvironmentGroupModal'

import css from './EnvironmentGroups.module.scss'
export interface EnvironmentWrapperProps {
  pageTitle: StringKeys
}

export default function EnvironmentWrapper({
  children,
  pageTitle
}: React.PropsWithChildren<unknown> & EnvironmentWrapperProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<PipelineType<PipelinePathProps>>()
  const [view, setView] = useState<Views>(Views.LIST)
  const [page, setPage] = useState(0)

  const { getString } = useStrings()
  useDocumentTitle(getString(pageTitle))

  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    page: page,
    size: 10
  }

  const { data, loading, error, refetch } = useGetEnvironmentGroupList({
    queryParams
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          hideModal()
        }}
        title={getString('common.environmentGroups.createNewEnvironmentGroup')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStylesEnv)}
      >
        <CreateEnvironmentGroupModal
          data={{ name: '', identifier: '', orgIdentifier, projectIdentifier }}
          closeModal={hideModal}
        />
      </Dialog>
    ),
    [orgIdentifier, projectIdentifier]
  )

  // type CustomColumn<T extends Record<string, any>> = Column<T>

  const environmentGroups = data?.data
  const hasEnvs = Boolean(!loading && environmentGroups?.content?.length)
  const emptyEnvs = Boolean(!loading && environmentGroups?.content?.length === 0)

  // const handleEdit = () => {
  //   console.log('Edit')
  // }

  // const handleDelete = () => {
  //   console.log('Delete')cons
  // }
  const columns: any = useMemo(
    // const columns: CustomColumn<EnvironmentGroupResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('common.environmentGroup').toUpperCase(),
        id: 'name',
        width: '40%',
        accessor: 'name',
        Cell: EnvironmentName
      }
      // {
      //   Header: getString('typeLabel').toUpperCase(),
      //   id: 'type',
      //   accessor: 'type',
      //   width: '15%',
      //   Cell: TypeCell
      // },
      // {
      //   id: 'modifiedBy',
      //   width: '10%',
      //   Cell: ModifiedByCell
      //   // actions: {
      //   //   onEdit: handleEdit,
      //   //   onDelete: handleDelete
      //   // }
      // }
    ],
    [getString]
  )

  return (
    <>
      {pageTitle === 'environments' ? (
        children
      ) : (
        <>
          <Page.Header
            size={'standard'}
            title={
              <Layout.Vertical>
                <Layout.Horizontal>
                  <NGBreadcrumbs customPathParams={{ module }} />
                </Layout.Horizontal>
                <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'left', alignItems: 'center' }}>
                  <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                    {getString(pageTitle)}
                  </Heading>
                </Layout.Horizontal>
              </Layout.Vertical>
            }
            toolbar={
              <TabNavigation
                size={'small'}
                links={[
                  {
                    label: getString('environment'),
                    to: routes.toEnvironments({
                      orgIdentifier,
                      projectIdentifier,
                      accountId,
                      module
                      // repoIdentifier,
                      // branch
                    })
                  },
                  {
                    label: getString('common.environmentGroups.title'),
                    to: routes.toEnvironmentGroups({
                      orgIdentifier,
                      projectIdentifier,
                      accountId,
                      module
                      // repoIdentifier,
                      // branch
                    })
                  }
                ]}
              />
            }
          />
          <Page.SubHeader>
            <Layout.Horizontal>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                data-testid="add-environment-group"
                icon="plus"
                text={getString('common.environmentGroups.newEnvironmentGroup')}
                onClick={showModal}
                // VIVEK: Add permission
                // permission={{
                //   permission: PermissionIdentifier.EDIT_ENVIRONMENT,
                //   resource: {
                //     resourceType: ResourceType.ENVIRONMENT
                //   }
                // }}
              />
            </Layout.Horizontal>
            <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
              {/* <>
                <ExpandingSearchInput
                  alwaysExpanded
                  width={200}
                  placeholder={getString('search')}
                  onChange={(text: string) => {
                    setIsReseting(true)
                    setSearchParam(text)
                  }}
                  ref={searchRef}
                  className={css.expandSearch}
                />
                {shouldRenderFilterSelector() && (
                  <Layout.Horizontal padding={{ left: 'small', right: 'small' }}>
                    <FilterSelector<FilterDTO>
                      appliedFilter={appliedFilter}
                      filters={filters}
                      onFilterBtnClick={openFilterDrawer}
                      onFilterSelect={handleFilterSelection}
                      fieldToLabelMapping={fieldToLabelMapping}
                      filterWithValidFields={filterWithValidFieldsWithMetaInfo}
                    />
                  </Layout.Horizontal>
                )}
              </> */}
              <GridListToggle initialSelectedView={Views.GRID} onViewToggle={setView} />
            </Layout.Horizontal>
          </Page.SubHeader>
          <Page.Body error={error?.message} retryOnError={() => refetch()} loading={loading}>
            {hasEnvs &&
              (view === Views.LIST ? (
                <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
                  <TableV2<PageEnvironmentGroupResponse>
                    columns={columns}
                    data={(environmentGroups?.content as PageEnvironmentGroupResponse[]) || []}
                    // onRowClick={(row: EnvironmentResponseDTO) => {
                    //   handleEnvEdit(defaultTo(row.identifier, ''))
                    // }}
                    pagination={{
                      itemCount: environmentGroups?.totalItems || 0,
                      pageSize: environmentGroups?.pageSize || 10,
                      pageCount: environmentGroups?.totalPages || -1,
                      pageIndex: environmentGroups?.pageIndex || 0,
                      gotoPage: pageNumber => setPage(pageNumber)
                    }}
                  />
                </Container>
              ) : (
                <>
                  <Container>
                    <Layout.Masonry
                      center
                      gutter={25}
                      items={environmentGroups?.content || []}
                      renderItem={(item: any) => (
                        <div>Env Group: {item.identifier}</div>
                        // <PipelineCard
                        //   pipeline={item}
                        //   goToPipelineDetail={goToPipelineDetail}
                        //   goToPipelineStudio={goToPipelineStudio}
                        //   refetchPipeline={refetchPipeline}
                        //   onDeletePipeline={onDeletePipeline}
                        //   onDelete={onDelete}
                        // />
                      )}
                      keyOf={(item: any) => item.identifier}
                    />
                  </Container>
                  <Container>
                    <Pagination
                      itemCount={environmentGroups?.totalItems || 0}
                      pageSize={environmentGroups?.pageSize || 10}
                      pageCount={environmentGroups?.totalPages || -1}
                      pageIndex={environmentGroups?.pageIndex || 0}
                      gotoPage={pageNumber => setPage(pageNumber)}
                    />
                  </Container>
                </>
              ))}
            {emptyEnvs && (
              <Container flex={{ align: 'center-center' }} height="100%">
                <Container flex style={{ flexDirection: 'column' }}>
                  <img src={EmptyContent} width={220} height={220} />
                  <Heading level={2} className={css.noEnvHeading}>
                    {' '}
                    {getString('common.environmentGroups.noEnvironmentGroups.title')}
                  </Heading>
                  <Text className={css.noEnvText}>
                    {getString('common.environmentGroups.noEnvironmentGroups.message')}
                  </Text>
                </Container>
              </Container>
            )}
          </Page.Body>
        </>
      )}
    </>
  )
}
