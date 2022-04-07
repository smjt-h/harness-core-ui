/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Renderer, CellProps } from 'react-table'
import {
  Layout,
  Table,
  Button,
  Text,
  ButtonVariation,
  StepProps,
  StepsProgress,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { Color, Intent, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetTestConnectionResult, useValidateSshHosts, HostValidationDTO } from 'services/cd-ng'
import { useGetDelegatesStatus } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../CreatePdcConnector.module.scss'

const hostStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}
interface TestConnectionProps {
  name: string
  isStep: boolean
  isLastStep: boolean
  type: string
  previousStep: () => void
  stepIndex: number
  identifier: string
  sshKeyRef: string
  hosts: string
}

interface WizardProps {
  onClose: () => void
}

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

const TestConnection: React.FC<StepProps<TestConnectionProps> & WizardProps> = props => {
  const { getString } = useStrings()

  const { prevStepData } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [validationHostData, setValidationHostData] = useState([] as HostValidationDTO[])
  const [hostErrors, setHostErrors] = useState([] as string[])
  const [isTesting, setIsTesting] = useState(true)

  const steps: string[] = useMemo(
    () =>
      prevStepData?.hosts
        ? [getString('connectors.pdc.testConnection.step1'), getString('connectors.pdc.testConnection.step2')]
        : [getString('connectors.pdc.testConnection.step1')],
    [prevStepData?.hosts]
  )

  const { data: delegateStatus } = useGetDelegatesStatus({
    queryParams: { accountId },
    lazy: false
  })

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { mutate: validateSshHosts } = useValidateSshHosts({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      identifier: prevStepData?.sshKeyRef || ''
    }
  })

  useEffect(() => {
    if ((delegateStatus?.resource?.delegates?.length || 0) > 0) {
      setCurrentIntent(Intent.SUCCESS)
      setCurrentStatus(Status.DONE)
      setCurrentStep(2)
      setCurrentStatus(Status.PROCESS)
      verifyTestConnection()
    } else {
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }, [delegateStatus])

  const verifyTestConnection = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()
      const { validationFailedHosts, validationPassedHosts } = result.data as any
      const validationPassed = validationPassedHosts.map((host: string) => ({
        host: host,
        status: hostStatus.SUCCESS
      }))
      const validationFailed = validationFailedHosts.map((host: string) => ({
        host: host,
        status: hostStatus.FAILED
      }))
      setValidationHostData(validationPassed.concat(validationFailed))
      setHostErrors(result?.data?.errors?.map?.(error => error.reason || '') || [])
      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
      } else {
        throw new Error('connectors.ceAws.testConnection.error')
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    } finally {
      setIsTesting(false)
    }
  }

  const testHost = async (host: string) => {
    const testHostResponse = await validateSshHosts([host])
    const newData = [...validationHostData]
    newData.map(hostItem => {
      if (hostItem.host === host[0]) {
        return testHostResponse.data
      }
      return host
    })
    setValidationHostData(newData)
  }

  const noColumnRenderer: Renderer<CellProps<HostValidationDTO>> = useMemo(
    () => data => <span>{data.row.index + 1}</span>,
    []
  )
  const hostColumnRenderer: Renderer<CellProps<HostValidationDTO>> = useMemo(
    () => data => <span>{data.row.original?.host || ''}</span>,
    []
  )
  const statusColumnRenderer: Renderer<CellProps<HostValidationDTO>> = useMemo(
    () => data =>
      (
        <Text color={data.row.original.status === hostStatus.SUCCESS ? Color.GREEN_900 : Color.RED_900}>
          {data.row.original.status === hostStatus.SUCCESS ? getString('success') : getString('failed')}
        </Text>
      ),
    []
  )
  const menuColumnRenderer: Renderer<CellProps<HostValidationDTO>> = useMemo(
    () => data =>
      data.row.original.status === hostStatus.SUCCESS ? (
        <span />
      ) : (
        <Button variation={ButtonVariation.SECONDARY} onClick={() => testHost(data.row.original.host || '')}>
          {getString('retry')}
        </Button>
      ),
    []
  )

  return (
    <Layout.Vertical spacing="medium" height="100%">
      <Layout.Vertical spacing="medium" className={css.testConnectionContentContainer}>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'pdcTextConnection' }}>
          {getString('common.smtp.testConnection')}
        </Text>
        <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
        {hostErrors.map(error => (
          <Text key={error} color={Color.RED_900}>
            {error}
          </Text>
        ))}
        {validationHostData.length > 0 && (
          <Table<HostValidationDTO>
            className={css.hostTable}
            data={validationHostData}
            bpTableProps={{ bordered: true, condensed: true, striped: false }}
            columns={[
              {
                Header: 'NO.',
                width: '10%',
                Cell: noColumnRenderer
              },
              {
                accessor: 'host',
                Header: 'HOST',
                width: '30%',
                Cell: hostColumnRenderer,
                disableSortBy: true
              },
              {
                accessor: 'status',
                Header: 'STATUS',
                width: '30%',
                Cell: statusColumnRenderer,
                disableSortBy: true
              },
              {
                Header: '',
                id: 'menu',
                width: '30%',
                Cell: menuColumnRenderer
              }
            ]}
          />
        )}
      </Layout.Vertical>
      <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
        <Button
          text={getString('back')}
          icon="chevron-left"
          variation={ButtonVariation.SECONDARY}
          onClick={() => props?.previousStep?.(props?.prevStepData)}
          data-name="pdcBackButton"
        />
        <Button
          type="submit"
          disabled={isTesting}
          onClick={props.onClose}
          variation={ButtonVariation.PRIMARY}
          text={getString('finish')}
          rightIcon="chevron-right"
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default TestConnection
