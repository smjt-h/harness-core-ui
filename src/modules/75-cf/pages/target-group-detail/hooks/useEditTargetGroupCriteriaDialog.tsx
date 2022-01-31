/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import EditTargetGroupCriteriaDialog, {
  EditTargetGroupCriteriaDialogProps
} from '../components/EditTargetGroupCriteria/EditTargetGroupCriteriaDialog'

const useEditTargetGroupCriteriaDialog = (
  targetGroup: EditTargetGroupCriteriaDialogProps['targetGroup'],
  onUpdate: EditTargetGroupCriteriaDialogProps['onUpdate']
): ReturnType<typeof useModalHook> => {
  const [openModal, hideModal] = useModalHook(() => (
    <EditTargetGroupCriteriaDialog hideModal={hideModal} targetGroup={targetGroup} onUpdate={onUpdate} />
  ))

  return [openModal, hideModal]
}

export default useEditTargetGroupCriteriaDialog
