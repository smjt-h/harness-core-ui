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
  const [isTesting, setIsTesting] = useState(true)

  const steps: string[] = useMemo(() => [getString('connectors.pdc.testConnection.step1')], [])

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

  const verifyTestConnection = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()
      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
        setCurrentStep(2)
      } else {
        setCurrentStatus(Status.ERROR)
        setCurrentIntent(Intent.DANGER)
        modalErrorHandler?.showDanger(result.data?.errors)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    verifyTestConnection()
  }, [])

  return (
    <Layout.Vertical spacing="medium" height="100%">
      <Layout.Vertical spacing="medium" className={css.testConnectionContentContainer}>
        <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'pdcTextConnection' }}>
          {getString('common.smtp.testConnection')}
        </Text>
        <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
        <ModalErrorHandler bind={setModalErrorHandler} style={{ marginTop: 'var(--spacing-large)' }} />
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
