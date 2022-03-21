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
import type { ServiceNowFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setAllowedValuesOptions } from '../ServiceNowCreate/helper'
import type { ServiceNowFieldNGWithValue } from './types'
import css from './ServiceNowCreate.module.scss'

export interface ServiceNowFieldsRendererProps {
  selectedFields?: ServiceNowFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: ServiceNowFieldNG) => void
  serviceNowContextType?: string
}

interface MappedComponentInterface {
  selectedField: ServiceNowFieldNG
  props: ServiceNowFieldsRendererProps
  expressions: string[]
  index: number
  serviceNowContextType?: string
}

function GetMappedFieldComponent({
  selectedField,
  props,
  expressions,
  index,
  serviceNowContextType
}: MappedComponentInterface) {
  const showTextField = useCallback(() => {
    if (
      selectedField.schema.type === 'string' ||
      selectedField.schema.type === 'glide_date_time' ||
      selectedField.schema.type === 'integer'
    ) {
      return true
    }
    if (isEmpty(selectedField.allowedValues) && selectedField.schema.array) {
      return true
    }
    return false
  }, [selectedField])

  const showMultiSelectField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema.array
  }, [selectedField])

  const showMultiTypeField = useCallback(() => {
    return selectedField.allowedValues
  }, [selectedField])

  if (showTextField()) {
    return (
      <>
        {serviceNowContextType === 'ServiceNowCreateDeploymentMode' ? (
          <FormInput.MultiTextInput
            label={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            className={css.deploymentViewMedium}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions
            }}
          />
        ) : (
          <FormInput.MultiTextInput
            label={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            className={css.md}
            multiTextInputProps={{
              expressions
            }}
          />
        )}
      </>
    )
  } else if (showMultiSelectField()) {
    return (
      <>
        {serviceNowContextType === 'ServiceNowCreateDeploymentMode' ? (
          <FormInput.MultiSelectTypeInput
            selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
            label={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            className={css.deploymentViewMedium}
            multiSelectTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions
            }}
          />
        ) : (
          <FormInput.MultiSelectTypeInput
            selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
            label={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            className={cx(css.multiSelect, css.md)}
            multiSelectTypeInputProps={{
              expressions
            }}
          />
        )}
      </>
    )
  } else if (showMultiTypeField()) {
    return (
      <>
        {serviceNowContextType === 'ServiceNowCreateDeploymentMode' ? (
          <FormInput.MultiTypeInput
            selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
            label={selectedField.name}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            className={css.deploymentViewMedium}
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions
            }}
          />
        ) : (
          <FormInput.MultiTypeInput
            selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
            label={selectedField.name}
            name={`spec.selectedFields[${index}].value`}
            placeholder={selectedField.name}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            className={cx(css.multiSelect, css.md)}
            multiTypeInputProps={{
              expressions
            }}
          />
        )}
      </>
    )
  }
  return null
}

export function ServiceNowFieldsRenderer(props: ServiceNowFieldsRendererProps) {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, onDelete, serviceNowContextType } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: ServiceNowFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          <GetMappedFieldComponent
            selectedField={selectedField}
            props={props}
            expressions={expressions}
            index={index}
            serviceNowContextType={serviceNowContextType}
          />
          {serviceNowContextType !== 'ServiceNowCreateDeploymentMode' ? (
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
