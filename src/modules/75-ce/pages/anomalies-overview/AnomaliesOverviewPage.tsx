/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, PageBody, PageHeader, Text, PageSpinner } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { CcmMetaData, useFetchCcmMetaDataQuery } from 'services/ce/services'
import { AnomalyData, CCMStringFilter, useGetAnomalyWidgetsData, useListAnomalies } from 'services/ce'
import AnomaliesSummary from '@ce/components/AnomaliesDetection/AnomaliesSummary'
import AnomalyFilters from '@ce/components/AnomaliesDetection/AnomaliesFilter'
import AnomaliesListGridView from '@ce/components/AnomaliesDetection/AnomaliesListView'
import AnomaliesSearch from '@ce/components/AnomaliesDetection/AnomaliesSearch'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

const getFilters = (filters: Record<string, Record<string, string>>, searchText: string) => {
  const updatedFilters = Object.values(filters).map(item => {
    return {
      field: item.field,
      operator: item.operator,
      values: [item.value]
    }
  })

  if (searchText) {
    updatedFilters.push({
      field: 'ALL',
      operator: 'LIKE',
      values: [searchText]
    })
  }

  return updatedFilters
}

const AnomaliesOverviewPage: React.FC = () => {
  const { getString } = useStrings()
  const [searchText, setSearchText] = React.useState('')
  const { accountId } = useParams<AccountPathProps>()
  const [listData, setListData] = useState<AnomalyData[]>([])
  const [costData, setCostData] = useState([])
  const [perspectiveAnomaliesData, setPerspectiveANomaliesData] = useState([])
  const [cloudProvidersWiseData, setCloudProvidersWiseData] = useState([])
  const [statusWiseData, setStatusWiseData] = useState([])
  const [filters, setFilters] = useState({})

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
  const { data: ccmData, fetching: isFetchingCcmMetaData } = ccmMetaResult

  const setAnomaliesFilters = (fieldName: string, operator: string, value: string) => {
    if (value) {
      setFilters(prevFilters => {
        return {
          ...prevFilters,
          [fieldName]: {
            field: fieldName,
            operator,
            value
          }
        }
      })
    } else {
      setFilters(prevFilters => {
        const updatedFilters = { ...prevFilters }
        delete updatedFilters[fieldName as keyof typeof updatedFilters]
        return updatedFilters
      })
    }
  }

  useEffect(() => {
    const getList = async () => {
      try {
        const response = await getAnomaliesList({
          filter: {
            stringFilters: getFilters(filters, searchText) as CCMStringFilter[]
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
            stringFilters: getFilters(filters, searchText) as CCMStringFilter[]
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
  }, [filters, getAnomaliesList, getAnomalySummary, searchText])

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
      <AnomalyFilters filters={filters} setFilters={setAnomaliesFilters} />
      <PageBody>
        {isListFetching || isFetchingCcmMetaData ? <PageSpinner /> : null}
        <Container
          padding={{
            right: 'xxxlarge',
            left: 'xxxlarge',
            bottom: 'medium',
            top: 'medium'
          }}
        >
          <AnomaliesSearch onChange={setSearchText} />
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
