/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Text,
  Layout,
  Button,
  Popover,
  Switch,
  Container,
  Icon,
  ButtonVariation,
  TableV2,
  NoDataCard
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Menu, Position } from '@blueprintjs/core'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getIconByNotificationMethod } from '@notifications/Utils/Utils'
import type { NotificationType } from '@notifications/interfaces/Notifications'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import type { NotificationRuleResponse } from 'services/cv'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import noDataNotifications from '@cv/assets/noDataNotifications.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useSRMNotificationModal } from '../useSRMNotificationModal/useSRMNotificationModal'
import type { NotificationRulesItem, SRMNotificationRules } from './SRMNotificationTable.types'
import css from './SRMNotificationTable.module.scss'

export interface SRMNotificationTableProps {
  data: NotificationRuleResponse[]
  onUpdate?: (data?: NotificationRulesItem, action?: Actions, closeModal?: () => void) => void
  gotoPage: (index: number) => void
  totalPages: number
  totalItems: number
  pageItemCount?: number
  pageSize: number
  pageIndex: number
  getExistingNotificationNames?: (skipIndex?: number) => string[]
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  onUpdate?: (data: NotificationRulesItem) => void
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnEnabled: Renderer<CellProps<NotificationRulesItem>> = ({ row, column }) => {
  const data = row.original
  return (
    <Switch
      checked={data.notificationRules.enabled}
      onChange={e => {
        ;(column as any).onUpdate?.(
          produce(data, draft => {
            draft.notificationRules.enabled = e.currentTarget.checked
          }),
          Actions.Update
        )
      }}
      disabled={(column as any).disabled}
    />
  )
}
// eslint-disable-next-line react/function-component-definition
const RenderColumnName: Renderer<CellProps<NotificationRulesItem>> = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {data.notificationRules.name}
    </Text>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnMethod: Renderer<CellProps<NotificationRulesItem>> = ({ row }) => {
  const data = row.original.notificationRules.notificationMethod?.type
  return (
    <Layout.Horizontal spacing="small">
      <Icon name={getIconByNotificationMethod(data as NotificationType)} />
      <Text>{data}</Text>
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnMenu: Renderer<CellProps<NotificationRulesItem>> = ({ row, column }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const data = row.original

  const handleEdit = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    ;(column as any).openNotificationModal?.(data.notificationRules, data.index)
  }

  const handleDelete = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    ;(column as any).onUpdate?.(row.original, Actions.Delete)
  }
  return (
    <Layout.Horizontal>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <Menu.Item icon="edit" text={getString('edit')} onClick={handleEdit} disabled={(column as any).disabled} />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            disabled={(column as any).disabled}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

function SRMNotificationTable(props: SRMNotificationTableProps): React.ReactElement {
  const {
    data,
    onUpdate,
    gotoPage,
    totalPages,
    totalItems,
    pageSize,
    pageIndex,
    getExistingNotificationNames = (_skipIndex?: number) => []
  } = props
  const { getString } = useStrings()
  const { projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()

  const { openNotificationModal, closeNotificationModal } = useSRMNotificationModal({
    onCreateOrUpdate: (_data?: SRMNotificationRules, _index?: number, _action?: Actions) => {
      onUpdate?.({ notificationRules: _data!, index: _index! }, _action, closeNotificationModal)
    },
    getExistingNotificationNames
  })

  const getAddNotificationButton = (): JSX.Element => (
    <RbacButton
      icon="plus"
      text={'New Notification Rule'}
      variation={ButtonVariation.PRIMARY}
      onClick={() => openNotificationModal()}
      // className={getClassNameForMonitoredServicePage(css.createSloInMonitoredService, monitoredService?.identifier)}
      permission={{
        permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
        resource: {
          resourceType: ResourceType.MONITOREDSERVICE,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

  const columns: CustomColumn<NotificationRuleResponse>[] = useMemo(
    () => [
      {
        Header: getString('enabledLabel').toUpperCase(),
        id: 'enabled',
        className: css.notificationTableHeader,
        accessor: row => row.notificationRule.enabled,
        onUpdate: onUpdate,
        width: '15%',
        Cell: RenderColumnEnabled,
        disableSortBy: true
      },
      {
        Header: getString('notifications.nameOftheRule').toUpperCase(),
        id: 'name',
        className: css.notificationTableHeader,
        accessor: row => row.notificationRule.name,
        width: '20%',
        Cell: RenderColumnName,
        disableSortBy: true
      },
      {
        Header: getString('notifications.notificationMethod').toUpperCase(),
        id: 'methods',
        className: css.notificationTableHeader,
        accessor: row => row.notificationRule.type,
        width: '28%',
        Cell: RenderColumnMethod,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.notificationRule.spec,
        className: css.notificationTableHeader,
        width: '2%',
        Cell: RenderColumnMenu,
        onUpdate: onUpdate,
        openNotificationModal: openNotificationModal,
        disableSortBy: true
      }
    ],
    [onUpdate, openNotificationModal, data]
  )

  if (!data.length) {
    return (
      <>
        <NoDataCard
          image={noDataNotifications}
          containerClassName={css.notificationsNoData}
          message={'There are no notifications'}
          button={getAddNotificationButton()}
        />
      </>
    )
  }

  return (
    <>
      <Container>
        <Layout.Horizontal flex className={css.headerActions}>
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('notifications.name')}
            icon="plus"
            id="newNotificationBtn"
            onClick={() => openNotificationModal()}
          />
        </Layout.Horizontal>
      </Container>
      <Container padding={{ bottom: 'huge' }} className={css.content}>
        <TableV2<NotificationRuleResponse>
          columns={columns}
          data={data}
          className={css.notificationTable}
          pagination={{
            itemCount: totalItems,
            pageSize: pageSize,
            pageCount: totalPages,
            pageIndex: pageIndex,
            gotoPage: gotoPage
          }}
        />
      </Container>
    </>
  )
}

export default SRMNotificationTable
