/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Label,
  FormInput,
  MultiTypeInputType,
  Icon,
  Layout,
  Text,
  getMultiTypeFromValue,
  Container
} from '@wings-software/uicore'
import { connect } from 'formik'
import { Color, FontVariation } from '@harness/design-system'
import { get, set, isEmpty, pickBy, identity, isNil, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type {
  DeploymentStageConfig,
  ServiceSpec,
  ExecutionWrapperConfig,
  ServiceConfig,
  PipelineInfrastructure,
  Infrastructure,
  StageOverridesConfig,
  StepElementConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField, Separator } from '@common/components'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { MultiTypeCustomMap } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import Volumes from '@pipeline/components/Volumes/Volumes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import {
  getAllowedValuesFromTemplate,
  getConnectorRefWidth,
  shouldRenderRunTimeInputViewWithAllowedValues,
  useGitScope
} from '@pipeline/utils/CIUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { StringsMap } from 'stringTypes'
import {
  getCustomStepProps,
  getStepTypeByDeploymentType,
  infraDefinitionTypeMapping
} from '@pipeline/utils/stageHelpers'
import type { K8sDirectInfraYaml } from 'services/ci'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { CollapseForm } from './CollapseForm'
import { getStepFromStage } from '../PipelineStudio/StepUtil'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { ConditionalExecutionForm } from './StageAdvancedInputSetForm'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '../AbstractSteps/Step'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PipelineInputSetForm.module.scss'

function ServiceDependencyForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes
}: {
  template?: any
  allValues?: any
  values?: any
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <Label>
        <Icon
          padding={{ right: 'small' }}
          name={factory.getStepIcon(allValues.type || /* istanbul ignore next */ '')}
        />
        {getString('pipeline.serviceDependencyText')}: {getString('pipeline.stepLabel', allValues)}
      </Label>
      <div>
        <StepWidget<any>
          factory={factory}
          readonly={readonly}
          path={path}
          allowableTypes={allowableTypes}
          template={template}
          initialValues={values || {}}
          allValues={allValues || {}}
          type={(allValues?.type as StepType) || ''}
          onUpdate={onUpdate}
          stepViewType={viewType}
        />
      </div>
    </Layout.Vertical>
  )
}

function StepFormInternal({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
}): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  return (
    <div>
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        readonly={readonly}
        path={path}
        allowableTypes={allowableTypes}
        template={template?.step}
        initialValues={values?.step || {}}
        allValues={allValues?.step || {}}
        type={(allValues?.step as StepElementConfig)?.type as StepType}
        onUpdate={onUpdate}
        stepViewType={viewType}
      />
      {getMultiTypeFromValue((template?.step as StepElementConfig)?.spec?.delegateSelectors) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeDelegateSelector
            expressions={expressions}
            inputProps={{ projectIdentifier, orgIdentifier }}
            allowableTypes={allowableTypes}
            label={getString('delegate.DelegateSelector')}
            name={`${path}.spec.delegateSelectors`}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue((template?.step as StepElementConfig)?.when?.condition) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(stepCss.formGroup, stepCss.md)}>
          <ConditionalExecutionForm
            readonly={readonly}
            path={`${path}.when.condition`}
            allowableTypes={allowableTypes}
          />
        </Container>
      )}
    </div>
  )
}

export function StepForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes,
  hideTitle = false
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: MultiTypeInputType[]
  hideTitle?: boolean
}): JSX.Element {
  const { getString } = useStrings()
  const isTemplateStep = (template?.step as unknown as TemplateStepNode)?.template
  const type = isTemplateStep
    ? ((template?.step as unknown as TemplateStepNode)?.template.templateInputs as StepElementConfig)?.type
    : ((template?.step as StepElementConfig)?.type as StepType)
  const iconColor = factory.getStepIconColor(type)

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      {!hideTitle && (
        <Label>
          <Icon
            padding={{ right: 'small' }}
            {...(iconColor ? { color: iconColor } : {})}
            style={{ color: iconColor }}
            name={factory.getStepIcon(type)}
          />
          {getString('pipeline.execution.stepTitlePrefix')}
          {getString('pipeline.stepLabel', allValues?.step)}
        </Label>
      )}
      <StepFormInternal
        template={
          isTemplateStep
            ? { step: (template?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : template
        }
        allValues={
          (allValues?.step as unknown as TemplateStepNode)?.template
            ? { step: (allValues?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : allValues
        }
        values={
          isTemplateStep
            ? { step: (values?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : values
        }
        path={isTemplateStep ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
        readonly={readonly}
        viewType={viewType}
        allowableTypes={allowableTypes}
        onUpdate={onUpdate}
      />
    </Layout.Vertical>
  )
}
export interface StageInputSetFormProps {
  deploymentStage?: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
  viewType: StepViewType
  stageIdentifier?: string
  executionIdentifier?: string
  allowableTypes: MultiTypeInputType[]
}

function ExecutionWrapperInputSetForm(props: {
  stepsTemplate: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: MultiTypeInputType[]
  executionIdentifier?: string
}): JSX.Element {
  const { stepsTemplate, allValues, values, path, formik, readonly, viewType, allowableTypes, executionIdentifier } =
    props
  return (
    <>
      {stepsTemplate?.map((item, index) => {
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', values)
          return originalStep && /* istanbul ignore next */ originalStep.step ? (
            /* istanbul ignore next */ <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              viewType={viewType}
              allowableTypes={allowableTypes}
              onUpdate={data => {
                /* istanbul ignore next */
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = {
                      identifier: originalStep.step?.identifier || '',
                      name: originalStep.step?.name || '',
                      type: (originalStep.step as StepElementConfig)?.type || ''
                    }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || '',
                    name: originalStep.step?.name || '',
                    type: (originalStep.step as StepElementConfig)?.type || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return item.parallel.map((nodep, indexp) => {
            if (nodep.step) {
              const originalStep = getStepFromStage(nodep.step?.identifier || '', allValues)
              const initialValues = getStepFromStage(nodep.step?.identifier || '', values)
              return originalStep && originalStep.step ? (
                <StepForm
                  key={nodep.step.identifier || index}
                  template={nodep}
                  allValues={originalStep}
                  values={initialValues}
                  readonly={readonly}
                  viewType={viewType}
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  allowableTypes={allowableTypes}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = {
                          identifier: originalStep.step?.identifier || '',
                          name: originalStep.step?.name || '',
                          type: (originalStep.step as StepElementConfig)?.type || '',
                          timeout: '10m'
                        }
                      }
                      initialValues.step = {
                        ...data,
                        identifier: originalStep.step?.identifier || '',
                        name: originalStep.step?.name || '',
                        type: (originalStep.step as StepElementConfig)?.type || '',
                        timeout: '10m'
                      }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
            } else if (nodep.stepGroup) {
              const stepGroup = getStepFromStage(nodep.stepGroup.identifier, allValues)
              const initialValues = getStepFromStage(nodep.stepGroup?.identifier || '', values)
              return (
                <>
                  <CollapseForm
                    header={stepGroup?.stepGroup?.name || ''}
                    headerProps={{ font: { size: 'normal' } }}
                    headerColor="var(--black)"
                  >
                    <ExecutionWrapperInputSetForm
                      executionIdentifier={executionIdentifier}
                      stepsTemplate={nodep.stepGroup.steps}
                      formik={formik}
                      readonly={readonly}
                      path={`${path}[${index}].parallel[${indexp}].stepGroup.steps`}
                      allValues={stepGroup?.stepGroup?.steps}
                      values={initialValues?.stepGroup?.steps}
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                    />
                  </CollapseForm>
                </>
              )
            } else {
              return null
            }
          })
        } else if (item.stepGroup) {
          const stepGroup = getStepFromStage(item.stepGroup.identifier, allValues)
          const initialValues = getStepFromStage(item.stepGroup?.identifier || '', values)
          return (
            <>
              <CollapseForm
                header={stepGroup?.stepGroup?.name || ''}
                headerProps={{ font: { size: 'normal' } }}
                headerColor="var(--black)"
              >
                <ExecutionWrapperInputSetForm
                  executionIdentifier={executionIdentifier}
                  stepsTemplate={item.stepGroup.steps}
                  formik={formik}
                  readonly={readonly}
                  path={`${path}[${index}].stepGroup.steps`}
                  allValues={stepGroup?.stepGroup?.steps}
                  values={initialValues?.stepGroup?.steps}
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                />
              </CollapseForm>
            </>
          )
        } else {
          return null
        }
      })}
    </>
  )
}

export function StageInputSetFormInternal({
  deploymentStageTemplate,
  deploymentStage,
  path,
  formik,
  readonly,
  viewType,
  stageIdentifier,
  executionIdentifier,
  allowableTypes
}: StageInputSetFormProps): React.ReactElement {
  const deploymentStageInputSet = get(formik?.values, path, {})
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isPropagating = deploymentStage?.serviceConfig?.useFromStage
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const containerSecurityContextFields = ['containerSecurityContext', 'runAsUser']
  const deploymentStageTemplateInfraKeys = Object.keys((deploymentStageTemplate.infrastructure as any)?.spec || {})
  const hasContainerSecurityContextFields = containerSecurityContextFields.some(field =>
    deploymentStageTemplateInfraKeys.includes(field)
  )
  const namePath = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeInputWithAllowedValues = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      placeholderKey,
      fieldPath
    }: {
      name: string
      tooltipId?: string
      labelKey: keyof StringsMap
      placeholderKey?: keyof StringsMap
      fieldPath: string
    }) => {
      if (!name) {
        return
      }
      if (deploymentStageTemplate.infrastructure && fieldPath) {
        const items = getAllowedValuesFromTemplate(deploymentStageTemplate.infrastructure, fieldPath)
        return (
          <FormInput.MultiTypeInput
            name={name}
            label={getString(labelKey)}
            useValue
            selectItems={items}
            placeholder={placeholderKey ? getString(placeholderKey) : ''}
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              selectProps: { disabled: readonly, items }
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: tooltipId ?? '' }}
            style={{ width: 300 }}
          />
        )
      }
    },
    [deploymentStageTemplate.infrastructure]
  )

  const renderMultiTypeTextField = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      inputProps,
      fieldPath
    }: {
      name: string
      tooltipId: string
      labelKey: keyof StringsMap
      inputProps: MultiTypeTextProps['multiTextInputProps']
      fieldPath: string
    }) => {
      if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, deploymentStageTemplate.infrastructure)) {
        return renderMultiTypeInputWithAllowedValues({
          name,
          tooltipId,
          labelKey: labelKey,
          fieldPath
        })
      }
      return (
        <MultiTypeTextField
          name={name}
          label={
            <Text
              className={stepCss.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              tooltipProps={{
                dataTooltipId: tooltipId
              }}
            >
              {getString(labelKey)}
            </Text>
          }
          style={{ width: 300 }}
          multiTextInputProps={inputProps}
        />
      )
    },
    [deploymentStageTemplate.infrastructure]
  )

  const renderMultiTypeMapInputSet = React.useCallback(
    ({ fieldName, stringKey }: { fieldName: string; stringKey: keyof StringsMap }): React.ReactElement => (
      <MultiTypeMapInputSet
        appearance={'minimal'}
        cardStyle={{ width: '50%' }}
        name={fieldName}
        valueMultiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: (
            <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
              {getString(stringKey)}
            </Text>
          ),
          disableTypeSelection: true,
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
        formik={formik}
      />
    ),
    []
  )

  const renderMultiTypeCheckboxInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId,
      defaultTrue
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
      defaultTrue?: boolean
    }): React.ReactElement => (
      <FormMultiTypeCheckboxField
        name={name}
        label={getString(labelKey)}
        defaultTrue={defaultTrue}
        multiTypeTextbox={{
          expressions,
          allowableTypes,
          disabled: readonly
        }}
        tooltipProps={{ dataTooltipId: tooltipId }}
        setToFalseWhenEmpty={true}
        disabled={readonly}
      />
    ),
    [expressions]
  )

  const renderMultiTypeListInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
    }): React.ReactElement => (
      <Container className={stepCss.bottomMargin3}>
        <MultiTypeListInputSet
          name={name}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          formik={formik}
          multiTypeFieldSelectorProps={{
            label: (
              <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: tooltipId }}>
                {getString(labelKey)}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
        />
      </Container>
    ),
    [expressions]
  )

  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <div id={`Stage.${stageIdentifier}.Service`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('service')}</div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate?.serviceConfig?.serviceRef && (
              /* istanbul ignore next */ <StepWidget<ServiceConfig>
                factory={factory}
                initialValues={deploymentStageInputSet?.serviceConfig || {}}
                template={deploymentStageTemplate?.serviceConfig || {}}
                type={StepType.DeployService}
                stepViewType={viewType}
                path={`${path}.serviceConfig`}
                allowableTypes={allowableTypes}
                readonly={readonly}
                customStepProps={{ stageIdentifier }}
              />
            )}
            {(!isNil(deploymentStage?.serviceConfig?.serviceDefinition?.type) || isPropagating) && (
              /* istanbul ignore next */ <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={
                  isPropagating && deploymentStageInputSet
                    ? (deploymentStageInputSet?.serviceConfig?.stageOverrides as StageOverridesConfig)
                    : deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec || {}
                }
                allowableTypes={allowableTypes}
                template={
                  isPropagating && deploymentStageTemplate
                    ? deploymentStageTemplate?.serviceConfig?.stageOverrides
                    : deploymentStageTemplate?.serviceConfig?.serviceDefinition?.spec || {}
                }
                type={getStepTypeByDeploymentType(
                  defaultTo(deploymentStage?.serviceConfig?.serviceDefinition?.type, '')
                )}
                stepViewType={viewType}
                path={
                  isPropagating
                    ? `${path}.serviceConfig.stageOverrides`
                    : `${path}.serviceConfig.serviceDefinition.spec`
                }
                readonly={readonly}
                customStepProps={{
                  stageIdentifier,
                  allValues:
                    isPropagating && deploymentStageInputSet
                      ? deploymentStage?.serviceConfig?.stageOverrides
                      : deploymentStage?.serviceConfig?.serviceDefinition?.spec
                }}
                onUpdate={(data: any) => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                    deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.stageOverrides && isPropagating) {
                    deploymentStageInputSet.serviceConfig.stageOverrides = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure && (
        <div id={`Stage.${stageIdentifier}.Infrastructure`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('infrastructureText')}</div>

          <div className={cx(css.nestedAccordions, css.infraSection)}>
            {(deploymentStageTemplate.infrastructure as any).type === 'KubernetesDirect' ? (
              <>
                {(deploymentStageTemplate.infrastructure as any).spec?.connectorRef ? (
                  shouldRenderRunTimeInputViewWithAllowedValues(
                    'spec.connectorRef',
                    deploymentStageTemplate.infrastructure
                  ) ? (
                    renderMultiTypeInputWithAllowedValues({
                      name: `${namePath}infrastructure.spec.connectorRef`,
                      tooltipId: 'connectorRef',
                      labelKey: 'connectors.title.k8sCluster',
                      placeholderKey: 'pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder',
                      fieldPath: 'spec.connectorRef'
                    })
                  ) : (
                    <Container className={stepCss.bottomMargin3}>
                      <FormMultiTypeConnectorField
                        width={getConnectorRefWidth(viewType)}
                        name={`${namePath}infrastructure.spec.connectorRef`}
                        label={
                          <Text font={{ variation: FontVariation.FORM_LABEL }}>
                            {getString('connectors.title.k8sCluster')}
                          </Text>
                        }
                        placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        gitScope={gitScope}
                        multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                        setRefValue
                      />
                    </Container>
                  )
                ) : null}
                {(deploymentStageTemplate.infrastructure as any).spec?.namespace && (
                  <Container className={stepCss.bottomMargin3}>
                    {renderMultiTypeTextField({
                      name: `${namePath}infrastructure.spec.namespace`,
                      tooltipId: 'namespace',
                      labelKey: 'pipelineSteps.build.infraSpecifications.namespace',
                      inputProps: {
                        multiTextInputProps: {
                          expressions,
                          allowableTypes: allowableTypes
                        },
                        disabled: readonly
                      },
                      fieldPath: 'spec.namespace'
                    })}
                  </Container>
                )}
              </>
            ) : (deploymentStageTemplate.infrastructure as any).type === 'VM' ? (
              (deploymentStageTemplate.infrastructure as any).spec?.spec?.identifier && (
                <Container className={cx(stepCss.formGroup, stepCss.sm)}>
                  {renderMultiTypeTextField({
                    name: `${namePath}infrastructure.spec.spec.identifier`,
                    tooltipId: 'poolId',
                    labelKey: 'pipeline.buildInfra.poolId',
                    inputProps: {
                      multiTextInputProps: {
                        expressions,
                        allowableTypes: allowableTypes
                      },
                      disabled: readonly
                    },
                    fieldPath: 'spec.spec.identifier'
                  })}
                </Container>
              )
            ) : null}
            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml).spec?.volumes && (
              <Container data-name="100width" className={stepCss.bottomMargin5}>
                <Volumes
                  name={`${namePath}infrastructure.spec.volumes`}
                  formik={formik}
                  expressions={expressions}
                  disabled={readonly}
                  allowableTypes={[MultiTypeInputType.FIXED]}
                />
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.serviceAccountName && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.serviceAccountName`,
                  tooltipId: 'serviceAccountName',
                  labelKey: 'pipeline.infraSpecifications.serviceAccountName',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.serviceAccountName'
                })}
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.automountServiceAccountToken &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.automountServiceAccountToken`,
                labelKey: 'pipeline.buildInfra.automountServiceAccountToken',
                tooltipId: 'automountServiceAccountToken',
                defaultTrue: true
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.labels &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.labels`,
                stringKey: 'ci.labels'
              })}

            {(deploymentStageTemplate.infrastructure as any).spec?.annotations &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.annotations`,
                stringKey: 'ci.annotations'
              })}

            {hasContainerSecurityContextFields && (
              <>
                <Separator topSeparation={16} bottomSeparation={8} />
                <div className={cx(css.tabSubHeading, stepCss.topMargin5)} id="containerSecurityContext">
                  {getString('pipeline.buildInfra.containerSecurityContext')}
                </div>
              </>
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.privileged &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.privileged`,
                labelKey: 'pipeline.buildInfra.privileged',
                tooltipId: 'privileged'
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.allowPrivilegeEscalation &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.allowPrivilegeEscalation`,
                labelKey: 'pipeline.buildInfra.allowPrivilegeEscalation',
                tooltipId: 'allowPrivilegeEscalation'
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.capabilities?.add &&
              renderMultiTypeListInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.capabilities.add`,
                labelKey: 'pipeline.buildInfra.addCapabilities',
                tooltipId: 'addCapabilities'
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.capabilities?.drop &&
              renderMultiTypeListInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.capabilities.drop`,
                labelKey: 'pipeline.buildInfra.dropCapabilities',
                tooltipId: 'dropCapabilities'
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.runAsNonRoot &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.runAsNonRoot`,
                labelKey: 'pipeline.buildInfra.runAsNonRoot',
                tooltipId: 'runAsNonRoot'
              })}
            {(deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.readOnlyRootFilesystem &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.readOnlyRootFilesystem`,
                labelKey: 'pipeline.buildInfra.readOnlyRootFilesystem',
                tooltipId: 'readOnlyRootFilesystem'
              })}
            {((deploymentStageTemplate.infrastructure as any).spec?.runAsUser ||
              (deploymentStageTemplate.infrastructure as any).spec?.containerSecurityContext?.runAsUser) && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.containerSecurityContext.runAsUser`,
                  tooltipId: 'runAsUser',
                  labelKey: 'pipeline.stepCommonFields.runAsUser',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes,
                      placeholder: '1000'
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.containerSecurityContext.runAsUser'
                })}
              </Container>
            )}
            {hasContainerSecurityContextFields && <Separator topSeparation={16} bottomSeparation={16} />}
            {(deploymentStageTemplate.infrastructure as any).spec?.priorityClassName && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.priorityClassName`,
                  tooltipId: 'priorityClassName',
                  labelKey: 'pipeline.buildInfra.priorityClassName',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.priorityClassName'
                })}
              </Container>
            )}

            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml).spec?.nodeSelector &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.nodeSelector`,
                stringKey: 'pipeline.buildInfra.nodeSelector'
              })}
            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml).spec?.tolerations && (
              <Container data-name="100width" className={cx(stepCss.formGroup, stepCss.bottomMargin3)}>
                <MultiTypeCustomMap
                  name={`${namePath}infrastructure.spec.tolerations`}
                  appearance={'minimal'}
                  cardStyle={{ width: '50%' }}
                  valueMultiTextInputProps={{
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  }}
                  formik={formik}
                  multiTypeFieldSelectorProps={{
                    label: (
                      <Text
                        font={{ variation: FontVariation.FORM_LABEL }}
                        margin={{ bottom: 'xsmall' }}
                        tooltipProps={{ dataTooltipId: 'tolerations' }}
                      >
                        {getString('pipeline.buildInfra.tolerations')}
                      </Text>
                    ),
                    allowedTypes: allowableTypes
                  }}
                  disabled={readonly}
                  multiTypeMapKeys={[
                    { label: getString('pipeline.buildInfra.effect'), value: 'effect' },
                    { label: getString('keyLabel'), value: 'key' },
                    { label: getString('common.operator'), value: 'operator' },
                    { label: getString('valueLabel'), value: 'value' }
                  ]}
                  excludeId={true}
                />
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any).spec?.initTimeout && (
              <Container className={cx(stepCss.formGroup, stepCss.xlg, stepCss.bottomMargin3)}>
                {shouldRenderRunTimeInputViewWithAllowedValues(
                  'spec.initTimeout',
                  deploymentStageTemplate.infrastructure
                ) ? (
                  renderMultiTypeInputWithAllowedValues({
                    name: `${namePath}infrastructure.spec.initTimeout`,
                    tooltipId: 'timeout',
                    labelKey: 'pipeline.infraSpecifications.initTimeout',
                    fieldPath: 'spec.initTimeout'
                  })
                ) : (
                  <FormMultiTypeDurationField
                    label={
                      <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'timeout' }}>
                        {getString('pipeline.infraSpecifications.initTimeout')}
                      </Text>
                    }
                    name={`${namePath}infrastructure.spec.initTimeout`}
                    multiTypeDurationProps={{
                      expressions,
                      allowableTypes: allowableTypes
                    }}
                    disabled={readonly}
                  />
                )}
              </Container>
            )}
          </div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure?.environmentRef && (
              /* istanbul ignore next */ <StepWidget<PipelineInfrastructure>
                factory={factory}
                initialValues={deploymentStageInputSet?.infrastructure || {}}
                template={deploymentStageTemplate?.infrastructure || {}}
                type={StepType.DeployEnvironment}
                stepViewType={viewType}
                allowableTypes={allowableTypes}
                path={`${path}.infrastructure`}
                readonly={readonly}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition && (
              /* istanbul ignore next */ <StepWidget<Infrastructure>
                factory={factory}
                template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                allowableTypes={allowableTypes}
                allValues={
                  deploymentStage?.infrastructure?.infrastructureDefinition?.spec || /* istanbul ignore next */ {}
                }
                type={
                  ((infraDefinitionTypeMapping[
                    deploymentStage?.infrastructure?.infrastructureDefinition?.type as string
                  ] || deploymentStage?.infrastructure?.infrastructureDefinition?.type) as StepType) ||
                  StepType.KubernetesDirect
                }
                path={`${path}.infrastructure.infrastructureDefinition.spec`}
                readonly={readonly}
                onUpdate={data => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                    deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
                stepViewType={viewType}
                customStepProps={getCustomStepProps(
                  deploymentStage?.infrastructure?.infrastructureDefinition?.type || '',
                  getString
                )}
              />
            )}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure?.infrastructureDefinition?.provisioner && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.infrastructure.infrastructureDefinition?.provisioner`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.inputheader}>{getString('pipeline.provisionerSteps')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.steps`}
                allValues={deploymentStage?.infrastructure.infrastructureDefinition?.provisioner?.steps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={
                  deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps
                }
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.rollbackSteps`}
                allValues={deploymentStage?.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
          </div>
        </div>
      )}
      {(deploymentStageTemplate as any).sharedPaths && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.SharedPaths`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.nestedAccordions} style={{ width: '50%' }}>
            <MultiTypeListInputSet
              name={`${namePath}sharedPaths`}
              multiTextInputProps={{
                allowableTypes: allowableTypes,
                expressions
              }}
              multiTypeFieldSelectorProps={{
                label: (
                  <div className={css.inputheader} style={{ padding: 0 }}>
                    {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                  </div>
                ),
                allowedTypes: [MultiTypeInputType.FIXED]
              }}
              disabled={readonly}
            />
          </div>
        </div>
      )}
      {(deploymentStageTemplate as ServiceSpec).variables && (
        /* istanbul ignore next */ <div id={`Stage.${stageIdentifier}.Variables`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('common.variables')}</div>

          <div className={css.nestedAccordions}>WIP</div>
        </div>
      )}
      {(deploymentStageTemplate as any).serviceDependencies && (
        <div id={`Stage.${stageIdentifier}.ServiceDependencies`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('pipeline.serviceDependenciesText')}</div>

          <div className={css.nestedAccordions}>
            {(deploymentStageTemplate as any).serviceDependencies &&
              (deploymentStageTemplate as any).serviceDependencies.map(({ identifier }: any, index: number) => (
                <ServiceDependencyForm
                  template={(deploymentStageTemplate as any).serviceDependencies[index]}
                  path={`${path}.serviceDependencies[${index}]`}
                  allValues={(deploymentStage as any)?.serviceDependencies?.[index]}
                  values={deploymentStageInputSet?.serviceDependencies?.[index]}
                  readonly={readonly}
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                  key={identifier}
                  onUpdate={data => /* istanbul ignore next */ {
                    const originalServiceDependency = (deploymentStage as any)?.serviceDependencies?.[index]
                    let initialValues = deploymentStageInputSet?.serviceDependencies?.[index]

                    if (initialValues) {
                      if (!initialValues) {
                        initialValues = {
                          identifier: originalServiceDependency.identifier || '',
                          name: originalServiceDependency.name || '',
                          type: originalServiceDependency.type || ''
                        }
                      }

                      initialValues = {
                        ...data,
                        identifier: originalServiceDependency.identifier || '',
                        name: originalServiceDependency.name || '',
                        type: originalServiceDependency.type || ''
                      }

                      formik?.setValues(set(formik?.values, `${path}.serviceDependencies[${index}]`, initialValues))
                    }
                  }}
                />
              ))}
          </div>
        </div>
      )}
      {deploymentStageTemplate.execution && (
        <div id={`Stage.${stageIdentifier}.Execution`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('executionText')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.execution?.steps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.execution.steps}
                path={`${path}.execution.steps`}
                allValues={deploymentStage?.execution?.steps}
                values={deploymentStageInputSet?.execution?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
            {deploymentStageTemplate.execution?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                path={`${path}.execution.rollbackSteps`}
                allValues={deploymentStage?.execution?.rollbackSteps}
                values={deploymentStageInputSet?.execution?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)
