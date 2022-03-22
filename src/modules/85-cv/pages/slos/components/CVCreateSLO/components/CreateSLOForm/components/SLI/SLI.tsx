/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  Heading,
  Card,
  FormInput,
  SelectOption,
  Layout,
  Container,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import type { RadioButtonProps } from '@wings-software/uicore/dist/components/RadioButton/RadioButton'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { defaultOption } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import { SLIProps, SLOFormFields, SLITypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { getHealthSourceOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
import SLIContextualHelpText from './components/SLIContextualHelpText'
import PickMetric from './views/PickMetric'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLI: React.FC<SLIProps> = ({
  children,
  formikProps,
  monitoredServicesLoading,
  monitoredServicesData,
  ...rest
}) => {
  const FLEX_START = 'flex-start'
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { monitoredServiceIdentifier } = useQueryParams<{ monitoredServiceIdentifier?: string }>()
  const { values } = formikProps

  const healthSourcesOptions = useMemo(
    () => getHealthSourceOptions(monitoredServicesData?.data, values?.monitoredServiceRef),
    [values?.monitoredServiceRef, monitoredServicesData]
  )

  const activeHealthSource: SelectOption = useMemo(
    () => healthSourcesOptions.find(healthSource => healthSource.value === values.healthSourceRef) ?? defaultOption,
    [healthSourcesOptions, values.healthSourceRef]
  )

  const radioItems: Pick<RadioButtonProps, 'label' | 'value'>[] = useMemo(() => {
    const { AVAILABILITY, LATENCY } = SLITypes
    return [
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.availability"
            description="cv.slos.contextualHelp.sli.availabilityDescription"
          />
        ),
        value: AVAILABILITY
      },
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.latency"
            description="cv.slos.contextualHelp.sli.latencyDescription"
          />
        ),
        value: LATENCY
      }
    ]
  }, [])

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }}>
        {getString('cv.slos.configureSLIQueries')}
      </Heading>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400} margin={{ bottom: 'small' }}>
        {getString('cv.forConfigurationYouWillNeedAtLeastOneMonitoredServiceWithAHealthSourceAndAMetric')}
      </Text>
      <Card className={css.cardSli}>
        <Layout.Horizontal flex={{ justifyContent: FLEX_START, alignItems: FLEX_START }}>
          <Container width="50%" border={{ right: true }}>
            <Layout.Vertical width="80%">
              <Layout.Horizontal flex={{ justifyContent: FLEX_START }}>
                <FormInput.Select
                  name={SLOFormFields.HEALTH_SOURCE_REF}
                  label={getString('cv.slos.healthSourceForSLI')}
                  placeholder={
                    monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectHealthsource')
                  }
                  items={healthSourcesOptions}
                  className={css.selectPrimary}
                  disabled={!values.monitoredServiceRef}
                  value={activeHealthSource}
                  onChange={healthSource => {
                    formikProps.setFieldValue(SLOFormFields.HEALTH_SOURCE_REF, healthSource.value)
                    formikProps.setFieldValue(SLOFormFields.VALID_REQUEST_METRIC, undefined)
                    formikProps.setFieldValue(SLOFormFields.GOOD_REQUEST_METRIC, undefined)
                  }}
                />
                <RbacButton
                  icon="plus"
                  text={getString('cv.healthSource.newHealthSource')}
                  variation={ButtonVariation.LINK}
                  disabled={!values.monitoredServiceRef}
                  onClick={() => {
                    history.push({
                      pathname: routes.toCVAddMonitoringServicesEdit({
                        accountId,
                        orgIdentifier,
                        projectIdentifier,
                        identifier: values.monitoredServiceRef,
                        module: 'cv'
                      }),
                      search: getCVMonitoringServicesSearchParam({
                        tab: MonitoredServiceEnum.Configurations,
                        redirectToSLO: true,
                        sloIdentifier: identifier,
                        monitoredServiceIdentifier
                      })
                    })
                  }}
                  permission={{
                    permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                    resource: {
                      resourceType: ResourceType.MONITOREDSERVICE,
                      resourceIdentifier: projectIdentifier
                    }
                  }}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical width="80%">
              <Heading
                level={4}
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                margin={{ top: 'xlarge', bottom: 'small' }}
              >
                {getString('cv.slos.sliTypeChooseMetric')}
              </Heading>
              <FormInput.RadioGroup name={SLOFormFields.SLI_TYPE} className={css.radioGroup} items={radioItems} />
            </Layout.Vertical>
          </Container>
          <Container className={css.contextualHelp} width="50%" padding={{ left: 'large', right: 'large' }}>
            <SLIContextualHelpText />
          </Container>
        </Layout.Horizontal>
      </Card>

      <PickMetric formikProps={formikProps} {...rest} />
      {children}
    </>
  )
}

export default SLI
