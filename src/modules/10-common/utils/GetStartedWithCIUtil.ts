/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ResponseOrganizationResponse,
  ResponseProjectResponse,
  getOrganizationPromise,
  ResponseModuleLicenseDTO,
  postProjectPromise,
  postOrganizationPromise,
  startFreeLicensePromise,
  startTrialLicensePromise,
  ModuleLicenseDTO
} from 'services/cd-ng'
import {
  DEFAULT_ORG_ID,
  DEFAULT_ORG_NAME,
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECT_NAME,
  UNIQUE_ORG_ID
} from '@common/utils/CIConstants'
import { Editions } from '@common/constants/SubscriptionTypes'

export interface StartFreeLicenseAndSetupProjectCallback {
  orgId: string
  projectId: string
  data?: ModuleLicenseDTO
}

function startPlanByEdition(accountId: string, edition: Editions): Promise<ResponseModuleLicenseDTO> {
  switch (edition) {
    case Editions.FREE: {
      return startFreeLicensePromise({
        body: undefined,
        queryParams: {
          accountIdentifier: accountId,
          moduleType: 'CI'
        },
        requestOptions: {
          headers: {
            'content-type': 'application/json'
          }
        }
      })
    }
    case Editions.ENTERPRISE:
    case Editions.TEAM:
    default: {
      return startTrialLicensePromise({
        body: {
          edition,
          moduleType: 'CI'
        },
        queryParams: {
          accountIdentifier: accountId
        },
        requestOptions: {
          headers: {
            'content-type': 'application/json'
          }
        }
      })
    }
  }
}

const startPlanAndSetupProject = ({
  accountId,
  orgId: organizationId,
  onSetUpSuccessCallback,
  edition
}: {
  accountId: string
  orgId: string
  onSetUpSuccessCallback: ({ orgId, projectId, data }: StartFreeLicenseAndSetupProjectCallback) => void
  edition: Editions
}) => {
  startPlanByEdition(accountId, edition).then((startPlanResponse: ResponseModuleLicenseDTO) => {
    const { data: startPlanData, status: startPlanStatus } = startPlanResponse
    /* istanbul ignore else */ if (startPlanStatus === 'SUCCESS') {
      postProjectPromise({
        body: {
          project: {
            identifier: DEFAULT_PROJECT_ID,
            name: DEFAULT_PROJECT_NAME,
            orgIdentifier: organizationId
          }
        },
        queryParams: { accountIdentifier: accountId, orgIdentifier: organizationId }
      }).then((createProjectResponse: ResponseProjectResponse) => {
        const { data: projectData, status: createProjectResponseStatus } = createProjectResponse
        /* istanbul ignore else */ if (
          createProjectResponseStatus === 'SUCCESS' &&
          projectData?.project.identifier &&
          startPlanData
        ) {
          onSetUpSuccessCallback({
            orgId: organizationId,
            projectId: projectData.project.identifier,
            data: startPlanData
          })
        }
      })
    }
  })
}

export const setUpCI = (
  accountId: string,
  edition: Editions,
  onSetUpSuccessCallback: ({ orgId, projectId, data }: StartFreeLicenseAndSetupProjectCallback) => void
): void => {
  getOrganizationPromise({
    identifier: DEFAULT_ORG_ID,
    queryParams: {
      accountIdentifier: accountId
    }
  }).then((fetchOrgResponse: ResponseOrganizationResponse) => {
    const { data: orgData, status: fetchOrgResponseStatus } = fetchOrgResponse
    if (fetchOrgResponseStatus === 'SUCCESS' && orgData?.organization.identifier === DEFAULT_ORG_ID) {
      startPlanAndSetupProject({ accountId, orgId: DEFAULT_ORG_ID, onSetUpSuccessCallback, edition })
    } else {
      // Org with id "default" doesn't exist. We need to create an org in this case.
      postOrganizationPromise({
        body: {
          organization: {
            identifier: UNIQUE_ORG_ID,
            name: DEFAULT_ORG_NAME
          }
        },
        queryParams: {
          accountIdentifier: accountId
        }
      }).then((createOrgResponse: ResponseOrganizationResponse) => {
        const { status: createOrgStatus, data: createOrgData } = createOrgResponse
        /* istanbul ignore else */ if (createOrgStatus === 'SUCCESS' && createOrgData?.organization?.identifier) {
          startPlanAndSetupProject({
            accountId,
            orgId: createOrgData?.organization?.identifier,
            onSetUpSuccessCallback,
            edition
          })
        }
      })
    }
  })
}
