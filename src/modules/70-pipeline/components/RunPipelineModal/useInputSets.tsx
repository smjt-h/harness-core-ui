import type { GetDataError } from 'restful-react'
import { parse } from 'yaml'
import { defaultTo, memoize } from 'lodash-es'

import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import {
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  useGetInputSetForPipeline
} from 'services/pipeline-ng'
import type { Failure, PipelineInfoConfig } from 'services/cd-ng'
import { getStageIdentifierFromStageData, StageSelectionData } from '@pipeline/utils/runPipelineUtils'

import type { InputSetValue } from '../InputSetSelector/utils'

const memoizedParse = memoize(parse)

export interface Pipeline {
  pipeline?: PipelineInfoConfig
}

export interface UseInputSetsProps {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier: string
  pipelineExecutionId?: string
  branch?: string
  repoIdentifier?: string
  inputSetSelected?: InputSetValue[]
  rerunInputSetYaml?: string
  selectedStageData: StageSelectionData
}

export interface UseInputSetsReturn {
  inputSet: Pipeline
  template: Pipeline
  loading: boolean
  error: GetDataError<Failure | Error> | null
}

export function useInputSets(props: UseInputSetsProps): UseInputSetsReturn {
  const {
    inputSetSelected,
    rerunInputSetYaml,
    accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    selectedStageData
  } = props

  /**
   * For single input set
   */
  const shouldUseAPI2 =
    !rerunInputSetYaml &&
    Array.isArray(inputSetSelected) &&
    inputSetSelected.length === 1 &&
    inputSetSelected[0].type !== 'OVERLAY_INPUT_SET'
  /**
   * If there are multiple inputSets
   * or at least one of them is an overlay input set
   * we should call merge inputset
   */
  const shouldUseAPI3 =
    !rerunInputSetYaml &&
    Array.isArray(inputSetSelected) &&
    (inputSetSelected.length >= 2 || inputSetSelected.some(row => row.type === 'OVERLAY_INPUT_SET'))

  console.log('shouldUseAPI2', shouldUseAPI2)
  console.log('shouldUseAPI3', shouldUseAPI3)
  // API 1
  const {
    data: template,
    loading: loadingApi1,
    error: error1
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    body: {
      stageIdentifiers: getStageIdentifierFromStageData(selectedStageData)
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    }
  })

  // API 2
  const {
    data: inputSet2,
    loading: loadingApi2,
    error: error2
  } = useGetInputSetForPipeline({
    lazy: shouldUseAPI2,
    inputSetIdentifier: defaultTo(inputSetSelected?.[0]?.value as string, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    }
  })

  // API 3
  const {
    data: inputSet3,
    loading: loadingApi3,
    error: error3
  } = useMutateAsGet(useGetMergeInputSetFromPipelineTemplateWithListInput, {
    lazy: shouldUseAPI3,
    body: {
      inputSetReferences: inputSetSelected?.map(row => row.value),
      stageIdentifiers: getStageIdentifierFromStageData(selectedStageData)
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    }
  })

  function getInputSet(): Pipeline {
    if (rerunInputSetYaml) {
      return memoizedParse(rerunInputSetYaml)
    }

    if (shouldUseAPI2 && inputSet2?.data?.inputSetYaml) {
      return memoizedParse(inputSet2.data.inputSetYaml).inputSet
    }

    if (shouldUseAPI3 && inputSet3?.data?.pipelineYaml) {
      return memoizedParse(inputSet3.data.pipelineYaml)
    }

    return {}
  }

  return {
    inputSet: getInputSet(),
    loading: loadingApi1 || loadingApi2 || loadingApi3,
    error: error1 || error2 || error3,
    template: template?.data?.inputSetTemplateYaml ? memoizedParse(template?.data?.inputSetTemplateYaml) : {}
  }
}
