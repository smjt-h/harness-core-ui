/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  Dialog,
  Layout,
  Views,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Container,
  GridListToggle
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { ParamsType, useServiceStore } from '@cd/components/Services/common'
import { useStrings } from 'framework/strings'
import { NewEditServiceModal } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceStep'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { Page } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import { GetServiceListQueryParams, useGetServiceList } from 'services/cd-ng'

import ServicesGridView from '../ServicesGridView/ServicesGridView'
import ServicesListView from '../ServicesListView/ServicesListView'

import css from './ServicesListPage.module.scss'

export const ServicesListPage: React.FC = () => {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ParamsType>()
  const [view, setView] = useState(Views.LIST)
  const { getString } = useStrings()
  const { fetchDeploymentList } = useServiceStore()
  const [mode, setMode] = useState<SelectedView>(SelectedView.VISUAL)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideModal}
        title={getString('cd.addService')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStyles)}
      >
        <Container>
          <Container className={css.yamlToggle}>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding-top="8px">
              <VisualYamlToggle
                selectedView={mode}
                onChange={nextMode => {
                  setMode(nextMode)
                }}
              />
            </Layout.Horizontal>
          </Container>

          <Container className={css.editServiceModal}>
            <NewEditServiceModal
              type={mode === SelectedView.VISUAL ? 'newEditService' : 'yamlService'}
              data={{ name: '', identifier: '', orgIdentifier, projectIdentifier }}
              isEdit={false}
              isService
              onCreateOrUpdate={() => {
                ;(fetchDeploymentList.current as () => void)?.()
                hideModal()
              }}
              closeModal={hideModal}
            />
          </Container>
        </Container>
      </Dialog>
    ),
    [fetchDeploymentList, orgIdentifier, projectIdentifier, mode]
  )

  const queryParams: GetServiceListQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    size: 10,
    page: 0
  }

  const {
    loading,
    data: serviceList,
    refetch
  } = useGetServiceList({
    queryParams
  })

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])

  return (
    <Page.Body className={css.pageBody}>
      <>
        <Layout.Horizontal className={css.header} flex={{ distribution: 'space-between' }}>
          <RbacButton
            intent="primary"
            data-testid="add-service"
            icon="plus"
            iconProps={{ size: 10 }}
            text={getString('newService')}
            permission={{
              permission: PermissionIdentifier.EDIT_SERVICE,
              resource: {
                resourceType: ResourceType.SERVICE
              }
            }}
            onClick={() => {
              showModal()
              setMode(SelectedView.VISUAL)
            }}
          />

          <GridListToggle initialSelectedView={Views.LIST} onViewToggle={setView} />
        </Layout.Horizontal>

        <Layout.Vertical
          margin={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
          className={css.container}
        >
          {view === Views.GRID ? (
            <ServicesGridView data={serviceList} loading={loading} onRefresh={() => refetch()} />
          ) : (
            <ServicesListView data={serviceList} loading={loading} onRefresh={() => refetch()} />
          )}
        </Layout.Vertical>
      </>
    </Page.Body>
  )
}
