import React from 'react'
import { get } from 'lodash-es'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import stepFactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stageTypeToIconMap } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import PipelineErrorCardBasic from './PipelineErrorList'
import css from './PipelineErrors.module.scss'

export interface PropsInterface {
  errors: any
}

const schemaErrorsMock = [
  {
    message: 'type: does not have a value in the enumeration [Kubernetes, NativeHelm, Ssh]',
    stageInfo: {
      identifier: 'deploy_stage1',
      type: 'Deployment',
      name: 'deployStage',
      fqn: '$.pipeline.stages[0].stage'
    },
    stepInfo: null,
    fqn: '$.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.type',
    hintMessage: null
  },
  {
    message: 'type: is missing but it is required',
    stageInfo: {
      identifier: 'deploy_stage1',
      type: 'Deployment',
      name: 'deployStage',
      fqn: '$.pipeline.stages[0].stage'
    },
    stepInfo: {
      identifier: 'a2',
      type: null,
      name: 'a1',
      fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step'
    },
    fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step',
    hintMessage: null
  },
  {
    message: 'name: does not match the regex pattern ^[a-zA-Z_][-0-9a-zA-Z_\\\\s]{0,63}$',
    stageInfo: null,
    stepInfo: null,
    fqn: '$.pipeline.name',
    hintMessage: null
  },
  {
    message: 'template: is missing but it is required',
    stageInfo: {
      identifier: 'deploy_stage1',
      type: 'Deployment',
      name: 'deployStage',
      fqn: '$.pipeline.stages[0].stage'
    },
    stepInfo: {
      identifier: 'a2',
      type: null,
      name: 'a1',
      fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step'
    },
    fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step',
    hintMessage: null
  },
  {
    message: 'allowStageExecutions: integer found, boolean expected',
    stageInfo: null,
    stepInfo: null,
    fqn: '$.pipeline.allowStageExecutions',
    hintMessage: null
  },
  {
    message: 'type: does not have a value in the enumeration [Deployment, CI, Approval, FeatureFlag]',
    stageInfo: { identifier: 'approval', type: 'Approval', name: 'approval', fqn: '$.pipeline.stages[1].stage' },
    stepInfo: null,
    fqn: '$.pipeline.stages[1].stage.type',
    hintMessage: null
  }
]

const isPipelineError = (item: any): boolean => !item.stageInfo && !item.stepInfo
const isStageError = (item: any): boolean => item.stageInfo && !item.stepInfo
const isStepError = (item: any): boolean => item.stageInfo && item.stepInfo

const addToErrorsByStage = (errorsByStage, item) =>
  isStageError(item)
    ? [item, ...errorsByStage[item.stageInfo.identifier]]
    : [...errorsByStage[item.stageInfo.identifier], item]

const getAdaptErrors = (
  schemaErrors: any
): { stageIds: []; errorsByStage: Record<string, unknown>; pipelineErrors: [] } =>
  schemaErrors.reduce(
    (accum, item) => {
      const errorsByStage = accum.errorsByStage
      if (isPipelineError(item)) {
        accum.pipelineErrors.push(item)
      } else {
        if (errorsByStage[item.stageInfo.identifier]) {
          errorsByStage[item.stageInfo.identifier] = addToErrorsByStage(errorsByStage, item)
        } else {
          errorsByStage[item.stageInfo.identifier] = [item]
          accum.stageIds.push(item.stageInfo.identifier)
        }
      }
      return accum
    },
    { stageIds: [], errorsByStage: {}, pipelineErrors: [] }
  )

const getAdaptedErrorsForStep = (stageIds: string[], errorsByStage: Record<string, any>): Record<string, unknown> => {
  const updatedErrorsByStage: Record<string, unknown> = {}
  stageIds.forEach((stepId: string) => {
    updatedErrorsByStage[stepId] = errorsByStage[stepId].reduce(
      (accum, item) => {
        const { stageErrors, errorsByStep, stepIds } = accum
        if (isStageError(item)) {
          stageErrors.push(item)
        } else if (isStepError(item)) {
          if (errorsByStep[item.stepInfo.identifier]) {
            // push
            errorsByStep[item.stepInfo.identifier].push(item)
          } else {
            errorsByStep[item.stepInfo.identifier] = [item]
            stepIds.push(item.stepInfo.identifier)
          }
        }
        return accum
      },
      { stageErrors: [], errorsByStep: {}, stepIds: [] }
    )
  })
  return updatedErrorsByStage
}

function StageErrorCard({ errors, stageName }: { errors: any[]; stageName: string }): React.ReactElement {
  return (
    <>
      {errors.map((err: { message: string; type: string; stageInfo: { type: string } }, index: number) => (
        <PipelineErrorCardBasic
          key={index}
          title={`Stage: ${stageName}`}
          errorText={err?.message}
          icon={stageTypeToIconMap[err.stageInfo.type]}
          onClick={() => {
            //
          }}
          buttonText={'Fix Stage'}
        />
      ))}
    </>
  )
}

function StepErrorCard({ stepIds, errorsByStep }: { stepIds: string[]; errorsByStep: any }): React.ReactElement | null {
  if (stepIds.length === 0) return null
  const renderStepError = (stepId: string): React.ReactElement => {
    const stepErrors = errorsByStep[stepId] || []
    const stepTitle = `Step: ${stepErrors[0].stepInfo.identifier} - ${stepErrors[0].stepInfo.name}`
    return stepErrors.map((err: { message: string; type: string }, index: number) => {
      const icon = stepFactory.getStepIcon(get(err, 'stepInfo.type', ''))
      return (
        <PipelineErrorCardBasic
          key={index}
          title={stepTitle}
          errorText={err?.message}
          icon={icon}
          onClick={() => {
            //
          }}
          buttonText={'Fix Step'}
        />
      )
    })
  }
  return <>{stepIds.map(renderStepError)}</>
}

function StageErrors({ errors }: PropsInterface): React.ReactElement {
  const { getString } = useStrings()
  const stageName = errors.stageErrors[0].stageInfo.name
  const { stepIds, errorsByStep, stageErrors } = errors
  // const renderError = error => {
  //   const { stageInfo, stepInfo } = error
  //   if (!stageInfo && !stepInfo) return null
  //   if (stageInfo && !stepInfo) {
  //     return <div>{`stage error - ${stageInfo.identifier}: ${error.message}`}</div>
  //   }
  //   if (stageInfo && stepInfo) {
  //     return <div>{`step error - ${stepInfo.identifier}: ${error.message}`}</div>
  //   }
  // }
  return (
    <>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.execution.stepTitlePrefix')} {stageName}
      </Text>
      <StageErrorCard errors={stageErrors} stageName={stageName} />
      <StepErrorCard errorsByStep={errorsByStep} stepIds={stepIds} />
    </>
  )
}

function PipelineError({ errors }: PropsInterface): React.ReactElement | null {
  const { getString } = useStrings()
  if (errors.length === 0) return null
  const renderError = (error: { message: string }, index: number): React.ReactElement => {
    return (
      <div>
        {index + 1}: {error.message}
      </div>
    )
  }

  return (
    <PipelineErrorCardBasic
      title={getString('common.pipeline')}
      errorText={errors.map((e: { message: string }) => e.message)}
      icon="pipeline"
      onClick={() => {
        //
      }}
      buttonText={'Fix Errors'}
    />
  )
}

function PipelineErrors({ errors: schemaErrors }: PropsInterface): React.ReactElement | null {
  schemaErrors = schemaErrorsMock
  if (!schemaErrors.length) {
    return null
  }
  const { stageIds, errorsByStage, pipelineErrors } = getAdaptErrors(schemaErrors)
  const updatedErrorsByStage = getAdaptedErrorsForStep(stageIds, errorsByStage)
  return (
    <div className={css.pipelineErrorList}>
      <PipelineError errors={pipelineErrors} />
      {stageIds.map((stageId: string) => {
        return <StageErrors key={stageId} errors={updatedErrorsByStage[stageId]} />
      })}
    </div>
  )
}

export default PipelineErrors
