/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, IconName, FontVariation, Color } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string
  amountSubTitle?: string
  subTitle?: string
  iconName?: IconName
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, amountSubTitle, subTitle, iconName } = props

  return (
    <Card className={cx(css.savingsCard, { [css.potentialSpendCard]: !iconName })} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_500}>
          {title}
        </Text>
        <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="xsmall">
          <Text
            className={css.amount}
            color={iconName ? Color.GREEN_700 : Color.GREY_800}
            icon={iconName ? iconName : undefined}
            font={{ variation: FontVariation.H3 }}
            iconProps={{ size: 28 }}
          >
            {amount}
          </Text>
          {amountSubTitle ? (
            <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
              {amountSubTitle}
            </Text>
          ) : null}
        </Layout.Horizontal>
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
