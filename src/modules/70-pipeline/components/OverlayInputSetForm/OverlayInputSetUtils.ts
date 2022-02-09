/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import type {
  CreateOverlayInputSetForPipelineQueryParams,
  InputSetSummaryResponse,
  UpdateOverlayInputSetForPipelinePathParams,
  UpdateOverlayInputSetForPipelineQueryParams
} from 'services/pipeline-ng'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import type { InputSetValue } from '../InputSetSelector/utils'

export const constructInputSetYamlObject = (item: InputSetSummaryResponse) => ({
  label: defaultTo(item.name, ''),
  insertText: defaultTo(item.identifier, ''),
  kind: CompletionItemKind.Field
})

export interface GetOverlayCreateUpdateOptionsInterface {
  inputSetObj: InputSetDTO
  accountId: string
  orgIdentifier: string
  pipelineIdentifier: string
  projectIdentifier: string
  gitDetails?: SaveToGitFormInterface
  objectId: string
  initialGitDetails: any
  isEdit: boolean
}

export const getCreateUpdateRequestBodyOptions = ({
  inputSetObj,
  accountId,
  orgIdentifier,
  pipelineIdentifier,
  projectIdentifier,
  gitDetails,
  objectId,
  initialGitDetails,
  isEdit
}: GetOverlayCreateUpdateOptionsInterface):
  | MutateRequestOptions<UpdateOverlayInputSetForPipelineQueryParams, UpdateOverlayInputSetForPipelinePathParams>
  | MutateRequestOptions<CreateOverlayInputSetForPipelineQueryParams, void> => {
  const commonQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    pipelineIdentifier,
    projectIdentifier
  }
  return isEdit
    ? {
        pathParams: { inputSetIdentifier: defaultTo(inputSetObj.identifier, '') },
        queryParams: {
          ...commonQueryParams,
          ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {}),
          ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
        }
      }
    : {
        queryParams: {
          ...commonQueryParams,
          ...(gitDetails ?? {}),
          ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
        }
      }
}

export const getInputSetReference = (currInputSet: InputSetValue) =>
  defaultTo(currInputSet.identifier, currInputSet.value) as string

// return the first truthy value from the list of values provided
export const anyOneOf = (values: Array<any>): any => values.find(value => value)
