/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext, useMemo } from 'react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { flatten, noop } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import type { GroupedCreatedMetrics } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import { useStrings } from 'framework/strings'
import {
  initGroupedCreatedMetrics,
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '../../common/CustomMetric/CustomMetric.utils'
import {
  transformCustomHealthSourceToSetupSource,
  validateMappings,
  onSubmitCustomHealthSource,
  getInitCustomMetricData
} from './CustomHealthSource.utils'
import type { CustomHealthSourceSetupSource, MapCustomHealthToService } from './CustomHealthSource.types'

import { defaultMetricName } from './CustomHealthSource.constants'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import CustomMetric from '../../common/CustomMetric/CustomMetric'

import type {
  CreatedMetricsWithSelectedIndex,
  CustomMappedMetric,
  CustomSelectedAndMappedMetrics
} from '../../common/CustomMetric/CustomMetric.types'
import CustomHealthSourceForm from './CustomHealthSourceForm'
import css from './CustomHealthSource.module.scss'

export interface CustomHealthSourceProps {
  data: any
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export function CustomHealthSource(props: CustomHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const { data: sourceData, onSubmit } = props

  const transformedSourceData = useMemo(() => transformCustomHealthSourceToSetupSource(sourceData), [sourceData])

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<CustomSelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(
      defaultMetricName,
      getInitCustomMetricData(''),
      transformedSourceData.mappedServicesAndEnvs as Map<string, CustomMappedMetric>
    )
  )

  const [groupedCreatedMetrics, setGroupedCreatedMetrics] = useState<GroupedCreatedMetrics>(
    initGroupedCreatedMetrics(mappedMetrics, getString)
  )

  const groupedCreatedMetricsList = flatten(Object.values(groupedCreatedMetrics))
    .map(item => item.metricName)
    .filter(item => Boolean(item)) as string[]

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(defaultMetricName, selectedMetric, mappedMetrics)
  )

  return (
    <Formik<MapCustomHealthToService>
      formName="mapPrometheus"
      initialValues={mappedMetrics.get(selectedMetric || '') as MapCustomHealthToService}
      isInitialValid={(args: any) =>
        Object.keys(
          validateMappings(
            getString,
            groupedCreatedMetricsList,
            groupedCreatedMetricsList.indexOf(selectedMetric),
            args.initialValues
          )
        ).length === 0
      }
      onSubmit={noop}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(
          getString,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          values
        )
      }}
    >
      {formikProps => {
        return (
          <FormikForm className={css.formFullheight}>
            <CustomMetric
              isValidInput={formikProps.isValid}
              setMappedMetrics={setMappedMetrics}
              selectedMetric={selectedMetric}
              formikValues={formikProps.values as any}
              mappedMetrics={mappedMetrics}
              createdMetrics={createdMetrics}
              setCreatedMetrics={setCreatedMetrics}
              defaultMetricName={'appdMetric'}
              tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
              addFieldLabel={getString('cv.monitoringSources.addMetric')}
              initCustomForm={getInitCustomMetricData(formikProps.values.baseURL) as any}
              groupedCreatedMetrics={groupedCreatedMetrics}
              setGroupedCreatedMetrics={setGroupedCreatedMetrics}
            >
              <CustomHealthSourceForm
                formValue={formikProps.values}
                onFieldChange={formikProps.setFieldValue}
                onValueChange={formikProps.setValues}
                mappedMetrics={mappedMetrics}
                selectedMetric={selectedMetric}
                connectorIdentifier={sourceData?.connectorRef || ''}
              />
            </CustomMetric>
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={onSubmitCustomHealthSource({
                formikProps,
                createdMetrics,
                selectedMetricIndex,
                mappedMetrics,
                selectedMetric,
                onSubmit,
                sourceData,
                transformedSourceData,
                getString
              })}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
