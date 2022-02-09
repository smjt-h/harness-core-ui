/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { DropDown, FlexExpander, Layout, Text, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import { QlceView, useFetchPerspectiveListQuery } from 'services/ce/services'
import { allCloudProvidersList } from '@ce/constants'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

interface AnomalyFiltersProps {
  filters: Record<string, Record<string, string>>
  setFilters: any
}

interface TimeRange {
  to: string
  from: string
}

const AnomalyFilters: React.FC<AnomalyFiltersProps> = ({ filters, setFilters }) => {
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
        onChange={option => {
          setFilters('PERSPECTIVE_ID', 'IN', option.value)
        }}
        value={filters ? filters['PERSPECTIVE_ID']?.value : null}
        addClearBtn={true}
        items={items}
      />
      <DropDown
        placeholder={getString('ce.anomalyDetection.filters.groupByCloudProvidersPlaceholder')}
        filterable={false}
        onChange={option => {
          setFilters('CLOUD_PROVIDER', 'IN', option.value)
        }}
        addClearBtn={true}
        value={filters ? filters['CLOUD_PROVIDER']?.value : null}
        items={allCloudProvidersList}
      />
      <Icon name="ng-filter" size={24} color="primary7" />
      <Text border={{ right: true, color: 'grey300' }} />
      <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
    </Layout.Horizontal>
  )
}

export default AnomalyFilters
