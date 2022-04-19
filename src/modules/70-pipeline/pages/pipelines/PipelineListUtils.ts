/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'

export const getStatusColor = (data: PMSPipelineSummaryResponse): string => {
  switch (data.executionSummaryInfo?.lastExecutionStatus) {
    case 'Success':
      return Color.GREEN_800
    case 'Failed':
      return Color.RED_800
    case 'Running':
      return Color.BLUE_800
    default:
      return Color.GREEN_800
  }
}

interface IconProps {
  icon: IconName
  size: number
}

export const getIconsForPipeline = (data: PMSPipelineSummaryResponse): IconProps[] => {
  const icons: IconProps[] = []
  if (data.modules?.includes('cd')) {
    icons.push({ icon: 'cd-main', size: 16 })
  }
  if (data.modules?.includes('ci')) {
    icons.push({ icon: 'ci-main', size: 16 })
  }
  if (data.modules?.includes('cv')) {
    icons.push({ icon: 'cv-main', size: 16 })
  }
  return icons
}

export const deploymentTypeLabel: Record<ServiceDefinition['type'], StringKeys> = {
  Kubernetes: 'kubernetesText',
  NativeHelm: 'pipeline.nativeHelm',
  Ssh: 'SSH',
  WinRm: 'pipeline.serviceDeploymentTypes.winrm'
}
