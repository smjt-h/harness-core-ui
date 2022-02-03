/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Text,
  Layout,
  Container,
  Color,
  Icon,
  Button,
  ButtonVariation,
  TableV2,
  ExpandingSearchInput,
  FontVariation
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'
import {
  RecommendationItemDto,
  useRecommendationsQuery,
  useRecommendationsSummaryQuery,
  K8sRecommendationFilterDtoInput,
  ResourceType,
  useFetchCcmMetaDataQuery,
  CcmMetaData,
  Maybe
} from 'services/ce/services'

import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import formatCost from '@ce/utils/formatCost'
import { getViewFilterForId } from '@ce/utils/perspectiveUtils'
import EmptyView from '@ce/images/empty-state.svg'
import OverviewAddCluster from '@ce/components/OverviewPage/OverviewAddCluster'
import { PAGE_EVENTS, USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'
import RecommendationFilters from '../../components/RecommendationFilters'
import css from './RecommendationList.module.scss'

type RouteFn = (
  params: {
    recommendation: string
    recommendationName: string
  } & {
    accountId: string
  }
) => string

interface RecommendationListProps {
  data: Array<RecommendationItemDto>
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  filters: Record<string, string[]>
  setCostFilters: React.Dispatch<React.SetStateAction<Record<string, number>>>
  costFilters: Record<string, number>
  fetching: boolean
  ccmData: Maybe<CcmMetaData> | undefined
  pagination: {
    itemCount: number
    pageSize: number
    pageCount: number
    pageIndex: number
    gotoPage: (pageNumber: number) => void
  }
  onAddClusterSuccess: () => void
}

const RecommendationsList: React.FC<RecommendationListProps> = ({
  data,
  pagination,
  fetching,
  ccmData,
  onAddClusterSuccess
}) => {
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId } = useParams<{ accountId: string }>()

  const { getString } = useStrings()
  const resourceTypeToRoute: Record<ResourceType, RouteFn> = useMemo(() => {
    return {
      [ResourceType.Workload]: routes.toCERecommendationDetails,
      [ResourceType.NodePool]: routes.toCENodeRecommendationDetails
    }
  }, [])

  if (fetching) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <Icon color="blue500" name="spinner" size={30} />
      </Card>
    )
  }

  if (ccmData && !ccmData.k8sClusterConnectorPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <OverviewAddCluster
          onAddClusterSuccess={onAddClusterSuccess}
          descriptionText={getString('ce.pageErrorMsg.recommendationDesc')}
        />
      </Card>
    )
  }

  if (ccmData && ccmData.k8sClusterConnectorPresent && !ccmData.clusterDataPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <img src={EmptyView} />
        <Text className={css.errorText}>{getString('ce.pageErrorMsg.recommendationNoData')}</Text>
      </Card>
    )
  }

  const NameCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    const originalRowData = cell.row.original
    const { clusterName, namespace, resourceType } = originalRowData
    return (
      <Layout.Horizontal style={{ alignItems: 'center' }} padding={{ right: 'medium' }}>
        {/* <Icon name="app-kubernetes" size={28} padding={{ right: 'medium' }} /> */}
        <Container>
          <Layout.Horizontal margin={{ top: 'xxxsmall' }} style={{ alignItems: 'baseline' }} spacing="xsmall">
            <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>{`${getString(
              'common.cluster'
            )}:`}</Text>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
              {clusterName}
            </Text>
          </Layout.Horizontal>
          {namespace && (
            <Layout.Horizontal margin={{ top: 'xxxsmall' }} style={{ alignItems: 'baseline' }} spacing="xsmall">
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>{`${getString(
                'ce.recommendation.listPage.filters.namespace'
              )}:`}</Text>
              <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                {clusterName}
              </Text>
            </Layout.Horizontal>
          )}
          <Layout.Horizontal margin={{ top: 'xxxsmall' }} style={{ alignItems: 'baseline' }} spacing="xsmall">
            <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_BOLD }}>
              {resourceType === 'WORKLOAD'
                ? getString('pipelineSteps.workload')
                : getString('ce.nodeRecommendation.nodepool')}
              :
            </Text>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
              {cell.value}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>
    )
  }

  const RecommendationTypeCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD'
          ? getString('ce.recommendation.listPage.recommendationTypes.resizing')
          : getString('ce.recommendation.listPage.recommendationTypes.rightSizing')}
      </Text>
    )
  }

  // const RecommendationDetailsCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
  //   const rowData = row.original
  //   const { resourceType } = rowData
  //   return (
  //     <Text>
  //       {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationDetails.resize') : ''}
  //     </Text>
  //   )
  // }

  // const ResourceTypeCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
  //   return <Text>{cell.value === 'WORKLOAD' ? getString('pipelineSteps.workload') : 'Nodepool'}</Text>
  // }

  const CostCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return cell.value ? (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.H6 }}>
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  const calculateSavingsPercentage = (monthlyCost: Maybe<number>, monthlySavings: number): number => {
    if (monthlyCost && monthlySavings) {
      return Math.floor((monthlySavings / monthlyCost) * 100)
    } else {
      return 0
    }
  }

  const SavingCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    const originalRowData = cell.row.original
    const { monthlyCost } = originalRowData

    const savingsPercentage = calculateSavingsPercentage(monthlyCost, cell.value)

    return !isNaN(cell.value) ? (
      <Layout.Horizontal spacing="small" style={{ alignItems: 'baseline' }}>
        <Text color={Color.GREEN_700} font={{ variation: FontVariation.H5 }}>
          {formatCost(cell.value)}
        </Text>
        <Text color={Color.GREEN_700} font={{ variation: FontVariation.BODY2 }}>
          {`(${savingsPercentage}%)`}
        </Text>
      </Layout.Horizontal>
    ) : null
  }

  return data ? (
    <Layout.Vertical spacing="large">
      {data.length ? (
        <TableV2<RecommendationItemDto>
          onRowClick={({ id, resourceType, resourceName }) => {
            trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_CLICK, {})
            history.push(
              resourceTypeToRoute[resourceType]({
                accountId,
                recommendation: id,
                recommendationName: resourceName || id
              })
            )
          }}
          data={data}
          columns={[
            {
              accessor: 'resourceName',
              Header: getString('ce.recommendation.listPage.listTableHeaders.resourceName'),
              Cell: NameCell,
              width: '36%'
            },
            {
              accessor: 'monthlySaving',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlySavings'),
              Cell: SavingCell,
              width: '18%'
            },
            {
              accessor: 'monthlyCost',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlyCost'),
              Cell: CostCell,
              width: '18%'
            },
            {
              Header: getString('ce.recommendation.listPage.listTableHeaders.recommendationType'),
              Cell: RecommendationTypeCell,
              width: '18%'
            }
            // {
            //   accessor: 'resourceType',
            //   Header: getString('ce.recommendation.listPage.listTableHeaders.resourceType'),
            //   Cell: ResourceTypeCell,
            //   width: '18%'
            // }

            // {
            //   Header: getString('ce.recommendation.listPage.listTableHeaders.details'),
            //   Cell: RecommendationDetailsCell,
            //   width: '15%'
            // }
          ]}
          pagination={pagination}
        ></TableV2>
      ) : (
        <Container className={css.errorContainer}>
          <img src={EmptyView} />
          <Text className={css.errorText}>{getString('ce.pageErrorMsg.noRecommendations')}</Text>
        </Container>
      )}
    </Layout.Vertical>
  ) : null
}

const RecommendationList: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [costFilters, setCostFilters] = useState<Record<string, number>>({})
  const [page, setPage] = useState(0)
  const [searchParam, setSearchParam] = useState<string>('')

  const { trackPage } = useTelemetry()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const { perspectiveId, perspectiveName } = useQueryParams<{ perspectiveId: string; perspectiveName: string }>()

  useEffect(() => {
    trackPage(PAGE_EVENTS.RECOMMENDATIONS_PAGE, {})
  }, [])

  const modifiedCostFilters = costFilters['minSaving'] ? costFilters : { ...costFilters, minSaving: 0 }

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult

  const perspectiveFilters = (
    perspectiveId ? { perspectiveFilters: getViewFilterForId(perspectiveId) } : ({} as any)
  ) as K8sRecommendationFilterDtoInput

  const [result] = useRecommendationsQuery({
    variables: {
      filter: {
        ...filters,
        ...perspectiveFilters,
        ...modifiedCostFilters,
        offset: page * 10,
        limit: 10
      } as K8sRecommendationFilterDtoInput
    },
    pause: fetchingCCMMetaData
  })

  const [summaryResult] = useRecommendationsSummaryQuery({
    variables: {
      filter: {
        ...filters,
        ...perspectiveFilters,
        ...modifiedCostFilters
      } as unknown as K8sRecommendationFilterDtoInput
    }
  })

  const { data, fetching } = result
  const { data: summaryData } = summaryResult

  const { getString } = useStrings()

  const totalMonthlyCost = summaryData?.recommendationStatsV2?.totalMonthlyCost || 0
  const totalSavings = summaryData?.recommendationStatsV2?.totalMonthlySaving || 0

  const recommendationItems = data?.recommendationsV2?.items || []

  const gotoPage = (pageNumber: number) => setPage(pageNumber)

  const goBackToPerspective: () => void = () => {
    history.push(
      routes.toPerspectiveDetails({
        perspectiveId,
        perspectiveName,
        accountId
      })
    )
  }

  const isEmptyView = !fetching && !recommendationItems?.length

  const filteredRecommendationData = useMemo(() => {
    return recommendationItems.filter(rec => rec?.resourceName?.toLowerCase().includes(searchParam.toLowerCase()))
  }, [searchParam, recommendationItems])

  const pagination = {
    itemCount: summaryData?.recommendationStatsV2?.count || 0,
    pageSize: 10,
    pageCount: summaryData?.recommendationStatsV2?.count
      ? Math.ceil(summaryData?.recommendationStatsV2?.count / 10)
      : 0,
    pageIndex: page,
    gotoPage: gotoPage
  }

  return (
    <>
      <Page.Header
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmRecommendations' }}
          >
            {getString('ce.recommendation.sideNavText')}
          </Text>
        }
        toolbar={
          perspectiveId ? (
            <Button
              text={getString('ce.recommendation.listPage.backToPerspectives', {
                name: perspectiveName
              })}
              icon="chevron-left"
              onClick={goBackToPerspective}
              variation={ButtonVariation.PRIMARY}
            />
          ) : null
        }
      />
      <Page.Body loading={fetching || fetchingCCMMetaData}>
        <Card style={{ width: '100%' }}>
          <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
            <RecommendationFilters
              costFilters={costFilters}
              setCostFilters={setCostFilters}
              setFilters={setFilters}
              filters={filters}
            />
          </Layout.Horizontal>
        </Card>
        <Container padding={{ left: 'xxxlarge', right: 'xxxlarge', top: 'medium' }} height="100%">
          <Layout.Vertical spacing="large">
            <ExpandingSearchInput
              alwaysExpanded
              onChange={text => {
                setSearchParam(text.trim())
              }}
            />
            <Layout.Horizontal spacing="medium">
              <RecommendationSavingsCard
                title={getString('ce.recommendation.listPage.monthlySavingsText')}
                amount={isEmptyView ? '$-' : formatCost(totalSavings)}
                subTitle={`by ${summaryData?.recommendationStatsV2?.count || 0} ${getString(
                  'ce.recommendation.sideNavText'
                )}`}
                iconName="money-icon"
              />
              <RecommendationSavingsCard
                title={getString('ce.recommendation.listPage.monthlyPotentialCostText')}
                amount={isEmptyView ? '$-' : formatCost(totalMonthlyCost)}
                amountSubTitle={getString('ce.recommendation.listPage.pontentialCostAmountSubText')}
                subTitle={getString('ce.recommendation.listPage.potentialCostSubText')}
              />
            </Layout.Horizontal>
            <RecommendationsList
              onAddClusterSuccess={() => {
                refetchCCMMetaData()
              }}
              ccmData={ccmData?.ccmMetaData}
              pagination={pagination}
              setFilters={setFilters}
              filters={filters}
              setCostFilters={setCostFilters}
              costFilters={costFilters}
              fetching={fetching || fetchingCCMMetaData}
              data={filteredRecommendationData as Array<RecommendationItemDto>}
            />
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
