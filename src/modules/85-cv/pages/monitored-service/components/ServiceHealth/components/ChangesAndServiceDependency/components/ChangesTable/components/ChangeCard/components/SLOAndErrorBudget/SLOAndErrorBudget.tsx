/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { find } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import {
  CardSelect,
  CardSelectType,
  Color,
  Container,
  FontVariation,
  Layout,
  NoDataCard,
  PillToggle,
  PillToggleProps,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetSLODashboardWidgets } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOTargetChartWrapper from './SLOTargetChartWrapper'
import { SelectedSLO, SLOAndErrorBudgetProps, SLOCardToggleViews } from './SLOAndErrorBudget.types'
import css from './SLOAndErrorBudget.module.scss'

const SLOAndErrorBudget: React.FC<SLOAndErrorBudgetProps> = ({ monitoredServiceIdentifier, startTime, endTime }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [view, setView] = useState(SLOCardToggleViews.SLO)
  const [selectedSLOs, setSelectedSLOs] = useState<SelectedSLO[]>([])

  const {
    data: sloDashboardWidgets,
    loading,
    error
  } = useGetSLODashboardWidgets({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier
    }
  })

  const toggleProps: PillToggleProps<SLOCardToggleViews> = {
    options: [
      {
        label: getString('cv.SLO'),
        value: SLOCardToggleViews.SLO
      },
      {
        label: getString('cv.errorBudget'),
        value: SLOCardToggleViews.ERROR_BUDGET
      }
    ],
    onChange: setView,
    selectedView: view,
    className: css.pillToggle
  }

  const handleCardSelectChange = (serviceLevelObjective: SelectedSLO): void => {
    setSelectedSLOs(prevSelectedSLOs => {
      if (find(prevSelectedSLOs, serviceLevelObjective)) {
        return prevSelectedSLOs.filter(item => item.identifier !== serviceLevelObjective.identifier)
      } else {
        return [...prevSelectedSLOs, serviceLevelObjective].slice(-3)
      }
    })
  }

  const serviceLevelObjectives: SelectedSLO[] = useMemo(
    () =>
      sloDashboardWidgets?.data?.content?.map(widget => ({ title: widget.title, identifier: widget.sloIdentifier })) ??
      [],
    [sloDashboardWidgets?.data?.content]
  )

  return (
    <Container margin={{ top: 'large' }} data-testid="SLO-and-errorBudget">
      <Container flex={{ justifyContent: 'center' }} padding={{ top: 'medium', bottom: 'medium' }}>
        <PillToggle {...toggleProps} />
      </Container>
      <Layout.Horizontal
        spacing="small"
        padding={{ bottom: 'small' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.BLACK}>
          {getString('cv.SLO')}:
        </Text>
        {loading && (
          <Layout.Horizontal spacing="small">
            <Container height={18} width={100} className={Classes.SKELETON} />
            <Container height={18} width={100} className={Classes.SKELETON} />
            <Container height={18} width={100} className={Classes.SKELETON} />
            <Container height={18} width={100} className={Classes.SKELETON} />
          </Layout.Horizontal>
        )}
        {!loading && error && (
          <Text color={Color.RED_500} font={{ variation: FontVariation.TINY_SEMI }} lineClamp={1}>
            {getErrorMessage(error)}
          </Text>
        )}
        {!loading && !error && (
          <CardSelect
            multi
            type={CardSelectType.CardView}
            cardClassName={css.selectCard}
            data={serviceLevelObjectives}
            selected={selectedSLOs}
            onChange={handleCardSelectChange}
            renderItem={item => (
              <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_700}>
                {item.title}
              </Text>
            )}
          />
        )}
      </Layout.Horizontal>
      <Text
        icon="info"
        color={Color.GREY_600}
        padding={{ bottom: 'xlarge' }}
        font={{ variation: FontVariation.SMALL }}
        iconProps={{ size: 12, color: Color.PRIMARY_7 }}
      >
        {getString('cv.aMaximumOfThreeSLOCanBeComparedWithTheServiceHealth')}
      </Text>
      <Layout.Vertical spacing="large">
        {selectedSLOs.map(serviceLevelObjective => (
          <SLOTargetChartWrapper
            key={serviceLevelObjective.identifier}
            type={view}
            startTime={startTime}
            endTime={endTime}
            selectedSLO={serviceLevelObjective}
          />
        ))}
      </Layout.Vertical>
      {!selectedSLOs.length && (
        <Container height={250}>
          <NoDataCard
            message={
              <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
                {getString('cv.pleaseSelectSLOToGetTheData')}
              </Text>
            }
            containerClassName={css.noDataContainer}
          />
        </Container>
      )}
    </Container>
  )
}

export default SLOAndErrorBudget
