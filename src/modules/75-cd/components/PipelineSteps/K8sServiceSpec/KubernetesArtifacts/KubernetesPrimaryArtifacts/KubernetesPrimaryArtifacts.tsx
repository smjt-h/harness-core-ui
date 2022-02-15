/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { Icon, Text } from '@harness/uicore'
import { Tooltip } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { KubernetesArtifactsProps } from '../../K8sServiceSpecInterface'
import { getNonRuntimeFields } from '../../K8sServiceSpecHelper'
import css from '../../K8sServiceSpec.module.scss'

export const KubernetesPrimaryArtifacts = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = props.stepViewType === StepViewType.InputSet || props.stepViewType === StepViewType.DeploymentForm
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)
  const artifactSource = props.type && artifactSourceBaseFactory.getArtifactSource(props.type)
  const artifact = props.artifacts?.primary
  const artifactPath = 'primary'

  return artifactSource ? (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Artifacts`}>
      <div className={css.subheading}>
        {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
      </div>
      <div className={cx(css.nestedAccordions, css.artifactsAccordion)}>
        <Text className={css.inputheader}>
          {getString('primaryArtifactText')}
          {!isEmpty(
            JSON.parse(
              getNonRuntimeFields(get(props.artifacts, `primary.spec`), get(props.template, 'artifacts.primary.spec'))
            )
          ) && (
            <Tooltip
              position="top"
              className={css.artifactInfoTooltip}
              content={getNonRuntimeFields(
                get(props.artifacts, `primary.spec`),
                get(props.template, 'artifacts.primary.spec')
              )}
            >
              <Icon name="info" />
            </Tooltip>
          )}
        </Text>
        {artifactSource.renderContent({
          ...props,
          isArtifactsRuntime,
          isPrimaryArtifactsRuntime,
          isSidecarRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          artifactPath,
          artifact
        })}
      </div>
    </div>
  ) : null
}
