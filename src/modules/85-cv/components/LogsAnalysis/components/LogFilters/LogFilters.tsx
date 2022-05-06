import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Checkbox, Container, Layout, MultiSelectOption } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HealthSourceMultiSelectDropDown } from '@cv/components/ExecutionVerification/components/HealthSourcesMultiSelectDropdown/HealthSourceMultiSelectDropDown'
import { useStrings } from 'framework/strings'
import { useGetAllHealthSourcesForMonitoredServiceIdentifier } from 'services/cv'
import type { LogFiltersProps } from './LogFilters.types'
import type { EventTypeFullName } from '../../../ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.constants'
import { getClusterTypes } from '../../../ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.utils'
import css from '../../../ExecutionVerification/components/LogAnalysisContainer/components/ClusterTypeFiltersForLogs.module.scss'
import { getFilterDisplayText } from '@cv/components/ExecutionVerification/components/DeploymentMetrics/DeploymentMetrics.utils'

const LogFilters: React.FC<LogFiltersProps> = ({
  clusterTypeFilters,
  onFilterChange,
  monitoredServiceIdentifier,
  onHealthSouceChange,
  selectedHealthSources
}) => {
  const { getString } = useStrings()

  const checkboxItems = getClusterTypes(getString)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const getFilteredText = useCallback(
    (selectedOptions: MultiSelectOption[] = [], filterText = ' '): string => {
      const baseText = getString(filterText)
      return getFilterDisplayText(selectedOptions, baseText, getString('all'))
    },
    [getString]
  )

  const { data, error, loading } = useGetAllHealthSourcesForMonitoredServiceIdentifier({
    monitoredServiceIdentifier,
    queryParams: { accountId, projectIdentifier, orgIdentifier }
  })

  console.log('loading', loading)

  return (
    <Container className={css.main}>
      <Layout.Horizontal className={css.filterContainer}>
        <HealthSourceMultiSelectDropDown
          data={data}
          error={error}
          loading={loading}
          onChange={onHealthSouceChange}
          selectedValues={selectedHealthSources}
        />
        <Layout.Horizontal margin={{ left: 'small' }} padding={{ left: 'small' }} border={{ left: true }}>
          {checkboxItems.map(item => (
            <Checkbox
              key={item.label}
              label={item.label}
              value={item.value as string}
              data-testid={item.label}
              defaultChecked={clusterTypeFilters?.includes(item.value as EventTypeFullName)}
              onChange={inputEl => {
                onFilterChange((inputEl.target as HTMLInputElement).checked, item.value as EventTypeFullName)
              }}
            />
          ))}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default LogFilters
