/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { CellProps, Renderer } from 'react-table'
import { Text, Icon, TableV2, Color, Layout, Button, getErrorInfoFromErrorObject } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import { Classes, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { AnomalyData, useReportAnomalyFeedback } from 'services/ce'
import { ANOMALIES_LIST_FORMAT, getTimePeriodString } from '@ce/utils/momentUtils'
import formatCost from '@ce/utils/formatCost'
import { useToaster } from '@common/components'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

interface ListProps {
  listData: AnomalyData[]
}

interface AnomaliesMenu {
  anomalyId: string
}

interface AnomalyParams {
  accountId: string
}

const AnomaliesMenu: React.FC<AnomaliesMenu> = ({ anomalyId }) => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)
  const { accountId } = useParams<AnomalyParams>()
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

const AnomaliesListGridView: React.FC<ListProps> = ({ listData }) => {
  const { getString } = useStrings()

  const DateCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const timestamp = row.original.time as number
    const relativeTime = row.original.anomalyRelativeTime

    return (
      <Layout.Vertical spacing="small">
        <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }}>
          {getTimePeriodString(timestamp, ANOMALIES_LIST_FORMAT)}
        </Text>
        <Text color={Color.GREY_600} font={{ size: 'small' }}>
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
        <Text font={{ weight: 'semi-bold', size: 'normal' }} color={Color.BLACK}>
          {formatCost(actualAmount)}
        </Text>
        {trend ? (
          <Text font={{ size: 'xsmall' }} color={Color.RED_600}>
            {getString('ce.anomalyDetection.trend', {
              trend: trend
            })}
          </Text>
        ) : null}
      </Layout.Horizontal>
    )
  }

  const ResourceCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const resourceName = row.original.resourceName
    const resourceInfo = row.original.resourceInfo

    return (
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name="app-kubernetes" size={24} />
        <Layout.Vertical spacing="small">
          <Link to={''}>
            <Text font={{ size: 'small' }} inline color="primary7" lineClamp={1} style={{ maxWidth: 200 }}>
              {resourceName}
            </Text>
          </Link>
          <Text font={{ size: 'small' }} color={Color.GREY_600}>
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
        <Text font={{ size: 'normal' }} color={Color.ORANGE_700}>
          {status}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_600}>
          {stausRelativeTime}
        </Text>
      </Layout.Vertical>
    )
  }

  const MenuCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    return <AnomaliesMenu anomalyId={row.original.id || ''} />
  }

  if (!listData.length) {
    return null
  }

  return (
    <TableV2
      className={css.tableView}
      columns={[
        {
          Header: getString('ce.anomalyDetection.tableHeaders.date'),
          accessor: 'time',
          Cell: DateCell,
          width: '25%'
        },
        {
          Header: getString('ce.anomalyDetection.tableHeaders.anomalousSpend'),
          accessor: 'actualAmount',
          Cell: CostCell,
          width: '25%'
        },
        {
          Header: getString('ce.anomalyDetection.tableHeaders.resource'),
          accessor: 'resourceName',
          Cell: ResourceCell,
          width: '25%'
        },
        {
          Header: getString('ce.anomalyDetection.tableHeaders.details'),
          accessor: 'details',
          width: '25%'
        },
        {
          Header: getString('ce.anomalyDetection.tableHeaders.status'),
          accessor: 'status',
          Cell: StatusCell,
          width: '25%'
        },
        {
          Header: ' ',
          width: '5%',
          Cell: MenuCell
        }
      ]}
      data={listData}
      pagination={{
        itemCount: 100,
        pageCount: 10,
        pageIndex: 0,
        pageSize: 10
      }}
      sortable
    />
  )
}

export default AnomaliesListGridView
