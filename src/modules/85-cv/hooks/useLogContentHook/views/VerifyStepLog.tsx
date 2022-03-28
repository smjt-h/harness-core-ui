/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import { useGetVerifyStepDeploymentActivitySummary, useGetVerifyStepLogs } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { PAGE_SIZE } from './ExecutionLog/ExecutionLog.constants'
import { LogTypes, VerifyStepLogProps } from '../useLogContentHook.types'
import ExecutionLog from './ExecutionLog/ExecutionLog'

const VerifyStepLog: React.FC<VerifyStepLogProps> = ({ isFullScreen, setIsFullScreen, verifyStepExecutionId }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [healthSource, setHealthSource] = React.useState<SelectOption>({ label: getString('all'), value: '' })
  const [errorLogsOnly, setErrorLogsOnly] = React.useState<boolean>(false)
  const [pageNumber, setPageNumber] = React.useState(0)

  const { data: verifyStepDeploymentActivitySummary } = useGetVerifyStepDeploymentActivitySummary({
    queryParams: { accountId },
    verifyStepExecutionId
  })

  /* istanbul ignore next */
  const { serviceName, envName } = verifyStepDeploymentActivitySummary?.resource ?? {}

  const { data, loading, error, refetch } = useGetVerifyStepLogs({
    verifyStepExecutionId,
    queryParams: {
      accountId,
      pageSize: PAGE_SIZE,
      logType: LogTypes.ExecutionLog,
      pageNumber,
      errorLogsOnly,
      ...(healthSource.value ? { healthSources: [healthSource.value as string] } : {})
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  return (
    <ExecutionLog
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      verifyStepExecutionId={verifyStepExecutionId}
      serviceName={serviceName}
      envName={envName}
      resource={data?.resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      healthSource={healthSource}
      setHealthSource={setHealthSource}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
    />
  )
}

export default VerifyStepLog
