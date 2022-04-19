/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'

import { Dialog, Layout, Icon, Text, FontVariation, Color, Container, Button, ButtonVariation } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'

import samplePipelineImg from '../../../assets/images/sample-pipeline.svg'

import css from './InfraProvisioningCarousel.module.scss'

interface InfraProvisioningCarouselProps {
  show: boolean
  provisioningStatus: 'IN_PROGRESS' | 'FAILED'
  onClose: () => void
}

const AUTO_TRANSITION_DELAY = 5000
const USER_INTERVENTION_TRANSITION_DELAY = 10000

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
        />
      )
    }
    return dots
  }

  return (
    <Dialog
      isOpen={show}
      enforceFocus={false}
      isCloseButtonShown={true}
      canEscapeKeyClose
      canOutsideClickClose
      onClose={onClose}
      className={css.main}
    >
      <Layout.Horizontal padding={{ top: 'small', bottom: 'small' }}>
        {provisioningStatus === 'IN_PROGRESS' ? (
          <>
            <Layout.Vertical style={{ flex: 1, alignItems: 'center' }} padding="xlarge">
              <Icon name="harness" size={34} padding="large" />
              <Text font={{ variation: FontVariation.H4 }} style={{ textAlign: 'center' }}>
                {getString('ci.getStartedWithCI.provisionSecureEnv')}
              </Text>
              <Container padding={{ top: 'xxlarge' }}>
                <Container
                  style={{ background: `transparent url(${samplePipelineImg}) no-repeat` }}
                  className={css.samplePipeline}
                />
              </Container>
              <Text font={{ variation: FontVariation.SMALL }}>
                {getString('ci.getStartedWithCI.duration', {
                  count: 2,
                  unit: getString('triggers.schedulePanel.minutesLabel').toLowerCase()
                })}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical style={{ flex: 1, alignItems: 'center' }} padding="xlarge">
              <Layout.Vertical spacing="medium">
                <Container padding={{ top: 'large' }}>
                  <Container
                    style={{ background: `transparent url(${samplePipelineImg}) no-repeat` }}
                    className={css.samplePipeline}
                  />
                </Container>
                <Layout.Vertical spacing="medium" style={{ alignItems: 'center' }} className={css.fixedMinHeight}>
                  <Text font={{ variation: FontVariation.H4 }}>{getString(CarouselSlides[activeSlide].label)}</Text>
                  <Text font={{ variation: FontVariation.BODY }} style={{ textAlign: 'center' }}>
                    {getString(CarouselSlides[activeSlide].details)}
                  </Text>
                </Layout.Vertical>
              </Layout.Vertical>
              <Layout.Horizontal>{renderDots(CarouselSlides.length)}</Layout.Horizontal>
            </Layout.Vertical>
          </>
        ) : provisioningStatus === 'FAILED' ? (
          <Layout.Vertical flex style={{ alignItems: 'center', width: '100%' }} padding="large" spacing="large">
            <Text font={{ variation: FontVariation.H4 }}>
              {getString('ci.getStartedWithCI.infraProvisioningFailed')}
            </Text>
            <Container padding={{ top: 'xlarge', bottom: 'large' }}>
              <Container
                style={{ background: `transparent url(${samplePipelineImg}) no-repeat` }}
                className={css.samplePipeline}
              />
            </Container>
            <Text
              font={{ variation: FontVariation.BODY }}
              style={{ textAlign: 'center' }}
              padding={{ bottom: 'small' }}
            >
              <String stringID="ci.getStartedWithCI.troubleShootFailedProvisioning" useRichText={true} />
            </Text>
            <Button variation={ButtonVariation.PRIMARY} text={getString('ci.getStartedWithCI.chooseDiffInfra')} />
            <Button icon="contact-support" text={getString('common.contactSupport')} />
          </Layout.Vertical>
        ) : null}
      </Layout.Horizontal>
    </Dialog>
  )
}
