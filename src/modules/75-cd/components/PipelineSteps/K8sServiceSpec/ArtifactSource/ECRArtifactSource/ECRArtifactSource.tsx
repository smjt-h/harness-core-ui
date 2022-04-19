/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'

import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { SidecarArtifact, useGetBuildDetailsForEcrWithYaml } from 'services/cd-ng'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { shouldFetchTagsSource } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getImagePath,
  getYamlData,
  isArtifactSourceRuntime,
  isFieldfromTriggerTabDisabled,
  resetTags
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../K8sServiceSpec.module.scss'

interface ECRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const Content = (props: ECRRenderContent): JSX.Element => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    pipelineIdentifier,
    branch,
    stageIdentifier,
    isTagsSelectionDisabled,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath
  } = props

  const { getString } = useStrings()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { expressions } = useVariablesExpression()
  const [lastQueryData, setLastQueryData] = React.useState<{ imagePath: string; region: any }>({
    imagePath: '',
    region: ''
  })
  const {
    data: ecrTagsData,
    loading: fetchingTags,
    refetch,
    error: fetchTagsError
  } = useMutateAsGet(useGetBuildDetailsForEcrWithYaml, {
    body: yamlStringify(getYamlData(formik?.values)),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      imagePath: getImagePath(
        artifact?.spec?.imagePath,
        get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
      ),
      connectorRef:
        getMultiTypeFromValue(artifact?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.connectorRef
          : get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, ''),
      region:
        getMultiTypeFromValue(artifact?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.region
          : get(initialValues?.artifacts, `${artifactPath}.spec.region`, ''),
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      fqnPath: isPropagatedStage
        ? `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.${artifactPath}.spec.tag`
        : `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.${artifactPath}.spec.tag`
    },
    lazy: true
  })

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const regions = defaultTo(regionData?.resource, []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const imagePathValue = getImagePath(
    artifact?.spec?.imagePath,
    get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
  )
  const connectorRefValue =
    get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '') || artifact?.spec?.connectorRef
  const regionValue = get(initialValues, `artifacts.${artifactPath}.spec.region`, '') || artifact?.spec?.region
  const fetchTags = (): void => {
    if (canFetchTags()) {
      setLastQueryData({ imagePath: imagePathValue, region: regionValue })
      refetch()
    }
  }

  const canFetchTags = (): boolean => {
    return !!(
      (lastQueryData.imagePath !== imagePathValue || lastQueryData.region !== regionValue) &&
      shouldFetchTagsSource(connectorRefValue, [imagePathValue, regionValue])
    )
  }

  const isFieldDisabled = (fieldName: string, isTag = false): boolean => {
    /* instanbul ignore else */
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    if (isTag) {
      return isTagsSelectionDisabled(props)
    }
    return false
  }
  const isRuntime = isArtifactSourceRuntime(isPrimaryArtifactsRuntime, isSidecarRuntime, isSidecar as boolean)

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template) && (
            <FormMultiTypeConnectorField
              name={`${path}.artifacts.${artifactPath}.spec.connectorRef`}
              label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
              selected={get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')}
              placeholder={''}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <ExperimentalInput
              formik={formik}
              multiTypeInputProps={{
                onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                selectProps: {
                  usePortal: true,
                  addClearBtn: !readonly,
                  items: regions
                },
                expressions,
                allowableTypes
              }}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.region`)}
              selectItems={regions}
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.imagePath`, template) && (
            <FormInput.MultiTextInput
              label={getString('pipeline.imagePathLabel')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.imagePath`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.imagePath`}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <FormInput.MultiTextInput
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={fetchingTags}
              buildDetailsList={ecrTagsData?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTags}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class ECRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Ecr
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isImagePathPresent = getImagePath(
      artifact?.spec?.imagePath,
      get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
    )
    const isConnectorPresent =
      getMultiTypeFromValue(artifact?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.connectorRef
        : get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    const isRegionPresent =
      getMultiTypeFromValue(artifact?.spec?.region) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.region
        : get(initialValues, `artifacts.${artifactPath}.spec.region`, '')
    return !(isImagePathPresent && isConnectorPresent && isRegionPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
