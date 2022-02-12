/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import {
  Text,
  Color,
  Container,
  ExpandingSearchInput,
  Layout,
  Checkbox,
  Button,
  Icon,
  TableV2,
  Select,
  SelectOption
} from '@wings-software/uicore'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ResourceGroup, useAllResourceGroups } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import css from './COInstanceSelector.module.scss'

interface COInstanceSelectorprops {
  instances: InstanceDetails[]
  selectedInstances: InstanceDetails[]
  setSelectedInstances: (selectedInstances: InstanceDetails[]) => void
  setGatewayDetails: (gatewayDetails: GatewayDetails) => void
  gatewayDetails: GatewayDetails
  onInstancesAddSuccess?: () => void
  loading?: boolean
  refresh?: (tomlString?: string) => void
}

function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere', paddingRight: 5 }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 8

const COInstanceSelector: React.FC<COInstanceSelectorprops> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const [filteredInstances, setFilteredInstances] = useState<InstanceDetails[]>([])
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(_defaultTo(props.selectedInstances, []))
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [resourceGroupData, setResourceGroupData] = useState<SelectOption[]>([])
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<SelectOption>()

  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)

  const { data: resourceGroups, loading: resourceGroupsLoading } = useAllResourceGroups({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: !isAzureProvider
  })

  useEffect(() => {
    setFilteredInstances(props.instances)
  }, [props.instances])

  useEffect(() => {
    setResourceGroupDataFromResponse(resourceGroups?.response)
  }, [resourceGroups?.response])

  useEffect(() => {
    if (!selectedResourceGroup && !_isEmpty(selectedInstances)) {
      const groupName = selectedInstances?.[0]?.metadata?.resourceGroup?.toLowerCase()
      const groupToSelect = resourceGroupData.find(d => d.label.toLowerCase() === groupName)
      setSelectedResourceGroup(groupToSelect)
    }
  }, [resourceGroupData])

  useEffect(() => {
    if (selectedResourceGroup) {
      const groupText = _defaultTo(selectedResourceGroup.value, '') as string
      props.refresh?.(`resource_groups=['${groupText}']`)
    }
  }, [selectedResourceGroup])

  const setResourceGroupDataFromResponse = (response: ResourceGroup[] = []) => {
    const loaded = response.map(r => ({
      label: r.name as string,
      value: r.name as string
    }))
    setResourceGroupData(loaded)
  }

  const onCheckboxChange = (e: React.FormEvent<HTMLInputElement>, alreadyChecked: boolean, data: InstanceDetails) => {
    console.log('checked', e.currentTarget.checked)
    if (e.currentTarget.checked && !alreadyChecked) {
      setSelectedInstances([...selectedInstances, data])
    } else if (!e.currentTarget.checked && alreadyChecked) {
      const updatedInstances = [...selectedInstances]
      updatedInstances.splice(selectedInstances.indexOf(data), 1)
      setSelectedInstances(updatedInstances)
    }
  }

  const addInstances = () => {
    const newInstances = [...selectedInstances]
    props.setSelectedInstances(newInstances)
    props.gatewayDetails.selectedInstances = newInstances
    props.setGatewayDetails(props.gatewayDetails)
    handleSearch('')
    props.onInstancesAddSuccess?.()
  }

  const handleSearch = (text: string): void => {
    console.log({ text })
    pageIndex !== 0 && setPageIndex(0)
    if (!text) {
      setFilteredInstances(props.instances)
      return
    }
    text = text.toLowerCase()
    const instances = props.instances.filter(
      t => t.name.toLowerCase().indexOf(text) >= 0 || t.id.toLowerCase().indexOf(text) >= 0
    )
    setFilteredInstances(instances)
  }

  useEffect(() => {
    trackEvent('SelectedInstances', {})
  }, [])

  const refreshPageParams = () => {
    setPageIndex(0)
  }

  const handleRefresh = () => {
    refreshPageParams()
    props.refresh?.()
  }

  const hasSelectedInstances = !_isEmpty(selectedInstances)

  return (
    <Container>
      <Layout.Vertical spacing="large">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>Select Instances</Text>
          <Text style={{ marginTop: 15 }}>
            {getString('ce.co.autoStoppingRule.configuration.instanceModal.description')}
          </Text>
        </Container>
        <Layout.Vertical
          style={{
            paddingBottom: 20,
            paddingTop: 20,
            borderBottom: '1px solid #CDD3DD'
          }}
        >
          <Layout.Horizontal
            style={{
              justifyContent: 'space-between'
            }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Button
                onClick={addInstances}
                disabled={!hasSelectedInstances}
                style={{
                  backgroundColor: Utils.getConditionalResult(hasSelectedInstances, Color.PRIMARY_7, 'inherit'),
                  color: Utils.getConditionalResult(hasSelectedInstances, Color.GREY_100, 'inherit'),
                  marginRight: 20
                }}
              >
                {`Add selected ${Utils.getConditionalResult(
                  hasSelectedInstances,
                  `(${selectedInstances.length})`,
                  ''
                )}`}
              </Button>
              <div onClick={handleRefresh}>
                <Icon name="refresh" color="primary7" size={14} />
                <span style={{ color: 'var(--primary-7)', margin: '0 5px', cursor: 'pointer' }}>Refresh</span>
              </div>
            </Layout.Horizontal>
            <ExpandingSearchInput className={css.search} onChange={handleSearch} />
          </Layout.Horizontal>
          {isAzureProvider ? (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'large'} style={{ maxWidth: '40%' }}>
              <Select
                disabled={resourceGroupsLoading}
                items={resourceGroupData}
                onChange={setSelectedResourceGroup}
                value={selectedResourceGroup}
                inputProps={{
                  placeholder: getString('ce.co.selectResourceGroupPlaceholder')
                }}
                name="resourceGroupSelector"
              />
            </Layout.Horizontal>
          ) : null}
        </Layout.Vertical>
        <InstanceSelectorBody
          isLoading={props.loading || resourceGroupsLoading}
          selectedResourceGroup={selectedResourceGroup}
          instances={filteredInstances}
          pageProps={{
            index: pageIndex,
            setIndex: setPageIndex,
            totalCount: _defaultTo(props.instances.length, 0)
          }}
          onCheckboxChange={onCheckboxChange}
          selectedInstances={selectedInstances}
          isAzureSelection={isAzureProvider}
        />
      </Layout.Vertical>
    </Container>
  )
}

interface InstanceSelectorBodyProps {
  isLoading: boolean
  selectedResourceGroup: SelectOption | undefined
  instances: InstanceDetails[]
  pageProps: { index: number; setIndex: (page: number) => void; totalCount: number }
  onCheckboxChange: (e: React.FormEvent<HTMLInputElement>, alreadyChecked: boolean, data: InstanceDetails) => void
  selectedInstances: InstanceDetails[]
  isAzureSelection: boolean
}

const InstanceSelectorBody: React.FC<InstanceSelectorBodyProps> = ({
  isLoading,
  selectedResourceGroup,
  instances,
  pageProps,
  onCheckboxChange,
  selectedInstances,
  isAzureSelection
}) => {
  const { getString } = useStrings()

  const isSelectedInstance = (item: InstanceDetails): boolean => {
    return selectedInstances.findIndex(s => s.id === item.id) >= 0
  }

  const TableCheck = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
    const alreadyChecked = isSelectedInstance(tableProps.row.original)
    return (
      <Checkbox checked={alreadyChecked} onChange={e => onCheckboxChange(e, alreadyChecked, tableProps.row.original)} />
    )
  }

  return (
    <Container style={{ minHeight: 250 }}>
      {isLoading ? (
        <Layout.Horizontal flex={{ justifyContent: 'center' }}>
          <Icon name="spinner" size={24} color="blue500" />
        </Layout.Horizontal>
      ) : (
        <>
          {isAzureSelection && _isEmpty(selectedResourceGroup) ? (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Text icon={'execution-warning'} font={{ size: 'medium' }} iconProps={{ size: 20 }}>
                {getString('ce.co.autoStoppingRule.configuration.instanceModal.emptyDescription')}
              </Text>
            </Layout.Horizontal>
          ) : isAzureSelection && _isEmpty(instances) ? (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Text font={{ size: 'medium' }} iconProps={{ size: 20 }}>
                {getString('ce.co.autoStoppingRule.configuration.instanceModal.emptyInstancesDescription', {
                  region: selectedResourceGroup?.label
                })}
              </Text>
            </Layout.Horizontal>
          ) : (
            <TableV2
              className={css.instancesTable}
              data={instances.slice(
                pageProps.index * TOTAL_ITEMS_PER_PAGE,
                pageProps.index * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
              )}
              pagination={{
                pageSize: TOTAL_ITEMS_PER_PAGE,
                pageIndex: pageProps.index,
                pageCount: Math.ceil(instances.length / TOTAL_ITEMS_PER_PAGE),
                itemCount: pageProps.totalCount,
                gotoPage: newPageIndex => pageProps.setIndex(newPageIndex)
              }}
              columns={[
                {
                  Header: '',
                  id: 'selected',
                  Cell: TableCheck,
                  width: '5%'
                },
                {
                  accessor: 'name',
                  Header: getString('ce.co.instanceSelector.name'),
                  width: '35%',
                  Cell: NameCell,
                  disableSortBy: true
                },
                {
                  accessor: 'ipv4',
                  Header: getString('ce.co.instanceSelector.ipAddress'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'region',
                  Header: getString('regionLabel'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'type',
                  Header: getString('typeLabel'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'status',
                  Header: getString('status'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                }
              ]}
            />
          )}
        </>
      )}
    </Container>
  )
}

export default COInstanceSelector
