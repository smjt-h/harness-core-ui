/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text, Container, Layout, SelectOption, FormInput } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { RegExAllowedInputExpression } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import { getOptionalSubLabel } from './CIStepOptionalConfig'
import {
  AllMultiTypeInputTypesForInputSet,
  AllMultiTypeInputTypesForStep,
  shouldRenderRunTimeInputViewWithAllowedValues
} from './StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ConnectorRefWithImageProps {
  showOptionalSublabel?: boolean
  readonly?: boolean
  showConnectorRef?: boolean
  showImage?: boolean
  stepViewType: StepViewType
  path?: string
  isInputSetView?: boolean
  template?: Record<string, any>
}

export const ConnectorRefWithImage: React.FC<ConnectorRefWithImageProps> = props => {
  const {
    showOptionalSublabel,
    readonly,
    showConnectorRef = true,
    showImage = true,
    stepViewType,
    path,
    isInputSetView,
    template
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg
  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeInputWithAllowedValues = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      fieldPath
    }: {
      name: string
      tooltipId?: string
      labelKey: keyof StringsMap
      fieldPath: string
    }) => {
      if (!name) {
        return
      }
      if (template && fieldPath) {
        const value = get(template, fieldPath, '')
        const items: SelectOption[] = []
        if (RegExAllowedInputExpression.test(value as string)) {
          // This separates out "<+input>.allowedValues(a, b, c)" to ["<+input>", ["a", "b", "c"]]
          const match = (value as string).match(RegExAllowedInputExpression)
          if (match && match?.length > 1) {
            const allowedValues = match[1]
            items.push(...allowedValues.split(',').map(item => ({ label: item, value: item })))
          }
        }
        return (
          <FormInput.MultiTypeInput
            name={name}
            label={getString(labelKey)}
            useValue
            selectItems={items}
            multiTypeInputProps={{
              allowableTypes: AllMultiTypeInputTypesForInputSet,
              expressions,
              selectProps: { disabled: readonly, items }
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: tooltipId ?? '' }}
          />
        )
      }
    },
    [template]
  )

  return (
    <>
      {showConnectorRef ? (
        <Container className={css.bottomMargin3}>
          {isInputSetView && shouldRenderRunTimeInputViewWithAllowedValues('spec.connectorRef', template) ? (
            <Container className={cx(css.formGroup, stepCss)}>
              {renderMultiTypeInputWithAllowedValues({
                name: `${prefix}spec.connectorRef`,
                labelKey: 'pipelineSteps.connectorLabel',
                fieldPath: 'spec.connectorRef'
              })}
            </Container>
          ) : (
            <FormMultiTypeConnectorField
              label={
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {getString('pipelineSteps.connectorLabel')}
                  </Text>
                  &nbsp;
                  {showOptionalSublabel ? getOptionalSubLabel(getString) : null}
                </Layout.Horizontal>
              }
              type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER]}
              width={385}
              name={`${prefix}spec.connectorRef`}
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              multiTypeProps={{
                expressions,
                allowableTypes: AllMultiTypeInputTypesForStep,
                disabled: readonly
              }}
              gitScope={gitScope}
              setRefValue
            />
          )}
        </Container>
      ) : null}
      {showImage ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {isInputSetView && shouldRenderRunTimeInputViewWithAllowedValues('spec.connectorRef', template) ? (
            renderMultiTypeInputWithAllowedValues({
              name: `${prefix}spec.image`,
              labelKey: 'imageLabel',
              tooltipId: showOptionalSublabel ? '' : 'image',
              fieldPath: 'spec.image'
            })
          ) : (
            <MultiTypeTextField
              name={`${prefix}spec.image`}
              label={
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    tooltipProps={
                      showOptionalSublabel
                        ? {}
                        : {
                            dataTooltipId: 'image'
                          }
                    }
                    placeholder={getString('imagePlaceholder')}
                  >
                    {getString('imageLabel')}
                  </Text>
                  &nbsp;
                  {showOptionalSublabel ? getOptionalSubLabel(getString, 'image') : null}
                </Layout.Horizontal>
              }
              multiTextInputProps={{
                multiTextInputProps: {
                  allowableTypes: AllMultiTypeInputTypesForStep
                }
              }}
            />
          )}
        </Container>
      ) : null}
    </>
  )
}
