/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'
import css from './TemplatesGridView.module.scss'

export const TemplatesGridView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const { data, selectedIdentifier, gotoPage, onSelect, onPreview, onOpenEdit, onOpenSettings, onDelete } = props

  return (
    <Layout.Vertical height={'100%'}>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          center
          gutter={25}
          items={defaultTo(data.content, [])}
          renderItem={(template: TemplateSummaryResponse) => (
            <TemplateCard
              template={template}
              onSelect={onSelect}
              isSelected={template.identifier === selectedIdentifier}
              onPreview={onPreview}
              onOpenEdit={onOpenEdit}
              onOpenSettings={onOpenSettings}
              onDelete={onDelete}
            />
          )}
          keyOf={(item: TemplateSummaryResponse) => item.identifier}
        />
      </Container>
      <Pagination
        itemCount={defaultTo(data.totalElements, 0)}
        pageSize={defaultTo(data.size, 10)}
        pageCount={defaultTo(data.totalPages, 0)}
        pageIndex={defaultTo(data.number, 0)}
        gotoPage={gotoPage}
      />
    </Layout.Vertical>
  )
}
