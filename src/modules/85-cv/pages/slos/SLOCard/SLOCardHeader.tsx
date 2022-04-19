/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams, Link } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import {
  Container,
  Heading,
  Text,
  Layout,
  Popover,
  Button,
  ButtonVariation,
  useConfirmationDialog,
  Icon
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Position, Menu, Intent } from '@blueprintjs/core'
import type { SLOErrorBudgetResetDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import ReviewChangeSVG from '@cv/assets/sloReviewChange.svg'
import { useErrorBudgetRestHook } from '@cv/hooks/useErrorBudgetRestHook/useErrorBudgetRestHook'
import { useLogContentHook } from '@cv/hooks/useLogContentHook/useLogContentHook'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import { getSearchString } from '@cv/utils/CommonUtils'
import { SLODetailsPageTabIds } from '@cv/pages/slos/CVSLODetailsPage/CVSLODetailsPage.types'
import { PeriodTypes } from '../components/CVCreateSLO/CVCreateSLO.types'
import type { SLOCardHeaderProps } from '../CVSLOsListingPage.types'
import css from '../CVSLOsListingPage.module.scss'

const SLOCardHeader: React.FC<SLOCardHeaderProps> = ({
  serviceLevelObjective,
  onDelete,
  onResetErrorBudget,
  monitoredServiceIdentifier
}) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [menuOpen, setMenuOpen] = useState(false)
  const [errorBudgetResetData, setErrorBudgetResetData] = useState<SLOErrorBudgetResetDTO | null>()

  const monitoredServicePathname = routes.toCVAddMonitoringServicesEdit({
    accountId,
    orgIdentifier,
    projectIdentifier,
    identifier: serviceLevelObjective.monitoredServiceIdentifier,
    module: 'cv'
  })

  const SLODetailsPagePathname =
    routes.toCVSLODetailsPage({
      identifier: serviceLevelObjective.sloIdentifier,
      accountId,
      orgIdentifier,
      projectIdentifier
    }) + getSearchString({ monitoredServiceIdentifier })

  const onEdit = (): void => {
    history.push({
      pathname: routes.toCVSLODetailsPage({
        identifier: serviceLevelObjective.sloIdentifier,
        accountId,
        orgIdentifier,
        projectIdentifier
      }),
      search: getSearchString({ tab: SLODetailsPageTabIds.Configurations, monitoredServiceIdentifier })
    })
  }

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.delete', { name: serviceLevelObjective.title }),
    contentText: (
      <Text color={Color.GREY_800}>{getString('cv.slos.confirmDeleteSLO', { name: serviceLevelObjective.title })}</Text>
    ),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        onDelete(serviceLevelObjective.sloIdentifier, serviceLevelObjective.title)
      }
    }
  })

  const { openDialog: confirmReviewChanges } = useConfirmationDialog({
    intent: Intent.WARNING,
    titleText: getString('cv.slos.reviewChanges'),
    contentText: (
      <Layout.Horizontal padding={{ right: 'xxlarge' }}>
        <Text color={Color.GREY_800}>{getString('cv.slos.sloEditWarningMessage')}</Text>
        <div>
          <img src={ReviewChangeSVG} width="145px" height="200px" alt="" />
        </div>
      </Layout.Horizontal>
    ),
    confirmButtonText: getString('common.ok'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed && errorBudgetResetData) {
        onResetErrorBudget(serviceLevelObjective.sloIdentifier, errorBudgetResetData)
      }
      setErrorBudgetResetData(null)
    }
  })

  const { openErrorBudgetReset } = useErrorBudgetRestHook({
    onSuccess: values => {
      setErrorBudgetResetData(values)
      confirmReviewChanges()
    }
  })

  const { openLogContentHook } = useLogContentHook({
    sloIdentifier: serviceLevelObjective.sloIdentifier,
    serviceName: serviceLevelObjective.serviceName,
    envName: serviceLevelObjective.environmentName
  })

  return (
    <>
      <Container flex margin={{ bottom: 'medium' }}>
        <Link to={SLODetailsPagePathname}>
          <Heading level={2} font={{ variation: FontVariation.H4 }} color={Color.PRIMARY_7}>
            {serviceLevelObjective.title}
          </Heading>
        </Link>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => setMenuOpen(nextOpenState)}
          position={Position.LEFT_TOP}
          content={
            <Menu style={{ minWidth: 'unset' }}>
              <RbacMenuItem
                icon="edit"
                text={getString('edit')}
                onClick={onEdit}
                permission={{
                  permission: PermissionIdentifier.EDIT_SLO_SERVICE,
                  resource: {
                    resourceType: ResourceType.SLO,
                    resourceIdentifier: projectIdentifier
                  }
                }}
              />
              {serviceLevelObjective.sloTargetType === PeriodTypes.CALENDAR && (
                <RbacMenuItem
                  icon="reset"
                  text={getString('cv.resetErrorBudget')}
                  onClick={() => openErrorBudgetReset(serviceLevelObjective)}
                  permission={{
                    permission: PermissionIdentifier.EDIT_SLO_SERVICE,
                    resource: {
                      resourceType: ResourceType.SLO,
                      resourceIdentifier: projectIdentifier
                    }
                  }}
                />
              )}
              <RbacMenuItem
                icon={
                  <Icon
                    size={20}
                    padding={{ right: 'xsmall' }}
                    name="api-docs"
                    color={Color.GREY_700}
                    className={css.menuIcon}
                  />
                }
                text={getString('cv.externalAPICalls')}
                onClick={() => openLogContentHook(LogTypes.ApiCallLog)}
                permission={{
                  permission: PermissionIdentifier.VIEW_SLO_SERVICE,
                  resource: {
                    resourceType: ResourceType.SLO,
                    resourceIdentifier: projectIdentifier
                  }
                }}
              />
              <RbacMenuItem
                icon={<Icon size={20} padding={{ right: 'xsmall' }} name="audit-trail" className={css.menuIcon} />}
                text={getString('cv.executionLogs')}
                onClick={() => openLogContentHook(LogTypes.ExecutionLog)}
                permission={{
                  permission: PermissionIdentifier.VIEW_SLO_SERVICE,
                  resource: {
                    resourceType: ResourceType.SLO,
                    resourceIdentifier: projectIdentifier
                  }
                }}
              />
              <RbacMenuItem
                icon="trash"
                text={getString('delete')}
                onClick={openDialog}
                permission={{
                  permission: PermissionIdentifier.DELETE_SLO_SERVICE,
                  resource: {
                    resourceType: ResourceType.SLO,
                    resourceIdentifier: projectIdentifier
                  }
                }}
              />
            </Menu>
          }
        >
          <Button icon="Options" variation={ButtonVariation.ICON} />
        </Popover>
      </Container>
      <Container flex={{ alignItems: 'flex-start' }}>
        <Layout.Vertical height={130} spacing="xsmall">
          <Layout.Horizontal spacing="xsmall">
            <Text
              width={100}
              font={{ variation: FontVariation.SMALL }}
              color={Color.GREY_400}
              tooltipProps={{ dataTooltipId: 'slosMonitoredService' }}
            >
              {getString('connectors.cdng.monitoredService.label')}:
            </Text>
            <Link to={monitoredServicePathname}>
              <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_6}>
                {serviceLevelObjective.serviceName}
              </Text>
              <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_6}>
                {serviceLevelObjective.environmentName}
              </Text>
            </Link>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xsmall">
            <Text
              width={100}
              font={{ variation: FontVariation.SMALL }}
              color={Color.GREY_400}
              tooltipProps={{ dataTooltipId: 'sliType' }}
            >
              {getString('cv.slos.sliType')}:
            </Text>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_700}>
              {serviceLevelObjective.type}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xsmall">
            <Text
              width={100}
              font={{ variation: FontVariation.SMALL }}
              color={Color.GREY_400}
              tooltipProps={{ dataTooltipId: 'slosHealthSource' }}
            >
              {getString('cv.slos.healthSource')}:
            </Text>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_700}>
              {serviceLevelObjective.healthSourceName}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xsmall">
            <Text width={100} font={{ variation: FontVariation.SMALL }} color={Color.GREY_400}>
              {getString('cv.slos.sloTargetAndBudget.periodType')}:
            </Text>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_700}>
              {serviceLevelObjective.sloTargetType}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xsmall">
            <Text width={100} font={{ variation: FontVariation.SMALL }} color={Color.GREY_400}>
              {getString('cv.periodLength')}:
            </Text>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_700}>
              {serviceLevelObjective.currentPeriodLengthDays === 1
                ? getString('cv.oneDay')
                : getString('cv.nDays', { n: serviceLevelObjective.currentPeriodLengthDays })}
            </Text>
          </Layout.Horizontal>
          <TagsRenderer tags={defaultTo(serviceLevelObjective.tags, {})} tagClassName={css.sloTags} />
        </Layout.Vertical>

        <Layout.Horizontal spacing="medium">
          <Container width={120} background={Color.GREY_100} padding="small" className={css.sloGlanceCard}>
            <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'burnRatePerDay' }}>
              {getString('cv.burnRatePerDay')}
            </Text>
            <Heading level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
              {defaultTo(Number(serviceLevelObjective.burnRate.currentRatePercentage), 0).toFixed(2)}%
            </Heading>
          </Container>
          <Container width={120} background={Color.GREY_100} padding="small" className={css.sloGlanceCard}>
            <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'timeRemaining' }}>
              {getString('cv.timeRemaining')}
            </Text>
            <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
              {serviceLevelObjective.timeRemainingDays}
            </Heading>
            <Text inline font={{ variation: FontVariation.FORM_HELP }}>
              {serviceLevelObjective.timeRemainingDays < 2 ? getString('cv.day') : getString('cv.days')}
            </Text>
          </Container>
        </Layout.Horizontal>
      </Container>
    </>
  )
}

export default SLOCardHeader
