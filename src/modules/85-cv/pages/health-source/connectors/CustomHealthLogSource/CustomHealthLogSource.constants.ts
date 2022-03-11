/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CustomHealthLogSetupSource } from './CustomHealthLogSource.types'

export const CustomHealthLogFieldNames = {
  QUERY_NAME: 'queryName',
  TIMESTAMP_JSON_PATH: 'timestampJsonPath',
  QUERY_VALUE_JSON_PATH: 'queryValueJsonPath',
  PATH: 'pathURL',
  QUERY: 'query',
  REQUEST_METHOD: 'requestMethod',
  SERVICE_INSTANCE_JSON_PATH: 'serviceInstanceJsonPath'
}

export const DEFAULT_CUSTOM_LOG_SETUP_SOURCE: CustomHealthLogSetupSource = {
  queryName: '',
  requestMethod: 'GET',
  queryValueJsonPath: '',
  serviceInstanceJsonPath: '',
  timestampJsonPath: '',
  startTime: {
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  endTime: {
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  pathURL: ''
}
