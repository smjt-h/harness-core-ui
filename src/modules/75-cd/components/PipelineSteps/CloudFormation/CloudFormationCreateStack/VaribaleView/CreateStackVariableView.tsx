/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { CreateStackVariableStepProps, CreateStackData } from '../../CloudFormationInterfaces'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './CreateStackVariableView.module.scss'

export function CreateStackVariableStep({
  variablesData = {} as CreateStackData,
  metadataMap,
  initialValues
}: CreateStackVariableStepProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={variablesData.spec?.provisionerIdentifier}
        originalData={initialValues.spec?.provisionerIdentifier}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <VariablesListTable
        data={variablesData.spec?.configuration?.connectorRef}
        originalData={initialValues.spec?.configuration?.connectorRef}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <VariablesListTable
        data={variablesData.spec?.configuration?.region}
        originalData={initialValues.spec?.configuration?.region}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <Text className={css.title}>{getString('cd.cloudFormation.templateFile')}</Text>
      <VariablesListTable
        data={
          variablesData.spec?.configuration?.templateFile?.spec?.store?.spec ||
          variablesData.spec?.configuration?.templateFile?.spec
        }
        originalData={
          initialValues.spec?.configuration?.templateFile?.spec?.store?.spec ||
          initialValues.spec?.configuration?.templateFile?.spec
        }
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {variablesData.spec?.configuration?.parameters && (
        <Text className={css.title}>{getString('cd.cloudFormation.parameterFileDetails')}</Text>
      )}
      {((variablesData.spec?.configuration?.parameters as []) || [])?.map((envVar, index) => (
        <VariablesListTable
          key={envVar}
          data={variablesData.spec?.configuration?.parameters?.[index]?.store?.spec}
          originalData={initialValues.spec?.configuration?.parameters?.[index]?.store?.spec}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
      ))}
      {variablesData.spec?.configuration?.parameterOverrides && (
        <Text className={css.title}>{getString('cd.cloudFormation.inlineParameterFiles')}</Text>
      )}
      {((variablesData.spec?.configuration?.parameterOverrides as []) || [])?.map((envVar, index) => (
        <VariablesListTable
          key={envVar}
          data={variablesData.spec?.configuration?.parameterOverrides?.[index]}
          originalData={initialValues.spec?.configuration?.parameterOverrides?.[index]}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
      ))}
      {variablesData.spec?.configuration?.tags && (
        <>
          <Text className={css.title}>{getString('tagsLabel')}</Text>
          <VariablesListTable
            data={variablesData.spec?.configuration?.tags?.spec}
            originalData={initialValues.spec?.configuration?.tags?.spec}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL3}
          />
        </>
      )}
    </>
  )
}
