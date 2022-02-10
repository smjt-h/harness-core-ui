/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import { TerraformStoreTypes } from '../TerraformInterfaces'

export const formatInitialValues = (isConfig: boolean, prevStepData: any, isTerraformPlan: boolean) => {
  if (isConfig && isTerraformPlan) {
    return {
      spec: {
        configuration: {
          configFiles: {
            store: {
              spec: {
                repositoryName:
                  prevStepData.formValues?.spec?.configuration?.configFiles?.store.spec?.repositoryName || null,
                artifacts: prevStepData.formValues?.spec?.configuration?.configFiles?.store.spec?.artifacts || []
              }
            }
          }
        }
      }
    }
  }

  if (isConfig) {
    return {
      spec: {
        configuration: {
          configFiles: {
            store: {
              spec: {
                repositoryName:
                  prevStepData.formValues?.spec?.configuration?.spec?.configFiles?.store.spec?.repositoryName || null,
                artifacts: prevStepData.formValues?.spec?.configuration?.spec?.configFiles?.store.spec?.artifacts || []
              }
            }
          }
        }
      }
    }
  }

  return {
    varFile: {
      identifier: prevStepData?.varFile?.identifier || null,
      type: TerraformStoreTypes.Remote,
      spec: {
        store: {
          spec: {
            repositoryName: prevStepData?.varFile?.spec?.store?.spec?.repositoryName || null,
            artifacts: prevStepData?.varFile?.spec?.store?.spec?.artifacts || []
          }
        }
      }
    }
  }
}

export const getConnectorRef = (isConfig: boolean, isTerraformPlan: boolean, prevStepData: any) => {
  if (isConfig && isTerraformPlan) {
    return prevStepData?.formValues.spec?.configuration?.configFiles?.store?.spec?.connectorRef
  }

  if (isConfig) {
    return prevStepData?.formValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
  }

  return prevStepData?.varFile?.spec?.store?.spec?.connectorRef
}

export const terraformArtifactorySchema = (isConfig: boolean, getString: any) => {
  const artifacts = {
    repositoryName: Yup.string().required(getString('common.validation.identifierIsRequired')),
    artifacts: Yup.array().of(
      Yup.object().shape({
        artifactFile: Yup.object().shape({
          artifactPathExpression: Yup.string().required(getString('cd.pathCannotBeEmpty')),
          name: Yup.string().required(getString('cd.pathCannotBeEmpty'))
        })
      })
    )
  }

  const configSetup = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          ...artifacts
        })
      })
    })
  }

  if (isConfig) {
    return Yup.object().shape({
      spec: Yup.object().shape({
        configuration: Yup.object().shape({
          ...configSetup
        })
      })
    })
  }

  return {
    varFile: Yup.object().shape({
      identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
      spec: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            ...artifacts
          })
        })
      })
    })
  }
}

export const tfArtifactoryFormINputNames = (isConfig: boolean) => {
  if (isConfig) {
    return {
      repositoryName: 'spec.configuration.configFiles.store.spec.repositoryName',
      artifacts: 'spec.configuration.configFiles.store.spec.artifacts'
    }
  }

  return {
    repositoryName: 'varFile.spec.store.spec.repositoryName',
    artifacts: 'varFile.spec.store.spec.artifacts'
  }
}

export const formatOnSubmitData = (values: any, prevStepData: any, connectorValue: any) => {
  const payload = {
    ...values,
    connectorRef: connectorValue
  }

  const data = {
    varFile: {
      type: payload.varFile.type,
      identifier: payload.varFile.identifier,
      spec: {
        store: {
          type: payload.connectorRef?.connector?.type || prevStepData?.selectedType,
          spec: {
            ...payload.varFile.spec?.store?.spec,
            connectorRef: payload.connectorRef
          }
        }
      }
    }
  }
  return data
}
