/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useState } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  Text,
  Icon,
  TableV2,
  Color,
  Layout,
  Button,
  getErrorInfoFromErrorObject,
  FontVariation
} from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import { Classes, IconName, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { AnomalyData, useReportAnomalyFeedback } from 'services/ce'
import { ANOMALIES_LIST_FORMAT, getTimePeriodString } from '@ce/utils/momentUtils'
import formatCost from '@ce/utils/formatCost'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { CcmMetaData, useFetchCcmMetaDataQuery } from 'services/ce/services'
import type { orderType, sortType, serverSortProps } from '@common/components/Table/react-table-config'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

interface SortByObjInterface {
  sort?: sortType
  order?: orderType
}
interface ListProps {
  listData: AnomalyData[]
  sortByObj: SortByObjInterface
  setSortByObj: Dispatch<SetStateAction<SortByObjInterface>>
}

interface AnomaliesMenu {
  anomalyId: string
}

const AnomaliesMenu: React.FC<AnomaliesMenu> = ({ anomalyId }) => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: updateAnomalyFeedback } = useReportAnomalyFeedback({
    queryParams: {
      accountIdentifier: accountId,
      anomalyId: anomalyId
    }
  })
  const { showError, showSuccess } = useToaster()

  const anomalyFeedback = async () => {
    try {
      const response = await updateAnomalyFeedback({
        feedback: 'FALSE_ANOMALY'
      })
      response && showSuccess(getString('ce.anomalyDetection.userFeedbackSuccessMsg'))
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }

  return (
    <Popover
      isOpen={isOpen}
      onInteraction={nextOpenState => {
        setIsOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      />
      <Menu>
        <MenuItem
          text={getString('ce.anomalyDetection.tableMenu.whitelistResource')}
          onClick={(e: any) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
        />
        <MenuItem
          text={getString('ce.anomalyDetection.tableMenu.falseAnomaly')}
          onClick={(e: any) => {
            e.stopPropagation()
            setIsOpen(false)
            anomalyFeedback()
          }}
        />
      </Menu>
    </Popover>
  )
}

const getServerSortProps = ({
  enableServerSort,
  accessor,
  sortByObj,
  setSortByObj
}: {
  enableServerSort: boolean
  accessor: string
  sortByObj: SortByObjInterface
  setSortByObj: Dispatch<SetStateAction<SortByObjInterface>>
}): serverSortProps => {
  if (!enableServerSort) {
    return { enableServerSort: false }
  } else {
    let newOrder: orderType | undefined
    const sortName = accessor

    if (sortName === sortByObj.sort && sortByObj.order) {
      newOrder = sortByObj.order === 'DESC' ? 'ASC' : 'DESC'
    } else {
      // no saved state for sortBy of the same sort type
      newOrder = 'ASC'
    }

    return {
      enableServerSort: true,
      isServerSorted: sortByObj.sort === accessor,
      isServerSortedDesc: sortByObj.order === 'DESC',
      getSortedColumn: ({ sort }: { sort?: sortType }) => {
        console.log('sorting table', sort, newOrder)
        setSortByObj({ sort, order: newOrder })
      }
    }
  }
}

const AnomaliesListGridView: React.FC<ListProps> = ({ listData, sortByObj, setSortByObj }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const DateCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const timestamp = row.original.time as number
    const relativeTime = row.original.anomalyRelativeTime

    return (
      <Layout.Vertical spacing="small">
        <Text color={Color.BLACK} font={{ variation: FontVariation.BODY2 }}>
          {getTimePeriodString(timestamp, ANOMALIES_LIST_FORMAT)}
        </Text>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
          {relativeTime}
        </Text>
      </Layout.Vertical>
    )
  }

  const CostCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const actualAmount = row.original.actualAmount as number
    const trend = row.original.trend

    return (
      <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="small">
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.BLACK}>
          {formatCost(actualAmount)}
        </Text>
        {trend ? (
          <Text font={{ variation: FontVariation.TINY }} color={Color.RED_600}>
            {getString('ce.anomalyDetection.trend', {
              trend: trend
            })}
          </Text>
        ) : null}
      </Layout.Horizontal>
    )
  }

  const getResourceIcon = (cloudProvider: string) => {
    switch (cloudProvider) {
      case 'CLUSTER':
        return 'service-kubernetes'

      case 'AWS':
        return 'service-aws'

      case 'AZURE':
        return 'service-azure'

      case 'GCP':
        return 'gcp'

      default:
        return 'harness'
    }
  }

  const map: Record<string, string> = {
    AZURE: 'defaultAzurePerspectiveId',
    AWS: 'defaultAwsPerspectiveId',
    GCP: 'defaultGcpPerspectiveId',
    CLUSTER: 'defaultClusterPerspectiveId'
  }

  const ResourceCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const resourceName = row.original.resourceName
    const resourceInfo = row.original.resourceInfo
    const cloudProvider = row.original.cloudProvider || ''

    const [ccmMetaResult] = useFetchCcmMetaDataQuery()
    const { data: ccmData } = ccmMetaResult
    const ccmMetaData = (ccmData?.ccmMetaData || {}) as CcmMetaData
    const mapping = map[cloudProvider]

    return (
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={getResourceIcon(cloudProvider) as IconName} size={24} />
        <Layout.Vertical spacing="small">
          <Link
            to={routes.toPerspectiveDetails({
              accountId: accountId,
              perspectiveId: (ccmMetaData[mapping as keyof CcmMetaData] as string) || '',
              perspectiveName: (ccmMetaData[mapping as keyof CcmMetaData] as string) || ''
            })}
          >
            <Text
              font={{ variation: FontVariation.SMALL }}
              inline
              color={Color.PRIMARY_7}
              lineClamp={1}
              style={{ maxWidth: 200 }}
            >
              {resourceName}
            </Text>
          </Link>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {resourceInfo}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const StatusCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const status = row.original.status
    const stausRelativeTime = row.original.statusRelativeTime

    return (
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.BODY }} color={Color.ORANGE_700}>
          {status}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {stausRelativeTime}
        </Text>
      </Layout.Vertical>
    )
  }

  const MenuCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    return <AnomaliesMenu anomalyId={row.original.id || ''} />
  }

  const columns: Column<AnomalyData>[] = React.useMemo(
    () => [
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.date')}
          </Text>
        ),
        accessor: 'time',
        Cell: DateCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'TIME',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.anomalousSpend')}
          </Text>
        ),
        accessor: 'actualAmount',
        Cell: CostCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'ACTUAL_COST',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.resource')}
          </Text>
        ),
        accessor: 'resourceName',
        Cell: ResourceCell,
        width: '35%'
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.status')}
          </Text>
        ),
        accessor: 'status',
        Cell: StatusCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'STATUS',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: ' ',
        width: '5%',
        Cell: MenuCell
      }
    ],
    []
  )

  if (!listData.length) {
    return null
  }

  return (
    <TableV2
      className={css.tableView}
      columns={columns}
      data={listData}
      pagination={{
        itemCount: listData.length,
        pageCount: 10,
        pageIndex: 0,
        pageSize: 10
      }}
    />
  )
}

export default AnomaliesListGridView
