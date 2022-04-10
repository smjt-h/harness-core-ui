/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'

import { Button, ButtonVariation, Container, Heading, Layout, TableV2 } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'

import {
  EnvironmentName,
  EnvironmentTypes
} from '@cd/components/Environments/EnvironmentsListColumns/EnvironmentsListColumns'

import { LastUpdatedBy } from '../EnvironmentGroupsListColumns'

import EmptyEnvironmentGroup from '../images/EmptyEnvironmentGroup.svg'

export function EnvironmentList({ list, showModal }: { list?: EnvironmentResponse[]; showModal: () => void }) {
  const { getString } = useStrings()

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<EnvironmentResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '40%',
        accessor: 'name',
        Cell: EnvironmentName
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        accessor: 'type',
        width: '15%',
        Cell: EnvironmentTypes
      },
      {
        Header: getString('lastUpdatedBy').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '30%',
        Cell: ({ row }: any) => <LastUpdatedBy lastModifiedAt={row?.original?.lastModifiedAt} />
      }
    ],
    [getString]
  )

  const environments = list?.map((environmentContent: EnvironmentResponse) => ({
    ...environmentContent.environment,
    lastModifiedAt: environmentContent.lastModifiedAt
  }))
  const hasEnvs = Boolean(list?.length)
  const emptyEnvs = Boolean(list?.length === 0)

  return (
    <>
      {hasEnvs && (
        <Container padding={{ top: 'medium' }} border={{ top: true }}>
          <TableV2<EnvironmentResponseDTO>
            columns={envColumns}
            data={(environments as EnvironmentResponseDTO[]) || []}
          />
        </Container>
      )}
      {emptyEnvs && (
        <Layout.Vertical flex={{ align: 'center-center' }} height={'70vh'}>
          <img src={EmptyEnvironmentGroup} alt={getString('cd.noEnvironment.title')} />
          <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
            {getString('common.environmentGroup.noEnvironment')}
          </Heading>
          <Button text={getString('environment')} icon="plus" onClick={showModal} variation={ButtonVariation.PRIMARY} />
        </Layout.Vertical>
      )}
    </>
  )
}
