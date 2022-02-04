import React, { useState, useMemo } from 'react'
import { FormInput, SelectOption, DropDown, Layout } from '@harness/uicore'
import { Filter } from '@common/components/Filter/Filter'
import { useStrings } from 'framework/strings'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { useBooleanStatus } from '@common/hooks'
import { useRecommendationFiltersQuery } from 'services/ce/services'

const RecommendationFiltersForm = ({ filterData }) => {
  const labelMapping = {
    name: 'Name',
    clusterName: 'Cluster Name',
    namespace: 'Namespace',
    resourceType: 'Resource Type'
  }

  return (
    <>
      {filterData.map(item => {
        const filterName = `${item.key}s`
        const labelName = labelMapping[item.key]
        const options = item.values.filter(val => val).map(val => ({ label: val, value: val }))
        return (
          <FormInput.MultiSelect
            key={item.key}
            name={filterName}
            label={labelName}
            items={options}
            placeholder={labelName}
          />
        )
      })}
    </>
  )
}

const RecommendationsFilters = ({ setFilters, recommendationFilters }) => {
  const filters = []
  const [appliedFilters, setAppliedFilters] = useState({})
  const appliedFilter = {}
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('ALL')

  //   const filterRef = React.useRef(null)

  const { getString } = useStrings()

  const [result] = useRecommendationFiltersQuery({})

  const { data, fetching } = result

  const filterData = data?.recommendationFilterStatsV2 || []

  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()

  const { name = 'Recommendations Filters', filterVisibility, identifier = '' } = {}

  const fieldToLabelMapping = React.useMemo(
    () =>
      new Map<string, string>([
        ['names', 'Name'],
        ['clusterNames', 'Cluster Name'],
        ['namespaces', 'Namespace']
      ]),
    []
  )

  const onFiltersApply = inputFormData => {
    const filtersToApply = {}
    console.log('Filters Form Data', inputFormData)
    Object.keys(inputFormData).forEach(key => {
      if (['clusterNames', 'names', 'namespaces', 'resourceTypes'].includes(key)) {
        filtersToApply[key] = inputFormData[key].map(val => val.value)
      }
    })
    setAppliedFilters(inputFormData)
    setFilters(filtersToApply)
    hideFilterDrawer()
  }

  const transformFilters = recommendationFilters => {
    const filtersToApply = {}

    Object.keys(recommendationFilters).forEach(key => {
      if (['clusterNames', 'names', 'namespaces', 'resourceTypes'].includes(key)) {
        filtersToApply[key] = recommendationFilters[key].map(val => ({ label: val, value: val }))
      }
    })
    return filtersToApply
  }

  console.log(transformFilters(recommendationFilters))

  const recommendationTypeOptions: SelectOption[] = useMemo(
    () => [
      { label: 'Recommendation Type: All', value: 'ALL' },
      { label: getString('ce.nodeRecommendation.nodepool'), value: 'NODE_POOL' },
      { label: getString('pipelineSteps.workload'), value: 'WORKLOAD' }
    ],
    []
  )

  return (
    <React.Fragment>
      <Layout.Horizontal
        spacing="small"
        padding={{ right: 'large' }}
        style={{ borderRightWidth: 0.5, borderRightStyle: 'solid', borderRightColor: '#B0B1C4' }}
      >
        {/* <DropDown placeholder="Savings > 10$" disabled /> */}
        <DropDown
          items={recommendationTypeOptions}
          value={resourceTypeFilter}
          filterable={false}
          onChange={item => {
            setResourceTypeFilter(item.value.toString())
            setFilters(currentVal => ({
              ...currentVal,
              resourceTypes: item.value === 'ALL' ? [] : [item.value.toString()]
            }))
          }}
        />
      </Layout.Horizontal>
      <FilterSelector
        filters={filters}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={() => {}}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={{}}
      />
      <Filter
        isOpen={isFiltersDrawerOpen}
        formFields={<RecommendationFiltersForm filterData={filterData} />}
        initialFilter={{
          formValues: { ...transformFilters(recommendationFilters) },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filters}
        isRefreshingFilters={fetching}
        onApply={onFiltersApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={() => {}}
        onDelete={() => {}}
        onFilterSelect={() => {}}
        onClear={() => {}}
        // ref={filterRef}
        onSuccessfulCrudOperation={() => {}}
      />
    </React.Fragment>
  )
}

export default RecommendationsFilters
