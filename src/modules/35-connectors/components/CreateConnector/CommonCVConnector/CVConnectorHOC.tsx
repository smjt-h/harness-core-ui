import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import type { CreateConnectorModalProps } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep, { DelegateSelectorProps } from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { dsconfigTypeToConnectorDetailsTitle } from './utils'
import type { ConnectionConfigProps } from './constants'

export interface CVConnectorHOCInput {
  connectorType: ConnectorInfoDTO['type']
  ConnectorCredentialsStep: (props: ConnectionConfigProps) => JSX.Element
  buildSubmissionPayload: DelegateSelectorProps['buildPayload']
}

export function cvConnectorHOC(hocInput: CVConnectorHOCInput): (props: CreateConnectorModalProps) => JSX.Element {
  const { ConnectorCredentialsStep, buildSubmissionPayload, connectorType } = hocInput
  const ConnectorComponent = (props: CreateConnectorModalProps): JSX.Element => {
    const {
      isEditMode,
      connectorInfo,
      onClose,
      onSuccess,
      setIsEditMode,
      accountId,
      orgIdentifier,
      projectIdentifier
    } = props
    const { getString } = useStrings()
    return (
      <StepWizard icon={getConnectorIconByType(connectorType)} iconProps={{ size: 37 }}>
        <ConnectorDetailsStep
          type={connectorType}
          name={dsconfigTypeToConnectorDetailsTitle(connectorType, getString)}
          isEditMode={isEditMode}
          connectorInfo={connectorInfo}
          gitDetails={props.gitDetails}
        />
        <ConnectorCredentialsStep
          isEditMode={isEditMode}
          accountId={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          connectorInfo={connectorInfo}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          hideModal={onClose}
          onConnectorCreated={onSuccess}
          connectorInfo={connectorInfo}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildSubmissionPayload}
        />
        <VerifyOutOfClusterDelegate
          name={`${getString('verify')} ${getString('connection')}`}
          connectorInfo={props.connectorInfo}
          onClose={onClose}
          isStep
          isLastStep
          type={connectorType}
        />
      </StepWizard>
    )
  }

  return ConnectorComponent
}
