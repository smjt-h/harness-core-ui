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
  Color
} from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Classes, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import {
  ANOMALIES_LIST_FORMAT,
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  getTimePeriodString
} from '@ce/utils/momentUtils'
import { AnomalyData, useListAnomalies } from 'services/ce'
import formatCost from '@ce/utils/formatCost'
import css from './AnomaliesOverviewPage.module.scss'

export interface TimeRange {
  to: string
  from: string
}
interface anomalyParams {
  accountId: string
}

const AnomalyFilters: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  return (
    <Layout.Horizontal spacing="large" className={css.header}>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
        <DropDown
          placeholder={'GroupBy: Perspectives'}
          filterable={false}
          onChange={option => {
            alert(option.value)
          }}
          className={css.groupbyFilter}
          items={[
            {
              label: 'GroupBy: Perspectives',
              value: 'perspectives'
            },
            {
              label: 'GroupBy: None (Show all anomalies)',
              value: 'none'
            }
          ]}
        />
      </Layout.Horizontal>
      <FlexExpander />
      {/* TODO: Mutiselect DropDown */}
      <DropDown
        placeholder={'All Perspectives'}
        filterable={false}
        onChange={option => {
          alert(option.value)
        }}
        items={[
          {
            label: 'All Perspectives',
            value: 'all'
          }
        ]}
      />
      <DropDown
        placeholder={'All Cloud Providers'}
        filterable={false}
        onChange={option => {
          alert(option.value)
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

const AnomaliesOverview: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="medium">
      <Layout.Vertical spacing="small">
        <Container padding="medium" background={Color.GREY_100} border={{ color: Color.GREY_100, radius: 4 }}>
          <Text color={Color.GREY_600} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.totalCountText')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            102
          </Text>
        </Container>
        <Container
          padding="medium"
          background={Color.RED_100}
          border={{ color: Color.RED_100, radius: 4 }}
          intent="danger"
        >
          <Text color={Color.RED_500} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.costImpacted')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            $17586.99
          </Text>
          <p></p>
        </Container>
      </Layout.Vertical>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.perspectiveWise').toUpperCase()}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.cloudProvidersWise')}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.statusWise')}
        </Text>
      </div>
    </Layout.Horizontal>
  )
}

interface listProps {
  listData: AnomalyData[]
}

const AnomaliesMenu = () => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)

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
          }}
        />
      </Menu>
    </Popover>
  )
}

const AnomaliesListGridView: React.FC<listProps> = ({ listData }) => {
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
          <Link to={''}>{resourceName || 'squidward/spongebob/1233445...'}</Link>
          <Text font={{ size: 'small' }} color={Color.GREY_600}>
            {resourceInfo || 'cluster/workload'}
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
          {status || 'Open'}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_600}>
          {stausRelativeTime || '6 minutes ago'}
        </Text>
      </Layout.Vertical>
    )
  }

  const MenuCell: Renderer<CellProps<AnomalyData>> = () => {
    return <AnomaliesMenu />
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
  const { accountId } = useParams<anomalyParams>()
  const [listData, setListData] = useState<AnomalyData[]>([])

  const { mutate: getAnomaliesList } = useListAnomalies({
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
        console.log('AnomaliesOverviewPage: Error in fetching the anomalies list', error)
      }
    }
    getList()
  }, [getAnomaliesList])

  return (
    <>
      <PageHeader title={getString('ce.anomalyDetection.sideNavText')} />
      <AnomalyFilters />
      <PageBody>
        {/* TODO: Add page spinner */}
        <Container
          padding={{
            right: 'xxxlarge',
            left: 'xxxlarge',
            bottom: 'medium',
            top: 'medium'
          }}
        >
          <AnomaliesSearch searchText={searchText} onChange={setSearchText} />
          <AnomaliesOverview />
          <AnomaliesListGridView listData={listData} />
        </Container>
      </PageBody>
    </>
  )
}

export default AnomaliesOverviewPage
