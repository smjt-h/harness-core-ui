/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Color } from '@harness/design-system'
import type { Service } from 'services/lw'
import { useStrings } from 'framework/strings'
import spotDisableIcon from '../images/spotDisabled.svg'
import onDemandDisableIcon from '../images/onDemandDisabled.svg'
import odIcon from '../images/ondemandIcon.svg'
import spotIcon from '../images/spotIcon.svg'

interface ComputeTypeProps {
  data: Service
  className?: string
}

const ComputeType: React.FC<ComputeTypeProps> = ({ data, className }) => {
  const { getString } = useStrings()
  const isK8sRule = data.kind === 'k8s'
  const isEcsRule = !_isEmpty(data.routing?.container_svc)
  const isRdsRule = !_isEmpty(data.routing?.database)
  const getIcon = () => {
    return data.fulfilment === 'spot'
      ? data.disabled
        ? spotDisableIcon
        : spotIcon
      : data.disabled
      ? onDemandDisableIcon
      : odIcon
  }

  const getDisplayValue = () => {
    return isRdsRule
      ? getString('ce.common.database')
      : isEcsRule
      ? getString('ce.common.containerService')
      : data.fulfilment
  }
  return (
    <Layout.Horizontal spacing="small" className={className}>
      {isK8sRule ? (
        <Icon name="app-kubernetes" size={21} />
      ) : isEcsRule ? (
        <Icon name="service-ecs" size={21} />
      ) : isRdsRule ? (
        <Icon name="aws-rds" size={21} />
      ) : (
        <img src={getIcon()} alt="" aria-hidden />
      )}
      <Text lineClamp={3} color={Color.GREY_500}>
        {getDisplayValue()}
      </Text>
    </Layout.Horizontal>
  )
}

export default ComputeType
