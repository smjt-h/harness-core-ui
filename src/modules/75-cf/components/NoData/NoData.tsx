/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { Button, ButtonProps, Heading, Layout, Text } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'
import { Color, FontVariation } from '@harness/design-system'
import css from './NoData.module.scss'

export interface NoDataProps extends LayoutProps {
  imageURL: string
  message: string
  description?: ReactNode
  width?: number
  buttonText?: string
  buttonWidth?: number
  onClick?: ButtonProps['onClick']
}

export const NoData: React.FC<NoDataProps> = ({
  imageURL,
  message,
  description,
  width,
  buttonText,
  buttonWidth,
  onClick,
  children,
  ...props
}) => {
  return (
    <Layout.Vertical className={css.centerAlignItems} spacing="xxlarge" width={width || 470} {...props}>
      <img src={imageURL} width={320} height={220} />
      <Heading
        className={css.centerAlign}
        level={2}
        font={{ variation: FontVariation.H4 }}
        width={546}
        color={Color.GREY_600}
      >
        {message}
      </Heading>
      {description && (
        <Text className={css.centerAlign} font={{ variation: FontVariation.BODY1 }} width={546} color={Color.GREY_600}>
          {description}
        </Text>
      )}
      {buttonText ? <Button intent="primary" text={buttonText} width={buttonWidth} onClick={onClick} /> : null}
      {children}
    </Layout.Vertical>
  )
}
