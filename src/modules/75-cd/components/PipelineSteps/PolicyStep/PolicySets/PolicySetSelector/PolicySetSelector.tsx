/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Layout, Text, Container, Pagination, useToaster, Icon } from '@harness/uicore'
import { Dialog, Spinner } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps, SecretsPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { LinkedPolicy, PolicySet, useGetPolicySetList } from 'services/pm'

import { PolicySetSelectorDialogTitle } from './utils'
import { PolicySetListRenderer } from './PolicySetListRenderer'
import { PolicyType } from '../../BasePolicyStep'

import css from './PolicySetSelector.module.scss'
export interface MinimalObject {
  identifier?: string
  name?: string
}
export interface Item {
  label: string
  value: string
  scope: Scope
}
export interface PolicySetSelectorProps {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  policySetList: PolicySet[]
  setPolicySetList: (list: PolicySet[]) => void
  policySets: string[] | undefined
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export function PolicySetSelector(props: PolicySetSelectorProps): JSX.Element {
  const { isOpen, setOpen, setPolicySetList, policySetList, policySets: ps1 } = props
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & SecretsPathProps & ModulePathParams>()
  const [selectedPolicies, setSelectedPolicies] = React.useState<LinkedPolicy[]>([])
  const [policyType, updatePolicyType] = React.useState<PolicyType>(PolicyType.ACCOUNT)
  const [policyList, setPolicyList] = React.useState<LinkedPolicy[]>([])
  const [pageIndex, setPageIndex] = React.useState<number>(0)
  const [pageSize, setPageSize] = React.useState<number>(40)
  // const [searchTerm, setSearchTerm] = React.useState<string>('')

  const { getString } = useStrings()
  const { showError } = useToaster()

  const queryParams = {
    accountIdentifier: 'Ws0xvw71Sm2YmpSC7A8z4g',
    orgIdentifier,
    projectIdentifier
  }

  const reqQueryParams = React.useMemo(
    () => ({
      ...queryParams,
      page: String(pageIndex),
      include_hierarchy: true,
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

  React.useEffect(() => {
    if (error) showError(getErrorMessage(error))
    if (!policySets && !error) {
      refetch()
    }
    if (policySets) {
      if (policySetList.length > 0) setSelectedPolicies(policySetList)
      switch (policyType) {
        case PolicyType.ACCOUNT:
          setPolicyList(policySets.filter(policy => policy.account_id && !policy.org_id && !policy.project_id))
          break
        case PolicyType.ORG:
          // updatePolicySet([] as any)
          setPolicyList(policySets.filter(policy => policy.account_id && policy.org_id && !policy.project_id))
          break
        case PolicyType.PROJECT:
          setPolicyList(policySets.filter(policy => policy.account_id && policy.org_id && policy.project_id))
          break
      }
    }
  }, [policyType, policySets, error, refetch])

  const accountSelectedSize = selectedPolicies.filter(pol => pol.account_id && !pol.org_id && !pol.project_id).length
  const orgSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && !pol.project_id).length
  const projectSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && pol.project_id).length

  const LoadingBlock = () => (
    <Container
      padding={{ left: 'medium', right: 'medium', top: 'medium', bottom: 'large' }}
      style={{ height: '500px', overflowX: 'hidden', overflowY: 'auto', width: '800px' }}
    >
      <Spinner size={Spinner.SIZE_SMALL} />
    </Container>
  )

  return (
    <>
      <Dialog
        isOpen={isOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setOpen(false)}
        className={cx(css.referenceSelect, css.dialog)}
        title={PolicySetSelectorDialogTitle()}
      >
        {loading ? (
          <LoadingBlock />
        ) : (
          <div className={cx(css.contentContainer)}>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%">
              <Container
                onClick={() => updatePolicyType(PolicyType.ACCOUNT)}
                className={cx(css.titleHeader, {
                  [css.titleHeaderSelected]: policyType === PolicyType.ACCOUNT
                })}
              >
                <Text font={{ size: 'normal' }} icon="layers">
                  {getString('account')}
                  {accountSelectedSize > 0 && (
                    <span className={css.selectedCount}>
                      {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}&nbsp;
                      {accountSelectedSize}
                    </span>
                  )}
                </Text>
              </Container>
              {
                <Container
                  onClick={() => updatePolicyType(PolicyType.ORG)}
                  className={cx(css.titleHeader, {
                    [css.titleHeaderSelected]: policyType === PolicyType.ORG
                  })}
                >
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
              {
                <Container
                  onClick={() => updatePolicyType(PolicyType.PROJECT)}
                  className={cx(css.titleHeader, {
                    [css.titleHeaderSelected]: policyType === PolicyType.PROJECT
                  })}
                >
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
            </Layout.Horizontal>
            <hr className={css.separator} />

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
              ps1={ps1}
            />
            <Container>
              <Container margin={{ bottom: 'medium', top: 'medium', left: 'xxxlarge', right: 'xxxlarge' }}>
                <Pagination
                  itemCount={policyList.length}
                  hidePageNumbers
                  pageIndex={pageIndex}
                  gotoPage={index => setPageIndex(index)}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  pageSizeOptions={[5, 10, 20, 40]}
                  onPageSizeChange={size => setPageSize(size)}
                />
              </Container>
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
            </Container>
          </div>
        )}
      </Dialog>
    </>
  )
}
