/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { NoDataCard } from '@harness/uicore'
import { useStrings } from 'framework/strings'

interface MetricErrorAndLoadingInterface {
  isEmpty: boolean
  loading: boolean
  children?: JSX.Element
}

export default function MetricErrorAndLoading(props: MetricErrorAndLoadingInterface): JSX.Element {
  const { isEmpty, loading, children } = props
  const { getString } = useStrings()
  if (isEmpty) {
    return loading ? (
      <NoDataCard icon="spinner" message={getString('loading')} />
    ) : (
      <NoDataCard message={getString('cv.monitoringSources.gco.noMetricData')} />
    )
  }
  return children ? children : <></>
}
