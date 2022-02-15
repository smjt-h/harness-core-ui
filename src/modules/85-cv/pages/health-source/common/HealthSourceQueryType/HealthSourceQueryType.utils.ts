/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { QueryType } from './HealthSourceQueryType.types'

export function generateQueryTypeRadioButtonOptions(
  getString: UseStringsReturn['getString']
): Array<{ label: string; value: string }> {
  return [
    {
      label: getString('cv.queryTypeService'),
      value: QueryType.SERVICE_BASED
    },
    {
      label: getString('cv.queryTypeHost'),
      value: QueryType.HOST_BASED
    }
  ]
}
