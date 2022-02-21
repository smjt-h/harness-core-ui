const accountId = 'accountId'
const project = 'project1'
const org = 'default'

export const deploymentActivitySummaryAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-activity-summary?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&pageNumber=0&pageSize=10`
export const deploymentTimeseriesDataWithNodeFilterAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10`
export const healthSourceAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/healthSources?routingId=${accountId}&accountId=${accountId}`
export const nodeNamesFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-node-names?routingId=${accountId}&accountId=${accountId}`
export const transactionsFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-transaction-names?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataWithFilters = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=true&anomalousNodesOnly=true&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10&healthSources=appd_prod%2Fappdtest&transactionNames=%2Ftodolist%2Fregister`
export const strategies = `/ng/api/pipelines/configuration/strategies?routingId=${accountId}`
export const strategiesYamlSnippets = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const variables = `/pipeline/api/pipelines/variables?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const pipelineSteps = `/pipeline/api/pipelines/v2/steps?routingId=${accountId}&accountId=${accountId}`
export const monitoresServices = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=testEnv&serviceIdentifier=*`
export const servicesCall = `/ng/api/servicesV2?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`

export const strategiesResponse = {
  status: 'SUCCESS',
  data: { Kubernetes: ['Rolling', 'BlueGreen', 'Canary', 'Default'], NativeHelm: ['Rolling', 'Default'] },
  metaData: null,
  correlationId: 'b4f7260b-9bed-4a21-a2a5-02c23dd573d8'
}
export const strategiesYamlSnippetsResponse = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  metaData: null,
  correlationId: '8f395970-533d-43ba-a6c1-0d8a8b6019fb'
}

export const variablesPostResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\npipeline:\n  name: "d0XP7wPYS92z7RNPJXBxBQ"\n  identifier: "test"\n  allowStageExecutions: "iAtVkGtNTfuApiM1y4pz7w"\n  projectIdentifier: "cNeuGlV-SxGBenQQnjirmw"\n  orgIdentifier: "GaWiGX3KStWLsidc-pmC2A"\n  description: "aHMFuVqQQXiIJrcyKJ0F1g"\n  tags:\n    __uuid: "ZZzfrY0xRe2TQUxD4zXQcg"\n  stages:\n  - stage:\n      name: "FpiyiPgnRta6m9VKPc6Vbg"\n      identifier: "test"\n      description: "4ohKeTljQ8uoVDK5NZXelA"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "HKHACGfEScK1RcgpU4N7tA"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n              __uuid: "M4d9qLcXRNm38IQl7AynrQ"\n            __uuid: "udO8BaK6RB2L8Ri3I4GfHg"\n          __uuid: "ZnH8Xo_rR3SffIcBRhJeKA"\n        infrastructure:\n          environmentRef: "t989wKT2Tcu10voxjpaLVw"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "K5JSINa9QxmC9OcJFRFD-Q"\n              namespace: "RJnwaHacRL-V4QvMi0A-Gg"\n              releaseName: "jJnmTM44SYuEXn0gfVKUDQ"\n              __uuid: "NDFruwtPQaG2Zfn4TYl-kA"\n            __uuid: "KAU4ecz2QQyqH9BmZhs0jw"\n          allowSimultaneousDeployments: "ZMT--U0oQEGNm2NmRKX4vg"\n          __uuid: "0Luzc_eKRWGURvqYH46WKw"\n        execution:\n          steps: []\n          rollbackSteps: []\n          __uuid: "UM7Uj0OdS5anWwnRkkJeFQ"\n        __uuid: "BpxR-OwMSQKPmeUj7CUgPQ"\n      tags:\n        __uuid: "WVfC96NfQqSLMMiuDrFvGg"\n      failureStrategies:\n      - onFailure:\n          errors: "NQoDZc7_QlOxvVYZtM_9zg"\n          action:\n            type: "StageRollback"\n            __uuid: "XOTP_IvkT9mrjNx2B_9spw"\n          __uuid: "UDGod4TVQLS_qVtVzirmhg"\n        __uuid: "LnqpJ5NoRYat8rERBHJQDA"\n      __uuid: "akWnlMAwRYWWIPuZifTxTQ"\n    __uuid: "gDAS3m1MTxqm07sAeILKpw"\n  __uuid: "f0614r79QC2FN73Ttzne8w"\n__uuid: "z6jIOZP5SRq_q3QNreHGAA"\n',
    metadataMap: {
      d0XP7wPYS92z7RNPJXBxBQ: {
        yamlProperties: {
          fqn: 'pipeline.name',
          localName: 'pipeline.name'
        },
        yamlOutputProperties: null
      },
      f0614r79QC2FN73Ttzne8w: {
        yamlProperties: {
          fqn: 'pipeline',
          localName: 'pipeline'
        },
        yamlOutputProperties: null
      },
      aHMFuVqQQXiIJrcyKJ0F1g: {
        yamlProperties: {
          fqn: 'pipeline.description',
          localName: 'pipeline.description'
        },
        yamlOutputProperties: null
      },
      akWnlMAwRYWWIPuZifTxTQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test',
          localName: 'stage'
        },
        yamlOutputProperties: null
      },
      FpiyiPgnRta6m9VKPc6Vbg: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.name',
          localName: 'stage.name'
        },
        yamlOutputProperties: null
      },
      '0Luzc_eKRWGURvqYH46WKw': {
        yamlProperties: {
          fqn: 'infrastructure',
          localName: ''
        },
        yamlOutputProperties: null
      },
      'RJnwaHacRL-V4QvMi0A-Gg': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.namespace',
          localName: 'infrastructure.infrastructureDefinition.spec.namespace'
        },
        yamlOutputProperties: null
      },
      HKHACGfEScK1RcgpU4N7tA: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.serviceConfig.serviceRef',
          localName: 'serviceConfig.serviceRef'
        },
        yamlOutputProperties: null
      },
      'K5JSINa9QxmC9OcJFRFD-Q': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.connectorRef',
          localName: 'infrastructure.infrastructureDefinition.spec.connectorRef'
        },
        yamlOutputProperties: null
      },
      '4ohKeTljQ8uoVDK5NZXelA': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.description',
          localName: 'stage.description'
        },
        yamlOutputProperties: null
      },
      ZnH8Xo_rR3SffIcBRhJeKA: {
        yamlProperties: {
          fqn: 'serviceConfig',
          localName: ''
        },
        yamlOutputProperties: null
      },
      t989wKT2Tcu10voxjpaLVw: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.environmentRef',
          localName: 'infrastructure.environmentRef'
        },
        yamlOutputProperties: null
      },
      jJnmTM44SYuEXn0gfVKUDQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.releaseName',
          localName: 'infrastructure.infrastructureDefinition.spec.releaseName'
        },
        yamlOutputProperties: null
      }
    },
    errorResponses: null,
    serviceExpressionPropertiesList: []
  },
  metaData: null,
  correlationId: 'fa70b7e0-bee4-404c-82b5-9eb09759fb0d'
}

export const pipelineStepsResponse = {
  status: 'SUCCESS',
  data: {
    name: 'Library',
    stepsData: [],
    stepCategories: [
      {
        name: 'Continuous Deployment',
        stepsData: [],
        stepCategories: [
          {
            name: 'Kubernetes',
            stepsData: [
              {
                name: 'BG Swap Services',
                type: 'K8sBGSwapServices',
                disabled: false,
                featureRestrictionName: 'K8S_BG_SWAP_SERVICES'
              },
              {
                name: 'Stage Deployment',
                type: 'K8sBlueGreenDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_BLUE_GREEN_DEPLOY'
              },
              { name: 'Apply', type: 'K8sApply', disabled: false, featureRestrictionName: 'K8S_APPLY' },
              { name: 'Delete', type: 'K8sDelete', disabled: false, featureRestrictionName: 'K8S_DELETE' },
              {
                name: 'Canary Delete',
                type: 'K8sCanaryDelete',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DELETE'
              },
              {
                name: 'Rolling Deployment',
                type: 'K8sRollingDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_DEPLOY'
              },
              {
                name: 'Canary Deployment',
                type: 'K8sCanaryDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DEPLOY'
              },
              { name: 'Scale', type: 'K8sScale', disabled: false, featureRestrictionName: 'K8S_SCALE' },
              {
                name: 'Rolling Rollback',
                type: 'K8sRollingRollback',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_ROLLBACK'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Terraform',
            stepsData: [
              {
                name: 'Terraform Destroy',
                type: 'TerraformDestroy',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_DESTROY'
              },
              {
                name: 'Terraform Rollback',
                type: 'TerraformRollback',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_ROLLBACK'
              },
              {
                name: 'Terraform Apply',
                type: 'TerraformApply',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_APPLY'
              },
              {
                name: 'Terraform Plan',
                type: 'TerraformPlan',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_PLAN'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Utilities',
            stepsData: [],
            stepCategories: [
              {
                name: 'Scripted',
                stepsData: [
                  { name: 'Shell Script', type: 'ShellScript', disabled: false, featureRestrictionName: null }
                ],
                stepCategories: []
              },
              {
                name: 'Non-Scripted',
                stepsData: [{ name: 'Http', type: 'Http', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          },
          {
            name: 'Approval',
            stepsData: [
              {
                name: 'Harness Approval',
                type: 'HarnessApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_HARNESS_UI'
              },
              {
                name: 'Jira Approval',
                type: 'JiraApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Jira',
            stepsData: [
              {
                name: 'Jira Create',
                type: 'JiraCreate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              },
              {
                name: 'Jira Update',
                type: 'JiraUpdate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'FlowControl',
            stepsData: [],
            stepCategories: [
              {
                name: 'Barrier',
                stepsData: [{ name: 'Barrier', type: 'Barrier', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          }
        ]
      },
      {
        name: 'Continuous Verification',
        stepsData: [],
        stepCategories: [
          {
            name: 'Continuous Verification',
            stepsData: [{ name: 'Verify', type: 'Verify', disabled: false, featureRestrictionName: null }],
            stepCategories: []
          }
        ]
      }
    ]
  },
  metaData: null,
  correlationId: '8f5b8513-dc74-4bf7-a36c-228fe7e3c4c4'
}

export const monitoresServicesResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641552686531,
    lastModifiedAt: 1642054520322,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'shaswat',
      identifier: 'appd_prod',
      name: 'appd_prod',
      type: 'Application',
      description: '',
      serviceRef: 'appd',
      environmentRef: 'prod',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'appd-test',
            identifier: 'appdtest',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'appdtest',
              feature: 'Application Monitoring',
              applicationName: 'cv-app',
              tierName: '1415279',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              metricDefinitions: []
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'd986946a-3521-4648-a787-53150e21aed7'
}
