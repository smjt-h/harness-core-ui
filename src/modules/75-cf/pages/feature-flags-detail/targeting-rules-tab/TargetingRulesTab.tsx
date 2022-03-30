/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, Formik, FormikForm, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import {
  Feature,
  GetAllSegmentsQueryParams,
  GetAllTargetsQueryParams,
  TargetMap,
  useGetAllSegments,
  useGetAllTargets
} from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import TargetingRulesTabFooter from './components/tab-targeting-footer/TargetingRulesTabFooter'

import FlagEnabledRulesCard from './components/flag-enabled-rules-card/FlagEnabledRulesCard'
import css from './TargetingRulesTab.module.scss'

export interface TargetingRulesFormValues {
  state: string
  onVariation: string
  formVariationMap: FormVariationMap[]
}
export interface TargetGroup {
  identifier: string
  ruleId: string
  name: string
}
export interface FormVariationMap {
  variationIdentifier: string
  variationName: string
  targetGroups: TargetGroup[]
  targets: TargetMap[]
  isVisible: boolean
}
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
    const formTargets =
      featureFlagData.envProperties?.variationMap?.find(
        variationMapItem => variation.identifier === variationMapItem.variation
      )?.targets || []

    const formTargetGroups =
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
      targets: formTargets,
      targetGroups: formTargetGroups,
      isVisible: formTargets.length > 0 || formTargetGroups.length > 0
    }
  })

  const initialValues = {
    state: featureFlagData.envProperties?.state as string,
    onVariation: featureFlagData.envProperties?.defaultServe.variation
      ? featureFlagData.envProperties?.defaultServe.variation
      : featureFlagData.defaultOnVariation,
    formVariationMap: formVariationMap
  }

  const { saveChanges, loading: patchFeatureLoading } = usePatchFeatureFlag({
    initialValues,
    featureFlagIdentifier: featureFlagData.identifier,
    refetchFlag
  })

  const isLoading = patchFeatureLoading || refetchFlagLoading || targetsLoading || segmentsLoading

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={false}
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      onSubmit={values => {
        saveChanges(values)
      }}
    >
      {formikProps => {
        return (
          <FormikForm data-testid="targeting-rules-tab-form">
            <Container className={css.tabContainer}>
              <Layout.Vertical spacing="small" padding={{ left: 'xlarge', right: 'xlarge' }}>
                <Card elevation={0}>
                  <FlagToggleSwitch
                    disabled={isLoading}
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
                  isLoading={isLoading}
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
                />

                <Card>OFF rules section</Card>
              </Layout.Vertical>

              {formikProps.dirty && (
                <TargetingRulesTabFooter
                  isLoading={isLoading}
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
