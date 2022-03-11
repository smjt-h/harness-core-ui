/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { CustomHealthSourceLogSpec, TimestampInfo, CustomHealthRequestDefinition } from 'services/cv'

export type SelectedAndMappedQueries = {
  selectedQuery: string
  mappedQueries: Map<string, CustomHealthLogSetupSource>
}

export type UpdateSelectedQueryMap = {
  updatedQueryName: string
  oldQueryName: string
  mappedQuery: SelectedAndMappedQueries['mappedQueries']
  formikProps: FormikProps<CustomHealthLogSetupSource>
}

export interface CustomHealthSourceLogProps {
  data: CustomHealthSourceLogSpec
  onSubmit: () => Promise<void>
}

export type CustomHealthLogSetupSource = {
  queryName: string
  queryValueJsonPath: string
  serviceInstanceJsonPath?: string
  timestampJsonPath: string
  startTime: TimestampInfo
  requestMethod: CustomHealthRequestDefinition['method']
  query?: string
  endTime: TimestampInfo
  pathURL: string
}
