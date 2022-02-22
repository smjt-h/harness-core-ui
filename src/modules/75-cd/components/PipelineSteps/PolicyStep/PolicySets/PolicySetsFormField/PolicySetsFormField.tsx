/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { FormikErrors, FormikProps } from 'formik'

import { Button, FormError, Layout } from '@harness/uicore'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { GetPolicySet, GetPolicySetQueryParams, PolicySet } from 'services/pm'

import type { PolicyStepFormData } from '../../PolicyStepTypes'
import { PolicyType } from '../../BasePolicyStep'
import { PolicySetSelector } from '../PolicySetSelector/PolicySetSelector'

import css from './PolicySetsFormField.module.scss'
interface PolicySetsFormFieldInterface extends Omit<IFormGroupProps, 'label'> {
  name: string
  formikProps?: FormikProps<PolicyStepFormData>
  error?: string | FormikErrors<any> | undefined
}

interface MiniPolicySetRendererProps {
  policySets: string[] | undefined
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
}

interface PoliciesRendererProps {
  policies?: (string | undefined)[]
}

export const PoliciesRenderer = (props: PoliciesRendererProps) => {
  const { policies } = props
  const policyList = policies || ['Policy 1', 'Policy 2', 'Policy 3']
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ right: 'medium' }}>
      {policyList.map((policyName, index) => (
        <div className={css.styledPolicy} key={index}>
          {policyName}
        </div>
      ))}
    </Layout.Horizontal>
  )
}

const MiniPolicySetRenderer: React.FC<MiniPolicySetRendererProps> = props => {
  const { policySets, accountIdentifier, orgIdentifier, projectIdentifier } = props
  const renderPolicySets = policySets && policySets.length > 0

  return (
    <>
      {renderPolicySets &&
        policySets?.map(policySet => {
          const accountType = policySet.includes('acc.')
            ? PolicyType.ACCOUNT
            : policySet.includes('org.')
            ? PolicyType.ORG
            : PolicyType.PROJECT
          let queryParams: GetPolicySetQueryParams = { accountIdentifier }

          if (accountType === 'Org') queryParams = { ...queryParams, orgIdentifier }
          if (accountType === 'Project') queryParams = { ...queryParams, orgIdentifier, projectIdentifier }

          return (
            <GetPolicySet
              policyset={policySet}
              resolve={psInfo => psInfo}
              queryParams={{ ...queryParams }}
              key={policySet}
            >
              {data => {
                return (
                  <>
                    {data && (
                      <Layout.Horizontal
                        className={css.policySetHolder}
                        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                        margin={{ bottom: 'xsmall' }}
                      >
                        <div className={css.accountIdentifier}>{data?.name}</div>
                        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                          <PoliciesRenderer policies={data?.policies?.map(policy => policy.name)} />
                          <div className={css.accountType}>{accountType}</div>
                        </Layout.Horizontal>
                      </Layout.Horizontal>
                    )}
                  </>
                )
              }}
            </GetPolicySet>
          )
        })}
    </>
  )
}

const PolicySetsFormField: React.FC<PolicySetsFormFieldInterface> = props => {
  const { formikProps, name, error, disabled, ...rest } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [isOpen, setOpen] = React.useState(false)
  const [policySetList, setPolicySetList] = React.useState<PolicySet[]>([])
  const { getString } = useStrings()

  const formatPolicySetList = (list: PolicySet[]) => {
    setPolicySetList(list)
    const valuesToSet = list.map(item => {
      if (item.project_id) return `${item.identifier}`
      else if (item.org_id) return `org.${item.identifier}`
      else return `acc.${item.identifier}`
    })
    formikProps?.setFieldValue(name, valuesToSet)
  }

  const policySets = formikProps?.values?.spec?.policySets

  const helperText = error ? <FormError name={name} errorMessage={error} /> : undefined
  const intent = error ? Intent.DANGER : Intent.NONE

  return (
    <FormGroup {...rest} helperText={helperText} intent={intent}>
      <MiniPolicySetRenderer
        policySets={policySets}
        accountIdentifier={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
      />
      <Button
        minimal
        className={css.addModifyButton}
        withoutCurrentColor={true}
        iconProps={{ size: 14 }}
        disabled={disabled}
        onClick={e => {
          if (disabled) {
            e.preventDefault()
          } else {
            setOpen(true)
          }
        }}
      >
        {getString('common.policiesSets.addOrModifyPolicySet')}
      </Button>
      {isOpen && (
        <PolicySetSelector
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          isOpen={isOpen}
          setOpen={setOpen}
          policySetList={policySetList}
          setPolicySetList={formatPolicySetList}
          policySets={policySets}
        />
      )}
    </FormGroup>
  )
}

export default PolicySetsFormField
