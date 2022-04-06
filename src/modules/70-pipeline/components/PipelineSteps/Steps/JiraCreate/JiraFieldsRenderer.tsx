/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { Button, FormInput, Layout, MultiTypeInputType } from '@wings-software/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { JiraFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setAllowedValuesOptions } from '../JiraApproval/helper'
import type { JiraFieldNGWithValue } from './types'
import css from './JiraCreate.module.scss'

export interface JiraFieldsRendererProps {
  fieldPrefix?: string
  jiraContextType?: string
  selectedFields?: JiraFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: JiraFieldNG) => void
}

interface MappedComponentInterface {
  selectedField: JiraFieldNG
  props: JiraFieldsRendererProps
  expressions: string[]
  index: number
  jiraContextType?: string
}

function GetMappedFieldComponent({
  selectedField,
  props,
  expressions,
  index,
  jiraContextType
}: MappedComponentInterface) {
  const multiTypeInputTypeforFields =
    jiraContextType === 'JiraCreateDeploymentMode'
      ? {
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
          expressions
        }
      : {
          expressions
        }
  const className =
    jiraContextType === 'JiraCreateDeploymentMode' ? css.deploymentViewMedium : cx(css.multiSelect, css.md)

  const showTextField = useCallback(() => {
    if (
      selectedField.schema.type === 'string' ||
      selectedField.schema.type === 'date' ||
      selectedField.schema.type === 'datetime' ||
      selectedField.schema.type === 'number'
    ) {
      return true
    }
    if (isEmpty(selectedField.allowedValues) && selectedField.schema.type === 'option' && selectedField.schema.array) {
      return true
    }
    return false
  }, [selectedField])

  const showMultiSelectField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema.type === 'option' && selectedField.schema.array
  }, [selectedField])

  const showMultiTypeField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema.type === 'option'
  }, [selectedField])

  const formikFieldPath =
    jiraContextType === 'JiraCreateDeploymentMode'
      ? `${props.fieldPrefix}spec.fields[${index}].value`
      : `spec.selectedFields[${index}].value`

  if (showTextField()) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={formikFieldPath}
        placeholder={selectedField.name}
        className={css.md}
        multiTextInputProps={{
          expressions
        }}
      />
    )
  } else if (showMultiSelectField()) {
    return (
      <FormInput.MultiSelectTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={formikFieldPath}
        placeholder={selectedField.name}
        className={className}
        multiSelectTypeInputProps={multiTypeInputTypeforFields}
        useValue={jiraContextType === 'JiraCreateDeploymentMode' ? true : false}
      />
    )
  } else if (showMultiTypeField()) {
    return (
      <FormInput.MultiTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={className}
        multiTypeInputProps={multiTypeInputTypeforFields}
        useValue={jiraContextType === 'JiraCreateDeploymentMode' ? true : false}
      />
    )
  }
  return null
}

export function JiraFieldsRenderer(props: JiraFieldsRendererProps) {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, onDelete, jiraContextType } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: JiraFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          <GetMappedFieldComponent
            selectedField={selectedField}
            props={props}
            expressions={expressions}
            index={index}
            jiraContextType={jiraContextType}
          />
          {jiraContextType !== 'JiraCreateDeploymentMode' ? (
            <Button
              minimal
              icon="trash"
              disabled={isApprovalStepFieldDisabled(readonly)}
              data-testid={`remove-selectedField-${index}`}
              onClick={() => onDelete?.(index, selectedField)}
            />
          ) : null}
        </Layout.Horizontal>
      ))}
    </>
  ) : null
}
