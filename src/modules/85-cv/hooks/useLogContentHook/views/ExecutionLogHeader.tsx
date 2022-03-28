/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FontVariation, Heading, Layout, Container, Text, Color, Select, Checkbox, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetVerifyStepHealthSources } from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getHealthSourceOptions, getTimeRangeOptions } from '../useLogContentHook.utils'
import type { ExecutionLogHeaderProps } from '../useLogContentHook.types'
import css from '../useLogContentHook.module.scss'

const ExecutionLogHeader: React.FC<ExecutionLogHeaderProps> = ({
  verifyStepExecutionId = '',
  serviceName,
  envName,
  healthSource,
  setHealthSource,
  timeRange,
  setTimeRange,
  errorLogsOnly,
  setErrorLogsOnly,
  actions,
  setPageNumber
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

  const handleHealthSource = (_healthSource: SelectOption): void => {
    if (_healthSource.value !== healthSource?.value) {
      actions.resetExecutionLogs()
      setPageNumber(0)
      setHealthSource?.(_healthSource)
    }
  }

  const handleDisplayOnlyErrors = (e: React.FormEvent<HTMLInputElement>): void => {
    actions.resetExecutionLogs()
    setPageNumber(0)
    setErrorLogsOnly(e.currentTarget.checked)
  }

  const handleTimeRange = (_timeRange: SelectOption): void => {
    actions.resetExecutionLogs()
    setPageNumber(0)
    setTimeRange?.(_timeRange)
  }

  return (
    <div>
      <Heading
        level={2}
        font={{ variation: FontVariation.FORM_TITLE }}
        border={{ bottom: true }}
        padding={{ top: 'xlarge', right: 'xlarge', bottom: 'small', left: 'xlarge' }}
      >
        {getString('cv.executionLogs')}
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
        {isVerifyStep ? (
          <Select
            value={{
              label: `${getString('pipeline.verification.healthSourceLabel')}: ${healthSource?.label}`,
              value: healthSource?.value ?? ''
            }}
            items={getHealthSourceOptions(getString, data?.resource)}
            onChange={handleHealthSource}
            disabled={loading}
            className={css.select}
          />
        ) : (
          <Select
            value={timeRange}
            items={getTimeRangeOptions(getString)}
            onChange={handleTimeRange}
            className={css.select}
          />
        )}
        <Checkbox
          checked={errorLogsOnly}
          onChange={handleDisplayOnlyErrors}
          label={getString('cv.displayOnlyErrors')}
          flex={{ align: 'center-center' }}
        />
      </Layout.Horizontal>
    </div>
  )
}

export default ExecutionLogHeader
