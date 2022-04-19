/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Page } from '@harness/uicore'
import ServiceDetails from './views/ServiceDetails'
import type { DetailsPanelProps } from './DetailsPanel.types'
import css from './DetailsPanel.module.scss'

const DetailsPanel: React.FC<DetailsPanelProps> = ({ loading, errorMessage, retryOnError, sloDashboardWidget }) => {
  return (
    <Page.Body
      loading={loading}
      error={errorMessage}
      retryOnError={retryOnError}
      noData={{
        when: () => !sloDashboardWidget
      }}
      className={css.pageBody}
    >
      <Container padding="xlarge">
        {sloDashboardWidget && <ServiceDetails sloDashboardWidget={sloDashboardWidget} />}
      </Container>
    </Page.Body>
  )
}

export default DetailsPanel
