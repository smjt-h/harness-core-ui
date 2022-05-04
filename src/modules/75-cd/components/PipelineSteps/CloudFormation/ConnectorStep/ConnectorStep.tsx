/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, StepWizard } from '@harness/uicore'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors } from '@connectors/constants'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { ConnectorMap, getBuildPayload, ConnectorTypes, GetNewConnector } from '../CloudFormationHelper'

import ConnectorStepOne from './ConnectorStepOne'
import css from '../CloudFormation.module.scss'

const DIALOG_PROPS = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

const AWSConnectorStep = ({ readonly, allowableTypes, showModal, setShowModal }: any) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showNewConnector, setShowNewConnector] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState('')
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      setShowModal(false)
    }
  }
  const close = () => {
    setShowNewConnector(false)
    setShowModal(false)
  }
  const newConnector = () => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(connectorType as ConnectorTypes)
    return (
      <StepWizard icon="service-aws" iconProps={{ size: 37 }} title={getString('connectors.title.aws')}>
        <ConnectorDetailsStep
          type={Connectors.AWS}
          name={getString('overview')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {GetNewConnector(
          connectorType,
          isEditMode,
          setIsEditMode,
          accountId,
          projectIdentifier,
          orgIdentifier,
          getString('credentials')
        )}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={true}
          type={Connectors.AWS}
        />
      </StepWizard>
    )
  }

  return (
    <Dialog
      {...(DIALOG_PROPS as IDialogProps)}
      isOpen={showModal}
      isCloseButtonShown
      onClose={close}
      className={cx(css.modal, Classes.DIALOG)}
    >
      <div className={css.createTfWizard}>
        <StepWizard
          title={getString('pipelineSteps.awsConnectorLabel')}
          className={css.configWizard}
          onStepChange={onStepChange}
          icon="service-cloudformation"
          iconProps={{
            size: 50
          }}
        >
          <ConnectorStepOne
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            name={getString('pipelineSteps.awsConnectorLabel')}
            setShowNewConnector={setShowNewConnector}
            showNewConnector={showNewConnector}
            selectedConnector={selectedConnector}
            setSelectedConnector={setSelectedConnector}
          />
          {showNewConnector ? newConnector() : null}
        </StepWizard>
      </div>
      <Button
        variation={ButtonVariation.ICON}
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={close}
        className={css.crossIcon}
      />
    </Dialog>
  )
}

export default AWSConnectorStep
