/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Text,
  Color,
  StepProps,
  FormikForm,
  Formik,
  Container,
  Layout,
  StepWizard,
  FormInput,
  useToaster,
  Select,
  Icon
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { isEqual, pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  useCreatePolicySet,
  useUpdatePolicySet,
  PolicySetWithLinkedPolicies,
  LinkedPolicy,
  useGetPolicySet
} from 'services/pm'
import PolicySelector from './PolicySelector'
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

type CreatePolicySetWizardProps = StepProps<{ refetch: () => void; hideModal: () => void }> & {
  hideModal?: () => void
  refetch: () => void
  prevStepData: any
  policySetData: PolicySetWithLinkedPolicies | any
  queryParams: QueryParams
  stepViewType?: StepViewType
}

const StepOne: React.FC<CreatePolicySetWizardProps> = ({
  nextStep,
  policySetData,
  prevStepData,
  queryParams,
  stepViewType
}) => {
  const _policySetData = { ...policySetData, ...prevStepData }
  const { mutate: createPolicySet } = useCreatePolicySet({ queryParams })
  const { mutate: updatePolicySet } = useUpdatePolicySet({
    policyset: _policySetData?.identifier?.toString(),
    queryParams
  })
  const { showSuccess, showError } = useToaster()

  const onSubmitFirstStep = async (values: any) => {
    values['enabled'] = true

    const _fields = pick(_policySetData, ['action', 'enabled', 'name', 'type', 'identifier'])
    const _clonedValues = pick(values, ['action', 'enabled', 'name', 'type', 'identifier'])

    // console.log(Object.keys(_clonedValues).length, policySetData?.id, _fields, _clonedValues)
    if (!isEqual(_fields, _clonedValues)) {
      if (policySetData?.id || Object.keys(_fields).length === Object.keys(_clonedValues).length) {
        updatePolicySet(values)
          .then(response => {
            showSuccess(`Successfully updated ${values.name} Policy Set`)
            nextStep?.({ ...values, id: response?.identifier })
          })
          .catch(error => showError(getErrorMessage(error)))
      } else {
        createPolicySet(values)
          .then(response => {
            showSuccess(`Successfully created ${values.name} Policy Set`)
            nextStep?.({ ...values, id: response?.identifier })
          })
          .catch(error => {
            showError(getErrorMessage(error))
          })
      }
    } else {
      nextStep?.({ ...values, id: _policySetData.identifier })
    }
  }

  const { getString } = useStrings()

  const entityType = [{ label: 'Pipeline', value: 'pipeline' }]
  const actionType = [
    { label: 'On Run', value: 'onrun' },
    { label: 'On Save', value: 'onsave' },
    { label: 'During Run', value: 'duringrun' }
  ]

  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('overview')}
      </Text>
      <Formik
        enableReinitialize={true}
        onSubmit={values => {
          onSubmitFirstStep(values)
        }}
        formName="CreatePolicySet"
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          type: Yup.string().trim().required(getString('validation.thisIsARequiredField')),
          action: Yup.string().trim().required(getString('validation.thisIsARequiredField'))
        })}
        initialValues={{
          name: _policySetData?.name || '',
          identifier: _policySetData?.identifier || '',
          type: _policySetData?.type || 'pipeline',
          action: _policySetData?.action || '',
          description: _policySetData?.description || ''
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputName: 'name',
                    isIdentifierEditable: true
                  }}
                />
                <FormInput.Select
                  items={entityType}
                  label={'Entity Type that this policy set applies to'}
                  name="type"
                  disabled={false}
                  value={entityType.length === 1 ? entityType[0] : undefined}
                />
                <FormInput.Select
                  items={actionType}
                  label={'On what event should the policy set be evaluated'}
                  name="action"
                  disabled={false}
                  value={actionType.length === 1 ? actionType[0] : undefined}
                />
              </Container>
              <Layout.Vertical>
                <Button type="submit" intent="primary" text={getString('continue')} />
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

const StepTwo: React.FC<{
  hideModal: () => void
  refetch: () => void
  prevStepData: { id: string }
  previousStep?: (data: any) => void
  policySetData: PolicySetWithLinkedPolicies | any
  queryParams: QueryParams
  setHidePolicySelector: (data: boolean) => void
  hidePolicySelector: boolean
}> = ({
  prevStepData,
  hideModal,
  refetch,
  policySetData,
  previousStep,
  queryParams,
  setHidePolicySelector,
  hidePolicySelector
}) => {
  const _policySetData = { ...policySetData, ...prevStepData }
  const { getString } = useStrings()
  const [selectedPolicies, setSelectedPolicies] = useState<LinkedPolicy[]>([])
  const { showSuccess, showError } = useToaster()
  const { mutate: patchPolicy } = useUpdatePolicySet({
    policyset: policySetData?.identifier?.toString() || prevStepData?.id,
    queryParams
  })
  const { data, loading: fetchingPolicySet } = useGetPolicySet({
    queryParams,
    policyset: policySetData?.identifier?.toString() || prevStepData?.id
  })

  const handlePatchRequest = async () => {
    return await patchPolicy({
      ..._policySetData,
      policies: selectedPolicies.map(policy => {
        // Check whether we need identifier prefixes
        if (_policySetData.org_id != '' && _policySetData.project_id == '') {
          // Org level policy set
          if (policy.org_id == '') {
            // Account level policy
            return { identifier: 'acc.' + policy.identifier, severity: policy.severity }
          }
        } else if (_policySetData.org_id != '' && _policySetData.project_id != '') {
          // Policy level policy set
          if (policy.org_id == '') {
            // Account level policy
            return { identifier: 'acc.' + policy.identifier, severity: policy.severity }
          } else if (policy.project_id == '') {
            // Org level policy
            return { identifier: 'org.' + policy.identifier, severity: policy.severity }
          }
        }
        return { identifier: policy.identifier, severity: policy.severity }
      })
    })
  }

  const handleSubmit = () => {
    handlePatchRequest()
      .then(() => {
        showSuccess('Successfully updated linked policies with the policy set')
        refetch()
        hideModal()
      })
      .catch(error => showError(getErrorMessage(error)))
  }

  React.useEffect(() => {
    if (data && data.policies?.length) {
      setSelectedPolicies(data.policies)
    }
  }, [data])

  const onPreviousStep = (): void => {
    previousStep?.({ ...prevStepData })
  }

  const renderPolicySelection = (policy: LinkedPolicy) => {
    return (
      <Layout.Horizontal padding={{ top: 'small' }}>
        <Layout.Vertical
          flex={{ alignItems: 'flex-start' }}
          style={{ width: '180px' }}
          spacing="xsmall"
          padding={{ right: 'small' }}
        >
          <input className={css.input} disabled value={policy.name} />
        </Layout.Vertical>
        <Layout.Vertical flex={{ alignItems: 'flex-start' }} style={{ width: '320px' }} spacing="xsmall">
          <Select
            defaultSelectedItem={{
              label: policy.severity === 'warning' ? 'Warn & continue' : 'Error and exit',
              value: policy.severity as string
            }}
            items={[
              { label: 'Warn & continue', value: 'warning' },
              { label: 'Error and exit', value: 'error' }
            ]}
            inputProps={{
              placeholder: 'Select Severity'
            }}
            onChange={async e => {
              setSelectedPolicies(
                selectedPolicies.map(pol =>
                  pol.identifier === policy.identifier ? ({ ...policy, severity: e.value } as LinkedPolicy) : pol
                )
              )
            }}
          />
        </Layout.Vertical>
        <Layout.Vertical flex={{ justifyContent: 'flex-end' }} spacing="medium">
          <Icon
            padding={{ top: 'small', bottom: 'small' }}
            name="main-trash"
            size={20}
            style={{ cursor: 'pointer' }}
            onClick={async () => {
              setSelectedPolicies(selectedPolicies.filter(_policy => _policy.identifier !== policy.identifier))
            }}
          />
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  return (
    <>
      {hidePolicySelector ? (
        <Container padding="small" height={500}>
          <Text margin={{ bottom: 'xsmall' }} font={{ size: 'medium' }} color={Color.BLACK}>
            {getString('common.policiesSets.evaluationCriteria')}
          </Text>
          <Text font={{ size: 'small' }} color={Color.BLACK} style={{ cursor: 'pointer' }}>
            Applies to Pipeline on the following events
          </Text>
          <Formik
            formLoading={fetchingPolicySet || undefined}
            enableReinitialize={true}
            onSubmit={handleSubmit}
            formName="patchPolicy"
            initialValues={{
              attachedPolicies: selectedPolicies
            }}
          >
            {() => {
              return (
                <FormikForm>
                  <Container className={css.policyAssignment} height={'400px'} margin={{ top: 'huge' }}>
                    <Layout.Horizontal>
                      <Layout.Vertical
                        flex={{ alignItems: 'flex-start' }}
                        style={{ width: '180px' }}
                        spacing="xsmall"
                        padding={{ right: 'small' }}
                      >
                        <Text font={{ size: 'small' }} color={Color.BLACK}>
                          Policy to Evaluate
                        </Text>
                      </Layout.Vertical>
                      <Layout.Vertical flex={{ alignItems: 'flex-start' }} style={{ width: '320px' }} spacing="xsmall">
                        <Text font={{ size: 'small' }} color={Color.BLACK}>
                          What should happen if a policy fails?
                        </Text>
                      </Layout.Vertical>
                    </Layout.Horizontal>
                    {selectedPolicies?.map((policy: LinkedPolicy) => renderPolicySelection(policy))}
                    <Layout.Horizontal padding={{ top: 'medium' }}>
                      <Text
                        font={{ size: 'small' }}
                        color={Color.PRIMARY_7}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setHidePolicySelector(false)}
                      >
                        + Add Policy
                      </Text>
                    </Layout.Horizontal>
                    <Layout.Horizontal spacing="medium" style={{ marginTop: 'auto' }}>
                      <Button type="button" text={getString('back')} onClick={onPreviousStep} />
                      <Button type="submit" intent="primary" text={getString('finish')} />
                    </Layout.Horizontal>
                  </Container>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      ) : (
        <PolicySelector
          setHidePolicySelector={setHidePolicySelector}
          queryParams={queryParams}
          prevStepData={prevStepData}
          setSelectedPolicies={setSelectedPolicies}
          selectedPolicies={selectedPolicies}
          policySetData={data as PolicySetWithLinkedPolicies}
        />
      )}
    </>
  )
}

const CreatePolicySetWizard: React.FC<any> = props => {
  //   const { isEdit } = prop
  const { getString } = useStrings()
  const [hidePolicySelector, setHidePolicySelector] = useState(true)

  return (
    <StepWizard
      iconProps={{ size: 37 }}
      title={getString('common.policiesSets.policyset')}
      isNavMode={hidePolicySelector}
      className={cx({ [css.useNav]: !hidePolicySelector })}
    >
      <StepOne name={getString('overview')} {...props} />
      <StepTwo
        name={getString('common.policiesSets.evaluationCriteria')}
        {...props}
        hidePolicySelector={hidePolicySelector}
        setHidePolicySelector={setHidePolicySelector}
      />
    </StepWizard>
  )
}

export default CreatePolicySetWizard
