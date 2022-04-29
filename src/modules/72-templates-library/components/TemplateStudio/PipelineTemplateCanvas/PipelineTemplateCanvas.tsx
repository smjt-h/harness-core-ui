/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { omit, set } from 'lodash-es'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { TemplatePipelineProvider } from '@pipeline/components/TemplatePipelineContext'
import { sanitize } from '@common/utils/JSONUtils'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DrawerTypes as PipelineDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { DrawerTypes as TemplateDrawerTypes } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'
import { RightDrawer } from '@templates-library/components/TemplateStudio/RightDrawer/RightDrawer'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import { RightBar as PipelineStudioRightBar } from '@pipeline/components/PipelineStudio/RightBar/RightBar'
import { TemplateDrawer } from '@templates-library/components/TemplateDrawer/TemplateDrawer'

export const DefaultNewPipelineName = 'Pipeline Name'
export const DefaultNewPipelineId = 'pipeline_name'

const PIPELINE_TO_TEMPLATE_DRAWER_TYPE_MAP = {
  [PipelineDrawerTypes.PipelineVariables]: TemplateDrawerTypes.TemplateVariables,
  [PipelineDrawerTypes.TemplateInputs]: TemplateDrawerTypes.TemplateInputs
} as const

type EventDetailType = PipelineDrawerTypes.PipelineVariables | PipelineDrawerTypes.TemplateInputs

const PipelineTemplateCanvas = () => {
  const {
    state: {
      templateView: { isDrawerOpened }
    }
  } = React.useContext(TemplateContext)
  const {
    state: { template, isLoading, isUpdated, templateView },
    updateTemplate,
    updateTemplateView,
    isReadonly
  } = React.useContext(TemplateContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()

  const createPipelineFromTemplate = () => ({
    ...template.spec,
    name: DefaultNewPipelineName,
    identifier: DefaultNewPipelineId
  })

  const [pipeline, setPipeline] = React.useState<PipelineInfoConfig>(createPipelineFromTemplate())

  React.useEffect(() => {
    if (!isLoading && !isUpdated) {
      setPipeline(createPipelineFromTemplate())
    }
  }, [isLoading, isUpdated])

  const onUpdatePipeline = async (pipelineConfig: PipelineInfoConfig) => {
    const processNode = omit(pipelineConfig, 'name', 'identifier', 'description', 'tags')
    sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
    set(template, 'spec', processNode)
    await updateTemplate(template)
  }

  useGlobalEventListener('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', event => {
    const adaptedDrawerType = PIPELINE_TO_TEMPLATE_DRAWER_TYPE_MAP[event.detail as EventDetailType]
    if (adaptedDrawerType) {
      updateTemplateView({
        ...templateView,
        isDrawerOpened: true,
        drawerData: { type: adaptedDrawerType }
      })
    }
  })

  if (pipeline) {
    return (
      <TemplatePipelineProvider
        queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
        initialValue={pipeline as PipelineInfoConfig}
        onUpdatePipeline={onUpdatePipeline}
        contextType={PipelineContextType.PipelineTemplate}
        isReadOnly={isReadonly}
      >
        {!isDrawerOpened && <StageBuilder />}
        <PipelineStudioRightBar />
        <TemplateDrawer />
        <RightDrawer />
      </TemplatePipelineProvider>
    )
  } else {
    return <></>
  }
}

export const PipelineTemplateCanvasWithRef = React.forwardRef(PipelineTemplateCanvas)
