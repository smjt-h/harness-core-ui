/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Text, Color, Container, TagsPopover, Layout } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import type { ServiceResponse } from 'services/cd-ng'
import { ServiceLastDeploymentStatus, ServiceMenu } from '../ServicesListColumns/ServicesListColumns'
import css from './ServiceCard.module.scss'

interface ServiceCardProps {
  data: ServiceResponse
  onEdit?: () => Promise<void>
  onRefresh?: () => Promise<void>
}

const ServiceCard: React.FC<ServiceCardProps> = props => {
  const { data, onRefresh } = props

  return (
    <Card className={css.card}>
      <Container className={css.projectInfo}>
        <div className={css.mainTitle}>
          <Text
            lineClamp={1}
            color={Color.GREY_800}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '32px',
              wordBreak: 'break-word'
            }}
          >
            {data?.service?.name}
          </Text>
          <ServiceMenu data={data} onRefresh={onRefresh} />
        </div>

        <Layout.Horizontal margin={{ top: 'xsmall', bottom: 'xsmall' }} className={css.idTags}>
          <Text
            lineClamp={1}
            margin={{ bottom: 'xsmall' }}
            color={Color.GREY_500}
            style={{
              fontSize: '12px',
              lineHeight: '24px',
              wordBreak: 'break-word'
            }}
          >
            ID: {data?.service?.identifier}
          </Text>

          {!isEmpty(data?.service?.tags) && (
            <TagsPopover
              className={css.tagsPopover}
              iconProps={{ size: 14, color: Color.GREY_600 }}
              tags={defaultTo(data?.service?.tags, {})}
            />
          )}
        </Layout.Horizontal>
        <div className={css.serviceInfo}>
          <div className={css.cardInfoRow}>
            <div className={css.cardInfoLabel}> Last Deployment </div>
            <div className={css.cardInfoValue}>
              <Text
                lineClamp={1}
                color={Color.BLACK}
                style={{
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                Test
              </Text>
            </div>
          </div>

          <div className={css.cardInfoRow}>
            <div className={css.cardInfoLabel}> Deployment Status </div>
            <div className={css.cardInfoValue}>
              <ServiceLastDeploymentStatus data={data} />
            </div>
          </div>
        </div>
      </Container>
    </Card>
  )
}

export default ServiceCard
