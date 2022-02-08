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
  TextInput,
  Text,
  Icon,
  TableV2,
  Color,
  PageSpinner
} from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Classes, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { CcmMetaData, QlceView, useFetchCcmMetaDataQuery, useFetchPerspectiveListQuery } from 'services/ce/services'
import {
  ANOMALIES_LIST_FORMAT,
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  getTimePeriodString
} from '@ce/utils/momentUtils'
import { AnomalyData, useGetAnomalyWidgetsData, useListAnomalies, useReportAnomalyFeedback } from 'services/ce'
import formatCost from '@ce/utils/formatCost'
import { allCloudProvidersList } from '@ce/constants'
import AnomaliesSummary from '@ce/components/AnomaliesDetection/AnomaliesSummary'
import css from './AnomaliesOverviewPage.module.scss'

export interface TimeRange {
  to: string
  from: string
}
interface AnomalyParams {
  accountId: string
}

const AnomalyFilters: React.FC = () => {
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  // Fetch all the perspective data
  const [{ data: perspectiveData }] = useFetchPerspectiveListQuery()
  const perspectiveList = (perspectiveData?.perspectives?.customerViews || []) as QlceView[]
  const items = perspectiveList.map(pName => ({
    label: pName.name as string,
    value: pName.id as string
  }))

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
        items={items}
      />
      <DropDown
        placeholder={getString('ce.anomalyDetection.filters.groupByCloudProvidersPlaceholder')}
        filterable={false}
        onChange={() => {
          // alert(option.value)
        }}
        items={allCloudProvidersList}
      />
      <Icon name="ng-filter" size={24} color="primary7" />
      <Text border={{ right: true, color: 'grey300' }} />
      <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
    </Layout.Horizontal>
  )
}

interface SearchProps {
  searchText: string
  onChange: React.Dispatch<React.SetStateAction<string>>
}

const AnomaliesSearch: React.FC<SearchProps> = ({ searchText, onChange }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal>
      {/* TODO: Need to add search icon in searchBox */}
      <TextInput
        value={searchText}
        onChange={(e: any) => {
          onChange(e.target.value)
        }}
        wrapperClassName={css.searchInput}
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

interface ListProps {
  listData: AnomalyData[]
}

interface AnomaliesMenu {
  anomalyId: string
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
      response && showSuccess('Thanks for your feedback!')
    } catch (error) {
      const errMessage = error.data.message
      showError(errMessage)
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
        {trend ? <Text font={{ size: 'xsmall' }} color={Color.RED_600}>{`+${trend}%`}</Text> : null}
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
              {resourceName || 'squidward/spongebob/1233445...'}
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

const AnomaliesOverviewPage: React.FC = () => {
  const { getString } = useStrings()
  const [searchText, setSearchText] = React.useState('')
  const { accountId } = useParams<AnomalyParams>()
  const [listData, setListData] = useState<AnomalyData[]>([])
  const [costData, setCostData] = useState([])
  const [perspectiveAnomaliesData, setPerspectiveANomaliesData] = useState([])
  const [cloudProvidersWiseData, setCloudProvidersWiseData] = useState([])
  const [statusWiseData, setStatusWiseData] = useState([])

  const { mutate: getAnomaliesList, loading: isListFetching } = useListAnomalies({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: getAnomalySummary } = useGetAnomalyWidgetsData({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // Fetch the default workload ID's for redirections
  const [ccmMetaResult] = useFetchCcmMetaDataQuery()
  const { data: ccmData } = ccmMetaResult

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

    const getSummary = async () => {
      try {
        const response = await getAnomalySummary({
          filter: {
            stringFilters: [
              {
                field: 'NAMESPACE',
                operator: 'IN',
                values: ['ecom-test02-live', 'nnamespace-2']
              }
            ]
          }
        })
        const { data } = response
        parseSummaryData(data)
      } catch (error) {
        // console.log('AnomaliesOverviewPage: Error in fetching summary data', error)
      }
    }
    getList()
    getSummary()
  }, [getAnomaliesList, getAnomalySummary])

  const parseSummaryData = (summaryData: any) => {
    summaryData.forEach((item: any) => {
      switch (item.widgetDescription) {
        case 'TOP_N_ANOMALIES':
          setPerspectiveANomaliesData(item.widgetData)
          break

        case 'TOTAL_COST_IMPACT':
          setCostData(item.widgetData?.[0])
          break

        case 'ANOMALIES_BY_CLOUD_PROVIDERS':
          setCloudProvidersWiseData(item.widgetData)
          break

        case 'ANOMALIES_BY_STATUS':
          setStatusWiseData(item.widgetData)
          break
      }
    })
  }

  return (
    <>
      <PageHeader
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmAnomalies' }}
          >
            {getString('ce.anomalyDetection.sideNavText')}
          </Text>
        }
        breadcrumbs={<NGBreadcrumbs />}
      />
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
          <AnomaliesSearch searchText={searchText} onChange={setSearchText} />
          <AnomaliesSummary
            costData={costData}
            perspectiveAnomaliesData={perspectiveAnomaliesData}
            cloudProvidersWiseData={cloudProvidersWiseData}
            statusWiseData={statusWiseData}
            allDefaultProviders={(ccmData?.ccmMetaData || {}) as CcmMetaData}
          />
          <AnomaliesListGridView listData={listData} />
        </Container>
      </PageBody>
    </>
  )
}

export default AnomaliesOverviewPage
