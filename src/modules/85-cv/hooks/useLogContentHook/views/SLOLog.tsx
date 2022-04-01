/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import { useGetServiceLevelObjectiveLogs } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { PAGE_SIZE } from './ExecutionLog/ExecutionLog.constants'
import { LogTypes, TimeRangeTypes, SLOLogProps } from '../useLogContentHook.types'
import ExecutionLog from './ExecutionLog/ExecutionLog'
import { getTimeRangeInMilliseconds, getTimeRangeOptions } from '../useLogContentHook.utils'

const SLOLog: React.FC<SLOLogProps> = ({ identifier, serviceName, envName, isFullScreen, setIsFullScreen }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [errorLogsOnly, setErrorLogsOnly] = React.useState<boolean>(false)
  const [pageNumber, setPageNumber] = React.useState(0)
  const [timeRange, setTimeRange] = React.useState<SelectOption>(getTimeRangeOptions(getString)[0])
  const [startTime, endTime] = getTimeRangeInMilliseconds(timeRange.value as TimeRangeTypes)

  const { data, loading, error, refetch } = useGetServiceLevelObjectiveLogs({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      logType: LogTypes.ExecutionLog,
      errorLogsOnly,
      pageNumber,
      startTime,
      endTime,
      pageSize: PAGE_SIZE
    }
  })

  /* istanbul ignore next */
  const resource = data?.resource

  return (
    <ExecutionLog
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      serviceName={serviceName}
      envName={envName}
      resource={resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
    />
  )
}

export default SLOLog
