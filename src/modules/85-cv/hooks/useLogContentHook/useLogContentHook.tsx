/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Classes } from '@blueprintjs/core'
import { Dialog } from '@harness/uicore'
import VerifyStepLog from './views/VerifyStepLog'
import SLOLog from './views/SLOLog'
import type { UseLogContentHookProps, UseLogContentHookReturn } from './useLogContentHook.types'
import css from './useLogContentHook.module.scss'

export const useLogContentHook = ({
  verifyStepExecutionId,
  sloIdentifier,
  serviceName,
  envName
}: UseLogContentHookProps): UseLogContentHookReturn => {
  const [isFullScreen, setIsFullScreen] = React.useState(false)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={() => {
          setIsFullScreen(false)
          hideModal()
        }}
        className={cx(css.dialog, { [css.fullScreen]: isFullScreen }, Classes.DIALOG)}
      >
        <div>
          {verifyStepExecutionId && (
            <VerifyStepLog
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              verifyStepExecutionId={verifyStepExecutionId}
            />
          )}
          {!verifyStepExecutionId && sloIdentifier && (
            <SLOLog
              identifier={sloIdentifier}
              serviceName={serviceName}
              envName={envName}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
          )}
        </div>
      </Dialog>
    ),
    [isFullScreen, setIsFullScreen, verifyStepExecutionId]
  )

  return {
    openLogContentHook: showModal,
    closeLogContentHook: hideModal
  }
}
