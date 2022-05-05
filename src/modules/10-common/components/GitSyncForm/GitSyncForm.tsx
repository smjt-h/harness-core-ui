import React, { useEffect } from 'react'
import { useStrings } from 'framework/strings'
import { Container, FormInput, SelectOption } from '@harness/uicore'
import cx from 'classnames'
import type { FormikContext } from 'formik'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useParams } from 'react-router'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { defaultTo } from 'lodash-es'
import RepositorySelect from '../RepositorySelect/RepositorySelect'
import RepoBranchSelectV2 from '../RepoBranchSelectV2/RepoBranchSelectV2'

interface GitSyncFormProps<T> {
  formikProps: FormikContext<T>
  defaultValue?: any
  modalErrorHandler?: any
  handleSubmit: () => void
  closeModal?: () => void
}

interface GitSyncFormFields {
  importYaml?: string
  connectorRef?: ConnectorSelectedValue
  repository?: string
  branch?: string
}

const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}

export function GitSyncForm(props: GitSyncFormProps<GitSyncFormFields>): React.ReactElement {
  const { formikProps, defaultValue = { importYaml: 'create' }, modalErrorHandler } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.setFieldValue('importYaml', 'create')
  }, [])

  return (
    <Container padding={{ top: 'large' }} className={cx()}>
      <FormInput.RadioGroup
        name="remoteType"
        radioGroup={{ inline: true }}
        items={[
          { label: 'Use Existing Yaml', value: 'remote', disabled: true },
          { label: 'Create New Yaml', value: 'new' }
        ]}
      />
      <ConnectorReferenceField
        name="connectorRef"
        width={350}
        type={['Github', 'Bitbucket']}
        selected={formikProps.values.connectorRef}
        label={'Select Git Connector'}
        placeholder={getString('select')}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onChange={(value, scope) => {
          // modalErrorHandler?.hide()
          formikProps.setFieldValue('connectorRef', {
            label: defaultTo(value.name, ''),
            value: getConnectorIdentifierWithScope(scope, value?.identifier),
            scope: scope,
            live: value?.status?.status === 'SUCCESS',
            connector: value
          })
          formikProps.setFieldValue?.('repository', '')
        }}
      />

      <RepositorySelect
        key={formikProps.values.connectorRef?.value} // Branch select must be reset if repositoryURL changes
        formikProps={formikProps}
        connectorRef={formikProps.values.connectorRef?.value}
        //modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(repo => repo.value === selected.value)) {
            formikProps.setFieldValue?.('repository', '')
          }
        }}
        selectedValue={formikProps.values.repository}
      />
      <RepoBranchSelectV2
        key={formikProps.values.repository} // Branch select must be reset if repositoryURL changes
        connectorIdentifierRef={formikProps.values.connectorRef?.value}
        repoName={formikProps.values.repository}
        modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(branch => branch.value === selected.value)) {
            formikProps.setFieldValue?.('branch', '')
          }
        }}
        selectedValue={formikProps.values.branch}
      />
      <FormInput.Text name="yamlPath" label={'Yaml Path'} placeholder={'Enter Yaml path'} />
    </Container>
  )
}
