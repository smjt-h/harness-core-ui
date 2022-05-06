/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, PageError } from '@harness/uicore'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useAddTargetsToExcludeList, useAddTargetsToIncludeList } from '@cf/utils/SegmentUtils'
import { GetTargetSegmentsQueryParams, Segment, Target, useGetTargetSegments } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import InclusionSubSection from './InclusionSubSection'
import ExclusionSubSection from './ExclusionSubSection'

export interface TargetGroupsProps {
  target: Target
}

const TargetGroups: React.FC<TargetGroupsProps> = ({ target }) => {
  const {
    accountId: accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    targetIdentifier
  } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const patchParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  }
  const { loading, error, data, refetch } = useGetTargetSegments({
    identifier: targetIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    } as GetTargetSegmentsQueryParams
  })
  const _useAddTargetsToIncludeList = useAddTargetsToIncludeList(patchParams)
  const _useAddTargetsToExcludeList = useAddTargetsToExcludeList(patchParams)

  const addTargetToSegments = async (segments: Segment[]): Promise<void> => {
    // Note: Due to https://harness.atlassian.net/browse/FFM-603 not done, we make
    // multiple patch APIs instead of one
    return Promise.all(
      segments.map(segment => _useAddTargetsToIncludeList(segment.identifier, [targetIdentifier]))
    ).then(() => {
      refetch()
    })
  }
  const excludeTargetFromSegments = async (segments: Segment[]): Promise<void> => {
    // Note: Due to https://harness.atlassian.net/browse/FFM-603 not done, we make
    // multiple patch APIs instead of one
    return Promise.all(
      segments.map(segment => _useAddTargetsToExcludeList(segment.identifier, [targetIdentifier]))
    ).then(() => {
      refetch()
    })
  }

  if (error) {
    return (
      <Container height="100%" width="100%" flex={{ align: 'center-center' }}>
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            refetch()
          }}
        />
      </Container>
    )
  }

  if (loading) {
    return (
      <Container height="100%" width="100%" flex={{ align: 'center-center' }}>
        <ContainerSpinner />
      </Container>
    )
  }

  return (
    <Layout.Vertical
      style={{ gap: 'var(--spacing-xlarge)' }}
      padding={{ top: 'xsmall', right: 'xlarge', left: 'xlarge', bottom: 'xlarge' }}
    >
      <InclusionSubSection
        target={target as Target}
        targetGroups={data?.includedSegments || []}
        onAddTargetGroups={addTargetToSegments}
        onRemoveTargetGroup={refetch}
      />

      <ExclusionSubSection
        target={target as Target}
        targetGroups={data?.excludedSegments || []}
        onAddTargetGroups={excludeTargetFromSegments}
        onRemoveTargetGroup={refetch}
      />
    </Layout.Vertical>
  )
}

export default TargetGroups
