/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Layout, Container, Pagination, useToaster, Icon, Tabs, Text, FontVariation } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps, Tab } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { LinkedPolicy, PolicySet, useGetPolicySetList } from 'services/pm'

import { PolicySetListRenderer } from './PolicySetListRenderer'
import { PolicySetType } from '../../BasePolicyStep'

import CreatePolicySetWizard from '../CreatePolicyStep/PolicySetWizard'
import css from './PolicySetModal.module.scss'
export interface PolicySetModalProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  policySetList: PolicySet[]
  setPolicySetList: (list: PolicySet[]) => void
  policySets: string[] | undefined
  stepViewType?: StepViewType
}

interface tempProps {
  accountIdentifier: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1080,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'auto'
  }
}
export function PolicySetModal(props: PolicySetModalProps): JSX.Element {
  const { isOpen, setOpen, setPolicySetList, policySetList, stepViewType } = props
  const [selectedTabId, setSelectedTabId] = React.useState(PolicySetType.ACCOUNT)
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [selectedPolicies, setSelectedPolicies] = React.useState<LinkedPolicy[]>([])
  const [policyType, updatePolicyType] = React.useState<PolicySetType>(PolicySetType.ACCOUNT)
  const [policyList, setPolicyList] = React.useState<LinkedPolicy[]>([])
  const [pageIndex, setPageIndex] = React.useState<number>(0)
  const [pageSize, setPageSize] = React.useState<number>(40)
  const [queryParams, setQueryParams] = React.useState<tempProps>({
    accountIdentifier,
    ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
    ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier })
  })

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps} canOutsideClickClose isCloseButtonShown onClose={hideModal}>
        <CreatePolicySetWizard
          hideModal={hideModal}
          refetch={refetch}
          policySetData={{}}
          queryParams={queryParams}
          stepViewType={stepViewType}
        />
      </Dialog>
    )
  }, [queryParams, stepViewType])

  const { getString } = useStrings()
  const { showError } = useToaster()

  const reqQueryParams = React.useMemo(
    () => ({
      ...queryParams,
      page: String(pageIndex),
      per_page: pageSize.toString()
      // searchTerm: searchTerm
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

  // const debouncedSearch = React.useCallback(
  //   debounce(() => {
  //     refetch()
  //   }, 300),
  //   [refetch]
  // )

  // React.useEffect(() => {
  //   debouncedSearch()
  // }, [searchTerm])

  const pageCount = React.useMemo(
    () => parseInt(policySetResponse?.headers?.get('x-total-pages') || '0'),
    [policySetResponse]
  )

  const itemCount = React.useMemo(
    () => parseInt(policySetResponse?.headers?.get('x-total-items') || '0'),
    [policySetResponse]
  )

  React.useEffect(() => {
    setQueryParams({
      accountIdentifier,
      ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
      ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier })
    })
  }, [selectedTabId])

  React.useEffect(() => {
    if (error) showError(getErrorMessage(error))
    if (!policySets && !error) {
      refetch()
    }
    if (policySets) {
      if (policySetList.length > 0) setSelectedPolicies(policySetList)
      switch (policyType) {
        case PolicySetType.ACCOUNT:
          setPolicyList(policySets)
          break
        case PolicySetType.ORG:
          setPolicyList(policySets)
          break
        case PolicySetType.PROJECT:
          setPolicyList(policySets)
          break
      }
    }
  }, [policyType, policySets, error, refetch])

  const accountSelectedSize = selectedPolicies.filter(pol => pol.account_id && !pol.org_id && !pol.project_id).length
  const orgSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && !pol.project_id).length
  const projectSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && pol.project_id).length

  const handleTabChange = (nextTab: PolicySetType): void => {
    setSelectedTabId(nextTab)
    // TODO: To be removed
    updatePolicyType(nextTab)
  }

  const Footer = () => (
    <>
      <hr className={css.separator} />
      <Container margin={{ top: 'large' }}>
        <Layout.Horizontal spacing="medium">
          <Button
            text="Apply"
            intent="primary"
            onClick={() => {
              setPolicySetList(selectedPolicies)
              setOpen(false)
            }}
          />
          <Button text="Cancel" onClick={() => setOpen(false)} />
        </Layout.Horizontal>
      </Container>
    </>
  )

  const TempComp = () => (
    <>
      {/* <TextInput
      placeholder={getString('search')}
      leftIcon="search"
      value={searchTerm}
      autoFocus
      onChange={e => setSearchTerm((e.target as any)?.value)}
    /> */}
      <PolicySetListRenderer
        policySetList={policyList}
        selectedPolicies={selectedPolicies}
        setSelectedPolicies={setSelectedPolicies}
        loading={loading}
        error={error}
        refetch={refetch}
      />
      <Pagination
        itemCount={itemCount}
        pageSize={pageSize}
        pageCount={pageCount}
        pageIndex={pageIndex}
        gotoPage={index => setPageIndex(index)}
        onPageSizeChange={size => setPageSize(size)}
        pageSizeOptions={[5, 10, 20, 40]}
        hidePageNumbers
      />
      <Footer />
    </>
  )

  return (
    <>
      <Dialog
        isOpen={isOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setOpen(false)}
        className={css.policySetModal}
        title={
          <Layout.Horizontal
            spacing="xsmall"
            padding={{ top: 'xlarge', left: 'medium', right: 'large' }}
            flex={{ justifyContent: 'space-between' }}
          >
            <Text font={{ variation: FontVariation.H3 }}>{getString('common.policiesSets.selectPolicySet')}</Text>
            <Button
              minimal
              icon="plus"
              className={css.newPolicyBtn}
              text={getString('common.policiesSets.newPolicyset')}
              margin={{ bottom: 'small' }}
              onClick={showModal}
            />
          </Layout.Horizontal>
        }
      >
        <Container padding={{ top: 'medium', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }} width={'800px'}>
          <Tabs id="policySetModal" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
            <Tab
              id={PolicySetType.ACCOUNT}
              title={
                <Container>
                  <Text font={{ size: 'normal' }} icon="layers">
                    {getString('account', { name: queryParams.accountIdentifier })}
                    {accountSelectedSize > 0 && (
                      <span className={css.selectedCount}>
                        {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}&nbsp;
                        {accountSelectedSize}
                      </span>
                    )}
                  </Text>
                </Container>
              }
              panel={<TempComp />}
              data-testid="account"
            />
            <Tab
              id={PolicySetType.ORG}
              title={
                <Container>
                  <Text font={{ size: 'normal' }} icon="diagram-tree">
                    {getString('orgLabel', { name: queryParams.orgIdentifier })}&nbsp;[{orgIdentifier}]
                    {orgSelectedSize > 0 && (
                      <span className={css.selectedCount}>
                        {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}&nbsp;
                        {orgSelectedSize}
                      </span>
                    )}
                  </Text>
                </Container>
              }
              panel={<TempComp />}
              data-testid="orgLabel"
            />
            <Tab
              id={PolicySetType.PROJECT}
              title={
                <Container>
                  <Text font={{ size: 'normal' }} icon="cube">
                    {getString('projectLabel', { name: queryParams.projectIdentifier })}&nbsp;[{projectIdentifier}]
                    {projectSelectedSize > 0 && (
                      <span className={css.selectedCount}>
                        {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}&nbsp;
                        {projectSelectedSize}
                      </span>
                    )}
                  </Text>
                </Container>
              }
              panel={<TempComp />}
              data-testid="projectLabel"
            />
          </Tabs>
        </Container>
      </Dialog>
    </>
  )
}
