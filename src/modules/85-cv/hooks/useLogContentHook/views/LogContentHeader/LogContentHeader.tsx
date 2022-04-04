/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FontVariation, Heading, Layout, Container, Text, Color, Select, Checkbox } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetVerifyStepHealthSources } from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getHealthSourceOptions, getTimeRangeOptions } from '../../useLogContentHook.utils'
import { LogTypes } from '../../useLogContentHook.types'
import type { LogContentHeaderProps } from './LogContentHeader.types'

const LogContentHeader: React.FC<LogContentHeaderProps> = ({
  logType,
  verifyStepExecutionId = '',
  serviceName,
  envName,
  healthSource,
  handleHealthSource,
  timeRange,
  handleTimeRange,
  errorLogsOnly,
  handleDisplayOnlyErrors
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const isVerifyStep = Boolean(verifyStepExecutionId)

  const { data, loading, refetch } = useGetVerifyStepHealthSources({
    verifyStepExecutionId,
    queryParams: {
      accountId
    },
    lazy: true
  })

  React.useEffect(() => {
    if (isVerifyStep) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerifyStep])

  return (
    <div>
      <Heading
        level={2}
        font={{ variation: FontVariation.FORM_TITLE }}
        border={{ bottom: true }}
        padding={{ top: 'xlarge', right: 'xlarge', bottom: 'small', left: 'xlarge' }}
      >
        {logType === LogTypes.ExecutionLog ? getString('cv.executionLogs') : getString('cv.externalAPICalls')}
      </Heading>
      <Layout.Horizontal spacing="medium" padding={{ top: 'medium', right: 'xlarge', bottom: 'large', left: 'xlarge' }}>
        <Container>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
            {getString('connectors.cdng.monitoredService.label')}
          </Text>
          <Layout.Horizontal spacing="small">
            <Text
              color={Color.BLACK}
              font={{ variation: FontVariation.TINY, weight: 'bold' }}
              padding={{ right: 'xsmall' }}
              style={{ maxWidth: '100px' }}
              lineClamp={1}
            >
              {serviceName}
            </Text>
            <Text
              font={{ variation: FontVariation.TINY_SEMI }}
              color={Color.GREY_700}
              style={{ maxWidth: '100px' }}
              lineClamp={1}
            >
              {envName}
            </Text>
          </Layout.Horizontal>
        </Container>
        <Container border={{ left: true }} />
        <Container width={230}>
          {isVerifyStep ? (
            <Select
              value={{
                label: `${getString('pipeline.verification.healthSourceLabel')}: ${healthSource?.label}`,
                value: healthSource?.value ?? ''
              }}
              items={getHealthSourceOptions(getString, data?.resource)}
              onChange={handleHealthSource}
              disabled={loading}
            />
          ) : (
            <Select value={timeRange} items={getTimeRangeOptions(getString)} onChange={handleTimeRange} />
          )}
        </Container>
        <Checkbox
          checked={errorLogsOnly}
          onChange={e => handleDisplayOnlyErrors(e.currentTarget.checked)}
          label={getString('cv.displayOnlyErrors')}
          flex={{ align: 'center-center' }}
        />
      </Layout.Horizontal>
    </div>
  )
}

export default LogContentHeader
