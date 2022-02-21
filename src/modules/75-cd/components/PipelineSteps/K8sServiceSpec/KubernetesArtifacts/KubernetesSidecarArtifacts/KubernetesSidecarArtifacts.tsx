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
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { KubernetesArtifactsProps } from '../../K8sServiceSpecInterface'
import { getNonRuntimeFields, isRuntimeMode } from '../../K8sServiceSpecHelper'
import css from '../../K8sServiceSpec.module.scss'

export const KubernetesSidecarArtifacts = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)

  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.Artifacts.Sidecars`}
    >
      {!!props.template?.artifacts?.sidecars?.length && (
        <>
          <Text className={css.inputheader}>{getString('sidecarArtifactText')}</Text>
          {props.template?.artifacts?.sidecars?.map(({ sidecar }, index) => {
            if (!sidecar) {
              return null
            }

            const artifactPath = `sidecars[${index}].sidecar`
            const artifactSource = artifactSourceBaseFactory.getArtifactSource(sidecar.type)

            const artifactDefaultValue = props.artifacts?.sidecars?.find(
              artifactData => artifactData.sidecar?.identifier === sidecar.identifier
            )?.sidecar

            return (
              <div key={sidecar.identifier}>
                <Text className={css.inputheader}>
                  {get(sidecar, 'identifier', '')}
                  {!isEmpty(
                    JSON.parse(
                      getNonRuntimeFields(
                        artifactDefaultValue?.spec,
                        get(props.template, `artifacts.${artifactPath}.spec`)
                      )
                    )
                  ) && (
                    <Tooltip
                      position="top"
                      className={css.artifactInfoTooltip}
                      content={getNonRuntimeFields(
                        artifactDefaultValue?.spec,
                        get(props.template, `artifacts.${artifactPath}.spec`)
                      )}
                    >
                      <Icon name="info" />
                    </Tooltip>
                  )}
                </Text>
                {artifactSource &&
                  artifactSource.renderContent({
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
                    isSidecar: true,
                    artifact: artifactDefaultValue
                  })}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
