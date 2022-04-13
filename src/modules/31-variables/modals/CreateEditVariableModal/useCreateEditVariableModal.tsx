/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'

// import CreateUpdateSecret, {
//   SecretIdentifiers,
//   SecretFormData
// } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'

import { useStrings } from 'framework/strings'
import CreateEditVariable from '@variables/components/CreateEditVariable/CreateEditVariable'
import css from '@variables/components/CreateEditVariable/CreateEditVariable.module.scss'

export interface UseCreateUpdateVariableModalProps {
  onSuccess?: ((data: any) => void) | (() => void)
  // connectorTypeContext?: ConnectorInfoDTO['type']
  // privateSecret?: boolean
  isEdit?: boolean
}

export interface UseCreateUpdateVariableModalReturn {
  openCreateUpdateVariableModal: (variable?: any) => void
  closeCreateUpdateVariableModal: () => void
}

const useCreateEditVariableModal = (props: UseCreateUpdateVariableModalProps): UseCreateUpdateVariableModalReturn => {
  const [variable, setVariable] = useState<any>()
  // const handleSuccess = (data: any) => {
  //   hideModal()
  //   props.onSuccess?.(data)
  // }
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={props.isEdit ? getString('common.editVariable') : getString('common.addVariable')}
        className={css.variableDialog}
      >
        <CreateEditVariable />
      </Dialog>
    ),
    [variable]
  )

  return {
    openCreateUpdateVariableModal: (_variable: any | undefined) => {
      setVariable(_variable)
      showModal()
    },
    closeCreateUpdateVariableModal: hideModal
  }
}

export default useCreateEditVariableModal
