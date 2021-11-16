import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  FontVariation,
  Formik,
  FormikForm,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  EntityGitDetails,
  ResponseConnectorResponse
} from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import ConnectivityMode, { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useCreateEditConnector, { BuildPayloadProps } from '@connectors/hooks/useCreateEditConnector'

interface ConnectivityModeStepData extends BuildPayloadProps {
  connectivityMode: ConnectivityModeType
}

interface ConnectivityModeStepProps {
  type: ConnectorConfigDTO['type']
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  gitDetails?: EntityGitDetails
  disableGitSync?: boolean
  submitOnNextStep?: boolean
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  hideModal?: () => void
  customHandleCreate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
}

const ConnectivityModeStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps> = props => {
  const { prevStepData, nextStep, connectorInfo, buildPayload, customHandleUpdate, customHandleCreate } = props
  const { getString } = useStrings()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<any>()

  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const isGitSyncEnabled = useAppStore().isGitSyncEnabled && !props.disableGitSync && orgIdentifier && projectIdentifier
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    if (prevStepData?.branch) {
      // updating connector branch to handle if new branch was created while commit
      prevStepData.branch = response?.data?.gitDetails?.branch
    }

    if (stepDataRef?.skipDefaultValidation) {
      props.hideModal?.()
    } else {
      nextStep?.({ ...prevStepData, ...stepDataRef } as ConnectorConfigDTO)
      props.setIsEditMode?.(true)
    }
  }

  const { onInitiate, loading } = useCreateEditConnector<ConnectivityModeStepData>({
    accountId,
    isEditMode: props.isEditMode,
    isGitSyncEnabled,
    afterSuccessHandler
  })

  let stepDataRef: ConnectorConfigDTO | null = null
  const defaultInitialValues = { connectivityMode: ConnectivityModeType.Manager }

  const connectorName = (prevStepData as ConnectorConfigDTO)?.name || (connectorInfo as ConnectorInfoDTO)?.name

  return (
    <>
      {!isGitSyncEnabled && loading ? (
        <PageSpinner
          message={
            props.isEditMode
              ? getString('connectors.updating', { name: connectorName })
              : getString('connectors.creating', { name: connectorName })
          }
        />
      ) : null}
      <Layout.Vertical>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Formik
          initialValues={{
            ...defaultInitialValues,
            ...prevStepData
          }}
          onSubmit={stepData => {
            if (props.submitOnNextStep || stepData.connectivityMode === ConnectivityModeType.Delegate) {
              nextStep?.({ ...prevStepData, ...stepData, projectIdentifier, orgIdentifier })
              return
            }

            const connectorData = {
              ...prevStepData,
              ...stepData,
              projectIdentifier: projectIdentifier,
              orgIdentifier: orgIdentifier
            }

            stepDataRef = stepData
            modalErrorHandler?.hide()
            onInitiate({
              connectorFormData: connectorData,
              buildPayload,
              customHandleCreate,
              customHandleUpdate
            })
          }}
          formName={`connectivityModeForm${props.type}`}
          enableReinitialize
        >
          {formik => {
            return (
              <FormikForm>
                <Layout.Vertical style={{ minHeight: 460 }} width={'700px'} spacing={'medium'}>
                  <Text
                    font={{ variation: FontVariation.H3 }}
                    color={Color.BLACK}
                    tooltipProps={{ dataTooltipId: 'ConnectivityModeTitle' }}
                  >
                    {'How do you want to connect to the provider?'}
                  </Text>
                  <ConnectivityMode
                    formik={formik}
                    onChange={val => {
                      props.setConnectivityMode?.(val)
                    }}
                  />
                </Layout.Vertical>
                <Layout.Horizontal padding={{ top: 'medium' }} margin={{ top: 'xxxlarge' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="awsBackButton"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent={'primary'}
                    text={getString(
                      formik.values.connectivityMode === ConnectivityModeType.Delegate ? 'continue' : 'saveAndContinue'
                    )}
                    disabled={loading}
                    rightIcon="chevron-right"
                    data-testid="connectivitySaveAndContinue"
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export default ConnectivityModeStep
