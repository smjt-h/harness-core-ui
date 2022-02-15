import React from 'react'
import { ButtonVariation, ButtonGroup, Button } from '@harness/uicore'
import { ZOOM_INC_DEC_LEVEL, INITIAL_ZOOM_LEVEL } from '../constants'
import css from './GraphActions.module.scss'
interface GraphActionProps {
  setGraphScale: (data: number) => void
  graphScale: number
  handleScaleToFit: () => void
}
const GraphActions = ({ setGraphScale, graphScale, handleScaleToFit }: GraphActionProps): React.ReactElement => {
  return (
    <div className={css.vertical}>
      <div className={css.graphActionButton}>
        <Button
          variation={ButtonVariation.TERTIARY}
          icon="canvas-position"
          tooltip="Zoom to fit"
          onClick={handleScaleToFit}
        />
      </div>
      <div className={css.graphActionButton}>
        <Button
          variation={ButtonVariation.TERTIARY}
          icon="reset"
          tooltip="Reset Zoom"
          onClick={() => setGraphScale(INITIAL_ZOOM_LEVEL)}
        />
      </div>

      <ButtonGroup className={css.buttongroup}>
        <Button
          variation={ButtonVariation.TERTIARY}
          icon="zoom-in"
          tooltip="Zoom In"
          onClick={() => {
            Number(graphScale.toFixed(1)) < 2 && setGraphScale(graphScale + ZOOM_INC_DEC_LEVEL)
          }}
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          tooltip="Zoom Out"
          icon="zoom-out"
          onClick={() => {
            Number(graphScale.toFixed(1)) > 0.3 && setGraphScale(graphScale - ZOOM_INC_DEC_LEVEL)
          }}
        />
      </ButtonGroup>
    </div>
  )
}
export default GraphActions
