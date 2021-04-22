import React from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, Spinner } from '@blueprintjs/core'
import {
  Button,
  Layout,
  useModalHook,
  Text,
  Formik,
  FormInput,
  Collapse,
  IconName,
  Color,
  CardSelect,
  Container,
  ButtonProps
} from '@wings-software/uicore'
import { ResponseEnvironmentResponseDTO, useCreateEnvironment } from 'services/cd-ng'
import { EnvironmentRequestRequestBody, useCreateEnvironment as useCreateEnvironmentCF } from 'services/cf'
import { useToaster } from '@common/exports'
import { useEnvStrings } from '@cf/hooks/environment'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import css from './EnvironmentDialog.module.scss'

const collapseProps = {
  collapsedIcon: 'plus' as IconName,
  expandedIcon: 'minus' as IconName,
  isOpen: false,
  isRemovable: false
}

export interface EnvironmentDialogProps {
  disabled?: boolean
  onCreate: (response?: ResponseEnvironmentResponseDTO) => void
  buttonProps?: ButtonProps
}

interface EnvironmentValues {
  name: string
  identifier: string
  description: string
  tags: string[]
  type: EnvironmentType
}

const identity = (x: any) => x as string

const EnvironmentDialog: React.FC<EnvironmentDialogProps> = ({ disabled, onCreate, buttonProps }) => {
  const { showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { mutate: createEnv, loading } = useCreateEnvironment({
    queryParams: {
      accountId
    }
  })
  const { mutate: createEnvCF } = useCreateEnvironmentCF({
    queryParams: {
      account: accountId,
      org: orgIdentifier
    }
  })

  const envTypes = [
    {
      text: getString('production'),
      value: EnvironmentType.PRODUCTION
    },
    {
      text: getString('nonProduction'),
      value: EnvironmentType.NON_PRODUCTION
    }
  ]

  const getTypeOption = (v: string) => envTypes.find(x => x.value === v) || envTypes[0]

  const initialValues: EnvironmentValues = {
    name: '',
    identifier: '',
    description: '',
    type: EnvironmentType.NON_PRODUCTION,
    tags: []
  }

  const handleSubmit = (values: EnvironmentValues) => {
    createEnv({
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      projectIdentifier,
      orgIdentifier,
      type: values.type,
      tags: values.tags.length > 0 ? values.tags.reduce((acc, next) => ({ ...acc, [next]: next }), {}) : {}
    })
      .then(response => {
        // Temporary workaround to send the same request to FF server
        // TODO: Remove this createEnvCF when FF server is fixed
        // @see https://harness.slack.com/archives/G01DJ6C0E1G/p1615324960021200
        createEnvCF({
          name: values.name,
          identifier: values.identifier,
          description: values.description,
          project: projectIdentifier,
          type: values.type
        } as EnvironmentRequestRequestBody).then(() => {
          hideModal()
          onCreate(response)
        })
      })
      .catch(error => {
        showError(getErrorMessage(error), 0)
      })
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen onClose={hideModal} className={css.dialog}>
        <Formik initialValues={initialValues} onSubmit={handleSubmit} onReset={hideModal}>
          {formikProps => {
            return (
              <Container
                padding="xxxlarge"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  paddingBottom: 'var(--spacing-medium)'
                }}
              >
                <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
                  {getEnvString('create.title')}
                </Text>
                <Text margin={{ top: 'large', bottom: 'large' }}>{getEnvString('create.description')}</Text>
                <Layout.Vertical
                  spacing="small"
                  style={{ minHeight: 415, overflow: 'auto', padding: 'var(--spacing-xsmall)' }}
                >
                  <FormInput.InputWithIdentifier
                    inputName="name"
                    idName="identifier"
                    isIdentifierEditable
                    inputLabel={getEnvString('create.nameLabel')}
                    inputGroupProps={{ inputGroup: { autoFocus: true } }}
                  />
                  <Layout.Vertical>
                    <Container className={css.collapse}>
                      <Collapse
                        {...collapseProps}
                        heading={getString('common.description')}
                        collapseHeaderClassName={css.collapseHeaderFix}
                      >
                        <FormInput.TextArea name="description" />
                      </Collapse>
                    </Container>
                    <Container className={css.collapse}>
                      <Collapse
                        {...collapseProps}
                        heading={getString('common.tagsLabel')}
                        collapseHeaderClassName={css.collapseHeaderFix}
                      >
                        <FormInput.TagInput
                          name="tags"
                          label=""
                          items={[]}
                          labelFor={identity}
                          itemFromNewTag={identity}
                          tagInputProps={{
                            showClearAllButton: true,
                            allowNewTag: true,
                            placeholder: 'Tags'
                          }}
                        />
                      </Collapse>
                    </Container>
                  </Layout.Vertical>
                  <Layout.Vertical spacing="small" style={{ margin: 'auto 0' }}>
                    <Text font={{ size: 'normal' }} padding={{ top: 'medium' }}>
                      {getEnvString('create.envTypeLabel')}
                    </Text>
                    <CardSelect
                      cornerSelected
                      data={envTypes}
                      selected={getTypeOption(formikProps.values.type)}
                      className={css.cardSelect}
                      onChange={nextValue => formikProps.setFieldValue('type', nextValue.value)}
                      renderItem={cardData => (
                        <Container
                          flex={{ align: 'center-center', distribution: 'space-between' }}
                          className="cardBody"
                        >
                          {cardData.text}
                        </Container>
                      )}
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <Container
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}
                >
                  <Button
                    text={getString('createSecretYAML.create')}
                    onClick={() => formikProps.handleSubmit()}
                    intent="primary"
                    disabled={loading}
                  />
                  <Button text={getString('common.cancel')} onClick={() => formikProps.handleReset()} minimal />
                  {loading && <Spinner size={16} />}
                </Container>
              </Container>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [loading])

  return (
    <Button
      disabled={disabled}
      onClick={openModal}
      text={`+ ${getString('environment')}`}
      intent="primary"
      padding={{
        top: 'small',
        bottom: 'small',
        left: 'huge',
        right: 'huge'
      }}
      {...buttonProps}
    />
  )
}

export default EnvironmentDialog
