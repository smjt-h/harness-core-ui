/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Layout, ExpandingSearchInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

interface SearchProps {
  onChange: React.Dispatch<React.SetStateAction<string>>
}

const AnomaliesSearch: React.FC<SearchProps> = ({ onChange }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal className={css.searchFilterWrapper}>
      <ExpandingSearchInput
        className={css.searchInput}
        onChange={text => onChange(text.trim())}
        alwaysExpanded={true}
        placeholder={getString('search')}
      />
      <Button
        text={getString('ce.anomalyDetection.settingsBtn')}
        icon="nav-settings"
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.MEDIUM}
      />
    </Layout.Horizontal>
  )
}

export default AnomaliesSearch
