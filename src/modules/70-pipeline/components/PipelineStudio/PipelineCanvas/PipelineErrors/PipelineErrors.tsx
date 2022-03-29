import React from 'react'

interface PropsInterface {
  errors: any
}

const schemaErrorsMock = [{"message":"type: does not have a value in the enumeration [Kubernetes, NativeHelm, Ssh]","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":null,"fqn":"$.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.type","hintMessage":null},{"message":"type: is missing but it is required","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":{"identifier":"a2","type":null,"name":"a1","fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step"},"fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step","hintMessage":null},{"message":"name: does not match the regex pattern ^[a-zA-Z_][-0-9a-zA-Z_\\\\s]{0,63}$","stageInfo":null,"stepInfo":null,"fqn":"$.pipeline.name","hintMessage":null},{"message":"template: is missing but it is required","stageInfo":{"identifier":"deploy_stage1","type":"Deployment","name":"deployStage","fqn":"$.pipeline.stages[0].stage"},"stepInfo":{"identifier":"a2","type":null,"name":"a1","fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step"},"fqn":"$.pipeline.stages[0].stage.spec.execution.steps[0].step","hintMessage":null},{"message":"allowStageExecutions: integer found, boolean expected","stageInfo":null,"stepInfo":null,"fqn":"$.pipeline.allowStageExecutions","hintMessage":null},{"message":"type: does not have a value in the enumeration [Deployment, CI, Approval, FeatureFlag]","stageInfo":{"identifier":"approval","type":"Approval123","name":"approval","fqn":"$.pipeline.stages[1].stage"},"stepInfo":null,"fqn":"$.pipeline.stages[1].stage.type","hintMessage":null}]

const isPipelineError = item => !item.stageInfo && !item.stepInfo
const isStageError = item => item.stageInfo && !item.stepInfo

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

const StageErrors = ({ errors }) => {
  const stageName = errors[0].stageInfo.name
  const renderError = error => {
    const { stageInfo, stepInfo } = error
    if (!stageInfo && !stepInfo) return null
    if (stageInfo && !stepInfo) {
      return <div>{`stage error: ${error.message}`}</div>
    }
    if (stageInfo && stepInfo) {
      return <div>{`step error: ${error.message}`}</div>
    }
  }
  return (
    <div>
      <h1>Stage: {stageName}</h1>
      {errors.map(renderError)}
    </div>
  )
}

const PipelineError = ({ errors }) => {
  if (errors.length === 0) return null
  const renderError = error => {
    return <div>{`pipeline error: ${error.message}`}</div>
  }
  return (
    <div>
      <h1>Pipeline</h1>
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
  return (
    <>
      <PipelineError errors={pipelineErrors} />
      {stageIds.map(stageId => {
        return <StageErrors key={stageId} errors={errorsByStage[stageId]} />
      })}
    </>
  )
}

export default PipelineErrors
