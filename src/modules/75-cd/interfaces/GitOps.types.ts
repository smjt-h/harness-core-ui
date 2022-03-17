/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeployServiceProps } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceStep'
import type { DeployEnvironmentProps } from '@cd/components/PipelineSteps/DeployEnvStep/DeployEnvStep'
import type { SimpleServiceProps } from '@cd/components/PipelineSteps/DeployServiceStep/SimpleServiceWidget'
import type { SimpleEnvironmentProps } from '@cd/components/PipelineSteps/DeployEnvStep/SimpleEnvWidget'

export interface GitOpsCustomMicroFrontendProps {
  customComponents: {
    DeployServiceWidget: React.ComponentType<DeployServiceProps>
    DeployEnvironmentWidget: React.ComponentType<DeployEnvironmentProps>
    SimpleServiceWidget: React.ComponentType<SimpleServiceProps>
    SimpleEnvironmentWidget: React.ComponentType<SimpleEnvironmentProps>
  }
}
