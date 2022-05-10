/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
export const DEFAULT_ORG_ID = 'default'

export const DEFAULT_PROJECT_NAME = 'Default Project'

export const DEFAULT_PROJECT_ID = 'Default_Project_'.concat(new Date().getTime().toString())

export const DEFAULT_ORG_NAME = 'Default_Org'

export const UNIQUE_ORG_ID = 'Default_Org_'.concat(new Date().getTime().toString())

export const DEFAULT_PIPELINE_NAME = 'Default Pipeline'

export const DEFAULT_PIPELINE_ID = 'Default_Pipeline_'.concat(new Date().getTime().toString())

export const DEFAULT_STAGE_ID = 'Build'

export const ACCOUNT_SCOPE_PREFIX = 'account.'

const KUBERNETES_INFRA_REF = 'Harness_Kubernetes_Cluster'

const DOCKER_REGISTRY_CTR_REF = 'harnessImage'

export const DEFAULT_ACCESS_TOKEN = 'Default_Access_Token'

export const DEFAULT_HARNESS_KMS = 'harnessSecretManager'

export const DEFAULT_SCM_CONNECTOR = 'Default SCM Connector'

export const DEFAULT_SCM_CONNECTOR_ID = 'Default_SCM_Connector'.concat(new Date().getTime().toString())

export const DEFAULT_PIPELINE_PAYLOAD = {
  pipeline: {
    name: '',
    identifier: DEFAULT_PIPELINE_ID,
    projectIdentifier: '',
    orgIdentifier: '',
    properties: {
      ci: {
        codebase: {
          connectorRef: 'connectorRef',
          repoName: '',
          build: '<+input>'
        }
      }
    },
    stages: [
      {
        stage: {
          name: DEFAULT_STAGE_ID,
          identifier: DEFAULT_STAGE_ID,
          type: 'CI',
          spec: {
            cloneCodebase: true,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: ACCOUNT_SCOPE_PREFIX.concat(KUBERNETES_INFRA_REF),
                namespace: '<+input>' // not sure
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'Echo Welcome Message',
                    identifier: 'Run',
                    spec: {
                      connectorRef: ACCOUNT_SCOPE_PREFIX.concat(DOCKER_REGISTRY_CTR_REF),
                      image: 'alpine',
                      shell: 'Sh',
                      command: 'echo "Welcome to Harness CI" '
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}

export enum Status {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  FAILURE = 'FAILURE'
}
