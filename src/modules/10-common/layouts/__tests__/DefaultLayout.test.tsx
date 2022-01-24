import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import { TestWrapper } from '@common/utils/testUtils'
import featuresFactory from 'framework/featureStore/FeaturesFactory'

import { BANNER_KEY } from '../FeatureBanner'
import { DefaultLayout } from '../DefaultLayout'

jest.mock('@common/hooks/useFeatures', () => ({
  useFeatures: jest.fn(() => ({}))
}))

const BANNER_TEXT = 'This is a feature banner'
const DISMISS_TEST_ID = 'feature-banner-dismiss'
const TEST_PATH = '/account/my_account/:module'

function renderMessage(): React.ReactNode {
  return BANNER_TEXT
}

describe('<DefaultLayout /> tests', () => {
  describe('feature banner tests', () => {
    beforeEach(() => {
      featuresFactory.unregisterAllFeatures()
      window.sessionStorage.removeItem(BANNER_KEY)
    })

    test('features banner is rendered', () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })
      const { container, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )

      const txt = getByText(BANNER_TEXT)

      expect(txt).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('features banner can be dismissed', () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })

      const { getByTestId, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )

      const btn = getByTestId(DISMISS_TEST_ID)

      fireEvent.click(btn)

      expect(() => getByText(BANNER_TEXT)).toThrow()
    })

    test('features banner stays dismissed for a module', async () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })
      featuresFactory.registerFeaturesByModule('ci', { features: [], renderMessage })

      const { getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
          <Link to="/account/my_account/ci">To CI</Link>
          <Link to="/account/my_account/cd">To CD</Link>
        </TestWrapper>
      )

      // dismiss banner
      const btn = screen.getByTestId(DISMISS_TEST_ID)
      fireEvent.click(btn)
      expect(() => getByText(BANNER_TEXT)).toThrow()

      // go to CI
      const toCI = getByText('To CI')
      fireEvent.click(toCI)

      const txt = screen.getByText(BANNER_TEXT)
      expect(txt).toBeDefined()

      // go back to CD
      const toCD = getByText('To CD')
      fireEvent.click(toCD)

      expect(() => getByText(BANNER_TEXT)).toThrow()
    })
  })
})
