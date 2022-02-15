import { pick } from 'lodash-es'
import * as Yup from 'yup'
import type { SecretFormData } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type {
  ConnectorInfoDTO,
  ListSecretsV2QueryParams,
  SecretDTOV2,
  SecretFileSpecDTO,
  SecretRequestWrapper,
  SecretTextSpecDTO
} from 'services/cd-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'

export enum SecretType {
  SecretFile = 'SecretFile',
  SecretText = 'SecretText',
  SSHKey = 'SSHKey'
}

interface RadioGroupItems {
  label: string
  value: string
}

export const secretManagerTypes: ConnectorInfoDTO['type'][] = [
  'AwsKms',
  'AzureKeyVault',
  'Vault',
  'AwsSecretManager',
  'GcpKms'
]

export const getSecretTypeOptions = (getString: UseStringsReturn['getString']): RadioGroupItems[] => [
  { label: getString('secrets.secret.labelText'), value: 'SecretText' },
  { label: getString('secrets.secret.labelFile'), value: 'SecretFile' }
]

export const getSourceCategory = (
  connectorType?: ConnectorInfoDTO['type']
): ListSecretsV2QueryParams['source_category'] | undefined => {
  if (connectorType && secretManagerTypes.includes(connectorType)) {
    return 'SECRET_MANAGER'
  }
  return undefined
}

export const isVaultSMSelected = (type?: ConnectorInfoDTO['type']): boolean => {
  return type === 'Vault' || type === 'AzureKeyVault' || type === 'AwsSecretManager'
}

export const SecretValueSchema = (editing: boolean, type: SecretDTOV2['type']): Yup.Schema<string | undefined> => {
  const { getString } = useStrings()
  return editing || type === 'SecretFile'
    ? Yup.string().trim()
    : Yup.string().trim().required(getString('common.validation.valueIsRequired'))
}

export const createSecretFileData = (
  data: SecretFormData,
  orgIdentifier?: string,
  projectIdentifier?: string
): FormData => {
  const formData = new FormData()
  formData.set(
    'spec',
    JSON.stringify({
      secret: {
        type: 'SecretFile',
        ...pick(data, ['name', 'identifier', 'description', 'tags']),
        orgIdentifier,
        projectIdentifier,
        spec: {
          ...pick(data, ['secretManagerIdentifier'])
        } as SecretFileSpecDTO
      } as SecretDTOV2
    })
  )
  const file = (data as any)?.['file']?.[0]
  file && formData.set('file', file)
  return formData
}

export const createSecretTextData = (
  data: SecretFormData,
  orgIdentifier?: string,
  projectIdentifier?: string
): SecretRequestWrapper => {
  return {
    secret: {
      type: 'SecretText',
      ...pick(data, ['name', 'identifier', 'description', 'tags']),
      orgIdentifier,
      projectIdentifier,
      spec: {
        ...pick(data, ['secretManagerIdentifier', 'value', 'valueType'])
      } as SecretTextSpecDTO
    }
  }
}
