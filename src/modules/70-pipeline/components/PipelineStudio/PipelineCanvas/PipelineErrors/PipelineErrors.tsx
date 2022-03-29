import React from 'react'

interface PropsInterface {
  errors: any
}

const schemaErrorsMock = [{"message":"type: does not have a value in the enumeration [Kubernetes, NativeHelm, Ssh]","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":null,"fqn":"$.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.type","hintMessage":null},{"message":"type: is missing but it is required","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":{"identifier":"a2","type":null,"name":"a1","fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step"},"fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step","hintMessage":null},{"message":"name: does not match the regex pattern ^[a-zA-Z_][-0-9a-zA-Z_\\\\s]{0,63}$","stageInfo":null,"stepInfo":null,"fqn":"$.pipeline.name","hintMessage":null},{"message":"template: is missing but it is required","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":{"identifier":"a2","type":null,"name":"a1","fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step"},"fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step","hintMessage":null},{"message":"allowStageExecutions: integer found, boolean expected","stageInfo":null,"stepInfo":null,"fqn":"$.pipeline.allowStageExecutions","hintMessage":null},{"message":"type: does not have a value in the enumeration [Deployment, CI, Approval, FeatureFlag]","stageInfo":{"identifier":"approval","type":"Approval123","name":"approval","fqn":"$.pipeline.stages[1].stage"},"stepInfo":null,"fqn":"$.pipeline.stages[1].stage.type","hintMessage":null}]

const isPipelineError = item => !item.stageInfo && !item.stepInfo
const isStageError = item => item.stageInfo && !item.stepInfo
const isStepError = item => item.stageInfo && item.stepInfo

const addToErrorsByStage = (errorsByStage, item) =>
  isStageError(item)
    ? [item, ...errorsByStage[item.stageInfo.identifier]]
    : [...errorsByStage[item.stageInfo.identifier], item]

var getAdaptErrors = schemaErrors =>
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

var getAdaptedErrorsForStep = (stageIds, errorsByStage) => {
  const updatedErrorsByStage = {}
  stageIds.forEach(stepId => {
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

const renderStageErrors = errors => {
  const msgs = errors.map((err, index) => (
    <div>
      {index + 1}: {err.message}
    </div>
  ))
  return (
    <div>
      <div>
        <b>stage errors section</b>
      </div>
      <div>{msgs}</div>
      <br />
    </div>
  )
}

const renderStepErrors = (stepIds, errorsByStep) => {
  if (stepIds.length === 0) return null
  const renderStepErrors = stepId => {
    const stepErrors = errorsByStep[stepId] || []
    return (
      <div>
        <b>Step Name</b>: {stepErrors[0].stepInfo.identifier} - {stepErrors[0].stepInfo.name}
        <div>
          {stepErrors.map((err, index) => (
            <div>
              {index + 1}: {err.message}
            </div>
          ))}
        </div>
        <br />
      </div>
    )
  }
  return <div>{stepIds.map(stepId => renderStepErrors(stepId))}</div>
}

const StageErrors = ({ errors }) => {
  const stageName = errors.stageErrors[0].stageInfo.name
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
    <div>
      <h1>Stage: {stageName}</h1>
      {renderStageErrors(errors.stageErrors)}
      {renderStepErrors(errors.stepIds, errors.errorsByStep)}
      {/*{errors.map(renderError)}*/}
      <br />
      <br />
    </div>
  )
}

const PipelineError = ({ errors }) => {
  if (errors.length === 0) return null
  const renderError = (error, index) => {
    return (
      <div>
        {index + 1}: {error.message}
      </div>
    )
  }
  return (
    <div>
      <h1>Pipeline Errors</h1>
      {errors.map(renderError)}
    </div>
  )
}

const PipelineErrors: React.FC<PropsInterface> = ({ errors: schemaErrors }) => {
  // schemaErrors = schemaErrorsMock
  if (!schemaErrors.length) {
    return null
  }
  const { stageIds, errorsByStage, pipelineErrors } = getAdaptErrors(schemaErrors)
  const updatedErrorsByStage = getAdaptedErrorsForStep(stageIds, errorsByStage)
  return (
    <>
      <PipelineError errors={pipelineErrors} />
      {stageIds.map(stageId => {
        return <StageErrors key={stageId} errors={updatedErrorsByStage[stageId]} />
      })}
    </>
  )
}

export default PipelineErrors
