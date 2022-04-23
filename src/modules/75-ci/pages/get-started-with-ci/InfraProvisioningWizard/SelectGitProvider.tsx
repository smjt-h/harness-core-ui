/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import type { FormikContext, FormikProps } from 'formik'
import cx from 'classnames'
import {
  Text,
  FontVariation,
  Layout,
  CardSelect,
  Icon,
  Container,
  Button,
  Formik,
  FormikForm as Form,
  FormInput,
  ButtonVariation,
  ButtonSize,
  Color,
  FormError
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { OAuthProviders, OAuthProviderType } from '@common/constants/OAuthProviders'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import {
  AllGitProviders,
  GitAuthenticationMethod,
  GitProvider,
  GitProviderTypeToAuthenticationMethodMapping,
  Hosting
} from './Constants'

import css from './InfraProvisioningWizard.module.scss'

const OAUTH_REDIRECT_URL_PREFIX = `${location.protocol}//${location.host}/gateway/`

export interface SelectGitProviderRef {
  values: SelectGitProviderInterface
  setFieldTouched(field: keyof SelectGitProviderInterface & string, isTouched?: boolean, shouldValidate?: boolean): void
  validate: () => boolean
  showValidationErrors: () => void
}

export type SelectGitProviderForwardRef =
  | ((instance: SelectGitProviderRef | null) => void)
  | React.MutableRefObject<SelectGitProviderRef | null>
  | null

interface SelectGitProviderProps {
  selectedHosting: Hosting
  selectedGitProvider?: GitProvider
}

export interface SelectGitProviderInterface {
  accessToken?: string
  username?: string
  applicationPassword?: string
  accessKey?: string
  gitAuthenticationMethod?: GitAuthenticationMethod
  gitProvider?: GitProvider
}

const SelectGitProviderRef = (
  props: SelectGitProviderProps,
  forwardRef: SelectGitProviderForwardRef
): React.ReactElement => {
  const { selectedGitProvider, selectedHosting } = props
  const { getString } = useStrings()
  const [gitProvider, setGitProvider] = useState<GitProvider>()
  const [authMethod, setAuthMethod] = useState<GitAuthenticationMethod>()
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
  const formikRef = useRef<FormikContext<SelectGitProviderInterface>>()

  useEffect(() => {
    if (authMethod === GitAuthenticationMethod.AccessToken) {
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
    }
  }, [authMethod])

  const setForwardRef = ({
    values,
    setFieldTouched
  }: {
    values: SelectGitProviderInterface
    setFieldTouched(
      field: keyof SelectGitProviderInterface & string,
      isTouched?: boolean,
      shouldValidate?: boolean
    ): void
  }): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values: values,
        setFieldTouched: setFieldTouched,
        validate: validateGitProviderSetup,
        showValidationErrors: markFieldsTouchedToShowValidationErrors
      }
    }
  }

  useEffect(() => {
    if (formikRef.current?.values && formikRef.current?.setFieldTouched) {
      setForwardRef({
        values: formikRef.current.values,
        setFieldTouched: formikRef.current.setFieldTouched
      })
    }
  })

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('common.smtp.testConnection')}
            size={ButtonSize.SMALL}
            type="submit"
            onClick={() => {
              if (formikRef.current?.values?.accessToken) {
                setTestConnectionStatus(TestStatus.IN_PROGRESS)
                //TODO remove this when api will available for integration
                setTimeout(() => setTestConnectionStatus(TestStatus.SUCCESS), 3000)
              }
            }}
          />
        )
      case TestStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal flex spacing="small">
            <Icon name="steps-spinner" color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
              {getString('common.test.inProgress')}
            </Text>
          </Layout.Horizontal>
        )
      case TestStatus.SUCCESS:
        return (
          <Layout.Horizontal flex spacing="small">
            <Icon name="success-tick" />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREEN_700}>
              {getString('common.test.connectionSuccessful')}
            </Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }

  //#region form view

  const getButtonLabel = React.useCallback((): string => {
    switch (gitProvider?.type) {
      case 'Github':
        return getString('ci.getStartedWithCI.accessTokenLabel')
      case 'Bitbucket':
        return `${getString('username')} & ${getString('ci.getStartedWithCI.appPassword')}`
      case 'Gitlab':
        return getString('common.accessKey')
      default:
        return ''
    }
  }, [gitProvider])

  const renderNonOAuthView = React.useCallback(
    (_formikProps: FormikProps<SelectGitProviderInterface>): JSX.Element => {
      switch (gitProvider?.type) {
        case 'Github':
          return (
            <Layout.Vertical>
              {selectedHosting === Hosting.OnPrem ? (
                <FormInput.Text
                  style={{ width: '40%' }}
                  name="url"
                  label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('UrlLabel')}</Text>}
                  tooltipProps={{ dataTooltipId: 'url' }}
                  disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
                />
              ) : null}
              <FormInput.Text
                style={{ width: '40%' }}
                name="accessToken"
                label={
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>
                    {getString('ci.getStartedWithCI.accessTokenLabel')}
                  </Text>
                }
                tooltipProps={{ dataTooltipId: 'accessToken' }}
                disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
              />
            </Layout.Vertical>
          )
        case 'Bitbucket':
          return (
            <Layout.Vertical>
              {selectedHosting === Hosting.OnPrem ? (
                <FormInput.Text
                  style={{ width: '40%' }}
                  name="url"
                  label={
                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                      {getString('ci.getStartedWithCI.apiUrlLabel')}
                    </Text>
                  }
                  tooltipProps={{ dataTooltipId: 'url' }}
                  disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
                />
              ) : null}
              <FormInput.Text
                style={{ width: '40%' }}
                name="username"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('username')}</Text>}
                tooltipProps={{ dataTooltipId: 'username' }}
                disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
              />
              <FormInput.Text
                style={{ width: '40%' }}
                name="applicationPassword"
                label={
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>
                    {getString('ci.getStartedWithCI.appPassword')}
                  </Text>
                }
                tooltipProps={{ dataTooltipId: 'applicationPassword' }}
                disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
              />
            </Layout.Vertical>
          )
        case 'Gitlab':
          return (
            <Layout.Vertical>
              {selectedHosting === Hosting.OnPrem ? (
                <FormInput.Text
                  style={{ width: '40%' }}
                  name="url"
                  label={
                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                      {getString('ci.getStartedWithCI.apiUrlLabel')}
                    </Text>
                  }
                  tooltipProps={{ dataTooltipId: 'url' }}
                  disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
                />
              ) : null}
              <FormInput.Text
                style={{ width: '40%' }}
                name="accessKey"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('common.accessKey')}</Text>}
                tooltipProps={{ dataTooltipId: 'accessKey' }}
                disabled={[TestStatus.FAILED, TestStatus.IN_PROGRESS].includes(testConnectionStatus)}
              />
              <TestConnection />
            </Layout.Vertical>
          )
        default:
          return <></>
      }
    },
    [gitProvider, selectedHosting]
  )

  //#endregion

  //#region methods exposed via ref

  const markFieldsTouchedToShowValidationErrors = React.useCallback((): void => {
    const { values, setFieldTouched } = formikRef.current || {}
    const { accessToken, accessKey, applicationPassword, username } = values || {}
    if (!authMethod) {
      setFieldTouched?.('gitAuthenticationMethod', true)
      return
    }
    if (gitProvider?.type === 'Github' && !accessToken) {
      setFieldTouched?.('accessToken', true)
    } else if (gitProvider?.type === 'Gitlab' && !accessKey) {
      setFieldTouched?.('accessKey', true)
    } else if (gitProvider?.type === 'Bitbucket') {
      if (!username) {
        setFieldTouched?.('username', true)
      }
      if (!applicationPassword) {
        setFieldTouched?.('applicationPassword', true)
      }
    }
  }, [gitProvider, authMethod])

  const validateGitProviderSetup = React.useCallback((): boolean => {
    const { accessToken, accessKey, applicationPassword, username } = formikRef.current?.values || {}
    switch (gitProvider?.type) {
      case 'Github':
        return gitProvider?.type === 'Github' && authMethod === GitAuthenticationMethod.AccessToken && !!accessToken
      case 'Gitlab':
        return gitProvider?.type === 'Gitlab' && authMethod === GitAuthenticationMethod.AccessKey && !!accessKey
      case 'Bitbucket':
        return (
          gitProvider?.type === 'Bitbucket' &&
          authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword &&
          !!username &&
          !!applicationPassword
        )
      default:
        return false
    }
  }, [gitProvider, authMethod])

  //#endregion

  const isNonOAuthMethodSelect = React.useCallback((): boolean => {
    return (
      (gitProvider?.type === 'Github' && authMethod === GitAuthenticationMethod.AccessToken) ||
      (gitProvider?.type === 'Gitlab' && authMethod === GitAuthenticationMethod.AccessKey) ||
      (gitProvider?.type === 'Bitbucket' && authMethod === GitAuthenticationMethod.UserNameAndApplicationPassword)
    )
  }, [gitProvider, authMethod])

  //#region formik related

  const getInitialValues = React.useCallback((): Record<string, string> => {
    switch (gitProvider?.type) {
      case 'Github':
        return { accessToken: '' }
      case 'Gitlab':
        return { accessKey: '' }
      case 'Bitbucket':
        return { applicationPassword: '', username: '' }
      default:
        return {}
    }
  }, [gitProvider])

  const getValidationSchema = React.useCallback(() => {
    switch (gitProvider?.type) {
      case 'Github':
        return Yup.object().shape({
          accessToken: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('ci.getStartedWithCI.accessTokenLabel') }))
        })
      case 'Gitlab':
        return Yup.object().shape({
          accessKey: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('common.accessKey') }))
        })
      case 'Bitbucket':
        return Yup.object().shape({
          username: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('username') })),
          applicationPassword: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('ci.getStartedWithCI.appPassword') }))
        })
      default:
        return Yup.object().shape({})
    }
  }, [gitProvider])

  //#endregion

  //#region on change of a git provider

  const resetField = (field: keyof SelectGitProviderInterface) => {
    const { setFieldValue, setFieldTouched } = formikRef.current || {}
    setFieldValue?.(field, '')
    setFieldTouched?.(field, false)
  }

  const resetFormFieldsOnGitAuthMethodSelect = React.useCallback((): void => {
    switch (gitProvider?.type) {
      case 'Github':
        resetField('accessToken')
        return
      case 'Gitlab':
        resetField('accessKey')
        return
      case 'Bitbucket':
        resetField('applicationPassword')
        resetField('username')
        return
      default:
        return
    }
  }, [gitProvider, authMethod])

  //#endregion

  return (
    <Layout.Vertical width="70%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.codeRepo')}</Text>
      <Formik<SelectGitProviderInterface>
        initialValues={{
          ...getInitialValues(),
          gitProvider: selectedGitProvider,
          gitAuthenticationMethod: undefined
        }}
        formName="ciInfraProvisiong-gitProvider"
        validationSchema={getValidationSchema()}
        validateOnChange={true}
        onSubmit={(values: SelectGitProviderInterface) => Promise.resolve(values)}
      >
        {formikProps => {
          formikRef.current = formikProps
          setForwardRef({
            values: formikProps.values,
            setFieldTouched: formikProps.setFieldTouched
          })
          return (
            <Form>
              <Container
                padding={{ top: 'xxlarge', bottom: 'xxxlarge' }}
                className={cx({ [css.borderBottom]: selectedGitProvider })}
              >
                <CardSelect
                  data={AllGitProviders}
                  cornerSelected={true}
                  className={css.icons}
                  cardClassName={css.gitProviderCard}
                  renderItem={(item: GitProvider) => (
                    <Layout.Vertical flex>
                      <Icon
                        name={item.icon}
                        size={30}
                        flex
                        className={cx(
                          { [css.githubIcon]: item.icon === 'github' },
                          { [css.gitlabIcon]: item.icon === 'gitlab' },
                          { [css.bitbucketIcon]: item.icon === 'bitbucket-blue' }
                        )}
                      />
                      <Text font={{ variation: FontVariation.BODY2 }} padding={{ top: 'small' }}>
                        {getString(item.label)}
                      </Text>
                    </Layout.Vertical>
                  )}
                  selected={gitProvider}
                  onChange={(item: GitProvider) => {
                    formikProps.setFieldValue('gitProvider', item)
                    setGitProvider(item)
                  }}
                />
                {formikProps.touched.gitProvider && !formikProps.values.gitProvider ? (
                  <Container padding={{ top: 'xsmall' }}>
                    <FormError
                      name={'gitProvider'}
                      errorMessage={getString('fieldRequired', {
                        field: getString('ci.getStartedWithCI.codeRepoLabel')
                      })}
                    />
                  </Container>
                ) : null}
              </Container>
              {selectedGitProvider ? (
                <>
                  <Text font={{ variation: FontVariation.H5 }} padding={{ top: 'xlarge', bottom: 'small' }}>
                    {getString('ci.getStartedWithCI.authMethod')}
                  </Text>
                  <Layout.Vertical padding={{ top: 'medium' }}>
                    <Layout.Horizontal spacing="small">
                      <Button
                        round
                        text={getString('ci.getStartedWithCI.oAuthLabel')}
                        onClick={() => {
                          const oAuthProviderDetails = OAuthProviders.filter(
                            (oAuthProvider: OAuthProviderType) =>
                              gitProvider && gitProvider.type.toUpperCase() === oAuthProvider.name.toUpperCase()
                          )[0]
                          if (oAuthProviderDetails) {
                            const redirectionUrl = `${OAUTH_REDIRECT_URL_PREFIX}api/users/${oAuthProviderDetails.url}`
                            window.open(redirectionUrl, '_blank')
                          }
                          formikProps.setFieldValue('gitAuthenticationMethod', GitAuthenticationMethod.OAuth)
                          setAuthMethod(GitAuthenticationMethod.OAuth)
                        }}
                        intent={authMethod === GitAuthenticationMethod.OAuth ? 'primary' : 'none'}
                      />
                      <Button
                        round
                        text={getButtonLabel()}
                        onClick={() => {
                          resetFormFieldsOnGitAuthMethodSelect()
                          if (gitProvider?.type) {
                            const gitAuthMethod = GitProviderTypeToAuthenticationMethodMapping.get(gitProvider.type)
                            formikProps.setFieldValue('gitAuthenticationMethod', gitAuthMethod)
                            setAuthMethod(gitAuthMethod)
                          }
                        }}
                        intent={isNonOAuthMethodSelect() ? 'primary' : 'none'}
                      />
                    </Layout.Horizontal>
                    {formikProps.touched.gitAuthenticationMethod && !formikProps.values.gitAuthenticationMethod ? (
                      <Container padding={{ top: 'xsmall' }}>
                        <FormError
                          name={'gitAuthenticationMethod'}
                          errorMessage={getString('fieldRequired', {
                            field: getString('ci.getStartedWithCI.authMethodLabel')
                          })}
                        />
                      </Container>
                    ) : null}
                  </Layout.Vertical>
                  {isNonOAuthMethodSelect() ? (
                    <Container padding={{ top: 'xlarge' }}>{renderNonOAuthView(formikProps)}</Container>
                  ) : null}
                </>
              ) : null}
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectGitProvider = React.forwardRef(SelectGitProviderRef)
