export const getYaml = () => `
pipeline:
    name: Pipeline 1
    identifier: Pipeline_1
    allowStageExecutions: false
    projectIdentifier: Chetan_Non_Git_Sync
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
            name: Stage 1
            identifier: Stage_1
            description: ""
            type: Deployment
            spec:
                serviceConfig:
                    serviceRef: Service_1
                    serviceDefinition:
                        type: ServerlessAwsLambda
                        spec:
                            variables: []
                            manifests:
                                - manifest:
                                        identifier: vv
                                        type: ServerlessAwsLambda
                                        spec:
                                            store:
                                                type: Git
                                                spec:
                                                    connectorRef: Git_Sync_Chetan_Git_Conn
                                                    gitFetchType: Branch
                                                    paths:
                                                        - test2
                                                    branch: main
                            artifacts:
                                primary:
                                    spec:
                                        connectorRef: <+input>
                                        artifactDirectory: <+input>
                                        artifactPath: <+input>
                                        repository: <+input>
                                        repositoryFormat: generic
                                    type: ArtifactoryRegistry
                infrastructure:
                    environmentRef: Env_1
                    infrastructureDefinition:
                        type: ServerlessAwsLambda
                        spec:
                            connectorRef: account.aws_connector
                            stage: stage1
                            region: region1
                    allowSimultaneousDeployments: false
                execution:
                    steps:
                        - step:
                                type: ServerlessAwsLambdaDeploy
                                name: Serverless Lambda Step 1
                                identifier: Serverless_Lambda_Step_1
                                spec:
                                    commandOptions: ""
                                timeout: 10m
                    rollbackSteps:
                        - step:
                                name: Rollback Rollout Deployment
                                identifier: rollbackRolloutDeployment
                                type: K8sRollingRollback
                                timeout: 10m
                                spec: {}
                serviceDependencies: []
            tags: {}
            failureStrategies:
                - onFailure:
                        errors:
                            - AllErrors
                        action:
                            type: StageRollback
    `
