import React, { useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import type { GetDataError } from 'restful-react'
import ReactTimeago from 'react-timeago'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import Table from '@common/components/Table/Table'
import type { TableProps } from '@common/components/Table/Table'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import type { DelegateInner } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import type { DelegateInnerCustom } from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

interface DelegateSelectorTableProps {
  data: DelegateInnerCustom[]
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
}

const RenderDelegateIcon: Renderer<CellProps<DelegateInnerCustom>> = ({ row }) => {
  const { checked } = row.original
  return checked ? <Icon name={'tick'} color={Color.GREEN_700} size={24} /> : <></>
}

const RenderDelegateName: Renderer<CellProps<DelegateInnerCustom>> = ({ row }) => {
  const { delegateType = '', delegateName } = row.original
  const { name } = row.values
  return (
    <Layout.Horizontal>
      <Icon name={delegateTypeToIcon(delegateType)} size={24} />
      <Layout.Vertical padding={{ left: 'small' }}>
        <Text color={Color.BLACK}>{delegateName || name}</Text>
        <Text color={Color.GREY_400}>{name}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderHeartbeat: Renderer<CellProps<DelegateInnerCustom>> = ({ row }) => {
  const { status, connections = [], lastHeartBeat } = row.original
  const isApprovalRequired = status === 'WAITING_FOR_APPROVAL'
  const isConnected = connections?.length > 0
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Icon
        name="full-circle"
        size={10}
        color={isApprovalRequired ? Color.YELLOW_500 : isConnected ? Color.GREEN_600 : Color.GREY_400}
        margin={{ right: lastHeartBeat ? 'small' : 0 }}
      />
      {lastHeartBeat && <ReactTimeago date={lastHeartBeat} live />}
    </Layout.Horizontal>
  )
}

const RenderTags: Renderer<CellProps<DelegateInnerCustom>> = ({ row }) => {
  const { tags, implicitSelectors } = row.original
  return <TagsViewer tags={[...(tags || []), ...Object.keys(implicitSelectors || {})]} />
}

export const DelegateSelectorTable: React.FC<DelegateSelectorTableProps> = props => {
  const { data, error, loading, refetch } = props
  const { getString } = useStrings()
  const columns: TableProps<DelegateInner>['columns'] = useMemo(
    () => [
      {
        Header: '',
        id: 'delegateIcon',
        width: '5%',
        Cell: RenderDelegateIcon
      },
      {
        Header: getString('delegate.DelegateName').toLocaleUpperCase(),
        accessor: (row: DelegateInner) => row.delegateName || row.hostName,
        id: 'name',
        width: '40%',
        Cell: RenderDelegateName
      },
      {
        Header: getString('connectors.delegate.hearbeat').toLocaleUpperCase(),
        accessor: (row: DelegateInner) => row.status,
        id: 'connectivity',
        width: '25%',
        Cell: RenderHeartbeat
      },
      {
        Header: getString('tagsLabel').toLocaleUpperCase(),
        id: 'tags',
        width: '30%',
        Cell: RenderTags
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )
  const getContent = () => {
    if (loading) {
      return <ContainerSpinner />
    }
    if (data) {
      return <Table columns={columns} data={data} className={css.table} />
    }
    return <PageError message={error?.message} onClick={() => refetch()} />
  }
  return (
    <Container padding={{ left: 'small', right: 'small', top: 'small' }} background={Color.WHITE} height={265}>
      {getContent()}
    </Container>
  )
}
