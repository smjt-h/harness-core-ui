/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, IconName, Container } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string
  subTitle?: string
  amountSubTitle?: string
  iconName?: IconName
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, subTitle, amountSubTitle, iconName } = props

  return (
    <Card className={css.savingsCard} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text color={Color.GREY_500} font={{ variation: FontVariation.H6 }}>
          {title}
        </Text>
        <Container>
          <Text
            inline
            font={{ variation: FontVariation.H3 }}
            color={iconName ? Color.GREEN_700 : Color.GREY_800}
            icon={iconName ? iconName : undefined}
            iconProps={{ size: 28 }}
          >
            {amount}
          </Text>
          {amountSubTitle ? (
            <Text inline color={Color.GREY_400} font={{ variation: FontVariation.TINY }} margin={{ left: 'xsmall' }}>
              {amountSubTitle}
            </Text>
          ) : null}
        </Container>
        {subTitle ? (
          <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY }}>
            {subTitle}
          </Text>
        ) : null}
      </Layout.Vertical>
    </Card>
  )
}

export default RecommendationSavingsCard
