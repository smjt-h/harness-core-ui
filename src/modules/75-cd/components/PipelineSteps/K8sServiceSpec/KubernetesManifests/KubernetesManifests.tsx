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
import manifestSourceBaseFactory from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ManifestConfig } from 'services/cd-ng'
import type { KubernetesManifestsProps } from '../K8sServiceSpecInterface'
import { getNonRuntimeFields, isRuntimeMode } from '../K8sServiceSpecHelper'
import css from './KubernetesManifests.module.scss'

export function KubernetesManifests(props: KubernetesManifestsProps): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isManifestsRuntime = runtimeMode && !!get(props.template, 'manifests', false)
  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Manifests`}>
      {!props.fromTrigger && (
        <div className={css.subheading}>
          {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        </div>
      )}
      {props.template.manifests?.map(({ manifest }, index) => {
        if (!manifest || !props.manifests?.length) {
          return null
        }

        const manifestPath = `manifests[${index}].manifest`
        const manifestSource = manifestSourceBaseFactory.getManifestSource(manifest.type)
        const manifestDefaultValue = props.manifests.find(
          manifestData => manifestData?.manifest?.identifier === manifest.identifier
        )?.manifest as ManifestConfig

        return (
          <div key={manifest.identifier}>
            <Text className={css.inputheader} margin={{ top: 'medium', bottom: 'small' }}>
              {!props.fromTrigger && get(manifest, 'identifier', '')}
              {!isEmpty(
                JSON.parse(getNonRuntimeFields(manifestDefaultValue?.spec, get(props.template, `${manifestPath}.spec`)))
              ) && (
                <Tooltip
                  position="top"
                  className={css.manifestInfoTooltip}
                  content={getNonRuntimeFields(manifestDefaultValue?.spec, get(props.template, `${manifestPath}.spec`))}
                >
                  <Icon name="info" />
                </Tooltip>
              )}
            </Text>
            {manifestSource &&
              manifestSource.renderContent({
                ...props,
                isManifestsRuntime,
                projectIdentifier,
                orgIdentifier,
                accountId,
                pipelineIdentifier,
                repoIdentifier,
                branch,
                manifestPath,
                manifest: manifestDefaultValue
              })}
          </div>
        )
      })}
    </div>
  )
}
