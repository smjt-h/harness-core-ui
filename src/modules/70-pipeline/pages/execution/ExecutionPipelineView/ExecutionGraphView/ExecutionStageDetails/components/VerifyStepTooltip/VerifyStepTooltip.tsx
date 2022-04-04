/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@harness/design-system'
import React from 'react'
import { Container } from '@harness/uicore'
import InfoStrip from '@common/components/InfoStrip/InfoStrip'
import type { VerifyStepTooltipProps } from './VerifyStepTooltip.types'
import css from './VerifyStepTooltip.module.scss'

export default function VerifyStepTooltip(props: VerifyStepTooltipProps): JSX.Element {
  const { failureInfo } = props
  const responseMessages = failureInfo?.responseMessages

  if (failureInfo?.message) {
    return <InfoStrip intent={Intent.PRIMARY} content={failureInfo.message} />
  }

  if (Array.isArray(responseMessages) && responseMessages.length) {
    return (
      <Container>
        {responseMessages.map((responseMessage, index) => {
          return (
            <InfoStrip
              key={`response-message-${index}`}
              intent={Intent.PRIMARY}
              content={responseMessage?.message}
              className={css.infoBar}
            />
          )
        })}
      </Container>
    )
  }

  return <></>
}
