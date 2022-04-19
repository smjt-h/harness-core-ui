/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'

import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import type { AllNGVariables } from '@pipeline/utils/types'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import type { UseStringsReturn } from 'framework/strings'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { InputSetErrorResponse } from 'services/pipeline-ng'

function mergeStage(stage: StageElementWrapperConfig, inputSetPortion: NgPipelineTemplate): StageElementWrapperConfig {
  const stageIdToBeMatched = defaultTo(stage.stage?.identifier, '')
  const matchedStageInInputSet = getStageFromPipeline(stageIdToBeMatched, inputSetPortion.pipeline)

  if (matchedStageInInputSet.stage) {
    let updatedStageVars = []
    if (stage?.stage?.variables && matchedStageInInputSet?.stage?.stage?.variables) {
      updatedStageVars = getMergedVariables(
        stage?.stage?.variables as AllNGVariables[],
        matchedStageInInputSet.stage.stage?.variables as AllNGVariables[]
      )
      matchedStageInInputSet.stage.stage.variables = updatedStageVars
    }
    return matchedStageInInputSet.stage
  }

  return stage
}

interface NgPipelineTemplate {
  pipeline: PipelineInfoConfig
}

export const mergeTemplateWithInputSetData = (
  templatePipeline: NgPipelineTemplate,
  inputSetPortion: NgPipelineTemplate
): NgPipelineTemplate => {
  // Replace all the matching stages in parsedTemplate with the stages received in input set portion
  const mergedStages = templatePipeline.pipeline.stages?.map(stage => {
    if (stage.parallel) {
      /*
      This stage is parallel. Now loop over all the children stages, and check if any of them match in input set portion
      We update all the parallel stages with the ones matching in the input set portion
      and then finally return the new 'updatedParallelStages' object
      */
      const updatedParallelStages = stage.parallel.map(parallelStage => mergeStage(parallelStage, inputSetPortion))
      // Finally setting the updatedParallelStages in the original object, so that the 'mergedStages' will have the updated values
      stage.parallel = updatedParallelStages
      return stage
    }

    /*
    This block will be executed if there are no parallel stages.
    Simply loop over the stages and keep matching and replacing
    */
    return mergeStage(stage, inputSetPortion)
  })

  const toBeUpdated = cloneDeep(templatePipeline)
  toBeUpdated.pipeline.stages = mergedStages
  if (inputSetPortion.pipeline?.properties?.ci) {
    if (!toBeUpdated.pipeline.properties) {
      toBeUpdated.pipeline.properties = {}
    }
    toBeUpdated.pipeline.properties.ci = inputSetPortion.pipeline.properties.ci
  }

  /*
  Below portion adds variables to the pipeline.
  If your input sets has variables, use them.

  Eventually in run pipeline form -
  If input sets are selected, we will supply the variables from 'toBeUpdated' pipleine
  This is why 'toBeUpdated' pipeline should have the variables
  */

  if (inputSetPortion.pipeline.variables) {
    // If we have variables saved in input set, pick them and update

    toBeUpdated.pipeline.variables = getMergedVariables(
      toBeUpdated.pipeline.variables as AllNGVariables[],
      inputSetPortion.pipeline.variables as AllNGVariables[]
    ) // inputSetPortion.pipeline.variables
  }

  return toBeUpdated
}

// Used in Input Set form and save as input set call in run pipeline
export const getFormattedErrors = (apiErrorMap?: { [key: string]: InputSetErrorResponse }): Record<string, any> => {
  const toReturn: Record<string, any> = {}
  if (apiErrorMap) {
    const apiErrorKeys = Object.keys(apiErrorMap)
    apiErrorKeys.forEach(apiErrorKey => {
      const errorsForKey = apiErrorMap[apiErrorKey].errors || []
      if (errorsForKey[0].fieldName) {
        toReturn[errorsForKey[0].fieldName] = `${errorsForKey[0].fieldName}: ${errorsForKey[0].message}`
      }
    })
  }
  return toReturn
}

export const getOverlayErrors = (invalidReferences: Record<string, string>): Record<string, any> => {
  const toReturn: Record<string, any> = {}
  if (invalidReferences) {
    Object.keys(invalidReferences).forEach(invalidReferenceKey => {
      toReturn[invalidReferenceKey] = `${invalidReferenceKey}: ${invalidReferences[invalidReferenceKey]}`
    })
  }

  return toReturn
}

export const getMergedVariables = (
  variables: AllNGVariables[],
  inputSetVariables: AllNGVariables[]
): AllNGVariables[] => {
  // create a map of input set variables values for easier lookup
  // we use "name" of the varibale as the key
  const inputSetVariablesMap: Record<string, AllNGVariables> = inputSetVariables.reduce(
    (acc, curr) => ({ ...acc, [defaultTo(curr.name, '')]: curr }),
    {}
  )

  // loop over existing variables and update their values from input sets
  const finalVariables: AllNGVariables[] = variables.map((variable): AllNGVariables => {
    const { name = '', type } = variable

    // if a variable with same name exists in input set variables
    if (name in inputSetVariablesMap) {
      // copy the variable data
      const newVar: AllNGVariables = { ...inputSetVariablesMap[name] }

      // remove the variable from input set variables
      delete inputSetVariablesMap[name]

      return {
        ...variable,
        // use new value if the type of varibale is same else use the current value
        value: newVar.type === type ? newVar.value : variable.value
      } as AllNGVariables
    }

    // else return original varibale
    return variable
  })

  const remainingVariables = Object.values(inputSetVariablesMap)

  // append the remaining input set variables to existing variables
  return finalVariables.concat(...remainingVariables)
}

export const getRbacButtonModules = (module?: string): string[] => {
  const rbacButtonModules = []
  if (module?.includes('cd')) {
    rbacButtonModules.push('cd')
  }
  if (module?.includes('ci')) {
    rbacButtonModules.push('ci')
  }
  return rbacButtonModules
}
/*
  Get features restriction to pass to 'run/ retry' pipeline button based on the modules the pipeline supports
*/
export const getFeaturePropsForRunPipelineButton = ({
  modules,
  getString
}: {
  modules?: string[]
  getString: UseStringsReturn['getString']
}): FeaturesProps | undefined => {
  if (!modules || !modules?.length) {
    return undefined
  }
  const featureIdentifiers: FeatureIdentifier[] = []
  const additionalFeaturesProps: { warningMessage?: string } = {}
  if (modules.includes('cd')) {
    featureIdentifiers.push(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
  }
  if (modules.includes('ci')) {
    featureIdentifiers.push(FeatureIdentifier.BUILDS)
    additionalFeaturesProps.warningMessage = getString('pipeline.featureRestriction.unlimitedBuildsRequiredPlan')
  }
  return {
    featuresRequest: {
      featureNames: featureIdentifiers
    },
    ...additionalFeaturesProps
  }
}

export interface SelectedStageData {
  stageIdentifier?: string
  stagesRequired?: string[]
  stageName?: string
  message?: string
}
export interface StageSelectionData {
  selectedStages: SelectedStageData[]
  allStagesSelected: boolean
  selectedStageItems: SelectOption[]
}

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

export const ALL_STAGE_VALUE = 'all'

export const getAllStageData = (getString: UseStringsReturn['getString']): SelectedStageData => ({
  stageIdentifier: ALL_STAGE_VALUE,
  stagesRequired: [],
  stageName: getString('pipeline.allStages')
})

export const getAllStageItem = (getString: UseStringsReturn['getString']): SelectOption => ({
  label: getString('pipeline.allStages'),
  value: ALL_STAGE_VALUE
})

export function getStageIdentifierFromStageData(selectedStageData: StageSelectionData): string[] {
  return selectedStageData.allStagesSelected
    ? []
    : selectedStageData.selectedStageItems.map(stageData => stageData.value as string)
}
