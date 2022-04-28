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
  ModuleContinue = 'Purpose Continue clicked',
  CDModuleContinue = 'CD Welcome Page Continue Clicked',
  CDCGModuleSelected = 'CD Current Gen Continue Clicked'
}

export enum TrialActions {
  StartTrialClick = 'Start a trial clicked',
  TrialModalPipelineSetupSubmit = 'Trial modal pipeline setup submited',
  TrialModalPipelineSetupCancel = 'Trial modal pipeline setup canceled'
}

export enum PlanActions {
  StartFreeClick = 'Start a free plan clicked'
}

export enum StageActions {
  SelectStage = 'Select a Stage',
  SetupStage = 'Setup Stage',
  DeleteStage = 'Delete Stage',
  LoadSelectStageTypeView = 'Select Stage Type View loaded',
  LoadEditStageView = 'Edit Stage View loaded',
  LoadCreateOrSelectConnectorView = 'Create or Select a Connector View loaded',
  ApplySelectedConnector = 'Apply Selected Connector',
  CancelSelectConnector = 'Cancel Select Connector',
  LoadSelectConnectorTypeView = 'Select Connector Type View loaded',
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
  SaveCreateDelegate = 'Save Create Delegate',
  SelectDelegateType = 'Select Delegate Type',
  SetupDelegate = 'Set up Delegate',
  SetupDelegateBack = 'Set up Delegate Back',
  VerificationBack = 'Verification Back',
  DownloadYAML = 'Download YAML File',
  LoadCreateTokenModal = 'Load Create Token Modal',
  SaveCreateToken = 'Save Create Token',
  CloseCreateToken = 'Close Create Token',
  ReviewScriptContinue = 'Review Script Continue',
  ReviewScriptBack = 'Review Script Back'
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
  ENVIRONMENT = 'Environment',
  CONTACT_SALES = 'ContactSales',
  LICENSE = 'License',
  FEEDBACK = 'Feedback',
  ENFORCEMENT = 'Enforcement'
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
  OpenCreateProjectModal = 'Create Project modal loaded',
  SaveCreateProject = 'Create project saved',
  LoadInviteCollaborators = 'Invite Collaborators loaded',
  SaveInviteCollaborators = 'Invite Collaborators saved',
  ClickBackToProject = 'Back to Project clicked',
  LoadSelectOrCreateProjectModal = 'Select Or Create Project Modal loaded',
  ClickSelectProject = 'Select Project from Project Selector clicked'
}

export enum ExitModalActions {
  ExitByCancel = 'Exit By Cancel',
  ExitByClose = 'Exit By Close',
  ExitByClick = 'Exit By Click Outside'
}

export enum EnvironmentActions {
  StartCreateEnvironment = 'Create Environment loaded',
  SaveCreateEnvironment = 'Save Create Environment saved'
}

export enum ContactSalesActions {
  LoadContactSales = 'Contact Sales loaded',
  SubmitContactSales = 'Contact Sales submitted'
}

export enum FeedbackActions {
  LoadFeedback = 'Feedback loaded',
  SubmitFeedback = 'Feedback submitted'
}

export enum LicenseActions {
  ExtendTrial = 'Extend Trial',
  LoadExtendedTrial = 'Extended Trial loaded'
}

export enum FeatureActions {
  DismissFeatureBanner = 'Feature Banner dismissed'
}
