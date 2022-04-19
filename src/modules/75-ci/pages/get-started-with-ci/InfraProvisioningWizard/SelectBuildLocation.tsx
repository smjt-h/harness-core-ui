/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Icon, Container, Text, FontVariation, Layout, CardSelect, PillToggle, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Hosting, SelectBuildLocationProps, BuildLocationDetails, AllBuildLocations } from './Constants'

import css from './InfraProvisioningWizard.module.scss'

export const SelectBuildLocation: React.FC<SelectBuildLocationProps> = props => {
  const { selectedBuildLocation } = props
  const [selected, setSelected] = useState<BuildLocationDetails>()
  const [hosting, setHosting] = useState<Hosting>(Hosting.SaaS)

  useEffect(() => {
    setSelected(selectedBuildLocation)
  }, [selectedBuildLocation])

  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.buildLocation')}</Text>
      <Container padding={{ top: 'xlarge', bottom: 'xxlarge' }}>
        <PillToggle
          options={[
            {
              label: getString('ci.getStartedWithCI.hosting', {
                hosting: getString('ci.getStartedWithCI.onCloudLabel')
              }),
              value: Hosting.SaaS
            },
            {
              label: getString('ci.getStartedWithCI.hosting', {
                hosting: getString('ci.getStartedWithCI.onPremLabel').toLowerCase()
              }),
              value: Hosting.OnPrem
            }
          ]}
          selectedView={hosting}
          onChange={(item: Hosting) => setHosting(item)}
          className={css.hostingToggle}
          disableToggle={true}
        />
      </Container>
      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'medium' }}>
        {getString('ci.getStartedWithCI.selectInfra')}
      </Text>
      <CardSelect
        cornerSelected={true}
        data={AllBuildLocations}
        cardClassName={css.card}
        renderItem={(item: BuildLocationDetails) => {
          const { icon, label, details, approxETAInMins, disabled } = item
          return (
            <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between' }}>
              <Layout.Vertical spacing="medium">
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                  <Icon name={icon} size={20} />
                  <Text font={{ variation: FontVariation.H5 }}>{getString(label)}</Text>
                </Layout.Horizontal>
                <Text font={{ variation: FontVariation.SMALL }}>{getString(details)}</Text>
              </Layout.Vertical>
              <Layout.Horizontal flex={{ justifyContent: disabled ? 'space-between' : 'flex-end' }} width="100%">
                {disabled ? (
                  <Container className={css.comingSoonPill} flex={{ justifyContent: 'center' }}>
                    <Text font={{ variation: FontVariation.TINY }} color={Color.WHITE}>
                      {getString('common.comingSoon')}
                    </Text>
                  </Container>
                ) : null}
                <Text font={{ variation: FontVariation.TINY }}>
                  ~ {approxETAInMins} {getString('timeMinutes')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          )
        }}
        selected={selected}
        onChange={(item: BuildLocationDetails) => setSelected(item)}
      />
    </Layout.Vertical>
  )
}
