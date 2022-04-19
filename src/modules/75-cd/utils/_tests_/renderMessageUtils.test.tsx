/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { BannerType } from '@common/layouts/Constants'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { getBannerText } from '../renderMessageUtils'

const features = new Map<FeatureIdentifier, CheckFeatureReturn>()
const mockServiceBreachData = (): void => {
  features.set(FeatureIdentifier.SERVICES, {
    enabled: false,
    featureDetail: {
      featureName: FeatureIdentifier.SERVICES,
      enabled: false,
      moduleType: 'CD',
      limit: 400,
      count: 400
    }
  })
}
const mockDeploymentPerMonthData = (): void => {
  features.set(FeatureIdentifier.DEPLOYMENTS_PER_MONTH, {
    enabled: false,
    featureDetail: {
      featureName: FeatureIdentifier.DEPLOYMENTS_PER_MONTH,
      enabled: false,
      moduleType: 'CD',
      limit: 400,
      count: 400
    }
  })
}

describe('Render Message when usage limit is breached tests', () => {
  test('When user has team plan and service limit is breached ', () => {
    const additionalLicenseProps = {
      isFreeEdition: false,
      isTeamEdition: true
    }
    mockServiceBreachData()
    const serviceFeatureDetail = features.get(FeatureIdentifier.SERVICES)
    const expectedMessage =
      'You have used services included in the team plan. Consider upgrading to unlock more services.'
    const getString = jest.fn().mockReturnValue(expectedMessage)

    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, serviceFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.LEVEL_UP)
  })
  test('When user has free plan and service limit is breached', () => {
    const additionalLicenseProps = {
      isFreeEdition: true,
      isTeamEdition: false
    }
    mockServiceBreachData()
    const serviceFeatureDetail = features.get(FeatureIdentifier.SERVICES)
    const expectedMessage =
      'You have used services included in the free plan. Consider upgrading to unlock more services.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, serviceFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.LEVEL_UP)
  })
  test('When dpm and servicelimit both are breached', () => {
    mockServiceBreachData()
    mockDeploymentPerMonthData()
    const dpmFeatureDetail = features.get(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
    const serviceFeatureDetail = features.get(FeatureIdentifier.SERVICES)
    const expectedMessage =
      'You have used 500 free deployments this month and 400 free services. Consider upgrading for higher limits.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, {}, serviceFeatureDetail, dpmFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.LEVEL_UP)
  })
  test('When dpm limit is breached', () => {
    mockDeploymentPerMonthData()
    const dpmFeatureDetail = features.get(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
    const expectedMessage =
      'You have used 500 free deployments this month and 400 free services. Consider upgrading for higher limits.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, {}, undefined, dpmFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.LEVEL_UP)
  })
})

describe('Display Warning messages tests', () => {
  test('Service warning', () => {
    features.set(FeatureIdentifier.SERVICES, {
      enabled: false,
      featureDetail: {
        featureName: FeatureIdentifier.SERVICES,
        enabled: false,
        moduleType: 'CD',
        limit: 400,
        count: 388
      }
    })
    const serviceFeatureDetail = features.get(FeatureIdentifier.SERVICES)
    const expectedMessage = 'You have used 97% of your service subscription limit.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, {}, serviceFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.INFO)
  })
  test('dpm warning', () => {
    features.set(FeatureIdentifier.DEPLOYMENTS_PER_MONTH, {
      enabled: false,
      featureDetail: {
        featureName: FeatureIdentifier.DEPLOYMENTS_PER_MONTH,
        enabled: false,
        moduleType: 'CD',
        limit: 400,
        count: 395
      }
    })
    const dpmFeatureDetail = features.get(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
    const expectedMessage = 'You have used 395 / 400 free deployments this month.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, {}, undefined, dpmFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.INFO)
  })

  test('Initial deployment warning', () => {
    features.set(FeatureIdentifier.INITIAL_DEPLOYMENTS, {
      enabled: false,
      featureDetail: {
        featureName: FeatureIdentifier.INITIAL_DEPLOYMENTS,
        enabled: false,
        moduleType: 'CD',
        limit: 1500,
        count: 1450
      }
    })
    const initialDeploymentsFeatureDetail = features.get(FeatureIdentifier.INITIAL_DEPLOYMENTS)
    const expectedMessage =
      'You have used 97% of deployments included in the free plan. After 1,000 deployments, the free plan will be restricted to 100 deployments per month.'
    const getString = jest.fn().mockReturnValue(expectedMessage)
    const { message, bannerType } = getBannerText(getString, {}, undefined, undefined, initialDeploymentsFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.INFO)
  })
})

describe('render message', () => {
  test('Display message if service is overuse and isTeamEdition', () => {
    const additionalLicenseProps = {
      isFreeEdition: false,
      isTeamEdition: true
    }
    features.set(FeatureIdentifier.SERVICES, {
      enabled: false,
      featureDetail: {
        featureName: FeatureIdentifier.SERVICES,
        enabled: false,
        moduleType: 'CD',
        limit: 400,
        count: 401
      }
    })
    const serviceFeatureDetail = features.get(FeatureIdentifier.SERVICES)
    const expectedMessage =
      'You have exceeded your service subscription limit. Consider increasing your limits to keep shipping.'
    const getString = jest.fn().mockReturnValue(expectedMessage)

    const { message, bannerType } = getBannerText(getString, additionalLicenseProps, serviceFeatureDetail)
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.OVERUSE)
  })

  test('No message displayed if limit not breached or overused', () => {
    const expectedMessage = ''
    const getString = jest.fn().mockReturnValue(expectedMessage)

    const { message, bannerType } = getBannerText(getString, {})
    expect(message()).toEqual(expectedMessage)
    expect(bannerType).toEqual(BannerType.LEVEL_UP)
  })
})
