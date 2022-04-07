/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'

export interface InfraProvisioningWizardProps {
  lastConfiguredWizardStepId?: InfraProvisiongWizardStepId
  stepMetaData?: Map<string, Record<string, any>>
}

export const enum Hosting {
  SaaS = 'SAAS',
  OnPrem = 'ON_PREM'
}

export const enum BuildLocation {
  HostedByHarness = 'HOSTED_BY_HARNESS',
  Kubernetes = 'KUBERNETES',
  AWS = 'AWS',
  DockerRunner = 'DOCKER_RUNNER'
}

export interface BuildLocationDetails {
  icon: IconName
  location: BuildLocation
  label: keyof StringsMap
  details: keyof StringsMap
  approxETAInMins: number
  disabled?: boolean
}

export interface WizardStep {
  stepRender: React.ReactElement
  onClickNext?: () => void
  onClickBack?: () => void
  stepFooterLabel?: keyof StringsMap
}

export interface SelectBuildLocationProps {
  selectedBuildLocation: BuildLocationDetails
}
export const HostedByHarnessBuildLocation: BuildLocationDetails = {
  icon: 'harness',
  location: BuildLocation.HostedByHarness,
  label: 'ci.getStartedWithCI.hostedByHarness',
  details: 'ci.getStartedWithCI.hostedByHarnessBuildLocation',
  approxETAInMins: 2
}

export const AllBuildLocations: BuildLocationDetails[] = [
  HostedByHarnessBuildLocation,
  {
    icon: 'app-kubernetes',
    location: BuildLocation.Kubernetes,
    label: 'kubernetesText',
    details: 'ci.getStartedWithCI.k8sBuildLocation',
    approxETAInMins: 12
  },
  {
    icon: 'service-aws',
    location: BuildLocation.AWS,
    label: 'common.aws',
    details: 'ci.getStartedWithCI.awsBuildLocation',
    approxETAInMins: 15
  },
  {
    icon: 'docker-step',
    location: BuildLocation.DockerRunner,
    label: 'ci.getStartedWithCI.dockerRunner',
    details: 'ci.getStartedWithCI.dockerRunnerBuildLocation',
    approxETAInMins: 2,
    disabled: true
  }
]

export enum InfraProvisiongWizardStepId {
  SelectBuildLocation = 'SELECT_BUILD_LOCATION',
  SelectVCSVendor = 'SELECT_VCS_VENDOR',
  SelectCodeRepo = 'SELECT_CODE_REPO'
}

// TODO Need to use exported StepStatus from uicore -> MultiStepProgressIndicator component
export enum StepStatus {
  ToDo = 'TODO',
  InProgress = 'INPROGRESS',
  Failed = 'FAILED',
  Success = 'SUCCESS'
}
