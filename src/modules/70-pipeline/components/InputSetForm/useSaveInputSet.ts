/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { MutateMethod } from 'restful-react'
import { defaultTo, isEmpty, omit } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'

import { useToaster } from '@harness/uicore'
import type { CreateUpdateInputSetsReturnType, InputSetDTO, SaveInputSetDTO } from '@pipeline/utils/types'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import type {
  CreateInputSetForPipelineQueryParams,
  EntityGitDetails,
  ResponseInputSetResponse,
  UpdateInputSetForPipelinePathParams,
  UpdateInputSetForPipelineQueryParams
} from 'services/pipeline-ng'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { getFormattedErrors } from '@pipeline/utils/runPipelineUtils'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { clearNullUndefined } from '@pipeline/utils/inputSetUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

interface GetUpdatedGitDetailsReturnType extends EntityGitDetails {
  lastObjectId?: string
  baseBranch?: string
}

const getUpdatedGitDetails = (
  isEdit: boolean,
  gitDetails: SaveToGitFormInterface | undefined,
  lastObjectId: string,
  initialGitDetails: EntityGitDetails
): GetUpdatedGitDetailsReturnType => {
  let updatedGitDetails: GetUpdatedGitDetailsReturnType = {}
  if (gitDetails) {
    updatedGitDetails = { ...gitDetails }
    if (isEdit) {
      updatedGitDetails['lastObjectId'] = lastObjectId
    }
    if (gitDetails.isNewBranch) {
      updatedGitDetails['baseBranch'] = initialGitDetails.branch
    }
  }
  return updatedGitDetails
}

interface UseSaveInputSetReturnType {
  handleSubmit: (inputSetObjWithGitInfo: InputSetDTO, gitDetails?: EntityGitDetails | undefined) => Promise<void>
}

interface InputSetInfo {
  createInputSet: MutateMethod<ResponseInputSetResponse, string, CreateInputSetForPipelineQueryParams, void>
  updateInputSet: MutateMethod<
    ResponseInputSetResponse,
    string,
    UpdateInputSetForPipelineQueryParams,
    UpdateInputSetForPipelinePathParams
  >
  inputSetResponse: ResponseInputSetResponse | null
  isEdit: boolean
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
}

export function useSaveInputSet(inputSetInfo: InputSetInfo): UseSaveInputSetReturnType {
  const { createInputSet, updateInputSet, inputSetResponse, isEdit, setFormErrors } = inputSetInfo
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()

  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<InputSetGitQueryParams>()

  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })

  const { isGitSyncEnabled } = React.useContext(AppStoreContext)

  const createUpdateInputSet = React.useCallback(
    async (
      inputSetObj: InputSetDTO,
      gitDetails?: SaveToGitFormInterface,
      objectId = ''
    ): CreateUpdateInputSetsReturnType => {
      let response: ResponseInputSetResponse | null = null
      try {
        const updatedGitDetails = getUpdatedGitDetails(isEdit, gitDetails, objectId, initialGitDetails)
        if (isEdit) {
          if (inputSetObj.identifier) {
            response = await updateInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }), {
              pathParams: {
                inputSetIdentifier: defaultTo(inputSetObj.identifier, '')
              },
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                pipelineRepoID: repoIdentifier,
                pipelineBranch: branch,
                ...updatedGitDetails
              }
            })
          } else {
            throw new Error(getString('common.validation.identifierIsRequired'))
          }
        } else {
          response = await createInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }), {
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              pipelineRepoID: repoIdentifier,
              pipelineBranch: branch,
              ...updatedGitDetails
            }
          })
        }
        if (!isGitSyncEnabled) {
          showSuccess(getString('inputSets.inputSetSaved'))
          history.goBack()
        }
      } catch (e) {
        const errors = getFormattedErrors(e?.data?.metadata?.uuidToErrorResponseMap)
        if (!isEmpty(errors)) {
          setFormErrors(errors)
        }
        // This is done because when git sync is enabled, errors are displayed in a modal
        if (!isGitSyncEnabled) {
          showError(getRBACErrorMessage(e), undefined, 'pipeline.update.create.inputset')
        } else {
          throw e
        }
      }
      return {
        status: response?.status, // nextCallback can be added if required
        nextCallback: () => history.goBack()
      }
    },
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      branch,
      createInputSet,
      updateInputSet,
      initialGitDetails,
      getString,
      history,
      isEdit,
      isGitSyncEnabled,
      setFormErrors,
      showSuccess,
      showError
    ]
  )

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> => createUpdateInputSet(payload?.inputSet || savedInputSetObj, gitData, objectId)
  })

  const handleSubmit = React.useCallback(
    async (inputSetObjWithGitInfo: InputSetDTO, gitDetails?: EntityGitDetails) => {
      const inputSetObj = omit(inputSetObjWithGitInfo, 'repo', 'branch')
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: isEdit ? inputSetResponse?.data?.gitDetails : gitDetails
            },
            payload: { inputSet: inputSetObj }
          })
        } else {
          createUpdateInputSet(inputSetObj)
        }
      }
    },
    [isEdit, isGitSyncEnabled, inputSetResponse, createUpdateInputSet, openSaveToGitDialog]
  )

  return {
    handleSubmit
  }
}
