/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import React from 'react'
import { Collapse, Color, Container, Layout, Text } from '@harness/uicore'
import { DEFAULT_DATE_FORMAT } from '@common/utils/StringUtils'
import { useStrings } from 'framework/strings'
import type { LinkedPolicy, PolicySet } from 'services/pm'
import { PoliciesRenderer } from '../PolicySetsFormField/PolicySetsFormField'
import PolicySetsCss from '../PolicySetsFormField/PolicySetsFormField.module.scss'

export interface PolicySetListRendererProps {
  policySetList: PolicySet[]
  selectedPolicies: PolicySet[]
  setSelectedPolicies: (list: PolicySet[]) => void
  ps1?: string[] | undefined
}

export function PolicySetListRenderer(props: PolicySetListRendererProps) {
  const { policySetList, selectedPolicies, setSelectedPolicies } = props
  const { getString } = useStrings()
  return (
    <Container
      // padding={{ left: 'xxxlarge', right: 'xxxlarge', top: 'small', bottom: 'small' }}
      style={{ height: '500px', overflowX: 'hidden', overflowY: 'auto' }}
    >
      {policySetList?.map((policy: LinkedPolicy) => {
        const checked = selectedPolicies?.some(_policy => _policy.identifier === policy.identifier) ?? false

        return (
          <Collapse
            key={policy.identifier}
            collapseHeaderClassName={checked ? PolicySetsCss.policyRowSelected : ''}
            collapseClassName={PolicySetsCss.policyRows}
            heading={
              <div className={PolicySetsCss.policyRowContent}>
                <Layout.Vertical flex={{ alignItems: 'center' }} padding={{ left: 'medium' }}>
                  <input
                    name="selectedPolicies"
                    type="checkbox"
                    value={policy.identifier}
                    checked={checked}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setSelectedPolicies([...selectedPolicies, { ...policy }])
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
              </div>
            }
            collapsedIcon={'main-chevron-right'}
            expandedIcon={'main-chevron-down'}
          >
            <Layout.Horizontal>
              <Container padding={{ top: 'medium', bottom: 'medium' }} background={Color.GREY_50} width={'50%'}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }}>
                  Policy
                </Text>
                <PoliciesRenderer />
              </Container>
              <Container padding={{ top: 'medium', bottom: 'medium' }} background={Color.GREY_50}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }}>
                  {getString('common.policy.table.lastModified')}
                </Text>
                <Text font={{ size: 'normal' }} style={{ color: '#0B0B0D' }}>
                  {moment.unix((policy.updated as number) / 1000).format(DEFAULT_DATE_FORMAT)}
                </Text>
              </Container>
            </Layout.Horizontal>
          </Collapse>
        )
      })}
    </Container>
  )
}
