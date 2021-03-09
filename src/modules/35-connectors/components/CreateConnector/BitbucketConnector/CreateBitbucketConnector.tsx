import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/exports'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildBitbucketPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '../commonSteps/GitDetailsStep'
import StepBitbucketAuthentication from './StepAuth/StepBitbucketAuthentication'

const CreateBitbucketConnector = (props: CreateConnectorModalProps): JSX.Element => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.BITBUCKET)}
      iconProps={{ size: 50 }}
      title={getString(getConnectorTitleIdByType(Connectors.BITBUCKET))}
    >
      <ConnectorDetailsStep
        type={Connectors.BITBUCKET}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <GitDetailsStep
        type={Connectors.BITBUCKET}
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <StepBitbucketAuthentication
        name={getString('credentials')}
        {...commonProps}
        onConnectorCreated={props.onSuccess}
      />
      <DelegateSelectorStep
        name={getString('delegateSelectorOptional')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildBitbucketPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        type={Connectors.BITBUCKET}
        name={getString('connectors.stepThreeName')}
        isStep={true}
        isLastStep={true}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

export default CreateBitbucketConnector
