/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { PageSpinner } from '@wings-software/uicore'
import { StartTrialTemplate } from '@rbac/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useStartTrialLicense, useStartFreeLicense } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useCDTrialModal } from '@cd/modals/CDTrial/useCDTrialModal'
import { TrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import bgImageURL from './images/cd.svg'

const CDTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { source } = useQueryParams<{ source?: string }>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { accountId } = useParams<ProjectPathProps>()
  const module = 'cd'
  const moduleType = 'CD'

  const isFreeEnabled = useFeatureFlag(FeatureFlag.FREE_PLAN_ENABLED)

  const { mutate: startTrial, loading: startingTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: startFreePlan, loading: startingFree } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const startPlan = isFreeEnabled
    ? () => {
        return startFreePlan()
      }
    : () => {
        return startTrial({ moduleType, edition: Editions.ENTERPRISE })
      }
  const experienceParam = isFreeEnabled ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL

  const startTrialnOpenCDTrialModal = async (): Promise<void> => {
    try {
      const data = await startPlan()
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)

      openCreateProjectModal()
    } catch (ex) {
      showError((ex.data as Error)?.message || ex.message)
    }
  }

  const goToProjectCreationPage = (): void => {
    history.push({
      pathname: routes.toModuleHome({ accountId, module }),
      search: `?modal=${experienceParam}&&experience=${experienceParam}`
    })
  }

  const { openTrialModal: openCreateProjectModal } = useCDTrialModal({
    trialType: TrialType.CREATE_OR_SELECT_PROJECT,
    actionProps: { onCreateProject: goToProjectCreationPage }
  })

  const startBtnDescription = isFreeEnabled
    ? getString('common.startFreePlan', { module: moduleType })
    : getString('cd.cdTrialHomePage.startTrial.startBtn.description')

  const startTrialProps = {
    description: getString('common.selectAVersion.description'),
    learnMore: {
      description: getString('cd.learnMore'),
      url: 'https://ngdocs.harness.io/category/c9j6jejsws-cd-quickstarts'
    },
    startBtn: {
      description: startBtnDescription,
      onClick: source ? undefined : startTrialnOpenCDTrialModal
    }
  }

  const { showError } = useToaster()

  if (startingTrial || startingFree) {
    return <PageSpinner />
  }

  return (
    <StartTrialTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={module}
    />
  )
}

export default CDTrialHomePage
