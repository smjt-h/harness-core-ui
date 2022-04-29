import { Button, Layout, Popover, TableV2, Text } from '@harness/uicore'

import React, { useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { Menu, Position, Classes } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PageVariableResponseDTO, StringVariableDTO, VariableResponseDTO } from 'services/cd-ng'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import css from './VariableListView.module.scss'

interface SecretsListProps {
  variables?: PageVariableResponseDTO
  gotoPage: (pageNumber: number) => void
  refetch?: () => void
}

const VariableListView: React.FC<SecretsListProps> = props => {
  const { variables, gotoPage, refetch } = props
  const history = useHistory()
  const variablesList: VariableResponseDTO[] = useMemo(() => variables?.content || [], [variables?.content])
  const { pathname } = useLocation()
  const { getString } = useStrings()

  const RenderColumnVariable: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Layout.Horizontal>
        <Layout.Vertical>
          <Layout.Horizontal spacing="small" width={230}>
            <Text color={Color.BLACK} lineClamp={1}>
              {data?.name}
            </Text>
            {/* {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null} */}
          </Layout.Horizontal>
          <Text color={Color.GREY_600} font={{ size: 'small' }} width={230} lineClamp={1}>
            {`${getString('common.ID')}: ${data?.identifier}`}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const RenderColumnType: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.GREY_600} font={{ size: 'small' }}>
        {data?.type}
      </Text>
    )
  }
  const RenderColumnValidation: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.GREY_600} font={{ size: 'small' }}>
        {data?.spec?.variableValueType}
      </Text>
    )
  }

  const RenderColumnValue: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.GREY_600} font={{ size: 'small' }}>
        {data?.spec?.value}
      </Text>
    )
  }
  const RenderColumnDefaultValue: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
    const data = row.original.variable
    return (
      <Text color={Color.GREY_600} font={{ size: 'small' }}>
        {(data?.spec as StringVariableDTO)?.defaultValue}
      </Text>
    )
  }

  const RenderColumnAction: Renderer<CellProps<VariableResponseDTO>> = ({ row, column }) => {
    const data = row.original.variable
    // const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
    // const { getRBACErrorMessage } = useRBACError()
    // const { showSuccess, showError } = useToaster()
    const [menuOpen, setMenuOpen] = useState(false)
    // const { mutate: deleteSecret } = useDeleteSecretV2({
    //   queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    //   requestOptions: { headers: { 'content-type': 'application/json' } }
    // })

    // const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: (column as any).refreshSecrets })
    // const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: (column as any).refreshSecrets })

    // const permissionRequest = {
    //   resource: {
    //     resourceType: ResourceType.SECRET,
    //     resourceIdentifier: data.identifier
    //   }
    // }

    // const { openDialog } = useConfirmationDialog({
    //   contentText: <String stringID="secrets.confirmDelete" vars={{ name: data.name }} />,
    //   titleText: <String stringID="secrets.confirmDeleteTitle" />,
    //   confirmButtonText: <String stringID="delete" />,
    //   cancelButtonText: <String stringID="cancel" />,
    //   intent: Intent.DANGER,
    //   buttonIntent: Intent.DANGER,
    //   onCloseDialog: async didConfirm => {
    //     if (didConfirm && data.identifier) {
    //       try {
    //         await deleteSecret(data.identifier)
    //         showSuccess(`Secret ${data.name} deleted`)
    //         ;(column as any).refreshSecrets?.()
    //       } catch (err) {
    //         showError(getRBACErrorMessage(err))
    //       }
    //     }
    //   }
    // })

    // const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    //   e.stopPropagation()
    //   setMenuOpen(false)
    //   openDialog()
    // }

    // const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    //   e.stopPropagation()
    //   setMenuOpen(false)
    //   data.type === 'SSHKey'
    //     ? openCreateSSHCredModal(data)
    //     : openCreateSecretModal(data.type, {
    //         identifier: data.identifier,
    //         orgIdentifier: data.orgIdentifier,
    //         projectIdentifier: data.projectIdentifier
    //       } as SecretIdentifiers)
    // }

    return (
      <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.RIGHT_TOP}
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
            <RbacMenuItem
              icon="edit"
              text="Edit"
              //   onClick={handleEdit}
              //   permission={{ ...permissionRequest, permission: PermissionIdentifier.UPDATE_SECRET }}
            />
            <RbacMenuItem
              icon="trash"
              text="Delete"
              //   onClick={handleDelete}
              //   permission={{ ...permissionRequest, permission: PermissionIdentifier.DELETE_SECRET }}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const columns: Column<VariableResponseDTO>[] = useMemo(
    () => [
      {
        Header: 'Variable',
        accessor: row => row.variable?.name,
        id: 'name',
        width: '25%',
        Cell: RenderColumnVariable
      },
      {
        Header: 'Type',
        accessor: row => row.variable?.type,
        id: 'type',
        width: '15%',
        Cell: RenderColumnType
      },
      {
        Header: 'Validation',
        accessor: row => row.variable?.spec?.variableValueType,
        id: 'validation',
        width: '15%',
        Cell: RenderColumnValidation
      },
      {
        Header: 'Value',
        accessor: row => row.variable?.spec?.value,
        id: 'value',
        width: '30%',
        Cell: RenderColumnValue
      },
      {
        Header: 'Default Value',
        accessor: row => row.variable?.spec,
        id: 'defaultValue',
        width: '10%',
        Cell: RenderColumnDefaultValue
      },
      //   {
      //     Header: getString('lastActivity'),
      //     accessor: 'createdAt',
      //     id: 'createdAt',
      //     width: '20%',
      //     Cell: RenderColumnCreatedAt
      //   },
      //   {
      //     Header: getString('lastUpdated').toUpperCase(),
      //     accessor: 'lastModifiedAt',
      //     id: 'lastModifiedAt',
      //     width: '15%',
      //     Cell: RenderColumnLastUpdated
      //   },
      {
        Header: '',
        accessor: row => row.variable?.identifier,
        id: 'action',
        width: '5%',
        Cell: RenderColumnAction,
        refetchVariables: refetch,
        disableSortBy: true
      }
    ],
    [refetch]
  )

  return (
    <TableV2<VariableResponseDTO>
      className={css.table}
      columns={columns}
      data={variablesList}
      name="VariableListView"
      onRowClick={variable => {
        history.push(`${pathname}/${variable.variable?.identifier}`)
      }}
      pagination={{
        itemCount: variables?.totalItems || 0,
        pageSize: variables?.pageSize || 10,
        pageCount: variables?.totalPages || -1,
        pageIndex: variables?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default VariableListView
