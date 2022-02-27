/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import {
  Button,
  Layout,
  Container,
  Pagination,
  useToaster,
  Icon,
  Tabs,
  Text,
  FontVariation,
  IconName
} from '@harness/uicore'
import { Dialog, Tab } from '@blueprintjs/core'

import { useStrings, StringKeys } from 'framework/strings'
import { GetPolicySetQueryParams, LinkedPolicy, useGetPolicySetList } from 'services/pm'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { PolicySetListRenderer } from '../PolicySetListRenderer/PolicySetListRenderer'
import { PolicySetType } from '../../BasePolicyStep'

import css from './PolicySetModal.module.scss'

export interface PolicySetModalProps {
  closeModal: () => void
  policySetIds: string[]
  setPolicySetIds: (list: string[]) => void
  stepViewType?: StepViewType
}

export function PolicySetModal({ policySetIds, setPolicySetIds, closeModal }: PolicySetModalProps): JSX.Element {
  const { getString } = useStrings()
  const { showError } = useToaster()

  const [selectedTabId, setSelectedTabId] = useState(PolicySetType.ACCOUNT)
  const [policySetList, setPolicySetList] = useState<LinkedPolicy[]>([])
  const [newPolicySetIds, setNewPolicySetIds] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(40)
  const [counts, setCounts] = useState({
    [PolicySetType.ACCOUNT]: 0,
    [PolicySetType.ORG]: 0,
    [PolicySetType.PROJECT]: 0
  })

  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [queryParams, setQueryParams] = useState<GetPolicySetQueryParams>({
    accountIdentifier,
    ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
    ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier })
  })

  useEffect(() => {
    if (policySetIds.length > 0) {
      setNewPolicySetIds(policySetIds)
    }
  }, [])

  useEffect(() => {
    setCounts({
      [PolicySetType.ACCOUNT]: newPolicySetIds.filter(id => id.includes('acc.')).length,
      [PolicySetType.ORG]: newPolicySetIds.filter(id => id.includes('org.')).length,
      [PolicySetType.PROJECT]: newPolicySetIds.filter(id => !id.includes('org.') && !id.includes('acc.')).length
    })
  }, [newPolicySetIds])

  useEffect(() => {
    // Set request query params to contain the org and project depending on the scope selected
    setQueryParams({
      accountIdentifier,
      ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
      ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier })
    })
  }, [selectedTabId])

  const reqQueryParams = useMemo(
    () => ({
      ...queryParams,
      page: String(pageIndex),
      per_page: pageSize.toString()
    }),
    [pageIndex, pageSize, queryParams]
  )

  const {
    data: policySets,
    loading,
    error,
    refetch,
    response: policySetResponse
  } = useGetPolicySetList({
    queryParams: reqQueryParams
  })

  const pageCount = useMemo(
    () => parseInt(policySetResponse?.headers?.get('x-total-pages') || '0'),
    [policySetResponse]
  )

  const itemCount = useMemo(
    () => parseInt(policySetResponse?.headers?.get('x-total-items') || '0'),
    [policySetResponse]
  )

  useEffect(() => {
    if (error) showError(getErrorMessage(error))
    if (!policySets && !error) {
      refetch()
    }
    if (policySets) {
      setPolicySetList(policySets)
    }
  }, [error, policySets, refetch, selectedTabId])

  const handleTabChange = (nextTab: PolicySetType): void => {
    setSelectedTabId(nextTab)
    setPageIndex(0)
  }

  // This component renders the title for the tabs in the modal
  const TabTitle = ({
    icon,
    type,
    count,
    name
  }: {
    icon: IconName
    type: StringKeys
    count: number
    name?: string
  }) => {
    return (
      <Container>
        <Text font={{ size: 'normal' }} icon={icon}>
          {getString(type)}
          {name ? `\xA0[${name}]` : ''}
          {count > 0 && (
            <span className={css.selectedCount}>
              {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}&nbsp;
              {count}
            </span>
          )}
        </Text>
      </Container>
    )
  }

  // This component renders the tab panel in the modal
  const TabPanel = () => (
    <>
      <PolicySetListRenderer
        newPolicySetIds={newPolicySetIds}
        setNewPolicySetIds={setNewPolicySetIds}
        policySetList={policySetList}
        loading={loading}
        error={error}
        refetch={refetch}
        selectedTabId={selectedTabId}
      />
      <Pagination
        itemCount={itemCount}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20, 40]}
        onPageSizeChange={size => setPageSize(size)}
        pageIndex={pageIndex}
        gotoPage={index => setPageIndex(index)}
        hidePageNumbers
      />
      <hr className={css.separator} />
      <Container margin={{ top: 'large' }}>
        <Layout.Horizontal spacing="medium">
          <Button
            text="Apply"
            intent="primary"
            onClick={() => {
              setPolicySetIds(newPolicySetIds)
              closeModal()
            }}
          />
          <Button text="Cancel" onClick={closeModal} />
        </Layout.Horizontal>
      </Container>
    </>
  )

  return (
    <>
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={closeModal}
        className={css.policySetModal}
        title={
          <Layout.Horizontal
            spacing="xsmall"
            padding={{ top: 'xlarge', left: 'medium', right: 'large' }}
            flex={{ justifyContent: 'space-between' }}
          >
            <Text font={{ variation: FontVariation.H3 }}>{getString('common.policiesSets.selectPolicySet')}</Text>
          </Layout.Horizontal>
        }
      >
        <Container padding={{ top: 'medium', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }} width={'800px'}>
          <Tabs id="policySetModal" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
            <Tab
              id={PolicySetType.ACCOUNT}
              title={<TabTitle icon="layers" type={'account'} count={counts[PolicySetType.ACCOUNT]} />}
              panel={<TabPanel />}
              data-testid="account"
            />
            <Tab
              id={PolicySetType.ORG}
              title={
                <TabTitle
                  icon="diagram-tree"
                  type={'orgLabel'}
                  count={counts[PolicySetType.ORG]}
                  name={orgIdentifier}
                />
              }
              panel={<TabPanel />}
              data-testid="orgLabel"
            />
            <Tab
              id={PolicySetType.PROJECT}
              title={
                <TabTitle
                  icon="cube"
                  type={'projectLabel'}
                  count={counts[PolicySetType.PROJECT]}
                  name={projectIdentifier}
                />
              }
              panel={<TabPanel />}
              data-testid="projectLabel"
            />
          </Tabs>
        </Container>
      </Dialog>
    </>
  )
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))
