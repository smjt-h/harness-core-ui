/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, Formik, FormikForm, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import * as yup from 'yup'
import { FieldArray, validateYupSchema, yupToFormErrors } from 'formik'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import {
  Feature,
  GetAllSegmentsQueryParams,
  GetAllTargetsQueryParams,
  useGetAllSegments,
  useGetAllTargets,
  WeightedVariation
} from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useStrings } from 'framework/strings'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import TargetingRulesTabFooter from './components/tab-targeting-footer/TargetingRulesTabFooter'

import FlagEnabledRulesCard from './components/flag-enabled-rules-card/FlagEnabledRulesCard'
import {
  FormVariationMap,
  VariationPercentageRollout,
  TargetGroup,
  TargetingRulesFormValues,
  TargetingRuleItemType
} from './Types.types'
import useFeatureEnabled from './hooks/useFeatureEnabled'
import DefaultRules from './components/default-rules/DefaultRules'
import css from './TargetingRulesTab.module.scss'
export interface TargetingRulesTabProps {
  featureFlagData: Feature
  refetchFlag: () => Promise<unknown>
  refetchFlagLoading: boolean
}

const TargetingRulesTab = ({
  featureFlagData,
  refetchFlag,
  refetchFlagLoading
}: TargetingRulesTabProps): ReactElement => {
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { getString } = useStrings()

  const { data: targetsData, loading: targetsLoading } = useGetAllTargets({
    queryParams: {
      environmentIdentifier,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: 1000
    } as GetAllTargetsQueryParams
  })

  const { data: segmentsData, loading: segmentsLoading } = useGetAllSegments({
    queryParams: {
      environmentIdentifier,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: 1000
    } as GetAllSegmentsQueryParams
  })

  const segments = segmentsData?.segments || []
  const targets = targetsData?.targets || []

  // convert variations/targets/target groups into a more UI friendly structure
  // Individual rules (variations/percentage rollouts) don't have a priority - only target groups do
  // so we sort the rules initially by target group priority,
  // and assign a "base priority" to the rule, which the target groups added to a variation will base their priorities off.
  // This is to maintain the ordering
  const formVariationMap: FormVariationMap[] = []
  featureFlagData.variations.forEach(variation => {
    const variationTargets =
      featureFlagData.envProperties?.variationMap?.find(
        variationMapItem => variation.identifier === variationMapItem.variation
      )?.targets || []

    const variationTargetGroups: TargetGroup[] =
      featureFlagData.envProperties?.rules
        ?.filter(rule => rule.serve.variation === variation.identifier)
        .map(targetGroupRule => ({
          priority: targetGroupRule.priority,
          identifier: targetGroupRule.clauses[0].values[0],
          ruleId: targetGroupRule.ruleId as string,
          name: segments.find(segment => segment.identifier === targetGroupRule.clauses[0].values[0])?.name as string
        })) || []

    // highest priority = lowest number
    const highestPriority =
      variationTargetGroups?.reduce(
        (prev: TargetGroup, current: TargetGroup) => (prev.priority < current.priority ? prev : current),
        {} as TargetGroup
      ).priority || 0

    // if this variation doesn't contain any targets/target groups we dont display it initially
    if (variationTargets.length || variationTargetGroups.length) {
      formVariationMap.push({
        priority: highestPriority,
        type: TargetingRuleItemType.VARIATION,
        variationIdentifier: variation.identifier,
        variationName: variation.name as string,
        targets: variationTargets,
        targetGroups: variationTargetGroups
      })
    }
  })

  const percentageRolloutRules = featureFlagData.envProperties?.rules?.filter(rule => rule.serve.distribution)
  const variationPercentageRollouts: VariationPercentageRollout[] = percentageRolloutRules
    ? percentageRolloutRules.map(percentageRollout => ({
        type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
        priority: percentageRollout.priority,
        variations: percentageRollout.serve.distribution?.variations || [],
        bucketBy: percentageRollout.serve.distribution?.bucketBy || 'identifier',
        clauses: percentageRollout.clauses,
        ruleId: percentageRollout.ruleId as string
      }))
    : []

  const targetingRuleItems = [...formVariationMap, ...variationPercentageRollouts].sort(
    (prev, next) => prev?.priority - next?.priority
  )

  const initialValues: TargetingRulesFormValues = {
    state: featureFlagData.envProperties?.state as string,
    onVariation: featureFlagData.envProperties?.defaultServe.variation
      ? featureFlagData.envProperties?.defaultServe.variation
      : featureFlagData.defaultOnVariation,
    offVariation: featureFlagData.envProperties?.offVariation as string,
    targetingRuleItems
  }

  const validate = (values: TargetingRulesFormValues) => {
    try {
      validateYupSchema(
        values,
        yup.object({
          targetingRuleItems: yup.array().of(
            yup.object({
              clauses: yup.array().of(
                yup.object({
                  values: yup
                    .array()
                    .of(yup.string().required(getString('cf.featureFlags.rules.validation.selectTargetGroup')))
                })
              ),
              variations: yup.lazy(value => {
                return yup.array().of(
                  yup.object({
                    weight: yup
                      .number()
                      .typeError(getString('cf.creationModal.mustBeNumber'))
                      .required(getString('cf.featureFlags.rules.validation.valueRequired'))
                      .test('weight-sum-test', getString('cf.featureFlags.rules.validation.valueMustAddTo100'), () => {
                        const totalWeight = (value as WeightedVariation[])
                          .map(x => x.weight)
                          .reduce((previous, current) => previous + current, 0)

                        return totalWeight === 100
                      })
                  })
                )
              })
            })
          )
        }),
        true,
        values
      )
    } catch (err) {
      return yupToFormErrors(err) //for rendering validation errors
    }

    return {}
  }

  const { saveChanges, loading: patchFeatureLoading } = usePatchFeatureFlag({
    initialValues,
    variations: featureFlagData.variations,
    featureFlagIdentifier: featureFlagData.identifier,
    refetchFlag
  })

  const { featureEnabled } = useFeatureEnabled()
  const disabled = patchFeatureLoading || refetchFlagLoading || targetsLoading || segmentsLoading || !featureEnabled

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={false}
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      validate={values => validate(values)}
      onSubmit={values => {
        saveChanges(values)
      }}
    >
      {formikProps => {
        return (
          <FormikForm data-testid="targeting-rules-tab-form" disabled={disabled}>
            <Container className={css.tabContainer}>
              <Layout.Vertical
                spacing="small"
                padding={{ left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}
                className={css.flagRulesSection}
              >
                <Card elevation={0}>
                  <FlagToggleSwitch
                    disabled={disabled}
                    currentState={formikProps.values.state}
                    currentEnvironmentState={featureFlagData.envProperties?.state}
                    handleToggle={() =>
                      formikProps.setFieldValue(
                        'state',
                        formikProps.values.state === FeatureFlagActivationStatus.OFF
                          ? FeatureFlagActivationStatus.ON
                          : FeatureFlagActivationStatus.OFF
                      )
                    }
                  />
                </Card>
                <FieldArray
                  name="targetingRuleItems"
                  render={arrayHelpers => (
                    <FlagEnabledRulesCard
                      targetingRuleItems={formikProps.values.targetingRuleItems}
                      targets={targets}
                      segments={segments}
                      featureFlagVariations={featureFlagData.variations}
                      disabled={disabled}
                      updateTargetGroups={(index: number, newTargetGroups: TargetGroup[]) => {
                        const newTargetingRuleItem = {
                          ...formikProps.values.targetingRuleItems[index],
                          targetGroups: newTargetGroups
                        }
                        arrayHelpers.replace(index, newTargetingRuleItem)
                      }}
                      updateTargets={(index: number, newTargets) => {
                        const newTargetingRuleItem = {
                          ...formikProps.values.targetingRuleItems[index],
                          targets: newTargets
                        }
                        arrayHelpers.replace(index, newTargetingRuleItem)
                      }}
                      addVariation={newVariation => {
                        const variation = {
                          priority: 100,
                          type: TargetingRuleItemType.VARIATION,
                          variationIdentifier: newVariation.identifier,
                          variationName: newVariation.name,
                          targets: [],
                          targetGroups: []
                        }

                        arrayHelpers.push(variation)
                      }}
                      removeVariation={removedVariationIndex => {
                        arrayHelpers.remove(removedVariationIndex)
                      }}
                      addPercentageRollout={() => {
                        // need to add with empty fields so the validation messages appear correctly
                        const newPercentageRollout = {
                          type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
                          bucketBy: 'identifier',
                          clauses: [
                            {
                              attribute: '',
                              id: '',
                              negate: false,
                              op: '',
                              values: ['']
                            }
                          ],
                          variations: featureFlagData.variations.map(variation => ({
                            variation: variation.identifier,
                            weight: 0
                          })),
                          ruleId: uuid()
                        }
                        arrayHelpers.push(newPercentageRollout)
                      }}
                      removePercentageRollout={index => {
                        arrayHelpers.remove(index)
                      }}
                    />
                  )}
                />

                <Card>
                  <DefaultRules
                    hideSubheading
                    featureFlagVariations={featureFlagData.variations}
                    titleStringId="cf.featureFlags.rules.whenFlagDisabled"
                    inputName="offVariation"
                  />
                </Card>
              </Layout.Vertical>

              {formikProps.dirty && (
                <TargetingRulesTabFooter
                  isLoading={disabled}
                  handleSubmit={formikProps.handleSubmit}
                  handleCancel={formikProps.handleReset}
                />
              )}
            </Container>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default TargetingRulesTab
