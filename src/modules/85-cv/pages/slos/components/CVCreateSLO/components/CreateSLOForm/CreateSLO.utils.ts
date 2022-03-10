/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import { CreateSLOEnum } from './CreateSLO.constants'
import type { SLOForm } from './CreateSLO.types'

export const isFormDataValid = (formikProps: FormikProps<SLOForm>, selectedTabId: CreateSLOEnum): boolean => {
  if (selectedTabId === CreateSLOEnum.NAME) {
    formikProps.setFieldTouched('name', true, false)
    formikProps.setFieldTouched('userJourneyRef', true, false)

    const { name, userJourneyRef } = formikProps.values

    if (!name || !userJourneyRef) {
      return false
    }
  }

  if (selectedTabId === CreateSLOEnum.SLI) {
    formikProps.setFieldTouched('monitoredServiceRef', true, false)
    formikProps.setFieldTouched('healthSourceRef', true, false)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.eventType', true, false)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.metric1', true, false)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.metric2', true, false)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.objectiveValue', true, false)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.comparator', true, false)

    const { monitoredServiceRef, healthSourceRef, serviceLevelIndicators } = formikProps.errors

    if (monitoredServiceRef || healthSourceRef || serviceLevelIndicators) {
      return false
    }
  }

  return true
}
