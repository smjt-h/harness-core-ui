/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  DropDown,
  FlexExpander,
  Layout,
  PageBody,
  PageHeader,
  Text,
  Icon,
  TableV2,
  Color,
  PageSpinner,
  ExpandingSearchInput,
  Card,
  getErrorInfoFromErrorObject,
  FontVariation
} from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Classes, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'

import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import {
  ANOMALIES_LIST_FORMAT,
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  getTimePeriodString
} from '@ce/utils/momentUtils'
import { AnomalyData, useListAnomalies, useReportAnomalyFeedback } from 'services/ce'
import formatCost from '@ce/utils/formatCost'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './AnomaliesOverviewPage.module.scss'

export interface TimeRange {
  to: string
  from: string
}

const AnomalyFilters: React.FC = () => {
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  return (
    <Layout.Horizontal spacing="large" className={css.header}>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
        <DropDown
          placeholder={getString('ce.anomalyDetection.filters.groupByNonePlaceholder')}
          filterable={false}
          onChange={() => {
            // alert(option.value)
          }}
          className={css.groupbyFilter}
          items={[
            {
              label: getString('ce.anomalyDetection.filters.groupByNoneLabel'),
              value: getString('ce.anomalyDetection.filters.groupByNoneValue')
            }
          ]}
        />
      </Layout.Horizontal>
      <FlexExpander />
      {/* TODO: Mutiselect DropDown */}
      <DropDown
        placeholder={getString('ce.anomalyDetection.filters.groupByPerspectivePlaceholder')}
        filterable={false}
        onChange={() => {
          // alert(option.value)
        }}
        items={[
          {
            label: 'All Perspectives',
            value: 'all'
          }
        ]}
      />
      <DropDown
        placeholder={getString('ce.anomalyDetection.filters.groupByCloudProvidersPlaceholder')}
        filterable={false}
        onChange={() => {
          // alert(option.value)
        }}
        items={[
          {
            label: 'All Cloud Providers',
            value: 'all'
          }
        ]}
      />
      <Icon name="ng-filter" size={24} color="primary7" />
      <Text border={{ right: true, color: 'grey300' }} />
      <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
    </Layout.Horizontal>
  )
}

const AnomaliesSearch: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal className={css.searchFilterWrapper}>
      {/* TODO: Need to add search icon in searchBox */}
      <ExpandingSearchInput
        className={css.searchInput}
        onChange={() => {
          // TODO: handling of search test in filters
        }}
        alwaysExpanded={true}
        placeholder={getString('search')}
      />
      <Button
        text={getString('ce.anomalyDetection.settingsBtn')}
        icon="nav-settings"
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.MEDIUM}
      />
    </Layout.Horizontal>
  )
}

const AnomaliesOverview: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="medium">
      <Layout.Vertical spacing="small">
        <Card>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.anomalyDetection.summary.totalCountText')}
          </Text>
          <Text font={{ variation: FontVariation.H4 }} intent="danger">
            102
          </Text>
        </Card>
        <Card>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_500}>
            {getString('ce.anomalyDetection.summary.costImpacted')}
          </Text>
          <Text font={{ variation: FontVariation.H4 }} intent="danger">
            $17586.99
          </Text>
          <p></p>
        </Card>
      </Layout.Vertical>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.anomalyDetection.summary.perspectiveWise')}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.anomalyDetection.summary.cloudProvidersWise')}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.anomalyDetection.summary.statusWise')}
        </Text>
      </div>
    </Layout.Horizontal>
  )
}

interface ListProps {
  listData: AnomalyData[]
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

const AnomaliesListGridView: React.FC<ListProps> = ({ listData }) => {
  const { getString } = useStrings()

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
        {trend ? <Text font={{ variation: FontVariation.TINY }} color={Color.RED_600}>{`+${trend}%`}</Text> : null}
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
          <Link to={''}>{resourceName}</Link>
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

  if (!listData.length) {
    return null
  }

  return (
    <TableV2
      className={css.tableView}
      columns={[
        {
          Header: (
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.anomalyDetection.tableHeaders.date')}
            </Text>
          ),
          accessor: 'time',
          Cell: DateCell,
          width: '25%'
        },
        {
          Header: (
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.anomalyDetection.tableHeaders.anomalousSpend')}
            </Text>
          ),
          accessor: 'actualAmount',
          Cell: CostCell,
          width: '25%'
        },
        {
          Header: (
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.anomalyDetection.tableHeaders.resource')}
            </Text>
          ),
          accessor: 'resourceName',
          Cell: ResourceCell,
          width: '25%'
        },
        {
          Header: (
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.anomalyDetection.tableHeaders.details')}
            </Text>
          ),
          accessor: 'details',
          width: '25%'
        },
        {
          Header: (
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.anomalyDetection.tableHeaders.status')}
            </Text>
          ),
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
        itemCount: listData.length,
        pageCount: 10,
        pageIndex: 0,
        pageSize: 10
      }}
    />
  )
}

const AnomaliesOverviewPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [listData, setListData] = useState<AnomalyData[]>([])

  const { mutate: getAnomaliesList, loading: isListFetching } = useListAnomalies({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    const getList = async () => {
      try {
        const response = await getAnomaliesList({
          filter: {
            stringFilters: [
              {
                field: 'NAMESPACE',
                operator: 'IN',
                values: ['ecom-test02-live', 'nnamespace-2']
              }
            ]
          },
          groupBy: [],
          orderBy: [
            {
              field: 'ACTUAL_COST',
              order: 'DESCENDING'
            }
          ],
          limit: 100,
          offset: 0
        })
        setListData(response?.data as AnomalyData[])
      } catch (error) {
        // console.log('AnomaliesOverviewPage: Error in fetching the anomalies list', error)
      }
    }
    getList()
  }, [getAnomaliesList])

  return (
    <>
      <PageHeader title={getString('ce.anomalyDetection.sideNavText')} />
      <AnomalyFilters />
      <PageBody>
        {isListFetching ? <PageSpinner /> : null}
        <Container
          padding={{
            right: 'xxxlarge',
            left: 'xxxlarge',
            bottom: 'medium',
            top: 'medium'
          }}
        >
          <AnomaliesSearch />
          <AnomaliesOverview />
          <AnomaliesListGridView listData={listData} />
        </Container>
      </PageBody>
    </>
  )
}

export default AnomaliesOverviewPage
