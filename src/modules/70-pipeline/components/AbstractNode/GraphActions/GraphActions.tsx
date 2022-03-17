/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, ButtonGroup, Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ZOOM_INC_DEC_LEVEL } from './constants'
import css from './GraphActions.module.scss'
interface GraphActionProps {
  setGraphScale: (data: number) => void
  graphScale: number
  handleScaleToFit: () => void
  resetGraphState: () => void
}
function GraphActions({
  setGraphScale,
  graphScale,
  handleScaleToFit,
  resetGraphState
}: GraphActionProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <span className={css.canvasButtons}>
      <div className={css.vertical}>
        <ButtonGroup>
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="canvas-position"
            tooltip={getString('canvasButtons.zoomToFit')}
            onClick={handleScaleToFit}
          />
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="canvas-selector"
            tooltip={getString('reset')}
            onClick={resetGraphState}
          />
        </ButtonGroup>
        <span className={css.verticalButtons}>
          <ButtonGroup>
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="zoom-in"
              tooltip={getString('canvasButtons.zoomIn')}
              onClick={() => {
                Number(graphScale.toFixed(1)) < 2 && setGraphScale(graphScale + ZOOM_INC_DEC_LEVEL)
              }}
            />
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="zoom-out"
              tooltip={getString('canvasButtons.zoomOut')}
              onClick={() => {
                Number(graphScale.toFixed(1)) > 0.3 && setGraphScale(graphScale - ZOOM_INC_DEC_LEVEL)
              }}
            />
          </ButtonGroup>
        </span>
      </div>
    </span>
  )
}
export default GraphActions
