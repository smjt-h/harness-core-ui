/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikValues } from 'formik'
import { get, isEmpty } from 'lodash-es'
import { TriggerDefaultFieldList, TriggerTypes } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const fromPipelineInputTriggerTab = (formik: FormikValues, fromTrigger = false): boolean => {
  return (
    formik?.values?.triggerType === TriggerTypes.MANIFEST && formik?.values?.selectedArtifact !== null && !fromTrigger
  )
}

export const isSelectedStage = (stageIdentifier: string, formikStageId: string): boolean =>
  stageIdentifier === formikStageId
export const isSelectedManifest = (selectedManifest: any, identifier: string): boolean =>
  !isEmpty(selectedManifest) && (!selectedManifest.identifier || selectedManifest.identifier === identifier)

export const isFieldfromTriggerTabDisabled = (
  fieldName: string,
  formik: FormikValues,
  stageIdentifier: string,
  identifier: string,
  fromTrigger = false
): boolean => {
  if (fromTrigger) {
    // Trigger Configuration Tab
    return get(TriggerDefaultFieldList, fieldName) ? true : false
  } else if (
    fromPipelineInputTriggerTab(formik, fromTrigger) &&
    isSelectedManifest(formik?.values?.selectedArtifact, identifier) &&
    isSelectedStage(stageIdentifier, formik?.values?.stageId)
  ) {
    return true
  }
  return false
}

export const shouldDisplayRepositoryName = (item: any): boolean => {
  return (
    item?.record?.spec?.connectionType === GitRepoName.Repo ||
    item?.record?.spec?.type === GitRepoName.Repo ||
    item?.connector?.spec?.type === GitRepoName.Repo
  )
}
