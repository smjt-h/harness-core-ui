/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

const HEADER_HEIGHT = 120

interface DetailPageTemplateBreadcrumbLink {
  title: string
  url: string
}

export interface DetailPageTemplateProps {
  breadcrumbs: DetailPageTemplateBreadcrumbLink[]
  title: React.ReactNode
  titleIcon?: IconName | React.ReactNode
  subTitle?: string
  tags?: string[] | null | undefined
  identifier?: string

  /** Optional extra components to be added into header (context menu, edit button, etc...)  */
  /** Note: Use absolute position to style it */
  headerExtras?: React.ReactNode
}

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  breadcrumbs,
  title,
  subTitle,
  identifier,
  headerExtras,
  children
}) => {
  return (
    <>
      <Container
        height={HEADER_HEIGHT}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{
          background: 'rgba(219, 241, 255, .46)',
          position: 'relative',
          borderBottom: '.5px solid rgb(227 224 224 / 50%)'
        }}
      >
        <Layout.Vertical spacing="medium">
          <NGBreadcrumbs
            customPathParams={{ module: 'cf' }}
            links={breadcrumbs.map(({ title: label, url }) => ({ label, url }))}
          />
          <Container>
            <Layout.Horizontal spacing="medium">
              <Text style={{ fontSize: '20px', color: 'var(--black)' }}>{title}</Text>
              {identifier && <IdentifierText identifier={identifier} allowCopy style={{ marginBottom: 0 }} />}
            </Layout.Horizontal>
            {subTitle && (
              <Text color={Color.GREY_400} padding={{ top: 'xsmall' }}>
                {subTitle}
              </Text>
            )}
          </Container>
        </Layout.Vertical>
        {headerExtras}
      </Container>
      <Container style={{ height: `calc(100% - ${HEADER_HEIGHT}px)`, overflow: 'auto', background: '#e4ebf433' }}>
        {children}
      </Container>
    </>
  )
}
