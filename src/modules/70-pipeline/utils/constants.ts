/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { IconName } from '@harness/uicore'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export const EXPRESSION_STRING = '<+expression>' // TODO: this needs to be exported from uicore for best use.

export enum CardVariant {
  Default = 'Default',
  Minimal = 'Minimal',
  MinimalWithActions = 'MinimalWithActions'
}

export const ConnectorRefWidth = {
  DeploymentFormView: 320,
  DeploymentForm: 320, // matches StepViewType key for getConnectorRefWidth function
  InputSetView: 310,
  DefaultView: 385,
  EditStageView: 366,
  EditStageViewInputSet: 308,
  RightBarView: 460
}

export const connectorTypes: { [key: string]: ConnectorInfoDTO['type'] } = {
  Aws: 'Aws',
  Gcp: 'Gcp'
}
export const stageTypeToIconMap: Record<string, IconName> = {
  Deployment: 'cd-main',
  CI: 'ci-main',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom',
  Approval: 'approval-stage-icon',
  FeatureFlag: 'cf-main'
}

export const getConnectorRefWidth = (viewType: StepViewType): number =>
  Object.entries(ConnectorRefWidth).find(key => key[0] === viewType)?.[1] || ConnectorRefWidth.DefaultView
