/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Text,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { defaultTo, pick } from 'lodash-es'
import {
  usePutSecret,
  usePutSecretFileV2,
  usePostSecretFileV2,
  usePostSecret,
  useGetConnectorList,
  SecretDTOV2,
  SecretResponseWrapper,
  ConnectorInfoDTO,
  ConnectorResponse,
  VaultConnectorDTO,
  useGetConnector,
  useGetSecretV2,
  ResponseSecretResponseWrapper,
  SecretTextSpecDTO,
  SecretFileSpecDTO
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getRBACErrorMessage } from '@rbac/utils/utils'
import {
  createSecretFileData,
  createSecretTextData,
  getSecretTypeOptions,
  getSourceCategory,
  isVaultSMSelected,
  SecretValueSchema
} from '@secrets/utils/CreateUpdateSecretUtils'
import VaultFormFields from './views/VaultFormFields'
import LocalFormFields from './views/LocalFormFields'

export type SecretFormData = Omit<SecretDTOV2, 'spec'> & SecretTextSpecDTO & SecretFileSpecDTO

export interface SecretIdentifiers {
  identifier: string
  projectIdentifier?: string
  orgIdentifier?: string
}

interface CreateUpdateSecretProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
  secret?: SecretIdentifiers
  type?: SecretResponseWrapper['secret']['type']
  onChange?: (data: SecretDTOV2) => void
  onSuccess?: (data: SecretFormData) => void
  connectorTypeContext?: ConnectorInfoDTO['type']
  privateSecret?: boolean
}

const LocalFormFieldsSMList = ['Local', 'GcpKms', 'AwsKms']
const CreateUpdateSecret: React.FC<CreateUpdateSecretProps> = props => {
  const { getString } = useStrings()
  const { onSuccess, connectorTypeContext, privateSecret } = props
  const propsSecret = props.secret
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const secretTypeFromProps = props.type
  const [type, setType] = useState<SecretResponseWrapper['secret']['type']>(
    defaultTo(secretTypeFromProps, 'SecretText')
  )
  const [secret, setSecret] = useState<SecretDTOV2>()
  const sourceCategory = getSourceCategory(connectorTypeContext)

  const {
    loading: loadingSecret,
    data: secretResponse,
    refetch,
    error: getSecretError
  } = useGetSecretV2({
    identifier: defaultTo(propsSecret?.identifier, ''),
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    },
    mock: props.mockSecretDetails,
    lazy: true
  })

  useEffect(() => {
    if (getSecretError) {
      modalErrorHandler?.showDanger(getSecretError.message)
      refetch?.()
    }
  }, [getSecretError])

  useEffect(() => {
    if (propsSecret?.identifier) {
      refetch?.()
    }
  }, [propsSecret?.identifier])

  const {
    data: secretManagersApiResponse,
    loading: loadingSecretsManagers,
    refetch: getSecretManagers
  } = useGetConnectorList({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      category: 'SECRET_MANAGER',
      source_category: sourceCategory
    },
    lazy: true
  })

  const {
    data: connectorDetails,
    loading: loadingConnectorDetails,
    refetch: getConnectorDetails
  } = useGetConnector({
    identifier: defaultTo(
      (secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier,
      (secretResponse?.data?.secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier
    ),
    lazy: true
  })
  const { mutate: createSecretText, loading: loadingCreateText } = usePostSecret({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, privateSecret }
  })
  const { mutate: createSecretFile, loading: loadingCreateFile } = usePostSecretFileV2({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, privateSecret }
  })
  const { mutate: updateSecretText, loading: loadingUpdateText } = usePutSecret({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })
  const { mutate: updateSecretFile, loading: loadingUpdateFile } = usePutSecretFileV2({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })

  const loading = loadingCreateText || loadingUpdateText || loadingCreateFile || loadingUpdateFile
  const editing = !!propsSecret

  useEffect(() => {
    if (!editing) {
      getSecretManagers()
    } else if (secretResponse?.data?.secret && !loadingSecret) {
      setSecret(secretResponse?.data?.secret)
      getConnectorDetails({
        queryParams: {
          accountIdentifier,
          ...pick(secretResponse?.data.secret, ['orgIdentifier', 'projectIdentifier'])
        }
      })
    }
  }, [secretResponse])

  const handleEditSecret = async (data: SecretFormData, orgId?: string, projectId?: string): Promise<void> => {
    try {
      if (type === 'SecretText') {
        await updateSecretText(createSecretTextData(data, orgId, projectId))
      }
      if (type === 'SecretFile') {
        await updateSecretFile(createSecretFileData(data, orgId, projectId) as any)
      }
      showSuccess(getString('secrets.updateSuccessMessage', { name: data.name }))
      onSuccess?.(data)
    } catch (error) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(error))
    }
  }

  const handleCreateSecret = async (data: SecretFormData, orgId?: string, projectId?: string): Promise<void> => {
    try {
      if (type === 'SecretText') {
        await createSecretText(createSecretTextData(data, orgId, projectId))
      }
      if (type === 'SecretFile') {
        await createSecretFile(createSecretFileData(data, orgId, projectId) as any)
      }
      showSuccess(getString('secrets.createSuccessMessage', { name: data.name }))
      onSuccess?.(data)
    } catch (error) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(error))
    }
  }

  const secretManagersOptions: SelectOption[] = editing
    ? [
        {
          label: defaultTo(connectorDetails?.data?.connector?.name, ''),
          value: defaultTo(connectorDetails?.data?.connector?.identifier, '')
        }
      ]
    : defaultTo(
        secretManagersApiResponse?.data?.content?.map((item: ConnectorResponse) => {
          return {
            label: defaultTo(item.connector?.name, ''),
            value: defaultTo(item.connector?.identifier, '')
          }
        }),
        []
      )

  const defaultSecretManagerId = secretManagersApiResponse?.data?.content?.filter(
    item => item.connector?.spec?.default
  )[0]?.connector?.identifier
  const secretTypeOptions = getSecretTypeOptions(getString)

  const [selectedSecretManager, setSelectedSecretManager] = useState<ConnectorInfoDTO | undefined>()
  const [readOnlySecretManager, setReadOnlySecretManager] = useState<boolean>()

  // update selectedSecretManager and readOnly flag in state when we get new data
  useEffect(() => {
    const selectedSM = editing
      ? // when editing, use connector from api response directly, since user cannot change SM
        connectorDetails?.data?.connector
      : // when creating, iterate over all secret managers to find default SM
        secretManagersApiResponse?.data?.content?.filter(
          itemValue => itemValue.connector?.identifier === defaultSecretManagerId
        )?.[0]?.connector

    setSelectedSecretManager(selectedSM)
    setReadOnlySecretManager((selectedSM?.spec as VaultConnectorDTO)?.readOnly)
  }, [defaultSecretManagerId, connectorDetails])

  // if the selected secret manager changes, update readOnly flag in state
  useEffect(() => {
    selectedSecretManager?.type === 'Vault'
      ? setReadOnlySecretManager((selectedSecretManager?.spec as VaultConnectorDTO)?.readOnly)
      : setReadOnlySecretManager(false)
  }, [selectedSecretManager])

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<SecretFormData>
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: {},
          valueType: readOnlySecretManager ? 'Reference' : 'Inline',
          type,
          secretManagerIdentifier: selectedSecretManager?.identifier || defaultSecretManagerId || '',
          orgIdentifier,
          projectIdentifier,
          ...pick(secret, ['name', 'identifier', 'description', 'tags']),
          ...pick(secret?.spec, ['valueType', 'secretManagerIdentifier']),
          ...(editing &&
            secret &&
            (secret?.spec as SecretTextSpecDTO)?.valueType === 'Reference' &&
            pick(secret?.spec, ['value']))
        }}
        formName="createUpdateSecretForm"
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          value: SecretValueSchema(editing, type),
          secretManagerIdentifier: Yup.string().required(getString('secrets.secret.validationKms'))
        })}
        validate={formData => {
          props.onChange?.({
            type: formData.type,
            ...pick(formData, ['name', 'description', 'identifier', 'tags']),
            spec: pick(formData, ['value', 'valueType', 'secretManagerIdentifier']) as SecretTextSpecDTO
          })
        }}
        onSubmit={data => {
          editing
            ? handleEditSecret(data, propsSecret?.orgIdentifier, propsSecret?.projectIdentifier)
            : handleCreateSecret(data, orgIdentifier, projectIdentifier)
        }}
      >
        {formikProps => {
          const typeOfSelectedSecretManager = selectedSecretManager?.type

          return (
            <FormikForm>
              <FormInput.Select
                name="secretManagerIdentifier"
                label={getString('secrets.labelSecretsManager')}
                items={secretManagersOptions}
                disabled={editing || loadingSecretsManagers || loadingConnectorDetails}
                onChange={item => {
                  setSelectedSecretManager(
                    secretManagersApiResponse?.data?.content?.filter(
                      itemValue => itemValue.connector?.identifier === item.value
                    )?.[0]?.connector
                  )
                }}
              />
              {!secretTypeFromProps ? (
                <FormInput.RadioGroup
                  name="type"
                  label={getString('secrets.secret.labelSecretType')}
                  items={secretTypeOptions}
                  radioGroup={{ inline: true }}
                  onChange={ev => {
                    setType((ev.target as HTMLInputElement).value as SecretResponseWrapper['secret']['type'])
                  }}
                />
              ) : null}
              <FormInput.InputWithIdentifier
                inputName="name"
                inputLabel={getString('secrets.labelSecretName')}
                idName="identifier"
                isIdentifierEditable={!editing}
                inputGroupProps={{ disabled: loadingSecret }}
              />
              {!typeOfSelectedSecretManager ? <Text>{getString('secrets.secret.messageSelectSM')}</Text> : null}
              {LocalFormFieldsSMList.findIndex(val => val === typeOfSelectedSecretManager) !== -1 ? (
                <LocalFormFields disableAutocomplete formik={formikProps} type={type} editing={editing} />
              ) : null}
              {isVaultSMSelected(typeOfSelectedSecretManager) ? (
                <VaultFormFields formik={formikProps} type={type} editing={editing} readonly={readOnlySecretManager} />
              ) : null}
              <Button
                intent="primary"
                type="submit"
                text={loading ? getString('secrets.secret.saving') : getString('save')}
                margin={{ top: 'large' }}
                disabled={loading || !typeOfSelectedSecretManager}
                variation={ButtonVariation.PRIMARY}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export default CreateUpdateSecret
