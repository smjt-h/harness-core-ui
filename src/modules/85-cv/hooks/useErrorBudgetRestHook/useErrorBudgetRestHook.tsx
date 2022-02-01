/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Dialog, useModalHook } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { SLODashboardWidget } from 'services/cv'
import ErrorBudgetResetForm from './views/ErrorBudgetResetForm'
import type { UseErrorBudgetRestHookProps, UseErrorBudgetRestHookReturn } from './useErrorBudgetRestHook.types'

export const useErrorBudgetRestHook = ({ onSuccess }: UseErrorBudgetRestHookProps): UseErrorBudgetRestHookReturn => {
  const { getString } = useStrings()
  const [serviceLevelObjective, setServiceLevelObjective] = useState<SLODashboardWidget>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        enforceFocus={false}
        title={getString('cv.resetErrorBudget')}
        onClose={hideModal}
        style={{ minWidth: 'max-content' }}
      >
        {serviceLevelObjective && (
          <ErrorBudgetResetForm
            serviceLevelObjective={serviceLevelObjective}
            onSubmit={formData => {
              onSuccess(formData)
              hideModal()
            }}
            onCancel={hideModal}
          />
        )}
      </Dialog>
    ),
    [serviceLevelObjective]
  )

  const open = (_serviceLevelObjective: SLODashboardWidget): void => {
    setServiceLevelObjective(_serviceLevelObjective)
    showModal()
  }

  return {
    openErrorBudgetReset: open,
    closeErrorBudgetReset: hideModal
  }
}
