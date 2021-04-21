import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { PipelineStages, PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { StageTypes } from '@pipeline/components/PipelineStudio/Stages/StageTypes'

export const getCFPipelineStages: (
  args: Omit<PipelineStagesProps, 'children'>,
  getString: UseStringsReturn['getString'],
  isCIEnabled?: boolean,
  isCDEnabled?: boolean,
  isCFEnabled?: boolean
) => React.ReactElement<PipelineStagesProps> = (
  args,
  getString,
  isCIEnabled = false,
  isCDEnabled = false,
  isCFEnabled = false
) => {
  return (
    <PipelineStages {...args}>
      {stagesCollection.getStage(StageTypes.FEATURE, isCFEnabled, getString)}
      {stagesCollection.getStage(StageTypes.DEPLOY, isCDEnabled, getString)}
      {stagesCollection.getStage(StageTypes.BUILD, isCIEnabled, getString)}
      {stagesCollection.getStage(StageTypes.PIPELINE, false, getString)}
      {stagesCollection.getStage(StageTypes.APPROVAL, false, getString)}
      {stagesCollection.getStage(StageTypes.CUSTOM, false, getString)}
    </PipelineStages>
  )
}
