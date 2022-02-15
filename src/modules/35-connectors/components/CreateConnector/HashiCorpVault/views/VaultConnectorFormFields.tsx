/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Color,
  FormInput,
  Icon,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  SelectOption
} from '@wings-software/uicore'
import type { FormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { VaultConfigFormData, HashiCorpVaultAccessTypes } from '@connectors/interfaces/ConnectorInterface'
import { useListAwsRegions } from 'services/portal'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'

interface VaultConnectorFormFieldsProps {
  formik: FormikContext<VaultConfigFormData>
}

const VaultConnectorFormFields: React.FC<VaultConnectorFormFieldsProps> = ({ formik }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<OrgPathProps>()

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const {
    data: regionData,
    loading,
    error
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  if (error) {
    modalErrorHandler?.showDanger(error.message)
  }

  const regionValues =
    regionData?.resource?.map(region => ({
      value: region.value,
      label: region.name || ''
    })) || []
  const accessTypeOptions: SelectOption[] = [
    {
      label: getString('connectors.hashiCorpVault.appRole'),
      value: HashiCorpVaultAccessTypes.APP_ROLE
    },
    {
      label: getString('token'),
      value: HashiCorpVaultAccessTypes.TOKEN
    },
    {
      label: getString('connectors.hashiCorpVault.vaultAgent'),
      value: HashiCorpVaultAccessTypes.VAULT_AGENT
    },
    {
      label: getString('connectors.hashiCorpVault.awsAuth'),
      value: HashiCorpVaultAccessTypes.AWS_IAM
    }
  ]

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <FormInput.Text name="vaultUrl" label={getString('connectors.hashiCorpVault.vaultUrl')} />
      <FormInput.Text name="basePath" label={getString('connectors.hashiCorpVault.baseSecretPath')} />
      <FormInput.Text
        name="namespace"
        label={getString('common.namespace')}
        placeholder={getString('connectors.hashiCorpVault.root')}
      />
      <FormInput.Select name="accessType" label={getString('authentication')} items={accessTypeOptions} />
      {formik?.values['accessType'] === HashiCorpVaultAccessTypes.APP_ROLE ? (
        <>
          <FormInput.Text name="appRoleId" label={getString('connectors.hashiCorpVault.appRoleId')} />
          <SecretInput
            name="secretId"
            label={getString('connectors.hashiCorpVault.secretId')}
            connectorTypeContext={'Vault'}
          />
        </>
      ) : formik?.values['accessType'] === HashiCorpVaultAccessTypes.AWS_IAM ? (
        <>
          <SecretInput name="xvaultAwsIamServerId" label={getString('connectors.hashiCorpVault.serverIdHeader')} />
          <FormInput.Text name="vaultAwsIamRole" label={getString('common.role')} />
          {loading ? (
            <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
          ) : (
            <FormInput.Select
              disabled={loading}
              name="awsRegion"
              items={regionValues}
              label={getString('regionLabel')}
            />
          )}
        </>
      ) : formik?.values['accessType'] === HashiCorpVaultAccessTypes.TOKEN ? (
        <SecretInput name="authToken" label={getString('token')} connectorTypeContext={'Vault'} />
      ) : (
        <FormInput.Text name="sinkPath" label={getString('connectors.hashiCorpVault.sinkPath')} />
      )}
      {formik?.values['accessType'] !== HashiCorpVaultAccessTypes.VAULT_AGENT &&
      formik?.values['accessType'] !== HashiCorpVaultAccessTypes.AWS_IAM ? (
        <FormInput.Text name="renewalIntervalMinutes" label={getString('connectors.hashiCorpVault.renewal')} />
      ) : null}

      <FormInput.CheckBox
        name="readOnly"
        label={getString('connectors.hashiCorpVault.readOnlyVault')}
        padding={{ left: 'xxlarge' }}
      />
      <FormInput.CheckBox
        name="default"
        label={getString('connectors.hashiCorpVault.defaultVault')}
        padding={{ left: 'xxlarge' }}
      />
    </>
  )
}

export default VaultConnectorFormFields
