/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  SelectOption,
  ButtonVariation,
  PageSpinner
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import {
  setupAzureRepoFormData,
  GitConnectionType,
  saveCurrentStepData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { GitAuthTypes, GitAPIAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { getCommonConnectorsValidationSchema } from '../../CreateConnectorUtils'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepAzureRepoAuthentication.module.scss'
import commonCss from '../../commonSteps/ConnectorCommonStyles.module.scss'

interface StepAzureRepoAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface AzureRepoAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface AzureRepoFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  accessToken: SecretReferenceInterface | void
  installationId: string
  applicationId: string
  privateKey: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  apiAccessUsername: TextReferenceInterface | void
  apiAccessToken: SecretReferenceInterface | void
  enableAPIAccess: boolean
  sameCredentialsAsAbove: boolean
  apiAuthType: string
}

const defaultInitialFormData: AzureRepoFormInterface = {
  connectionType: GitConnectionType.HTTP,
  authType: GitAuthTypes.USER_TOKEN,
  username: undefined,
  accessToken: undefined,
  installationId: '',
  applicationId: '',
  privateKey: undefined,
  sshKey: undefined,
  apiAccessUsername: undefined,
  apiAccessToken: undefined,
  enableAPIAccess: false,
  sameCredentialsAsAbove: false,
  apiAuthType: GitAPIAuthTypes.TOKEN
}

const RenderAzureRepoAuthForm: React.FC<FormikProps<AzureRepoFormInterface>> = props => {
  const { getString } = useStrings()
  switch (props.values.authType) {
    case GitAuthTypes.USER_TOKEN:
      return (
        <>
          <TextReference
            name="username"
            stringId="username"
            type={props.values.username ? props.values.username?.type : ValueType.TEXT}
          />
          <SecretInput name="accessToken" label={getString('personalAccessToken')} />
        </>
      )
    default:
      return null
  }
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<AzureRepoFormInterface>> = props => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('usernameToken'),
      value: GitAuthTypes.USER_TOKEN
    }
  ]

  useEffect(() => {
    props.setFieldValue('apiAuthType', GitAuthTypes.USER_TOKEN)
  }, [])

  return (
    <>
      <Container className={css.authHeaderRow}>
        <Text font={{ variation: FontVariation.H6 }}>{getString('common.git.APIAuthentication')}</Text>
        <FormInput.Select
          name="apiAuthType"
          items={apiAuthOptions}
          className={commonStyles.authTypeSelect}
          value={apiAuthOptions[0]}
        />
      </Container>
      <FormInput.CheckBox
        name="sameCredentialsAsAbove"
        label={getString('connectors.sameCredentialsAsAbove')}
        padding={{ left: 'xxlarge' }}
      />
      {!props.values.sameCredentialsAsAbove && (
        <>
          <TextReference
            name="apiAccessUsername"
            stringId="username"
            type={props.values.apiAccessUsername ? props.values.apiAccessUsername?.type : ValueType.TEXT}
          />
          <SecretInput name="accessToken" label={getString('personalAccessToken')} />
        </>
      )}
    </>
  )
}

const StepAzureRepoAuthentication: React.FC<
  StepProps<StepAzureRepoAuthenticationProps> & AzureRepoAuthenticationProps
> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)

  const authOptions: Array<SelectOption> = [
    {
      label: getString('usernameToken'),
      value: GitAuthTypes.USER_TOKEN
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets && props.isEditMode) {
      if (props.connectorInfo) {
        setupAzureRepoFormData(props.connectorInfo, accountId).then(data => {
          setInitialValues(data as AzureRepoFormInterface)
          setLoadingConnectorSecrets(false)
        })
      } else {
        setLoadingConnectorSecrets(false)
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepAzureRepoAuthenticationProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical width="60%" style={{ minHeight: 460 }} className={cx(css.secondStep, commonCss.stepContainer)}>
      <Text font={{ variation: FontVariation.H3 }}>{getString('credentials')}</Text>

      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="stepAzureRepoAuthForm"
        validationSchema={getCommonConnectorsValidationSchema(getString).concat(
          Yup.object().shape({
            apiAuthType: Yup.string().when('enableAPIAccess', {
              is: val => val,
              then: Yup.string().trim().required(getString('validation.authType')),
              otherwise: Yup.string().nullable()
            }),
            apiAccessUsername: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAuthTypes.USER_TOKEN,
              then: Yup.string().trim().required(getString('validation.username')),
              otherwise: Yup.string().nullable()
            }),
            accessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAuthTypes.USER_TOKEN,
              then: Yup.object().required(getString('connectors.validation.personalAccessToken')),
              otherwise: Yup.object().nullable()
            })
          })
        )}
        onSubmit={handleSubmit}
      >
        {formikProps => {
          saveCurrentStepData<ConnectorInfoDTO>(
            props.getCurrentStepData,
            formikProps.values as unknown as ConnectorInfoDTO
          )
          return (
            <Form className={cx(commonCss.fullHeight, commonCss.fullHeightDivsWithFlex)}>
              <Container className={cx(css.stepFormWrapper, commonCss.paddingTop8)}>
                {formikProps.values.connectionType === GitConnectionType.SSH ? (
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'baseline' }}>
                    <Text
                      tooltipProps={{ dataTooltipId: 'azureRepoAuthentication' }}
                      font={{ variation: FontVariation.H6 }}
                    >
                      {getString('authentication')}
                    </Text>
                    <SSHSecretInput name="sshKey" label={getString('SSH_KEY')} />
                  </Layout.Horizontal>
                ) : (
                  <Container>
                    <Container className={css.authHeaderRow} flex={{ alignItems: 'baseline' }}>
                      <Text
                        font={{ variation: FontVariation.H6 }}
                        tooltipProps={{ dataTooltipId: 'azureRepoAuthentication' }}
                      >
                        {getString('authentication')}
                      </Text>
                      <FormInput.Select
                        name="authType"
                        items={authOptions}
                        disabled={false}
                        className={commonStyles.authTypeSelect}
                      />
                    </Container>

                    <RenderAzureRepoAuthForm {...formikProps} />
                  </Container>
                )}

                <FormInput.CheckBox
                  name="enableAPIAccess"
                  label={getString('common.git.enableAPIAccess')}
                  padding={{ left: 'xxlarge' }}
                />
                <Text font="small" className={commonCss.bottomMargin4}>
                  {getString('common.git.APIAccessDescription')}
                </Text>
                {formikProps.values.enableAPIAccess ? <RenderAPIAccessFormWrapper {...formikProps} /> : null}
              </Container>

              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => props?.previousStep?.(props?.prevStepData)}
                  data-name="azureRepoBackButton"
                  variation={ButtonVariation.SECONDARY}
                />
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepAzureRepoAuthentication
