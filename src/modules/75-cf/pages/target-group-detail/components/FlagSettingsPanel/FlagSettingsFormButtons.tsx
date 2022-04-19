/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Color, Layout } from '@harness/uicore'
import { Spinner } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

export interface FlagSettingsFormButtonsProps {
  submitting: boolean
  onCancel: () => void
  onSubmit: () => void
}

const FlagSettingsFormButtons: FC<FlagSettingsFormButtonsProps> = ({ submitting, onSubmit, onCancel }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      spacing="small"
      border={{ top: true, color: Color.GREY_100 }}
      padding={{ top: 'medium', bottom: 'medium', left: 'xlarge', right: 'xlarge' }}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <Button
        type="submit"
        text={getString('saveChanges')}
        intent="primary"
        variation={ButtonVariation.PRIMARY}
        disabled={submitting}
        onClick={e => {
          e.preventDefault()
          onSubmit()
        }}
      />
      <Button
        type="reset"
        text={getString('cancel')}
        variation={ButtonVariation.SECONDARY}
        disabled={submitting}
        onClick={e => {
          e.preventDefault()
          onCancel()
        }}
      />
      {submitting && (
        <span data-testid="saving-spinner">
          <Spinner size={16} />
        </span>
      )}
    </Layout.Horizontal>
  )
}

export default FlagSettingsFormButtons
