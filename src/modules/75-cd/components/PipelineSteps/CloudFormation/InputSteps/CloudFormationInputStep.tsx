/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, map } from 'lodash-es'
import cx from 'classnames'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  FormikForm,
  Text,
  Color,
  MultiSelectOption,
  MultiSelectTypeInput,
  SelectOption,
  Label,
  Layout
} from '@harness/uicore'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useListAwsRegions } from 'services/portal'
import { useCFCapabilitiesForAws, useCFStatesForAws, useGetIamRolesForAws } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'
import TemplateFileInputs from './TemplateFile'
import type { CreateStackData, CreateStackProps } from '../CloudFormationInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const isRuntime = (value: string | undefined | SelectOption[]): boolean =>
  getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

function CloudFormationCreateStackInputStepRef<T extends CreateStackData = CreateStackData>(
  props: CreateStackProps<T> & { formik?: FormikContext<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>([])
  const [awsStatuses, setAwsStates] = useState<MultiSelectOption[]>([])
  const [capabilities, setCapabilities] = useState<MultiSelectOption[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = useState<MultiSelectOption[]>([])
  const [selectedStackStatus, setSelectedStackStatus] = useState<MultiSelectOption[]>([])
  const awsRef = inputSetData?.template?.spec?.configuration?.connectorRef

  useEffect(() => {
    if (selectedCapabilities.length > 0) {
      formik?.setFieldValue(
        `${path}.spec.configuration.capabilities`,
        map(selectedCapabilities, cap => cap.value)
      )
    }
  }, [selectedCapabilities])

  useEffect(() => {
    if (selectedStackStatus.length > 0) {
      formik?.setFieldValue(
        `${path}.spec.configuration.skipOnStackStatuses`,
        map(selectedStackStatus, status => status.value)
      )
    }
  }, [selectedStackStatus])

  const capabilitiesRequired = isRuntime(inputSetData?.template?.spec?.configuration?.capabilities as string)
  const { data: capabilitiesData, refetch: getAwsCapabilities } = useCFCapabilitiesForAws({ lazy: true })
  useEffect(() => {
    if (capabilitiesData) {
      const capabilitiesValues = map(capabilitiesData?.data, cap => ({ label: cap, value: cap }))
      setCapabilities(capabilitiesValues as MultiSelectOption[])
    }

    if (!capabilitiesData && capabilitiesRequired) {
      getAwsCapabilities()
    }
  }, [capabilitiesData, capabilitiesRequired])

  const awsStatusRequired = isRuntime(inputSetData?.template?.spec?.configuration?.skipOnStackStatuses as string)
  const { data: awsStatusData, refetch: getAwsStatuses } = useCFStatesForAws({ lazy: true })
  useEffect(() => {
    if (awsStatusData) {
      const awsStatesValues = map(awsStatusData?.data, cap => ({ label: cap, value: cap }))
      setAwsStates(awsStatesValues as MultiSelectOption[])
    }

    if (!awsStatusData && awsStatusRequired) {
      getAwsStatuses()
    }
  }, [awsStatusData, awsStatusRequired])

  const {
    data: regionData,
    loading: regionsLoading,
    refetch: getRegions
  } = useListAwsRegions({
    lazy: true,
    queryParams: {
      accountId
    }
  })
  const regionRequired = isRuntime(inputSetData?.template?.spec?.configuration?.region)
  useEffect(() => {
    if (regionData) {
      const regionValues = map(regionData?.resource, reg => ({ label: reg.name, value: reg.value }))
      setRegions(regionValues as MultiSelectOption[])
    }

    if (!regionData && regionRequired) {
      getRegions()
    }
  }, [regionData, regionRequired])

  const { data: roleData, refetch: getRoles } = useGetIamRolesForAws({
    lazy: true,
    debounce: 500,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      connectorRef: awsRef as string
    }
  })

  const roleRequired = isRuntime(inputSetData?.template?.spec?.configuration?.roleArn)
  useEffect(() => {
    if (roleData) {
      const roleValues = map(roleData?.data, cap => ({ label: cap, value: cap }))
      setAwsRoles(roleValues as MultiSelectOption[])
    }
    if (!roleData && roleRequired && awsRef) {
      getRoles()
    }
  }, [roleData, roleRequired, awsRef])

  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.connectorRef) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
            type={Connectors.AWS}
            name={`${path}.spec.configuration.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            style={{ marginBottom: 10 }}
            multiTypeProps={{ expressions, allowableTypes }}
            disabled={readonly}
            width={300}
            setRefValue
          />
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.region) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name={`${path}.spec.configuration.region`}
            placeholder={getString(regionsLoading ? 'common.loading' : 'pipeline.regionPlaceholder')}
            disabled={readonly}
            useValue
            multiTypeInputProps={{
              selectProps: {
                allowCreatingNewItems: true,
                items: regions ? regions : []
              },
              expressions,
              allowableTypes
            }}
            selectItems={regions ? regions : []}
          />
        </div>
      )}
      <TemplateFileInputs {...props} />
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.stackName) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.stackName`}
            label={getString('cd.cloudFormation.stackName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.roleArn) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormInput.MultiTypeInput
            label={getString('connectors.awsKms.roleArnLabel')}
            name={`${path}.spec.configuration.roleARN`}
            disabled={readonly}
            useValue
            multiTypeInputProps={{
              selectProps: {
                allowCreatingNewItems: false,
                items: awsRoles ? awsRoles : []
              },
              expressions,
              allowableTypes
            }}
            selectItems={awsRoles ? awsRoles : []}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.capabilities) ===
        MultiTypeInputType.RUNTIME && (
        <Layout.Vertical>
          <Label style={{ color: Color.GREY_900 }}>{getString('cd.cloudFormation.specifyCapabilities')}</Label>
          <MultiSelectTypeInput
            name={`${path}.spec.configuration.capabilities`}
            disabled={readonly}
            multiSelectProps={{
              items: capabilities
            }}
            width={500}
            value={selectedCapabilities}
            onChange={values => setSelectedCapabilities(values as MultiSelectOption[])}
          />
        </Layout.Vertical>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.tags?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${path}.spec.configuration.tags.spec.content`}
            label={getString('tagsLabel')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={() => (
              <TFMonaco
                name={`${path}.spec.configuration.tags.spec.content`}
                formik={formik!}
                expressions={expressions}
                title={getString('tagsLabel')}
              />
            )}
          >
            <TFMonaco
              name={`${path}.spec.configuration.tags.spec.content`}
              formik={formik!}
              expressions={expressions}
              title={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.skipOnStackStatuses) ===
        MultiTypeInputType.RUNTIME && (
        <Layout.Vertical>
          <Label style={{ color: Color.GREY_900 }}>{getString('cd.cloudFormation.continueStatus')}</Label>
          <MultiSelectTypeInput
            name={`${path}.spec.configuration.skipOnStackStatuses`}
            disabled={readonly}
            multiSelectProps={{
              items: awsStatuses
            }}
            width={500}
            value={selectedStackStatus}
            onChange={values => setSelectedStackStatus(values as MultiSelectOption[])}
          />
        </Layout.Vertical>
      )}
    </FormikForm>
  )
}

const CloudFormationCreateStackInputStep = connect(CloudFormationCreateStackInputStepRef)
export default CloudFormationCreateStackInputStep
