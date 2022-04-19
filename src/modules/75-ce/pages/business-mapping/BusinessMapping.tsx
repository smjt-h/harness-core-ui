/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Layout,
  PageBody,
  PageHeader,
  Container,
  Text,
  FontVariation,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Drawer, Position } from '@blueprintjs/core'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import { BusinessMapping, useDeleteBusinessMapping, useGetBusinessMappingList } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import BusinessMappingBuilder from '@ce/components/BusinessMappingBuilder/BusinessMappingBuilder'
import BusinessMappingList from '@ce/components/BusinessMappingList/BusinessMappingList'
import EmptyPage from '@ce/common/EmptyPage/EmptyPage'

const BusinessMappingPage: () => React.ReactElement = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [selectedBM, setSelectedBM] = useState<BusinessMapping>({})
  const { data, loading, refetch } = useGetBusinessMappingList({ queryParams: { accountIdentifier: accountId } })
  const { mutate: deleteBusinessMapping, loading: deleteLoading } = useDeleteBusinessMapping({
    queryParams: { accountIdentifier: accountId }
  })
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const { showError, showSuccess } = useToaster()

  const businessMappingData = data?.resource || []

  const ToolBar = (
    <Layout.Horizontal
      padding={{
        left: 'large',
        right: 'large',
        top: 'medium',
        bottom: 'medium'
      }}
      background="white"
      border={{
        bottom: true
      }}
    >
      <Button
        icon="plus"
        text={getString('ce.businessMapping.newButton')}
        intent="primary"
        onClick={() => {
          setDrawerOpen(true)
        }}
      />
    </Layout.Horizontal>
  )

  if (!loading && !businessMappingData.length) {
    return (
      <>
        <PageHeader breadcrumbs={<NGBreadcrumbs />} title={getString('ce.businessMapping.sideNavText')} />
        <PageBody>
          {ToolBar}
          <EmptyPage
            subtitle={getString('ce.businessMapping.emptySubtitles')}
            buttonText={getString('ce.businessMapping.newButton')}
            buttonAction={() => setDrawerOpen(true)}
          />
        </PageBody>
      </>
    )
  }

  const handleDelete: (id: string, name: string) => void = async (id, name) => {
    try {
      const deleted = await deleteBusinessMapping(id, {
        headers: {
          'content-type': 'application/json'
        }
      })
      if (deleted) {
        showSuccess(getString('ce.businessMapping.deleted', { name: name }))
        refetch()
      }
    } catch (err) {
      showError(getErrorInfoFromErrorObject(err))
    }
  }

  const onEdit: (data: BusinessMapping) => void = editData => {
    setSelectedBM(editData)
    setDrawerOpen(true)
  }

  return (
    <>
      <PageHeader breadcrumbs={<NGBreadcrumbs />} title={getString('ce.businessMapping.sideNavText')} />
      <PageBody loading={loading || deleteLoading}>
        {ToolBar}
        <Container padding="medium">
          {businessMappingData.length ? (
            <Text font={{ variation: FontVariation.H5 }}>
              {getString('ce.common.totalCount', { count: businessMappingData.length })}
            </Text>
          ) : null}
          <BusinessMappingList onEdit={onEdit} handleDelete={handleDelete} data={businessMappingData} />
        </Container>

        <Drawer
          autoFocus
          enforceFocus
          hasBackdrop
          usePortal
          canOutsideClickClose
          canEscapeKeyClose
          position={Position.RIGHT}
          isOpen={drawerOpen}
          onClose={
            /* istanbul ignore next */ () => {
              setSelectedBM({})
              setDrawerOpen(false)
            }
          }
        >
          <BusinessMappingBuilder
            selectedBM={selectedBM}
            onSave={() => {
              setDrawerOpen(false)
              refetch()
            }}
          />
        </Drawer>
      </PageBody>
    </>
  )
}

export default BusinessMappingPage
