/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import cx from 'classnames'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'
import { useStrings } from 'framework/strings'
import { CustomHealthLogFieldNames } from '../../CustomHealthLogSource.constants'
import type { JsonPathSelectionProps } from './JsonPathSelection.types'
import css from './JsonPathSelection.module.scss'

export default function JsonPathSelection(props: JsonPathSelectionProps): JSX.Element {
  const {
    valueForQueryValueJsonPath,
    valueForTimestampJsonPath,
    valueForServiceInstanceJsonPath,
    sampleRecord,
    disableFields,
    className,
    onChange
  } = props
  const { getString } = useStrings()

  return (
    <Container className={cx(css.main, className)}>
      {disableFields && (
        <Text icon="danger-icon" intent="danger" className={css.errorBanner}>
          {getString('cv.customHealthSource.Querymapping.validation.enableJSONPaths')}
        </Text>
      )}
      <InputWithDynamicModalForJson
        onChange={onChange}
        fieldValue={valueForQueryValueJsonPath || ''}
        isQueryExecuted={!disableFields}
        isDisabled={disableFields}
        sampleRecord={sampleRecord || null}
        inputName={CustomHealthLogFieldNames.QUERY_VALUE_JSON_PATH}
        inputLabel={getString('cv.customHealthSource.Querymapping.queryValueJsonPath')}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
      />
      <InputWithDynamicModalForJson
        onChange={onChange}
        fieldValue={valueForTimestampJsonPath || ''}
        isQueryExecuted={!disableFields}
        isDisabled={disableFields}
        sampleRecord={sampleRecord || null}
        inputName={CustomHealthLogFieldNames.TIMESTAMP_JSON_PATH}
        inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')}
        noRecordInputLabel={'noRecordInputLabel'}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
      />
      <InputWithDynamicModalForJson
        onChange={onChange}
        fieldValue={valueForServiceInstanceJsonPath || ''}
        isQueryExecuted={!disableFields}
        isDisabled={disableFields}
        sampleRecord={sampleRecord || null}
        inputName={CustomHealthLogFieldNames.SERVICE_INSTANCE_JSON_PATH}
        inputLabel={getString('cv.customHealthSource.ServiceInstance.pathLabel')}
        recordsModalHeader={getString('cv.customHealthSource.ServiceInstance.pathModalHeader')}
        noRecordInputLabel={'noRecordInputLabel'}
        showExactJsonPath={true}
      />
    </Container>
  )
}
