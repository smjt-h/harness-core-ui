/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import Lottie from 'react-lottie-player'

import { Dialog, Layout, Icon, Text, FontVariation, Color, Container, Button, ButtonVariation } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { ProvisioningStatus } from '../InfraProvisioningWizard/Constants'

import samplePipelineImg from '../../../assets/images/sample-pipeline.svg'
import provisioningInit from './assets/provisioning_init.json'
import provisioningInProgress from './assets/provisioning_in_progress.json'
import provisioningFailed from './assets/provisioning_failed.svg'
import provisioningSuccess from './assets/provisioning_success.svg'

import css from './InfraProvisioningCarousel.module.scss'

export interface InfraProvisioningCarouselProps {
  show: boolean
  provisioningStatus?: ProvisioningStatus
  onClose: () => void
}

const AUTO_TRANSITION_DELAY = 5000
const USER_INTERVENTION_TRANSITION_DELAY = 10000
const POST_SUCCESS_TRANSITION_DELAY = 1000

export const CarouselSlides: { label: keyof StringsMap; details: keyof StringsMap }[] = [
  {
    label: 'codebase',
    details: 'ci.getStartedWithCI.carousel.helptext.connectToRepo'
  },
  {
    label: 'ci.getStartedWithCI.carousel.labels.harnessCIFeatures',
    details: 'ci.getStartedWithCI.carousel.helptext.harnessCIFeatures'
  },
  {
    label: 'ci.getStartedWithCI.ti',
    details: 'ci.getStartedWithCI.carousel.helptext.ti'
  },
  {
    label: 'pipelineStudio',
    details: 'ci.getStartedWithCI.carousel.helptext.pipelineStudio'
  },
  {
    label: 'ci.getStartedWithCI.carousel.labels.containerizedSteps',
    details: 'ci.getStartedWithCI.carousel.helptext.containerizedSteps'
  },
  {
    label: 'ci.getStartedWithCI.carousel.labels.useCaching',
    details: 'ci.getStartedWithCI.carousel.helptext.useCaching'
  },
  {
    label: 'ci.getStartedWithCI.carousel.labels.usePlugins',
    details: 'ci.getStartedWithCI.carousel.helptext.usePlugins'
  },
  {
    label: 'ci.getStartedWithCI.carousel.labels.integration',
    details: 'ci.getStartedWithCI.carousel.helptext.seamlessIntegration'
  }
]

export const InfraProvisioningCarousel: React.FC<InfraProvisioningCarouselProps> = props => {
  const { show, provisioningStatus, onClose } = props
  const { getString } = useStrings()
  const [activeSlide, setActiveSlide] = useState<number>(0)
  const [enableTransition, setEnableTransition] = useState<boolean>(true)
  const [animationData, setAnimationData] = useState<Record<string, any>>(provisioningInit)

  useEffect(() => {
    const timerId = setInterval(() => setAnimationData(provisioningInProgress), AUTO_TRANSITION_DELAY)
    return () => clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (enableTransition) {
      const timerId = setInterval(
        () => setActiveSlide((activeSlide + 1) % CarouselSlides.length),
        AUTO_TRANSITION_DELAY
      )
      return () => clearInterval(timerId)
    }
  })

  useEffect(() => {
    if (!enableTransition) {
      const timerId = setInterval(() => setEnableTransition(true), USER_INTERVENTION_TRANSITION_DELAY)
      return () => clearInterval(timerId)
    }
  }, [enableTransition])

  useEffect(() => {
    if (provisioningStatus === ProvisioningStatus.SUCCESS) {
      const timerId = setInterval(onClose, POST_SUCCESS_TRANSITION_DELAY)
      return () => clearInterval(timerId)
    }
  }, [provisioningStatus])

  const renderDots = (count: number): React.ReactNode[] => {
    const dots: React.ReactNode[] = []
    for (let i = 0; i < count; i++) {
      dots.push(
        <Icon
          key={i}
          name="dot"
          color={activeSlide === i ? Color.BLUE_600 : Color.BLUE_100}
          size={26}
          onClick={() => {
            setActiveSlide(i)
            setEnableTransition(false)
          }}
          style={{ cursor: 'pointer' }}
        />
      )
    }
    return dots
  }

  const renderViewForStatus = React.useCallback(() => {
    switch (provisioningStatus) {
      case ProvisioningStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal padding={{ top: 'xxxlarge', left: 'xxxlarge', right: 'xxxlarge' }} flex>
            <Layout.Vertical padding="xlarge" style={{ flex: 1 }} className={css.centerAlign}>
              <Icon name="harness" size={34} padding="large" />
              <Text font={{ variation: FontVariation.H4 }} className={css.centerAlign}>
                {getString('ci.getStartedWithCI.provisionSecureEnv')}
              </Text>
              <Container padding={{ bottom: 'large' }}>
                <Lottie animationData={animationData} play />
              </Container>
              <Text font={{ variation: FontVariation.SMALL }}>
                {getString('ci.getStartedWithCI.duration', {
                  count: 2,
                  unit: getString('triggers.schedulePanel.minutesLabel').toLowerCase()
                })}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical padding="xxlarge" style={{ flex: 1 }} className={css.centerAlign}>
              <Layout.Vertical spacing="medium">
                <Container padding={{ top: 'large' }}>
                  <Container
                    style={{ background: `transparent url(${samplePipelineImg}) no-repeat` }}
                    className={css.samplePipeline}
                  />
                </Container>
                <Layout.Vertical spacing="medium" className={cx(css.fixedMinHeight, css.centerAlign)}>
                  <Text font={{ variation: FontVariation.H4 }}>{getString(CarouselSlides[activeSlide].label)}</Text>
                  <Text font={{ variation: FontVariation.BODY }} className={css.centerAlign}>
                    {getString(CarouselSlides[activeSlide].details)}
                  </Text>
                </Layout.Vertical>
              </Layout.Vertical>
              <Layout.Horizontal>{renderDots(CarouselSlides.length)}</Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        )
      case ProvisioningStatus.FAILURE:
        return (
          <Layout.Vertical flex style={{ width: '100%' }} padding="large" spacing="large" className={css.centerAlign}>
            <Text font={{ variation: FontVariation.H4 }}>
              {getString('ci.getStartedWithCI.infraProvisioningFailed')}
            </Text>
            <Container
              style={{ background: `transparent url(${provisioningFailed}) no-repeat` }}
              className={css.provisioningStatus}
            />
            <Text font={{ variation: FontVariation.BODY }} className={css.centerAlign} padding={{ bottom: 'small' }}>
              <String stringID="ci.getStartedWithCI.troubleShootFailedProvisioning" useRichText={true} />
            </Text>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('ci.getStartedWithCI.chooseDiffInfra')}
              onClick={() => onClose()}
            />
            <Button icon="contact-support" text={getString('common.contactSupport')} disabled={true} />
          </Layout.Vertical>
        )
      case ProvisioningStatus.SUCCESS:
        return (
          <Layout.Vertical spacing="medium" flex={{ justifyContent: 'center' }} padding={{ top: 'huge' }}>
            <Icon name="harness" size={34} />
            <Layout.Horizontal flex spacing="small" padding={{ top: 'medium', bottom: 'xxlarge' }}>
              <Icon name="success-tick" size={20} />
              <Text font={{ variation: FontVariation.H4 }}>
                {getString('ci.getStartedWithCI.provisioningSuccessful')}
              </Text>
            </Layout.Horizontal>
            <Container padding={{ left: 'huge' }}>
              <Container
                style={{ background: `transparent url(${provisioningSuccess}) no-repeat` }}
                className={css.provisioningStatus}
              />
            </Container>
          </Layout.Vertical>
        )
      default:
        return <></>
    }
  }, [provisioningStatus, activeSlide, enableTransition])

  return (
    <Dialog
      isOpen={show}
      enforceFocus={false}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      onClose={onClose}
      className={css.main}
    >
      {renderViewForStatus()}
    </Dialog>
  )
}
