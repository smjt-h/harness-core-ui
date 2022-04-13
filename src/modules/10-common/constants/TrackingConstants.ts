/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum PageNames {
  Purpose = 'Purpose page',
  TrialInProgress = 'Trial in progress page',
  TrialSetupPipelineModal = 'Trial setup pipeline modal'
}

export enum PurposeActions {
  ModuleContinue = 'Purpose Continue click',
  CDModuleContinue = 'CD Welcome Page Continue Clicked',
  CDCGModuleSelected = 'CD Current Gen Continue Clicked'
}

export enum TrialActions {
  StartTrialClick = 'Start a trial click',
  TrialModalPipelineSetupSubmit = 'Trial modal pipeline setup submit',
  TrialModalPipelineSetupCancel = 'Trial modal pipeline setup cancel'
}

export enum PlanActions {
  StartFreeClick = 'Start a free plan click'
}

export enum StageActions {
  SelectStage = 'Select a Stage',
  SetupStage = 'Setup Stage',
  DeleteStage = 'Delete Stage',
  LoadSelectStageTypeView = 'Load Select Stage Type View',
  LoadEditStageView = 'Load Edit Stage View',
  LoadCreateOrSelectConnectorView = 'Load Create or Select a Connector View',
  ApplySelectedConnector = 'Apply Selected Connector',
  CancelSelectConnector = 'Cancel Select Connector',
  LoadSelectConnectorTypeView = 'Load Select Connector Type View',
  SelectConnectorType = 'Select Connector Type'
}

export enum SecretActions {
  StartCreateSecret = 'Start Create Secret',
  SaveCreateSecret = 'Save Create Secret'
}

export enum ConnectorActions {
  StartCreateConnector = 'Start Create Connector',
  SaveCreateConnector = 'Save Create Connector'
}

export enum DelegateActions {
  StartCreateDelegate = 'Start Create Delegate',
  SaveCreateDelegate = 'Save Create Delegate'
}

export enum StepActions {
  SelectStep = 'Select a Step',
  AddEditStep = 'Add/Edit Step',
  AddEditStepGroup = 'Add/Edit Step Group',
  DeleteStep = 'Delete Step',
  AddEditFailureStrategy = 'Add/Edit Failure strategy'
}

export enum PipelineActions {
  StartedExecution = 'Started Pipeline Execution',
  // CompletedExecution = 'Completed Pipeline Execution', // this is done from BE
  StartedPipelineCreation = 'Started Pipeline Creation',
  PipelineCreatedViaVisual = 'Save a pipeline using Visual Mode',
  PipelineCreatedViaYAML = 'Save a pipeline using YAML editor',
  PipelineUpdatedViaVisual = 'Update a pipeline using Visual Mode',
  PipelineUpdatedViaYAML = 'Update a pipeline using YAML editor',
  SetupLater = 'Click Setup later',
  LoadCreateNewPipeline = 'Load Create new Pipeline',
  CancelCreateNewPipeline = 'Cancel Create new Pipeline',
  LoadSelectOrCreatePipeline = 'Load Select or Create Pipeline',
  SelectAPipeline = 'Select a Pipeline',
  CreateAPipeline = 'Create a Pipeline'
}

export enum NavigatedToPage {
  DeploymentsPage = 'Navigates to Deployments/Builds page',
  PipelinesPage = 'Navigates to Pipelines page',
  PipelineStudio = 'Navigates to Pipline Studio',
  PipelineInputSet = 'Navigates to Pipline Input Set',
  PipelineTriggers = 'Navigates to Pipline Triggers',
  PipelineExecutionHistory = 'Navigates to Pipline Execution History'
}

export enum Category {
  SIGNUP = 'Signup',
  PROJECT = 'Project',
  PIPELINE = 'Pipeline',
  STAGE = 'Stage',
  SECRET = 'Secret',
  CONNECTOR = 'Connector',
  DELEGATE = 'Delegate',
  ENVIRONMENT = 'Environment'
}

export enum ManifestActions {
  SaveManifestOnPipelinePage = 'Save Manifest on Pipeline Page',
  UpdateManifestOnPipelinePage = 'Update Manifest on Pipeline Page'
}

export enum ArtifactActions {
  SavePrimaryArtifactOnPipelinePage = 'Save Primary Artifact on Pipeline Page',
  UpdatePrimaryArtifactOnPipelinePage = 'Update Primary Artifact on Pipeline Page',
  SaveSidecarArtifactOnPipelinePage = 'Save Sidecar Artifact on Pipeline Page',
  UpdateSidecarArtifactOnPipelinePage = 'Update Sidecar Artifact on Pipeline Page'
}

export enum ProjectActions {
  OpenCreateProjectModal = 'Open Create Project modal',
  SaveCreateProject = 'Save Create project',
  LoadInviteCollaborators = 'Load Invite Collaborators',
  SaveInviteCollaborators = 'Save Invite Collaborators',
  ClickBackToProject = 'Click Back to Project',
  LoadSelectOrCreateProjectModal = 'Load Select Or Create Project Modal',
  ClickSelectProject = 'Select Project from Project Selector'
}

export enum ExitModalActions {
  ExitByCancel = 'ExitByCancel',
  ExitByClose = 'ExitByClose',
  ExitByClick = 'ExitByClick'
}

export enum EnvironmentActions {
  StartCreateEnvironment = 'Start Create Environment',
  SaveCreateEnvironment = 'Save Create Environment'
}
