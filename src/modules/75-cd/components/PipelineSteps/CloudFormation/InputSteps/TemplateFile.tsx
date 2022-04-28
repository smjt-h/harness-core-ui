/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { FormikContext } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Text, Color, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TFMonaco } from '../../Common/Terraform/Editview/TFMonacoEditor'
import { ConnectorMap } from '../CloudFormationHelper'
import type { CreateStackData, CreateStackProps } from '../CloudFormationInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TemplateFileInputs<T extends CreateStackData = CreateStackData>(
  props: CreateStackProps<T> & { formik?: FormikContext<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  console.log('inputSetData: ', inputSetData);
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isAccount, setIsAccount] = useState<boolean>(false)
  return (
    <>
      <Container flex width={120} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('cd.cloudFormation.templateFile')}</Text>
      </Container>
      {inputSetData?.template?.spec?.configuration?.templateFile?.type === 'Remote' &&
        getMultiTypeFromValue(
          inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
        ) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeConnectorField
              label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
              type={ConnectorMap[inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.type]}
              name={`${path}.spec.configuration.templateFile.spec.store.spec.connectorRef`}
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              style={{ marginBottom: 10 }}
              multiTypeProps={{ expressions, allowableTypes }}
              disabled={readonly}
              onChange={(value: any, _unused, _notUsed) => {
                setIsAccount(value?.record?.spec?.type === 'Account')
                formik?.setFieldValue(
                  `${path}.spec.configuration.templateFile.spec.store.spec.connectorRef`,
                  value?.record?.identifier
                )
              }}
              setRefValue
            />
          </div>
        )}
      {/*
        *
        If a connector type of account is chosen 
        we need to get the repo name to access the files
        *
        */}
      {inputSetData?.template?.spec?.configuration?.templateFile?.type === 'Remote' &&
        (isAccount ||
          getMultiTypeFromValue(
            inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.spec?.repoName
          ) === MultiTypeInputType.RUNTIME) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.templateFile.spec.store.spec.repoName`}
              label={getString('pipelineSteps.repoName')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      {inputSetData?.template?.spec?.configuration?.templateFile?.type === 'Remote' &&
        getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.spec?.branch) ===
          MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.templateFile.spec.store.spec.branch`}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      {inputSetData?.template?.spec?.configuration?.templateFile?.type === 'Remote' &&
        getMultiTypeFromValue(
          inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.spec?.commitId
        ) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.templateFile.spec.store.spec.commitId`}
              label={getString('pipeline.manifestType.commitId')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      {inputSetData?.template?.spec?.configuration?.templateFile?.type === 'Remote' &&
        getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.templateFile?.spec?.store?.spec?.paths) ===
          MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.templateFile.spec.store.spec.paths[0]`}
              label={getString('common.git.filePath')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      {getMultiTypeFromValue((inputSetData?.template as CreateStackData)?.spec?.configuration?.templateFile?.spec?.templateBody) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${path}.spec.configuration.templateFile.spec.templateBody`}
            label={getString('tagsLabel')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={() => (
              <TFMonaco
                name={`${path}.spec.configuration.templateFile.spec.templateBody`}
                formik={formik!}
                expressions={expressions}
                title={getString('tagsLabel')}
              />
            )}
          >
            <TFMonaco
              name={`${path}.spec.configuration.templateFile.spec.templateBody`}
              formik={formik!}
              expressions={expressions}
              title={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </>
  )
}
