/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'

import {
  Button,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Heading,
  Layout,
  TagsPopover,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { EnvironmentGroupResponse, EnvironmentResponse, getEnvironmentListPromise } from 'services/cd-ng'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useInfiniteScroll } from '@templates-library/components/TemplateActivityLog/InfiniteScroll'

import { EnvironmentSelection } from '../CreateEnvironmentGroupModal'

import EmptyEnvironmentGroup from '../images/EmptyEnvironmentGroup.svg'

import css from './EnvironmentGroupDetails.module.scss'

export default function EditEnvironmentGroupModal({
  selectedEnvs,
  onEnvironmentUpdate
}: {
  selectedEnvs: EnvironmentGroupResponse[]
  onEnvironmentUpdate: (envsChanged: boolean, newEnvs?: EnvironmentResponse[]) => void
}) {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [newEnvs, setNewEnvs] = useState<EnvironmentResponse[]>(selectedEnvs)
  const [searchTerm, setSearchTerm] = useState('')

  const loadMoreRef = useRef(null)
  const pageSize = useRef(20)

  const { getString } = useStrings()

  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: pageSize.current,
      searchTerm
    }),
    [accountId, orgIdentifier, projectIdentifier, searchTerm]
  )

  const {
    items: environments,
    error: fetchEnvironmentsError,
    fetching: fetchingEnvironments,
    attachRefToLastElement,
    offsetToFetch
  } = useInfiniteScroll({
    getItems: options => {
      return getEnvironmentListPromise({
        queryParams: { ...queryParams, size: options.limit, page: options.offset }
      })
    },
    limit: pageSize.current,
    loadMoreRef,
    searchTerm
  })

  const isFetchingEnvironmentsFirstTime = useMemo(() => {
    return fetchingEnvironments && offsetToFetch.current === 0
  }, [fetchingEnvironments, offsetToFetch.current])

  const isFetchingEnvironmentsNextTime = useMemo(() => {
    return fetchingEnvironments && offsetToFetch.current > 0
  }, [fetchingEnvironments, offsetToFetch.current])

  const isEmptyContent = useMemo(() => {
    return !fetchingEnvironments && !fetchEnvironmentsError && isEmpty(environments)
  }, [fetchingEnvironments, fetchEnvironmentsError, environments])

  return (
    <Layout.Vertical>
      <Container margin={{ bottom: 'small' }}>
        <ExpandingSearchInput
          alwaysExpanded
          placeholder={'Search Environments'}
          autoFocus={false}
          width={'100%'}
          onChange={setSearchTerm}
          throttle={200}
        />
      </Container>

      <Layout.Horizontal
        height={360}
        border={{
          radius: 4
        }}
      >
        <Layout.Vertical className={css.editModalSelection} width={'50%'} border={{ right: true }}>
          {isFetchingEnvironmentsFirstTime ? (
            <Container flex={{ align: 'center-center' }} height={'100%'}>
              <Spinner size={32} />
            </Container>
          ) : isEmptyContent ? (
            <Layout.Vertical flex={{ align: 'center-center' }} width={'100%'} height={'100%'}>
              <img src={EmptyEnvironmentGroup} alt={getString('cd.noEnvironment.title')} />
              <Heading level={2}>{getString('cd.noEnvironment.title')}</Heading>
            </Layout.Vertical>
          ) : (
            (environments as EnvironmentResponse[]).map((item, index) => {
              if (!item?.environment) {
                return null
              }

              const { name, identifier, tags } = item?.environment
              const checked = newEnvs.some(
                (selectedEnv: EnvironmentResponse) => selectedEnv.environment?.identifier === identifier
              )

              return (
                <Layout.Horizontal
                  width={'100%'}
                  height={60}
                  flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                  padding={{ left: 'medium' }}
                  margin={{ top: 0 }}
                  border={{ bottom: true }}
                  key={identifier}
                  ref={attachRefToLastElement(index) ? loadMoreRef : undefined}
                >
                  <EnvironmentSelection
                    identifier={identifier}
                    checked={checked}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      if ((e.target as any).checked && identifier) {
                        setNewEnvs([...defaultTo(newEnvs, []), item])
                      } else {
                        setNewEnvs([
                          ...newEnvs.filter(
                            (selectedEnv: EnvironmentResponse) => selectedEnv.environment?.identifier !== identifier
                          )
                        ])
                      }
                    }}
                  />
                  <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="small">
                    <Container width={'240px'}>
                      <Text color={Color.BLACK} lineClamp={1} margin={{ bottom: 'small' }}>
                        {name}
                      </Text>

                      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
                        {getString('common.ID')}: {identifier}
                      </Text>
                    </Container>
                    {!isEmpty(tags) && (
                      <TagsPopover
                        className={css.tagsPopover}
                        iconProps={{ size: 14, color: Color.GREY_600 }}
                        tags={defaultTo(tags, {})}
                      />
                    )}
                  </Layout.Horizontal>
                </Layout.Horizontal>
              )
            })
          )}

          {isFetchingEnvironmentsNextTime && (
            <Container padding={{ left: 'xxlarge' }}>
              <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
                {getString('common.environment.fetchNext')}
              </Text>
            </Container>
          )}
        </Layout.Vertical>
        <Layout.Vertical
          flex={{ justifyContent: 'center', alignItems: 'flex-start' }}
          padding={{ left: 'medium', right: 'medium' }}
          width={'50%'}
        >
          <Text
            font={{ variation: FontVariation.H5 }}
            padding={{ bottom: 'medium' }}
            margin={{ bottom: 'medium' }}
            border={{ bottom: true }}
            width={'100%'}
          >
            {newEnvs.length} environment(s)
          </Text>
          {newEnvs.map(data => (
            <Text
              font={{ weight: 'semi-bold', align: 'left' }}
              color={Color.BLACK}
              width={'280px'}
              lineClamp={1}
              key={data?.environment?.identifier}
            >
              {data?.environment?.name}
            </Text>
          ))}
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="large">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('add')}
          data-id="environment-group-edit"
          onClick={() => {
            onEnvironmentUpdate(!isEqual(selectedEnvs, newEnvs), newEnvs)
          }}
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          text={getString('cancel')}
          onClick={() => onEnvironmentUpdate(false)}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
