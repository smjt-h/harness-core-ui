/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Button, ButtonVariation, Container, Heading } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import EmptyContent from './images/EmptyEnvironmentGroup.svg'
import EmptySearch from './images/NoEnvironmentGroups-Search.svg'

export default function NoEnvironmentGroups({ searchTerm, showModal }: { searchTerm: string; showModal: () => void }) {
  const { getString } = useStrings()

  return (
    <Container flex={{ align: 'center-center' }} height="75vh">
      {searchTerm ? (
        <Container flex style={{ flexDirection: 'column' }}>
          <img src={EmptySearch} width={220} height={220} />
          <Heading level={2}>{getString('common.noSearchResultsFound', { searchTerm })}</Heading>
          <Heading level={2} margin={{ bottom: 'large', top: 'small' }}>
            {getString('common.searchOther')}
          </Heading>
        </Container>
      ) : (
        <Container flex style={{ flexDirection: 'column' }}>
          <img src={EmptyContent} width={220} height={220} />
          <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
            {getString('common.environmentGroups.noEnvironmentGroups.label')}
          </Heading>
          <Button
            text={getString('common.environmentGroup.createNew')}
            icon="plus"
            onClick={showModal}
            variation={ButtonVariation.PRIMARY}
          />
        </Container>
      )}
    </Container>
  )
}
