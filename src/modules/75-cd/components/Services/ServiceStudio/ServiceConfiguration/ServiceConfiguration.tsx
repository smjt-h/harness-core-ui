/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { VisualYamlToggle, VisualYamlSelectedView as SelectedView, Container } from '@harness/uicore'
import { cloneDeep, defaultTo, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import produce from 'immer'
import DeployServiceSpecifications from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceSpecifications'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useGetYamlSchema } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

interface ServiceConfigurationProps {
  serviceData: any
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `service.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 194,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function ServiceConfiguration({ serviceData }: ServiceConfigurationProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    state: { pipeline },
    setSelection,
    updatePipeline,
    isReadonly
  } = usePipelineContext()

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()

  const { data: serviceSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Service',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  React.useEffect(() => {
    if (!isEmpty(pipeline.stages)) {
      setSelection({ stageId: pipeline.stages?.[0]?.stage?.identifier })
    }
  }, [pipeline.stages])

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const serviceSetYamlVisual = parse(yaml).service

        if (serviceSetYamlVisual) {
          const newPipelineData = produce({ ...pipeline }, draft => {
            set(
              draft,
              'stages[0].stage.spec.serviceConfig.serviceDefinition',
              cloneDeep(serviceSetYamlVisual.serviceDefinition)
            )
          })
          updatePipeline(newPipelineData)
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, serviceSchema]
  )

  return (
    <>
      <div>
        <VisualYamlToggle
          selectedView={selectedView}
          onChange={nextMode => {
            handleModeSwitch(nextMode)
          }}
          //   disableToggle={!inputSetTemplateYaml}
        />
      </div>
      {selectedView === SelectedView.VISUAL ? (
        <DeployServiceSpecifications />
      ) : (
        <Container>
          <YAMLBuilder
            {...yamlBuilderReadOnlyModeProps}
            existingJSON={serviceData}
            bind={setYamlHandler}
            schema={serviceSchema?.data}
            showSnippetSection={false}
            isEditModeSupported={!isReadonly}
          />
        </Container>
      )}
    </>
  )
}

export default ServiceConfiguration
