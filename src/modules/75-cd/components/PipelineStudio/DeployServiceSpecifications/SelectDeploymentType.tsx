/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Card, Color, HarnessDocTooltip, Icon, Layout, Popover, ThumbnailSelect } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { DeploymentTypeItem } from './DeploymentInterface'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'
import deployServiceCsss from './DeployServiceSpecifications.module.scss'

interface SelectServiceDeploymentTypeProps {
  selectedDeploymentType: string
  isReadonly: boolean
  handleDeploymentTypeChange: (deploymentType: string) => void
}

export default function SelectDeploymentType(props: SelectServiceDeploymentTypeProps): JSX.Element {
  const { selectedDeploymentType, isReadonly } = props
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const { licenseInformation } = useLicenseStore()
  const { NG_NATIVE_HELM } = useFeatureFlags()
  const { accountId } = useParams<{
    accountId: string
  }>()

  // Supported in NG
  const ngSupportedDeploymentTypes: DeploymentTypeItem[] = React.useMemo(
    () => [
      {
        label: getString('serviceDeploymentTypes.kubernetes'),
        icon: 'service-kubernetes',
        value: 'Kubernetes'
      }
    ],
    [getString]
  )

  // Suppported in CG
  const cgSupportedDeploymentTypes: DeploymentTypeItem[] = React.useMemo(
    () => [
      {
        label: getString('pipeline.nativeHelm'),
        icon: 'service-helm',
        value: 'NativeHelm'
      },
      {
        label: getString('serviceDeploymentTypes.amazonEcs'),
        icon: 'service-ecs',
        value: 'amazonEcs'
      },
      {
        label: getString('serviceDeploymentTypes.amazonAmi'),
        icon: 'main-service-ami',
        value: 'amazonAmi'
      },
      {
        label: getString('serviceDeploymentTypes.awsCodeDeploy'),
        icon: 'app-aws-code-deploy',
        value: 'awsCodeDeploy'
      },
      {
        label: getString('serviceDeploymentTypes.winrm'),
        icon: 'command-winrm',
        value: 'winrm'
      },
      {
        label: getString('serviceDeploymentTypes.awsLambda'),
        icon: 'app-aws-lambda',
        value: 'awsLambda'
      },
      {
        label: getString('serviceDeploymentTypes.pcf'),
        icon: 'service-pivotal',
        value: 'pcf'
      },
      {
        label: getString('serviceDeploymentTypes.ssh'),
        icon: 'secret-ssh',
        value: 'ssh'
      }
    ],
    [getString]
  )

  const [cgDeploymentTypes, setCgDeploymentTypes] = React.useState(cgSupportedDeploymentTypes)

  React.useEffect(() => {
    if (licenseInformation[ModuleName.CD]?.licenseType !== 'TRIAL') {
      cgSupportedDeploymentTypes.forEach(deploymentType => {
        deploymentType['disabled'] = true
        if (deploymentType.value === 'NativeHelm') {
          deploymentType['disabled'] = !NG_NATIVE_HELM
        }
      })
    } else {
      const onClick = () => {
        window.location.href = `${window.location.href.split('/ng/')[0]}/#/account/${accountId}/onboarding`
      }
      cgSupportedDeploymentTypes.forEach(deploymentType => {
        deploymentType['disabled'] = false
        deploymentType['tooltip'] = (
          <div className={deployServiceCsss.tooltipContainer} onClick={onClick}>
            Use in Continuous Delivery First Generation
          </div>
        )
        deploymentType['tooltipProps'] = { isDark: true }
      })
    }
    setCgDeploymentTypes(cgSupportedDeploymentTypes)
  }, [licenseInformation, NG_NATIVE_HELM])

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  }, [formikRef])

  const renderDeploymentTypes = React.useCallback((): JSX.Element => {
    if (licenseInformation[ModuleName.CD]?.licenseType === 'TRIAL') {
      return (
        <Layout.Horizontal margin={{ top: 'medium' }}>
          <Layout.Vertical border={{ right: true }} margin={{ right: 'huge' }} padding={{ right: 'huge' }}>
            <div className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}>
              {getString('common.currentlyAvailable')}
            </div>
            <ThumbnailSelect
              className={stageCss.thumbnailSelect}
              name={'deploymentType'}
              items={ngSupportedDeploymentTypes}
              isReadonly={isReadonly}
              onChange={props.handleDeploymentTypeChange}
            />
          </Layout.Vertical>

          <Layout.Vertical>
            <Layout.Horizontal>
              <div className={deployServiceCsss.comingSoonBanner}>{getString('common.comingSoon')}</div>
              <div
                className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
                data-tooltip-id="supportedInFirstGeneration"
              >
                {getString('common.supportedInFirstGeneration')}
                <HarnessDocTooltip tooltipId="supportedInFirstGeneration" useStandAlone={true} />
              </div>
              <Popover
                position="auto"
                interactionKind={PopoverInteractionKind.HOVER}
                content={'Hi, Hello, How are you ?'}
                className={Classes.DARK}
              >
                <span className={deployServiceCsss.tooltipIcon}>
                  <Icon size={12} name="tooltip-icon" color={Color.PRIMARY_7} />
                </span>
              </Popover>
            </Layout.Horizontal>
            <ThumbnailSelect
              className={stageCss.thumbnailSelect}
              name={'deploymentType'}
              items={cgDeploymentTypes}
              isReadonly={isReadonly}
              onChange={props.handleDeploymentTypeChange}
            />
          </Layout.Vertical>
        </Layout.Horizontal>
      )
    }
    return (
      <ThumbnailSelect
        className={stageCss.thumbnailSelect}
        name={'deploymentType'}
        items={[...ngSupportedDeploymentTypes, ...cgDeploymentTypes]}
        isReadonly={isReadonly}
        onChange={props.handleDeploymentTypeChange}
      />
    )
  }, [
    cgDeploymentTypes,
    ngSupportedDeploymentTypes,
    getString,
    isReadonly,
    licenseInformation,
    props.handleDeploymentTypeChange
  ])

  return (
    <Formik<{ deploymentType: string }>
      onSubmit={noop}
      enableReinitialize={true}
      initialValues={{ deploymentType: selectedDeploymentType }}
      validationSchema={Yup.object().shape({
        deploymentType: Yup.string().required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
        formikRef.current = formik
        return (
          <Card className={stageCss.sectionCard}>
            <div
              className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id="stageOverviewDeploymentType"
            >
              {getString('deploymentTypeText')}
              <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
            </div>
            {renderDeploymentTypes()}
          </Card>
        )
      }}
    </Formik>
  )
}
