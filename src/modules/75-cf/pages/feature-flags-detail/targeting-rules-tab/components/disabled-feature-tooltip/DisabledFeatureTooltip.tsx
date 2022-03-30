/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useIsFeatureDisabled from '../../hooks/useIsFeatureDisabled'

/* 
  Use this if you're passing the tooltip as a prop on an existing component to render 
  an RBAC/Plan Enforced tooltip
*/
export const DisabledFeatureTooltipContent: FC = () => {
  const { hasPermission, featureEnabled } = useIsFeatureDisabled()
  const license = useLicenseStore()

  const isFreePlan = license.licenseInformation.CF?.edition === 'FREE'

  if (!hasPermission) {
    return <RBACTooltip permission={PermissionIdentifier.EDIT_FF_FEATUREFLAG} resourceType={ResourceType.ENVIRONMENT} />
  } else if (!featureEnabled && isFreePlan) {
    return <FeatureWarningTooltip featureName={FeatureIdentifier.MAUS} />
  }

  return null
}

/* 
  Wrap a component with this to render a centered RBAC/Plan Enforced tooltip.
  Only use if the ui-core component doesn't support tooltip prop
*/
export const DisabledFeatureTooltip: FC<{ fullWidth?: boolean }> = ({ children, fullWidth }) => {
  const { disabled } = useIsFeatureDisabled()

  if (!disabled) {
    return <> {children}</>
  }

  return (
    <Text
      width={fullWidth ? '100%' : 'max-content'}
      inline
      tooltip={<DisabledFeatureTooltipContent />}
      tooltipProps={{
        targetProps: {
          style: { display: fullWidth ? 'inline-block!important' : 'flex', width: fullWidth ? '100%' : 'max-content' }
        }
      }}
    >
      {children}
    </Text>
  )
}

export default DisabledFeatureTooltip
