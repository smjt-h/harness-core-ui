/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { ExpressionInput, EXPRESSION_INPUT_PLACEHOLDER } from '@wings-software/uicore'
import { ListInput } from '@common/components/ListInput/ListInput'

import css from './ExpressionsListInput.module.scss'

export interface ExpressionsListInputProps {
  name: string
  value: string[]
  readOnly?: boolean
  expressions?: string[]
  formikProps?: FormikProps<any>
  inputClassName?: string
}

export function ExpressionsListInput(props: ExpressionsListInputProps) {
  const { name, value, readOnly, expressions = [], formikProps, inputClassName } = props

  return (
    <ListInput
      name={name}
      elementList={value}
      readOnly={readOnly}
      listItemRenderer={(str: string, index: number) => (
        <ExpressionInput
          name={`${name}.${index}`}
          value={str}
          disabled={readOnly}
          inputProps={{ className: inputClassName, placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
          items={expressions}
          onChange={val => formikProps?.setFieldValue(`${name}.${index}`, val)}
          popoverProps={{
            className: css.expressionsInput
          }}
        />
      )}
    />
  )
}
