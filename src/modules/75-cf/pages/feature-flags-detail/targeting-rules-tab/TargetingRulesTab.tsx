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
import { validateYupSchema, yupToFormErrors } from 'formik'
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
import type { FormVariationMap, VariationPercentageRollout, TargetGroup, TargetingRulesFormValues } from './Types.types'
import useFeatureEnabled from './hooks/useFeatureEnabled'
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
  const formVariationMap: FormVariationMap[] = featureFlagData.variations.map(variation => {
    const variationTargets =
      featureFlagData.envProperties?.variationMap?.find(
        variationMapItem => variation.identifier === variationMapItem.variation
      )?.targets || []

    const variationTargetGroups =
      featureFlagData.envProperties?.rules
        ?.filter(rule => rule.serve.variation === variation.identifier)
        .map(targetGroupRule => ({
          identifier: targetGroupRule.clauses[0].values[0],
          ruleId: targetGroupRule.ruleId as string,
          name: segments.find(segment => segment.identifier === targetGroupRule.clauses[0].values[0])?.name as string
        })) || []

    return {
      variationIdentifier: variation.identifier,
      variationName: variation.name as string,
      targets: variationTargets,
      targetGroups: variationTargetGroups,
      isVisible: variationTargets.length > 0 || variationTargetGroups.length > 0
    }
  })

  const variationPercentageRollouts = featureFlagData.envProperties?.rules?.filter(rule => rule.serve.distribution)

  const initialValues: TargetingRulesFormValues = {
    state: featureFlagData.envProperties?.state as string,
    onVariation: featureFlagData.envProperties?.defaultServe.variation
      ? featureFlagData.envProperties?.defaultServe.variation
      : featureFlagData.defaultOnVariation,
    formVariationMap,
    variationPercentageRollouts: variationPercentageRollouts
      ? variationPercentageRollouts.map(percentageRollout => ({
          variations: percentageRollout.serve.distribution?.variations || [],
          bucketBy: percentageRollout.serve.distribution?.bucketBy || 'identifier',
          clauses: percentageRollout.clauses,
          ruleId: percentageRollout.ruleId as string
        }))
      : []
  }

  const validate = (values: TargetingRulesFormValues) => {
    try {
      validateYupSchema(
        values,
        yup.object({
          variationPercentageRollouts: yup.array().of(
            yup.object({
              clauses: yup.array().of(
                yup.object({
                  values:
                    values.variationPercentageRollouts.length > 0
                      ? yup
                          .array()
                          .of(yup.string().required(getString('cf.featureFlags.rules.validation.selectTargetGroup')))
                      : yup.array().of(yup.string())
                })
              ),
              variations: yup.lazy(value => {
                return yup.array().of(
                  yup.object({
                    weight:
                      values.variationPercentageRollouts.length > 0
                        ? yup
                            .number()
                            .typeError(getString('cf.creationModal.mustBeNumber'))
                            .required(getString('cf.featureFlags.rules.validation.valueRequired'))
                            .test(
                              'weight-sum-test',
                              getString('cf.featureFlags.rules.validation.valueMustAddTo100'),
                              () => {
                                const totalWeight = (value as WeightedVariation[])
                                  .map(x => x.weight)
                                  .reduce((previous, current) => previous + current, 0)

                                return totalWeight === 100
                              }
                            )
                        : yup.number()
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
                padding={{ left: 'xlarge', right: 'xlarge' }}
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

                <FlagEnabledRulesCard
                  formVariationMap={formikProps.values.formVariationMap}
                  targets={targets}
                  segments={segments}
                  featureFlagVariations={featureFlagData.variations}
                  variationPercentageRollouts={formikProps.values.variationPercentageRollouts}
                  disabled={disabled}
                  updateTargetGroups={(index: number, newTargetGroups: TargetGroup[]) =>
                    formikProps.setFieldValue(`formVariationMap[${index}].targetGroups`, newTargetGroups)
                  }
                  updateTargets={(index: number, newTargets) =>
                    formikProps.setFieldValue(`formVariationMap[${index}].targets`, newTargets)
                  }
                  addVariation={newVariation => {
                    const addedVariationIndex = formVariationMap.findIndex(
                      variation => variation.variationIdentifier === newVariation.variationIdentifier
                    )
                    formikProps.setFieldValue(`formVariationMap[${addedVariationIndex}].isVisible`, true)
                  }}
                  removeVariation={removedVariation => {
                    const removedVariationIndex = formVariationMap.findIndex(
                      variation => variation.variationIdentifier === removedVariation.variationIdentifier
                    )
                    formikProps.setFieldValue(`formVariationMap[${removedVariationIndex}]`, {
                      ...removedVariation,
                      targets: [],
                      targetGroups: [],
                      isVisible: false
                    })
                  }}
                  addPercentageRollout={() => {
                    // need to add with empty fields so the validation messages appear correctly
                    const newPercentageRollout: VariationPercentageRollout = {
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
                    const percentageRollouts = [...formikProps.values.variationPercentageRollouts, newPercentageRollout]
                    formikProps.setFieldValue(`variationPercentageRollouts`, percentageRollouts)
                  }}
                  removePercentageRollout={index => {
                    const percentageRollouts = [...formikProps.values.variationPercentageRollouts]
                    percentageRollouts.splice(index, 1)
                    formikProps.setFieldValue(`variationPercentageRollouts`, percentageRollouts)
                  }}
                />

                <Card>OFF rules section</Card>
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
