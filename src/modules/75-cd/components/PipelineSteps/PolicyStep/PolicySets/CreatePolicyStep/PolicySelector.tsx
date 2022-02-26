/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import cx from 'classnames'
import * as moment from 'moment'
import { Button, Text, Color, Container, Layout, Select, Pagination, Icon, useToaster, Collapse } from '@harness/uicore'
import { Spinner } from '@blueprintjs/core'
import { DEFAULT_DATE_FORMAT } from '@common/utils/StringUtils'
import { useGetPolicyList, LinkedPolicy, PolicySetWithLinkedPolicies } from 'services/pm'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '../PolicySetModal/PolicySetModal'
import css from './PolicySets.module.scss'

type QueryParams = {
  accountIdentifier: string | undefined
  orgIdentifier: string | undefined
  projectIdentifier: string | undefined
  per_page: string
  page: string
  sort: string[]
  searchTerm: string
  include_hierarchy?: boolean
}

enum PolicyType {
  ACCOUNT = 'account',
  ORG = 'org',
  PROJECT = 'project'
}

const PolicySelector: React.FC<{
  setHidePolicySelector: (data: boolean) => void
  queryParams: QueryParams
  prevStepData: { id: string }
  policySetData: PolicySetWithLinkedPolicies
  selectedPolicies: LinkedPolicy[]
  setSelectedPolicies: (value: LinkedPolicy[]) => void
}> = ({ setHidePolicySelector, queryParams, setSelectedPolicies, selectedPolicies }) => {
  const { getString } = useStrings()
  const [policyType, updatePolicyType] = useState<PolicyType>(PolicyType.ACCOUNT)
  const [pageIndex, setPageIndex] = useState(0)
  const [policyList, setPolicyList] = useState<LinkedPolicy[]>([])
  const { showError } = useToaster()
  const reqQueryParams = useMemo(
    () => ({
      ...queryParams,
      page: String(pageIndex),
      include_hierarchy: true
    }),
    [pageIndex]
  )
  const {
    data: policies,
    loading,
    error,
    refetch,
    response: policyResponse
  } = useGetPolicyList({
    queryParams: reqQueryParams
  })

  const pageCount = useMemo(() => parseInt(policyResponse?.headers?.get('x-total-pages') || '0'), [policyResponse])
  const pageSize = useMemo(() => parseInt(policyResponse?.headers?.get('x-page-size') || '0'), [policyResponse])

  useEffect(() => {
    if (error) showError(getErrorMessage(error))
    if (!policies && !error) {
      refetch()
    }
    if (policies) {
      switch (policyType) {
        case PolicyType.ACCOUNT:
          setPolicyList(policies.filter(policy => policy.account_id && !policy.org_id && !policy.project_id))
          break
        case PolicyType.ORG:
          setPolicyList(policies.filter(policy => policy.account_id && policy.org_id && !policy.project_id))
          break
        case PolicyType.PROJECT:
          setPolicyList(policies.filter(policy => policy.account_id && policy.org_id && policy.project_id))
          break
      }
    }
  }, [policyType, policies, error])

  const accountSelectedSize = selectedPolicies.filter(pol => pol.account_id && !pol.org_id && !pol.project_id).length
  const orgSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && !pol.project_id).length
  const projectSelectedSize = selectedPolicies.filter(pol => pol.account_id && pol.org_id && pol.project_id).length

  const LoadingBlock = () => (
    <Container padding={{ left: 'medium', right: 'medium', top: 'medium', bottom: 'large' }}>
      <Spinner size={Spinner.SIZE_SMALL} />
    </Container>
  )

  return (
    <Container height={800}>
      <Container padding={{ top: 'xxxlarge', left: 'xxxlarge', right: 'xxxlarge' }}>
        <Text margin={{ bottom: 'xlarge' }} font={{ size: 'large' }} color={Color.BLACK}>
          Select Policy
        </Text>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%">
          <Container
            onClick={() => updatePolicyType(PolicyType.ACCOUNT)}
            className={cx(css.titleHeader, { [css.titleHeaderSelected]: policyType === PolicyType.ACCOUNT })}
          >
            <Text font={{ size: 'normal' }} icon="layers">
              Account
              {accountSelectedSize > 0 && (
                <span className={css.selectedCount}>
                  {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}
                  {accountSelectedSize}
                </span>
              )}
            </Text>
          </Container>
          {queryParams.orgIdentifier && (
            <Container
              onClick={() => updatePolicyType(PolicyType.ORG)}
              className={cx(css.titleHeader, { [css.titleHeaderSelected]: policyType === PolicyType.ORG })}
            >
              <Text font={{ size: 'normal' }} icon="diagram-tree">
                Org
                {orgSelectedSize > 0 && (
                  <span className={css.selectedCount}>
                    {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}
                    {orgSelectedSize}
                  </span>
                )}
              </Text>
            </Container>
          )}
          {queryParams.projectIdentifier && (
            <Container
              onClick={() => updatePolicyType(PolicyType.PROJECT)}
              className={cx(css.titleHeader, { [css.titleHeaderSelected]: policyType === PolicyType.PROJECT })}
            >
              <Text font={{ size: 'normal' }} icon="cube">
                Project
                {projectSelectedSize > 0 && (
                  <span className={css.selectedCount}>
                    {<Icon className={css.tickIcon} name="main-tick" size={10} color="white" />}
                    {projectSelectedSize}
                  </span>
                )}
              </Text>
            </Container>
          )}
        </Layout.Horizontal>
      </Container>
      <hr className={css.separator} />
      {loading ? (
        <LoadingBlock />
      ) : (
        <Container
          padding={{ left: 'xxxlarge', right: 'xxxlarge', top: 'small', bottom: 'small' }}
          style={{ height: '500px', overflowX: 'hidden', overflowY: 'auto' }}
        >
          {policyList?.map((policy: LinkedPolicy) => {
            const checked = selectedPolicies.some(_policy => _policy.identifier === policy.identifier)
            let policySeverity = policy?.severity
            if (!policySeverity) {
              policySeverity = selectedPolicies.filter(_policy => _policy.identifier === policy.identifier)[0]?.severity
            }

            return (
              <Collapse
                key={policy.identifier}
                collapseHeaderClassName={checked ? css.policyRowSelected : ''}
                collapseClassName={css.policyRows}
                heading={
                  <div className={css.policyRowContent}>
                    <Layout.Vertical flex={{ alignItems: 'center' }} padding={{ left: 'medium' }}>
                      <input
                        name="selectedPolicies"
                        type="checkbox"
                        value={policy.identifier}
                        checked={checked}
                        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setSelectedPolicies([...selectedPolicies, { ...policy, severity: 'error' }])
                          } else {
                            setSelectedPolicies(
                              selectedPolicies.filter(_policy => _policy.identifier !== policy.identifier)
                            )
                          }
                        }}
                      />
                    </Layout.Vertical>
                    <Layout.Vertical flex={{ alignItems: 'center' }}>
                      <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK} padding="medium">
                        {policy.name}
                      </Text>
                    </Layout.Vertical>
                    {checked && (
                      <Layout.Vertical className={css.severity}>
                        <Select
                          defaultSelectedItem={{
                            label: policySeverity === 'warning' ? 'Warn & continue' : 'Error and exit',
                            value: policySeverity ? policySeverity : 'warning'
                          }}
                          items={[
                            { label: 'Warn & continue', value: 'warning' },
                            { label: 'Error and exit', value: 'error' }
                          ]}
                          onChange={async e => {
                            setSelectedPolicies(
                              selectedPolicies.map(pol =>
                                pol.identifier === policy.identifier
                                  ? ({ ...policy, severity: e.value } as LinkedPolicy)
                                  : pol
                              )
                            )
                          }}
                        />
                      </Layout.Vertical>
                    )}
                  </div>
                }
              >
                <Container padding={{ top: 'medium', bottom: 'medium' }} background={Color.GREY_50}>
                  <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }}>
                    {getString('common.policy.table.lastModified')}
                  </Text>
                  <Text font={{ size: 'normal' }}>
                    {moment.unix((policy.updated as number) / 1000).format(DEFAULT_DATE_FORMAT)}
                  </Text>
                </Container>
              </Collapse>
            )
          })}
        </Container>
      )}
      <Container>
        <Container margin={{ bottom: 'medium', top: 'medium', left: 'xxxlarge', right: 'xxxlarge' }}>
          <Pagination
            hidePageNumbers
            gotoPage={index => setPageIndex(index)}
            itemCount={policyList.length}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20, 40]}
          />
        </Container>
        <hr className={css.separator} />
        <Container margin={{ bottom: 'medium', top: 'medium', left: 'xxxlarge', right: 'xxxlarge' }}>
          <Layout.Horizontal spacing="medium">
            <Button text="Apply" intent="primary" onClick={() => setHidePolicySelector(true)} />
            <Button text="Cancel" onClick={() => setHidePolicySelector(true)} />
          </Layout.Horizontal>
        </Container>
      </Container>
    </Container>
  )
}

export default PolicySelector
