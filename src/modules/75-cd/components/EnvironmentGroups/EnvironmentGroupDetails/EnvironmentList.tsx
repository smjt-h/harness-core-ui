/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { defaultTo } from 'lodash-es'

import { Button, ButtonVariation, Container, Heading, Icon, Layout, TableV2 } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'

import { useDeepCompareEffect } from '@common/hooks'

import {
  DeleteCheckbox,
  EnvironmentName,
  EnvironmentTypes
} from '@cd/components/Environments/EnvironmentsListColumns/EnvironmentsListColumns'

import { LastUpdatedBy } from '../EnvironmentGroupsList/EnvironmentGroupsListColumns'

import EmptyEnvironmentGroup from '../images/EmptyEnvironmentGroup.svg'

export function EnvironmentList({
  list,
  showModal,
  onDeleteEnvironments
}: {
  list: EnvironmentResponse[]
  showModal: () => void
  onDeleteEnvironments: (environmentsToRemove: EnvironmentResponseDTO[]) => void
}) {
  const { getString } = useStrings()
  const [environmentsToRemove, setEnvironmentsToRemove] = useState<EnvironmentResponseDTO[]>([])

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const onCheckboxSelect = (event: FormEvent<HTMLInputElement>, item: EnvironmentResponseDTO) => {
    const identifier = item.identifier
    if ((event.target as any).checked && identifier) {
      setEnvironmentsToRemove([...defaultTo(environmentsToRemove, []), item] as EnvironmentResponseDTO[])
    } else {
      setEnvironmentsToRemove([
        ...environmentsToRemove.filter((selectedEnv: EnvironmentResponseDTO) => selectedEnv?.identifier !== identifier)
      ])
    }
  }

  useDeepCompareEffect(() => {
    setEnvironmentsToRemove([])
  }, [list])

  const envColumns: CustomColumn<EnvironmentResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '50%',
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
        Cell: ({ row }: any) => (
          <LastUpdatedBy lastModifiedAt={/*istanbul ignore next*/ row?.original?.lastModifiedAt} />
        )
      },
      {
        Header: (
          <Icon
            name={'main-trash'}
            onClick={() => onDeleteEnvironments(environmentsToRemove)}
            style={{ cursor: 'pointer' }}
          />
        ),
        id: 'delete',
        width: '5%',
        Cell: DeleteCheckbox,
        onCheckboxSelect,
        environmentsToRemove
      }
    ],
    [getString]
  )

  const environments = list.map((environmentContent: EnvironmentResponse) => ({
    ...environmentContent.environment,
    lastModifiedAt: environmentContent.lastModifiedAt
  }))
  const hasEnvs = Boolean(list.length)
  const emptyEnvs = Boolean(list.length === 0)

  return (
    <>
      {hasEnvs && (
        <Container padding={{ top: 'medium' }} border={{ top: true }}>
          <TableV2<EnvironmentResponseDTO> columns={envColumns} data={environments as EnvironmentResponseDTO[]} />
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
