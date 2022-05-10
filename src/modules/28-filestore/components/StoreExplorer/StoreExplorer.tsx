/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { NewFileButton } from '@filestore/common/NewFile/NewFile'
import type { FileStoreNodeDTO } from 'services/cd-ng'
import { FILE_STORE_ROOT } from '@filestore/utils/constants'
import { RootNodesList } from '@filestore/components/NavNodeList/NavNodesList'

import css from './StoreExplorer.module.scss'

export interface StoreExplorerProps {
  title?: string
  fileStore: FileStoreNodeDTO[]
}

export default function StoreExplorer({ fileStore }: StoreExplorerProps): React.ReactElement {
  return (
    <Layout.Vertical height="100%">
      <Container background={Color.GREY_0} padding={{ top: 'medium', left: 'medium' }} className={css.explorer}>
        <NewFileButton parentIdentifier={FILE_STORE_ROOT} />
        <RootNodesList rootStore={fileStore} />
      </Container>
    </Layout.Vertical>
  )
}
