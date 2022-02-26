/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { FormikErrors, FormikProps } from 'formik'

import { Button, Color, FormError, Layout, Text } from '@harness/uicore'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { GetPolicySet, GetPolicySetQueryParams, PolicySet } from 'services/pm'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { PolicyStepFormData } from '../../PolicyStepTypes'
import { PolicySetType } from '../../BasePolicyStep'
import { PolicySetModal } from '../PolicySetModal/PolicySetModal'

import css from './PolicySetsFormField.module.scss'
interface PolicySetsFormFieldInterface extends Omit<IFormGroupProps, 'label'> {
  name: string
  formikProps?: FormikProps<PolicyStepFormData>
  error?: string | FormikErrors<any> | undefined
  stepViewType?: StepViewType
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

export const PoliciesRenderer = ({ policies }: PoliciesRendererProps) => {
  const length = policies?.length ?? 0
  if (!length) return null
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} margin={{ right: 'small' }}>
      {policies?.slice(0, 2).map((policy, index) => (
        <Text className={css.styledPolicy} key={index} lineClamp={1}>
          {policy}
        </Text>
      ))}
      {length > 2 && (
        <Text
          className={css.styledPolicy}
          background={Color.GREY_100}
          alwaysShowTooltip
          tooltip={
            <Layout.Vertical padding="medium">
              <div>
                {policies?.splice(2).map((policy, index) => (
                  <Text
                    lineClamp={1}
                    color={Color.BLACK}
                    margin={{ top: 'small', bottom: 'small' }}
                    style={{ maxWidth: '400px' }}
                    key={index}
                  >
                    {policy}
                  </Text>
                ))}
              </div>
            </Layout.Vertical>
          }
        >
          {`+${length - 2}`}
        </Text>
      )}
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
            ? PolicySetType.ACCOUNT
            : policySet.includes('org.')
            ? PolicySetType.ORG
            : PolicySetType.PROJECT
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
                        <Text lineClamp={1} color={Color.BLACK}>
                          {data?.name}
                        </Text>
                        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                          <PoliciesRenderer policies={data?.policies?.map(policy => policy.name)} />
                          <Text font={'small'} width={48}>
                            {accountType}
                          </Text>
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
  const { formikProps, name, error, disabled, stepViewType, ...rest } = props
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
    <FormGroup
      {...rest}
      helperText={helperText}
      intent={intent}
      className={css.formGroup}
      label={getString('common.policiesSets.policyset')}
    >
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
        <PolicySetModal
          isOpen={isOpen}
          setOpen={setOpen}
          policySetList={policySetList}
          setPolicySetList={formatPolicySetList}
          policySets={policySets}
          stepViewType={stepViewType}
        />
      )}
    </FormGroup>
  )
}

export default PolicySetsFormField
