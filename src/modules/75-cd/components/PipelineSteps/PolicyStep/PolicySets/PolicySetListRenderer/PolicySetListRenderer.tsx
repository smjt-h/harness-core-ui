/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import moment from 'moment'
import type { GetDataError } from 'restful-react'

import { Checkbox, Collapse, Color, Container, Layout, Page, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { PolicySet } from 'services/pm'

import { DATE_WITHOUT_TIME_FORMAT } from '@common/utils/StringUtils'

import { PolicySetType } from '../../BasePolicyStep'

import css from './PolicySetListRenderer.module.scss'

export interface PolicySetListRendererProps {
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
  newPolicySetIds: string[]
  setNewPolicySetIds: (list: string[]) => void
  policySetList: PolicySet[]
  selectedTabId: PolicySetType
}

export function PolicySetListRenderer({
  loading,
  error,
  refetch,
  newPolicySetIds,
  setNewPolicySetIds,
  policySetList,
  selectedTabId
}: PolicySetListRendererProps) {
  const { getString } = useStrings()

  return (
    <Page.Body
      loading={loading}
      error={(error?.data as Error)?.message || error?.message}
      retryOnError={() => refetch()}
      noData={{
        when: () => !policySetList?.length,
        icon: 'nav-project',
        message: getString('common.policiesSets.noPolicySetResult')
      }}
      className={css.renderer}
    >
      {policySetList.map((policySet: PolicySet) => {
        const checked =
          newPolicySetIds.some(_id => {
            const parts = _id.split('.')
            if (parts[1] === undefined && selectedTabId === PolicySetType.PROJECT) {
              return parts[0] === policySet.identifier
            } else if (parts[0] === 'acc' && selectedTabId === PolicySetType.ACCOUNT) {
              return parts[1] === policySet.identifier
            } else if (parts[0] === 'org' && selectedTabId === PolicySetType.ORG) {
              return parts[1] === policySet.identifier
            }
          }) ?? false

        return (
          <Collapse
            key={policySet.identifier}
            collapseClassName={css.policySetRows}
            heading={
              <Layout.Horizontal width={'100%'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Layout.Vertical padding={{ left: 'medium' }}>
                  <Checkbox
                    name="selectedPolicySets"
                    value={policySet.identifier}
                    checked={checked}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      const id = policySet.project_id
                        ? `${policySet.identifier}`
                        : policySet.org_id
                        ? `org.${policySet.identifier}`
                        : `acc.${policySet.identifier}`
                      if ((e.target as any).checked) {
                        setNewPolicySetIds([...newPolicySetIds, id])
                      } else {
                        setNewPolicySetIds(newPolicySetIds.filter(_id => _id !== id))
                      }
                    }}
                  />
                </Layout.Vertical>
                <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK} padding="medium">
                  {policySet.name}
                </Text>
              </Layout.Horizontal>
            }
            collapsedIcon={'main-chevron-right'}
            expandedIcon={'main-chevron-down'}
          >
            <Layout.Horizontal>
              {/* TODO: To be added once the policy set list api starts returning policies
              <Container padding={{ top: 'medium', bottom: 'medium' }} background={Color.GREY_50} width={'50%'}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }}>
                  Policy
                </Text>
                <PoliciesRenderer policies={['Policy 1', 'Policy 2', 'Policy 3']} />
              </Container> */}
              <Container padding={{ top: 'medium', bottom: 'medium' }} background={Color.GREY_50}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }} style={{ textTransform: 'capitalize' }}>
                  {getString('common.lastModifiedTime')}
                </Text>
                <Text font={{ size: 'normal' }} style={{ color: '#0B0B0D' }}>
                  {moment.unix((policySet.updated as number) / 1000).format(DATE_WITHOUT_TIME_FORMAT)}
                </Text>
              </Container>
            </Layout.Horizontal>
          </Collapse>
        )
      })}
    </Page.Body>
  )
}
