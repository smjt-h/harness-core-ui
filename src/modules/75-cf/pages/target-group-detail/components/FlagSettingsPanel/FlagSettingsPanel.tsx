/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Container, PageError, useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Feature, GetAllFeaturesQueryParams, Segment, useGetAllFeatures, useGetSegmentFlags } from 'services/cf'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/Feature_Flags_Teepee.svg'
import type { TargetGroupFlagsMap } from '../../TargetGroupDetailPage.types'
import useAddFlagsToTargetGroupDialog from '../../hooks/useAddFlagsToTargetGroupDialog'
import FlagSettingsForm from './FlagSettingsForm'

export interface FlagSettingsPanelProps {
  targetGroup: Segment
}

const FlagSettingsPanel: FC<FlagSettingsPanelProps> = ({ targetGroup }) => {
  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const {
    data: targetGroupFlags,
    loading: loadingTargetGroupFlags,
    error: targetGroupFlagsError,
    refetch: refetchTargetGroupFlags
  } = useGetSegmentFlags({
    identifier: targetGroup.identifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: targetGroup.environment as string
    }
  })

  const flagsQueryParams = useMemo<GetAllFeaturesQueryParams>(
    () => ({
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: targetGroup.environment as string
    }),
    [accountIdentifier, orgIdentifier, projectIdentifier, targetGroup.environment]
  )

  const {
    data: flags,
    loading: loadingFlags,
    error: flagsError,
    refetch: refetchFlags
  } = useGetAllFeatures({
    lazy: true,
    debounce: 200,
    queryParams: flagsQueryParams
  })

  const targetGroupFlagIds = useMemo<string[]>(
    () => (targetGroupFlags || []).map(({ identifier }) => identifier),
    [targetGroupFlags]
  )

  useEffect(() => {
    if (targetGroupFlagIds.length) {
      refetchFlags({
        queryParams: {
          ...flagsQueryParams,
          pageSize: targetGroupFlagIds.length,
          featureIdentifiers: targetGroupFlagIds.join(',')
        }
      })
    }
  }, [flagsQueryParams, refetchFlags, targetGroupFlagIds])

  const targetGroupFlagsMap = useMemo<TargetGroupFlagsMap>(() => {
    if (!targetGroupFlags?.length || !flags?.features?.length) {
      return {}
    }

    return (
      targetGroupFlags
        // filter out flags that are present in the target group, but not in the features response
        .filter(({ identifier: targetGroupFlagId }) =>
          (flags.features ?? []).some(({ identifier: flagId }) => targetGroupFlagId === flagId)
        )
        .sort(({ name: n1 }, { name: n2 }) => (n1.toLocaleLowerCase() > n2.toLocaleLowerCase() ? 1 : -1))
        .reduce<TargetGroupFlagsMap>(
          (map, targetGroupFlag) => ({
            ...map,
            [targetGroupFlag.identifier]: {
              ...targetGroupFlag,
              flag: flags?.features?.find(({ identifier }) => identifier === targetGroupFlag.identifier) as Feature
            }
          }),
          {}
        )
    )
  }, [targetGroupFlags, flags?.features])

  const onFlagsAdded = useCallback(() => {
    showSuccess(getString('cf.segmentDetail.flagsAddedSuccessfully'))
    refetchTargetGroupFlags()
  }, [refetchTargetGroupFlags, showSuccess])

  const onFlagsUpdated = useCallback(() => {
    showSuccess(getString('cf.segmentDetail.updateSuccessful'))
    refetchTargetGroupFlags()
  }, [refetchTargetGroupFlags, showSuccess])

  const [openAddFlagsToTargetGroupDialog] = useAddFlagsToTargetGroupDialog(
    targetGroup,
    onFlagsAdded,
    targetGroupFlagIds
  )

  if (targetGroupFlagsError || flagsError) {
    return (
      <PageError
        message={getErrorMessage(targetGroupFlagsError || flagsError)}
        onClick={async () => await refetchTargetGroupFlags()}
      />
    )
  }

  if (loadingTargetGroupFlags || loadingFlags || (targetGroupFlags?.length && !flags)) {
    return <ContainerSpinner flex={{ align: 'center-center' }} />
  }

  if (!targetGroupFlags?.length || !flags?.features?.length) {
    return (
      <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
        <NoData
          imageURL={imageUrl}
          message={getString('cf.segmentDetail.noFlags')}
          onClick={openAddFlagsToTargetGroupDialog}
          buttonText={getString('cf.segmentDetail.addFlagToTargetGroup')}
        />
      </Container>
    )
  }

  return (
    <FlagSettingsForm
      targetGroup={targetGroup}
      targetGroupFlagsMap={targetGroupFlagsMap}
      onChange={onFlagsUpdated}
      openAddFlagDialog={openAddFlagsToTargetGroupDialog}
    />
  )
}

export default FlagSettingsPanel
