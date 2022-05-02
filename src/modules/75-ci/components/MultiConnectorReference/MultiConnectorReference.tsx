/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeConnectorField,
  MultiTypeConnectorFieldProps
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useGitScope } from '@pipeline/utils/CIUtils'

export const MultiConnectorReference = (props: MultiTypeConnectorFieldProps): React.ReactElement => {
  const {
    label,
    type,
    width,
    name,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    disabled,
    multiTypeProps,
    placeholder
  } = props
  const { getString } = useStrings()
  const gitScope = useGitScope()
  return (
    <>
      <FormMultiTypeConnectorField
        label={label}
        type={type}
        width={width}
        name={name}
        placeholder={placeholder ?? getString('select')}
        accountIdentifier={accountIdentifier}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        multiTypeProps={multiTypeProps}
        gitScope={gitScope}
        disabled={disabled}
        setRefValue
      />
    </>
  )
}
