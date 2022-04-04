/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import AddFlagsToTargetGroupDialog, {
  AddFlagsToTargetGroupDialogProps
} from '../components/FlagSettingsPanel/AddFlagsToTargetGroupDialog/AddFlagsToTargetGroupDialog'

const useAddFlagsToTargetGroupDialog = (
  targetGroup: AddFlagsToTargetGroupDialogProps['targetGroup'],
  onChange: AddFlagsToTargetGroupDialogProps['onChange'],
  existingFlagIds: AddFlagsToTargetGroupDialogProps['existingFlagIds']
): ReturnType<typeof useModalHook> => {
  const [openModal, hideModal] = useModalHook(
    () => (
      <AddFlagsToTargetGroupDialog
        hideModal={hideModal}
        targetGroup={targetGroup}
        onChange={onChange}
        existingFlagIds={existingFlagIds}
      />
    ),
    [targetGroup, onChange, existingFlagIds]
  )

  return [openModal, hideModal]
}

export default useAddFlagsToTargetGroupDialog
