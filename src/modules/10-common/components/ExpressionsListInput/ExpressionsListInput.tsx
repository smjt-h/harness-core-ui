/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect, FormikContext } from 'formik'
import { get } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import { ExpressionInput, EXPRESSION_INPUT_PLACEHOLDER } from '@wings-software/uicore'
import { ListInput } from '@common/components/ListInput/ListInput'
import { errorCheck } from '@common/utils/formikHelpers'

import css from './ExpressionsListInput.module.scss'

export interface ExpressionsListInputProps {
  name: string
  value: string[]
  readOnly?: boolean
  expressions?: string[]
  inputClassName?: string
  formik?: FormikContext<any>
}

function ExpressionsListInputInternal(props: ExpressionsListInputProps) {
  const { name, value, readOnly, expressions = [], formik, inputClassName } = props

  return (
    <ListInput
      name={name}
      elementList={value}
      readOnly={readOnly}
      listItemRenderer={(str: string, index: number) => {
        const fieldName = `${name}.${index}`
        const hasError = errorCheck(fieldName, formik)
        return (
          <FormGroup
            helperText={hasError ? get(formik?.errors, fieldName) : null}
            intent={hasError ? Intent.DANGER : Intent.NONE}
            className={css.expressionsInputContainer}
          >
            <ExpressionInput
              name={fieldName}
              value={str}
              disabled={readOnly}
              inputProps={{ className: inputClassName, placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
              items={expressions}
              onChange={val =>
                /* istanbul ignore next */
                formik?.setFieldValue(fieldName, val)
              }
            />
          </FormGroup>
        )
      }}
    />
  )
}

export const ExpressionsListInput = connect(ExpressionsListInputInternal)
