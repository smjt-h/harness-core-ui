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
  MultiSelectOption
} from '@harness/uicore'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useListAwsRegions } from 'services/portal'
import { useGetIamRolesForAws } from 'services/cd-ng'
import type { DeleteStackData, DeleteStackProps } from '../CloudFormationInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const isRuntime = (value: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

export function CloudFormationDeleteStackInputStepRef<T extends DeleteStackData = DeleteStackData>(
  props: DeleteStackProps<T> & { formik?: FormikContext<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>([])
  const [awsRef, setAwsRef] = useState<string>(
    inputSetData?.template?.spec?.configuration?.spec?.connectorRef as string
  )

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
  const regionRequired = isRuntime(inputSetData?.template?.spec?.configuration?.spec?.region as string)
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
      awsConnectorRef: awsRef
    }
  })

  const roleRequired = isRuntime(inputSetData?.template?.spec?.configuration?.spec?.roleArn as string)
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
      {isRuntime(inputSetData?.template?.timeout as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
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
      {isRuntime(inputSetData?.template?.spec?.configuration?.spec?.provisionerIdentifier as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {isRuntime(inputSetData?.template?.spec?.configuration?.spec?.connectorRef as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
            type={Connectors.AWS}
            name={`${path}.spec.configuration.spec.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            style={{ marginBottom: 10 }}
            multiTypeProps={{ expressions, allowableTypes }}
            disabled={readonly}
            width={300}
            onChange={(value: any, _unused, _notUsed) => {
              setAwsRef(value?.record?.identifier)
              formik?.setFieldValue(`${path}.spec.configuration.spec.connectorRef`, value?.record?.identifier)
            }}
            setRefValue
          />
        </div>
      )}
      {isRuntime(inputSetData?.template?.spec?.configuration?.spec?.region as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name={`${path}.spec.configuration.spec.region`}
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
      {isRuntime(inputSetData?.template?.spec?.configuration?.spec?.roleArn as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            label={getString('connectors.awsKms.roleArnLabel')}
            name={`${path}.spec.configuration.spec.roleArn`}
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
      {isRuntime(inputSetData?.template?.spec?.configuration?.spec?.stackName as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.spec.stackName`}
            label={getString('cd.cloudFormation.stackName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
    </FormikForm>
  )
}

const CloudFormationDeleteStackInputStep = connect(CloudFormationDeleteStackInputStepRef)
export default CloudFormationDeleteStackInputStep
