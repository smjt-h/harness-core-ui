/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import type { FormikContext } from 'formik'
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
import { AllGitProviders, GitAuthenticationMethod, GitProvider } from './Constants'

import css from './InfraProvisioningWizard.module.scss'

const OAUTH_REDIRECT_URL_PREFIX = `${location.protocol}//${location.host}/gateway/`

export interface SelectGitProviderRef {
  values: SelectGitProviderInterface
  setFieldTouched(field: keyof SelectGitProviderInterface & string, isTouched?: boolean, shouldValidate?: boolean): void
}

export type SelectGitProviderForwardRef =
  | ((instance: SelectGitProviderRef | null) => void)
  | React.MutableRefObject<SelectGitProviderRef | null>
  | null

interface SelectGitProviderProps {
  selectedGitProvider?: GitProvider
}

export interface SelectGitProviderInterface {
  accessToken: string
  gitAuthenticationMethod?: GitAuthenticationMethod
  gitProvider?: GitProvider
}

const SelectGitProviderRef = (
  props: SelectGitProviderProps,
  forwardRef: SelectGitProviderForwardRef
): React.ReactElement => {
  const { selectedGitProvider } = props
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
        setFieldTouched: setFieldTouched
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

  return (
    <Layout.Vertical width="70%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.codeRepo')}</Text>
      <Formik<SelectGitProviderInterface>
        initialValues={{
          accessToken: '',
          gitProvider: selectedGitProvider,
          gitAuthenticationMethod: undefined
        }}
        formName="ciInfraProvisiong-gitProvider"
        validationSchema={Yup.object().shape({
          accessToken: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('ci.getStartedWithCI.accessTokenLabel') }))
        })}
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
                    formikProps.setFieldValue('gitProvider', item.type)
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
                        text={getString('ci.getStartedWithCI.accessTokenLabel')}
                        onClick={() => {
                          formikProps.setFieldValue('accessToken', '')
                          formikProps.setFieldValue('gitAuthenticationMethod', GitAuthenticationMethod.AccessToken)
                          setAuthMethod(GitAuthenticationMethod.AccessToken)
                        }}
                        intent={authMethod === GitAuthenticationMethod.AccessToken ? 'primary' : 'none'}
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
                  {authMethod === GitAuthenticationMethod.AccessToken ? (
                    <Container padding={{ top: 'xlarge' }}>
                      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="large">
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
                        <Container
                          padding={{ top: 'small', left: 'small' }}
                          className={cx({
                            [css.testConnectionBtnWithError]:
                              formikProps.touched.accessToken && formikProps.errors.accessToken
                          })}
                        >
                          <TestConnection />
                        </Container>
                      </Layout.Horizontal>
                    </Container>
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
