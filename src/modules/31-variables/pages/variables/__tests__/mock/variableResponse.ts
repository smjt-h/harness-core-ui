/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const VariableSuccessResponseWithData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10,
    content: [
      {
        variable: {
          identifier: 'CUSTOM_VARIABLE',
          name: 'CUSTOM_VARIABLE',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          type: 'String',
          spec: { valueType: 'FIXED', fixedValue: 'CUSTOM', defaultValue: '', allowedValues: [], regex: null }
        },
        createdAt: 1651340335268,
        lastModifiedAt: 1651340335268
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const VariableSuccessResponseWithNoData = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 10, content: [], pageIndex: 0, empty: true },
  metaData: null,
  correlationId: 'correlationId'
}

export const VariableSuccessResponseWithError = {
  status: 'ERROR',
  code: 'INVALID_REQUEST',
  message: 'Invalid request: Failed to connect',
  correlationId: '6cff39eb-81df-4c68-a2b8-d1d6986f93cb',
  detailedMessage: null,
  responseMessages: [
    {
      code: 'INVALID_REQUEST',
      level: 'ERROR',
      message: 'Invalid request: Failed to connect',
      exception: null,
      failureTypes: []
    }
  ],
  metadata: null
}
