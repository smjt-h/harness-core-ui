/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { NestedAccordionPanel, NestedAccordionProvider, PageError } from '@wings-software/uicore'
import { get } from 'lodash-es'

import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import {
  PipelineVariablesContextProvider,
  usePipelineVariables
} from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { VariablesHeader } from '@pipeline/components/PipelineStudio/PipelineVariables/VariablesHeader/VariablesHeader'
import PipelineCard from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/PipelineCard'
import StageCard from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/StageCard'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import VariableAccordionSummary from './VariableAccordionSummary'
import css from './PipelineVariables.module.scss'

export function PipelineVariables(): React.ReactElement {
  const {
    state: { pipeline },
    updatePipeline,
    stepsFactory,
    isReadonly,
    allowableTypes,
    updateStage
  } = usePipelineContext()
  const {
    originalPipeline,
    variablesPipeline,
    metadataMap,
    error,
    initLoading,
    searchIndex = 0
  } = usePipelineVariables()
  const { getString } = useStrings()

  const pipelineVariablesRef = React.useRef()
  React.useLayoutEffect(() => {
    if (searchIndex === null && pipelineVariablesRef.current) {
      ;(pipelineVariablesRef.current as any)?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }, [searchIndex])
  const stagesCards: JSX.Element[] = []
  /* istanbul ignore else */
  if (variablesPipeline.stages && variablesPipeline.stages?.length > 0) {
    variablesPipeline.stages?.forEach((data, i) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP, j: number) => {
          if (nodeP.stage) {
            const stagePath = `stages[${i}].parallel[${j}].stage`
            const unresolvedStage = get(pipeline, stagePath)
            stagesCards.push(
              <StageCard
                originalStage={get(originalPipeline, stagePath)}
                unresolvedStage={unresolvedStage}
                key={nodeP.stage.identifier}
                stage={nodeP.stage}
                metadataMap={metadataMap}
                readonly={isReadonly || !!unresolvedStage.template}
                path="pipeline"
                allowableTypes={allowableTypes}
                stepsFactory={stepsFactory}
                updateStage={updateStage}
              />
            )
          }
        })
      } /* istanbul ignore else */ else if (data.stage) {
        const stagePath = `stages[${i}].stage`
        const unresolvedStage = get(pipeline, stagePath)
        stagesCards.push(
          <StageCard
            key={data.stage.identifier}
            stage={data.stage}
            originalStage={get(originalPipeline, stagePath)}
            unresolvedStage={unresolvedStage}
            metadataMap={metadataMap}
            readonly={isReadonly || !!unresolvedStage.template}
            path="pipeline"
            allowableTypes={allowableTypes}
            stepsFactory={stepsFactory}
            updateStage={updateStage}
          />
        )
      }
    })
  }

  if (initLoading) return <PageSpinner />

  return (
    <div className={css.pipelineVariables}>
      {error ? (
        <PageError message={(error?.data as Error)?.message || error?.message} />
      ) : (
        <div className={css.content}>
          <VariablesHeader />
          <div className={css.variableList} ref={pipelineVariablesRef as any}>
            <GitSyncStoreProvider>
              <NestedAccordionPanel
                noAutoScroll
                isDefaultOpen
                key="pipeline"
                id="pipeline"
                addDomId
                collapseProps={{
                  keepChildrenMounted: true
                }}
                summary={<VariableAccordionSummary>{getString('common.pipeline')}</VariableAccordionSummary>}
                summaryClassName={css.stageSummary}
                detailsClassName={css.pipelineDetails}
                panelClassName={css.pipelineMarginBottom}
                details={
                  <>
                    <PipelineCard
                      variablePipeline={variablesPipeline}
                      pipeline={pipeline}
                      stepsFactory={stepsFactory}
                      updatePipeline={updatePipeline}
                      metadataMap={metadataMap}
                      readonly={isReadonly}
                      allowableTypes={allowableTypes}
                    />

                    {stagesCards.length > 0 ? stagesCards : null}
                  </>
                }
              />
            </GitSyncStoreProvider>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PipelineVariablesWrapper(props: { pipeline?: PipelineInfoConfig }): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <PipelineVariablesContextProvider pipeline={props.pipeline} enablePipelineTemplatesResolution>
        <PipelineVariables />
      </PipelineVariablesContextProvider>
    </NestedAccordionProvider>
  )
}
