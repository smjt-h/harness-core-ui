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
import {
  Card,
  Color,
  Dialog,
  FontVariation,
  HarnessDocTooltip,
  Icon,
  Layout,
  Popover,
  Text,
  ThumbnailSelect
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ServiceDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { CDFirstGenTrial } from './CDFirstGenTrial'
import type { DeploymentTypeItem } from './DeploymentInterface'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'
import deployServiceCsss from './DeployServiceSpecifications.module.scss'

export function getServiceDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(ServiceDeploymentType))
    .required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
}

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
        value: ServiceDeploymentType.Kubernetes
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
        value: ServiceDeploymentType.NativeHelm
      },
      {
        label: getString('serviceDeploymentTypes.amazonEcs'),
        icon: 'service-ecs',
        value: ServiceDeploymentType.amazonEcs
      },
      {
        label: getString('serviceDeploymentTypes.amazonAmi'),
        icon: 'main-service-ami',
        value: ServiceDeploymentType.amazonAmi
      },
      {
        label: getString('serviceDeploymentTypes.awsCodeDeploy'),
        icon: 'app-aws-code-deploy',
        value: ServiceDeploymentType.awsCodeDeploy
      },
      {
        label: getString('serviceDeploymentTypes.winrm'),
        icon: 'command-winrm',
        value: ServiceDeploymentType.winrm
      },
      {
        label: getString('serviceDeploymentTypes.awsLambda'),
        icon: 'app-aws-lambda',
        value: ServiceDeploymentType.awsLambda
      },
      {
        label: getString('serviceDeploymentTypes.pcf'),
        icon: 'service-pivotal',
        value: ServiceDeploymentType.pcf
      },
      {
        label: getString('serviceDeploymentTypes.ssh'),
        icon: 'secret-ssh',
        value: ServiceDeploymentType.ssh
      }
    ],
    [getString]
  )

  const [cgDeploymentTypes, setCgDeploymentTypes] = React.useState(cgSupportedDeploymentTypes)
  const [ngDeploymentTypes, setNgDeploymentTypes] = React.useState(ngSupportedDeploymentTypes)

  const [showCurrentGenSwitcherModal, hideCurrentGenSwitcherModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideCurrentGenSwitcherModal}
        isCloseButtonShown
        style={{
          width: 1200,
          height: 600,
          padding: 0
        }}
      >
        <CDFirstGenTrial
          selectedDeploymentType={cgDeploymentTypes.find(type => type.value === selectedDeploymentType)}
          accountId={accountId}
        />
      </Dialog>
    )
  }, [selectedDeploymentType])

  React.useEffect(() => {
    if (licenseInformation[ModuleName.CD]?.licenseType !== 'TRIAL') {
      cgSupportedDeploymentTypes.forEach(deploymentType => {
        deploymentType['disabled'] = true
        if (deploymentType.value === 'NativeHelm') {
          deploymentType['disabled'] = !NG_NATIVE_HELM
        }
      })
      setCgDeploymentTypes(cgSupportedDeploymentTypes)
    } else {
      if (NG_NATIVE_HELM) {
        // If FF enabled - Native Helm will be in NG - left section
        setNgDeploymentTypes([
          ...ngSupportedDeploymentTypes,
          ...cgSupportedDeploymentTypes.filter(deploymentType => deploymentType.value === 'NativeHelm')
        ])
      }
      const cgTypes = NG_NATIVE_HELM
        ? cgSupportedDeploymentTypes.filter(deploymentType => deploymentType.value !== 'NativeHelm')
        : cgSupportedDeploymentTypes
      cgTypes.forEach(deploymentType => {
        deploymentType['disabled'] = false
        deploymentType['tooltip'] = (
          <div
            className={cx(deployServiceCsss.tooltipContainer, deployServiceCsss.cursorPointer)}
            onClick={() => {
              props.handleDeploymentTypeChange(deploymentType.value)
              showCurrentGenSwitcherModal()
            }}
          >
            Use in Continuous Delivery First Generation
          </div>
        )
        deploymentType['tooltipProps'] = { isDark: true }
      })
      setCgDeploymentTypes(cgTypes)
    }
  }, [licenseInformation, NG_NATIVE_HELM])

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  }, [formikRef])

  const renderDeploymentTypes = React.useCallback((): JSX.Element => {
    if (licenseInformation[ModuleName.CD]?.licenseType === 'TRIAL') {
      const tooltipContent = (
        <article className={cx(deployServiceCsss.cdGenerationSelectionTooltip, deployServiceCsss.tooltipContainer)}>
          <section className={deployServiceCsss.cdGenerationSwitchContainer}>
            <div className={cx(deployServiceCsss.cdGenerationSwitcher, deployServiceCsss.cdGenerationSwitcherSelected)}>
              <div className={deployServiceCsss.newText}>NEW</div>
              <Icon className="infoCard.iconClassName" name="cd-solid" size={24} />
              {getString('common.purpose.cd.newGen.title')}
            </div>
            <div
              className={cx(deployServiceCsss.cdGenerationSwitcher, deployServiceCsss.cursorPointer)}
              onClick={showCurrentGenSwitcherModal}
            >
              <Icon className={'infoCard.iconClassName'} name="command-approval" size={24} />
              {getString('common.purpose.cd.1stGen.title')}
            </div>
          </section>
          <section className={deployServiceCsss.cdGenerationContent}>
            <Text color={Color.GREY_0} font={{ variation: FontVariation.BODY }}>
              {getString('cd.cdSwitchToFirstGen.description4')}
            </Text>
            <a
              className={deployServiceCsss.learnMore}
              href="https://docs.harness.io/article/4o7oqwih6h-harness-key-concepts#cd_abstraction_model"
              rel="noreferrer"
              target="_blank"
            >
              {getString('cd.cdSwitchToFirstGen.learnMoreAboutCD1stGen')}
            </a>
          </section>
        </article>
      )
      return (
        <Layout.Horizontal margin={{ top: 'medium' }}>
          <Layout.Vertical border={{ right: true }} margin={{ right: 'huge' }} padding={{ right: 'huge' }}>
            <div className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}>
              {getString('common.currentlyAvailable')}
            </div>
            <ThumbnailSelect
              className={stageCss.thumbnailSelect}
              name={'deploymentType'}
              items={ngDeploymentTypes}
              isReadonly={isReadonly}
              onChange={props.handleDeploymentTypeChange}
              expandAllByDefault={true}
            />
          </Layout.Vertical>

          <Layout.Vertical>
            <Layout.Horizontal>
              <div className={deployServiceCsss.comingSoonBanner}>{getString('common.comingSoon')}</div>
              <div
                className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
                data-tooltip-id="supportedInFirstGeneration"
              >
                {getString('common.currentlySupportedOn')}
                <a
                  target="_blank"
                  rel="noreferrer"
                  onClick={showCurrentGenSwitcherModal}
                  style={{ paddingLeft: '4px' }}
                >
                  {getString('common.firstGeneration')}
                </a>
                <HarnessDocTooltip tooltipId="supportedInFirstGeneration" useStandAlone={true} />
              </div>
              <Popover
                position="auto"
                interactionKind={PopoverInteractionKind.HOVER}
                content={tooltipContent}
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
              onChange={deploymentType => {
                props.handleDeploymentTypeChange(deploymentType)
                showCurrentGenSwitcherModal()
              }}
              expandAllByDefault={true}
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
        deploymentType: getServiceDeploymentTypeSchema(getString)
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
