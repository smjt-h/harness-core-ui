/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { Classes, Intent, Menu, Position } from '@blueprintjs/core'

import { Button, Layout, Popover, TagsPopover, Text, useConfirmationDialog } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { EnvironmentType } from '@common/constants/EnvironmentType'

import css from './EnvironmentGroups.module.scss'
import environmentCss from '../Environments/EnvironmentsListColumns/EnvironmentsListColumns.module.scss'

function EnvironmentGroupName({
  name,
  identifier,
  tags
}: {
  name?: string
  identifier?: string
  tags?: {
    [key: string]: string
  }
}): React.ReactElement {
  const { getString } = useStrings()

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK} lineClamp={1}>
          {name}
        </Text>
        {!isEmpty(tags) && (
          <TagsPopover
            className={css.tagsPopover}
            iconProps={{ size: 14, color: Color.GREY_600 }}
            tags={defaultTo(tags, {})}
            popoverProps={{
              position: 'right'
            }}
          />
        )}
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('common.ID')}: {identifier}
      </Text>
    </>
  )
}

function LastUpdatedBy({ lastModifiedAt }: { lastModifiedAt?: number }): React.ReactElement {
  return <ReactTimeago date={lastModifiedAt as number} />
}

function NoOfEnvironments({ length }: { length: number }) {
  return (
    <Text
      color={Color.BLACK}
      background={Color.GREY_100}
      padding={{ left: 'large', top: 'small', right: 'large', bottom: 'small' }}
      inline
    >
      {length} environments included
    </Text>
  )
}

function EditOrDeleteCell({ identifier, onEdit, onDelete }: any): React.ReactElement {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const [canEdit, canDelete] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.ENVIRONMENT_GROUP
      },
      permissions: [PermissionIdentifier.EDIT_ENVIRONMENT_GROUP, PermissionIdentifier.DELETE_ENVIRONMENT_GROUP]
    },
    [accountId, orgIdentifier, projectIdentifier]
  )

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.environmentGroup.delete'),
    contentText: getString('common.environmentGroup.deleteConfirmation'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        await onDelete(identifier)
        setMenuOpen(false)
      }
    }
  })

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover isOpen={menuOpen} onInteraction={setMenuOpen} className={Classes.DARK} position={Position.LEFT}>
        <Button
          minimal
          style={{
            transform: 'rotate(90deg)'
          }}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
          <RbacMenuItem
            icon="edit"
            text={getString('edit')}
            disabled={!canEdit}
            onClick={event => {
              event.stopPropagation()
              onEdit(identifier)
            }}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            disabled={!canDelete}
            onClick={event => {
              event.stopPropagation()
              openDialog()
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

function EnvironmentTypes({ type }: { type?: 'PreProduction' | 'Production' }) {
  const { getString } = useStrings()
  return (
    <Text className={environmentCss.environmentType} font={{ size: 'small' }}>
      {getString(type === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')}
    </Text>
  )
}

export { EnvironmentGroupName, LastUpdatedBy, NoOfEnvironments, EditOrDeleteCell, EnvironmentTypes }
