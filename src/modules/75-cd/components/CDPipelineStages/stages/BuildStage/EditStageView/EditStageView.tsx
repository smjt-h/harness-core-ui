import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Collapse,
  Button,
  Switch,
  TextInput,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { IconName } from '@blueprintjs/core'
import { isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { StageElementWrapper, PipelineInfoConfig } from 'services/cd-ng'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/exports'
import { useStrings } from 'framework/exports'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import css from './EditStageView.module.scss'

export interface EditStageView {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
  onChange?: (values: StageElementWrapper) => void
}

interface Values {
  identifier: string
  name: string
  description?: string
  cloneCodebase?: boolean
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

export const EditStageView: React.FC<EditStageView> = ({ data, onSubmit, onChange }): JSX.Element => {
  const { getString } = useStrings()
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')

  const {
    state: { pipeline },
    updatePipeline
  } = React.useContext(PipelineContext)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const initialValues: Values = {
    identifier: data?.stage.identifier,
    name: data?.stage.name,
    description: data?.stage.description,
    cloneCodebase: data?.stage.spec?.cloneCodebase ?? true
  }

  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    initialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  const validationSchema = () =>
    Yup.lazy((values: Values): any =>
      Yup.object().shape({
        name: Yup.string().required(getString('fieldRequired', { field: getString('stageNameLabel') })),
        ...(!codebase &&
          values.cloneCodebase && {
            connectorRef: Yup.mixed().required(
              getString('fieldRequired', { field: getString('pipelineSteps.build.create.connectorLabel') })
            ),
            ...(connectionType === 'Account' && {
              repoName: Yup.string().required(
                getString('fieldRequired', { field: getString('pipelineSteps.build.create.repositoryNameLabel') })
              )
            })
          })
      })
    )

  const handleValidate = (values: Values): void => {
    if (data) {
      onChange?.(values)
    }
  }

  const handleSubmit = (values: Values): void => {
    if (data) {
      // TODO: Add Codebase verification
      if (values.cloneCodebase && values.connectorRef) {
        set(pipeline, 'properties.ci.codebase', {
          connectorRef: values.connectorRef.value,
          ...(values.repoName && { repoName: values.repoName }),
          build: RUNTIME_INPUT_VALUE
        })

        // Repo level connectors should not have repoName
        if (connectionType === 'Repo' && (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
          delete (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
        }

        updatePipeline(pipeline)
      }

      data.stage.identifier = values.identifier
      data.stage.name = values.name

      if (values.description) data.stage.description = values.description
      if (!data.stage.spec) data.stage.spec = {}
      data.stage.spec.cloneCodebase = values.cloneCodebase

      onSubmit?.(data, values.identifier)
    }
  }

  const collapseProps = {
    collapsedIcon: 'small-plus' as IconName,
    expandedIcon: 'small-minus' as IconName,
    isOpen: false,
    isRemovable: false,
    className: 'collapse',
    heading: getString('description')
  }

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <FormikForm>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                icon="pipeline-build"
                iconProps={{ size: 16 }}
                margin={{ bottom: 'medium' }}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              <FormInput.InputWithIdentifier inputLabel={getString('stageNameLabel')} />
              <div className={css.collapseDiv}>
                <Collapse
                  {...collapseProps}
                  isOpen={(formikProps.values.description && formikProps.values.description?.length > 0) || false}
                >
                  <FormInput.TextArea name="description" />
                </Collapse>
              </div>
              <Switch
                label={getString('cloneCodebaseLabel')}
                onChange={e => formikProps.setFieldValue('cloneCodebase', e.currentTarget.checked)}
                defaultChecked={formikProps.values.cloneCodebase}
              />
              <div className={css.cloneCodebaseInfo}>
                <Button icon="info" minimal iconProps={{ size: 8 }} />
                <Text font="xsmall">{getString('pipelineSteps.build.create.cloneCodebaseHelperText')}</Text>
              </div>
              {/* We don't need to configure CI Codebase if it is already configured or we are skipping Clone Codebase step */}
              {!codebase && formikProps.values.cloneCodebase && (
                <div className={css.configureCodebase}>
                  <Text
                    font={{ size: 'medium', weight: 'semi-bold' }}
                    icon="cog"
                    iconProps={{ size: 18 }}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('pipelineSteps.build.create.configureCodebase')}
                  </Text>
                  <Text margin={{ bottom: 'medium' }}>
                    {getString('pipelineSteps.build.create.configureCodebaseHelperText')}
                  </Text>
                  <ConnectorReferenceField
                    error={
                      formikProps.submitCount && formikProps.errors.connectorRef
                        ? formikProps.errors.connectorRef
                        : undefined
                    }
                    name="connectorRef"
                    category={'CODE_REPO'}
                    selected={formikProps.values.connectorRef}
                    label={getString('pipelineSteps.build.create.connectorLabel')}
                    placeholder={loading ? getString('loading') : getString('select')}
                    disabled={loading}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    onChange={(value, scope) => {
                      setConnectionType(value.spec.type)
                      setConnectorUrl(value.spec.url)

                      formikProps.setFieldValue('connectorRef', {
                        label: value.name || '',
                        value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                        scope: scope
                      })
                    }}
                  />
                  {connectionType === 'Repo' ? (
                    <>
                      <Text margin={{ bottom: 'xsmall' }}>
                        {getString('pipelineSteps.build.create.repositoryNameLabel')}
                      </Text>
                      <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                    </>
                  ) : (
                    <>
                      <FormInput.Text
                        className={css.repositoryUrl}
                        label={'Repository Name'}
                        name="repoName"
                        style={{ flexGrow: 1 }}
                      />
                      {connectorUrl.length > 0 ? (
                        <div className={css.predefinedValue}>
                          {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                            (formikProps.values.repoName ? formikProps.values.repoName : '')}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                onClick={() => formikProps.submitForm()}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
