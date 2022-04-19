/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'

import * as cfServicesMock from 'services/cf'
import type { TargetingRulesTabProps } from '../TargetingRulesTab'
import TargetingRulesTab from '../TargetingRulesTab'
import * as usePatchFeatureFlagMock from '../hooks/usePatchFeatureFlag'
import mockSegment from './data/mockSegments'
import mockTargets from './data/mockTargets'
import mockFeature from './data/mockFeature'
import expectedFormValues from './data/expectedFormValues'

const renderComponent = (props: Partial<TargetingRulesTabProps> = {}): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <TargetingRulesTab featureFlagData={mockFeature} refetchFlag={jest.fn()} refetchFlagLoading={false} {...props} />
    </TestWrapper>
  )
}

describe('TargetingRulesTab', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.spyOn(cfServicesMock, 'useGetAllSegments').mockReturnValue({
      data: { segments: mockSegment },
      loading: false
    } as any)

    jest.spyOn(cfServicesMock, 'useGetAllTargets').mockReturnValue({
      data: { targets: mockTargets },
      loading: false
    } as any)
  })

  describe('Flag State', () => {
    test('it should toggle flag state correctly', async () => {
      renderComponent()

      const flagToggle = screen.getByTestId('flag-status-switch')
      expect(flagToggle).toBeChecked()

      userEvent.click(flagToggle)

      expect(flagToggle).not.toBeChecked()
      expect(screen.getByText('cf.featureFlags.flagWillTurnOff')).toBeInTheDocument()
    })

    test('it should toggle flag state from OFF to ON correctly', async () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [],
            state: 'off',
            variationMap: [],
            version: 56
          }
        }
      })

      const flagToggle = screen.getByTestId('flag-status-switch')
      await waitFor(() => expect(flagToggle).not.toBeChecked())

      userEvent.click(flagToggle)

      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.featureFlags.flagWillTurnOn')).toBeInTheDocument()

      expect(screen.queryByTestId('targeting-rules-footer')).toBeInTheDocument()
    })
  })

  describe('Default Variation', () => {
    test('it should render and update default onVariation correctly', async () => {
      renderComponent()

      const onVariationDropdown = document.querySelector('input[name="onVariation"]') as HTMLSelectElement
      expect(onVariationDropdown).toHaveValue('True')
      userEvent.click(onVariationDropdown)

      const onVariationDropdownOptions = document.querySelectorAll('li')
      expect(onVariationDropdownOptions).toHaveLength(2)

      userEvent.click(onVariationDropdownOptions[1])
      expect(onVariationDropdown).toHaveValue('False')
    })

    test('it should use default onVariation if environment variation does not exist', async () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: undefined
        }
      })

      expect(document.querySelector('input[name="onVariation"]') as HTMLSelectElement).toHaveValue('True')
    })
  })

  describe('Variation Target/Target Groups', () => {
    test('it should render target groups tags/dropdown correctly', async () => {
      renderComponent()

      // assert correct target groups are prepopulated
      const targetGroupTagInputValue = screen
        .getByTestId('false_target_groups')
        .querySelectorAll('span[data-tag-index]')

      expect(targetGroupTagInputValue[0]).toHaveTextContent('target_group_4')
      expect(targetGroupTagInputValue[1]).toHaveTextContent('target_group_5')

      // assert target groups list appear on click
      const targetGroupTagInput = screen.getByTestId('false_target_groups').querySelector('input') as HTMLInputElement
      userEvent.type(targetGroupTagInput, 'target')
      const targetGroupInputList = document.querySelector('ul')
      await waitFor(() => expect(targetGroupInputList).toBeInTheDocument())
      expect(document.querySelectorAll('li')[0]).toHaveTextContent(/target_group_5/)
      expect(document.querySelectorAll('li')[1]).toHaveTextContent(/target_group_4/)
      expect(document.querySelectorAll('li')[2]).toHaveTextContent(/target_group_1/)
      expect(document.querySelectorAll('li')[3]).toHaveTextContent(/target_group_2/)
      expect(document.querySelectorAll('li')[4]).toHaveTextContent(/target_group_3/)
    })

    test('it should render target tags/dropdown correctly', async () => {
      renderComponent()

      // assert correct target are prepopulated
      const targetGroupTagInputValue = screen.getByTestId('false_targets').querySelectorAll('span[data-tag-index]')

      expect(targetGroupTagInputValue[0]).toHaveTextContent(/target_1/)

      // assert target groups list appear on click
      const targetGroupTagInput = screen.getByTestId('false_targets').querySelector('input') as HTMLInputElement
      userEvent.type(targetGroupTagInput, 'target')
      const targetGroupInputList = document.querySelector('ul')
      await waitFor(() => expect(targetGroupInputList).toBeInTheDocument())
      expect(document.querySelectorAll('li')[0]).toHaveTextContent(/target_1/)
      expect(document.querySelectorAll('li')[1]).toHaveTextContent(/target_2/)
      expect(document.querySelectorAll('li')[2]).toHaveTextContent(/target_3/)
      expect(document.querySelectorAll('li')[3]).toHaveTextContent(/target_4/)
    })

    test('it should update Target Groups for a variation correctly', async () => {
      renderComponent()

      let targetGroupTagInputValues = screen.getByTestId('false_target_groups').querySelectorAll('span[data-tag-index]')

      expect(targetGroupTagInputValues[0]).toHaveTextContent(/target_group_4/)
      expect(targetGroupTagInputValues[1]).toHaveTextContent(/target_group_5/)

      userEvent.click(screen.getByTestId('false-target-groups-input'))

      await waitFor(() => expect(screen.getByText('target_group_2')).toBeInTheDocument())
      userEvent.click(screen.getByText('target_group_2'))

      targetGroupTagInputValues = screen.getByTestId('false_target_groups').querySelectorAll('span[data-tag-index]')
      expect(targetGroupTagInputValues).toHaveLength(3)
      expect(targetGroupTagInputValues[0]).toHaveTextContent(/target_group_4/)
      expect(targetGroupTagInputValues[1]).toHaveTextContent(/target_group_5/)
      expect(targetGroupTagInputValues[2]).toHaveTextContent(/target_group_2/)
    })

    test('it should update Targets for a variation correctly', async () => {
      renderComponent()

      let targetTagInputValues = screen.getByTestId('false_targets').querySelectorAll('span[data-tag-index]')

      expect(targetTagInputValues[0]).toHaveTextContent(/target_1/)

      userEvent.click(screen.getByTestId('false-target-input'))

      await waitFor(() => expect(screen.getByText('target_4')).toBeInTheDocument())
      userEvent.click(screen.getByText('target_4'))

      targetTagInputValues = screen.getByTestId('false_targets').querySelectorAll('span[data-tag-index]')
      expect(targetTagInputValues).toHaveLength(2)
      expect(targetTagInputValues[0]).toHaveTextContent(/target_1/)
      expect(targetTagInputValues[1]).toHaveTextContent(/target_4/)
    })

    test('it should render variation item correctly when Target Groups are empty but Targets exist', async () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [],
            state: 'off',
            variationMap: [{ targets: [{ identifier: 'target1', name: 'target_1' }], variation: 'false' }],
            version: 56
          }
        }
      })

      expect(screen.getByTestId('false_target_groups').querySelectorAll('span[data-tag-index]')).toHaveLength(0)
    })

    test('it should render variation item correctly when Targets are empty but Target Groups exist', async () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [
              {
                clauses: [
                  {
                    attribute: '',
                    id: 'd36b6624-c514-4b94-94c7-9f558324badf',
                    negate: false,
                    op: 'segmentMatch',
                    values: ['randomID']
                  }
                ],
                priority: 100,
                ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde',
                serve: { variation: 'false' }
              }
            ],
            state: 'off',
            variationMap: [],
            version: 56
          }
        }
      })

      expect(screen.getByTestId('false_targets').querySelectorAll('span[data-tag-index]')).toHaveLength(0)
    })

    test('it should render empty target groups input when variation segmentsundefined', async () => {
      jest.spyOn(cfServicesMock, 'useGetAllSegments').mockReturnValue({
        data: undefined
      } as any)
      renderComponent()

      const targetGroupTagInputValue = screen
        .getByTestId('false_target_groups')
        .querySelector('span[data-tag-index="0"]')

      expect(targetGroupTagInputValue).not.toBeInTheDocument()
    })

    test('it should render empty targets input when targets is/ undefined', async () => {
      jest.spyOn(cfServicesMock, 'useGetAllTargets').mockReturnValue({
        data: undefined
      } as any)
      renderComponent()

      const targetGroupTagInputValue = screen.getByTestId('false_targets').querySelector('span[data-tag-index="0"]')

      expect(targetGroupTagInputValue).not.toBeInTheDocument()
    })

    test('it should show "Add Targeting" button when more targets available', async () => {
      renderComponent()
      expect(screen.getByText('cf.featureFlags.rules.addTargeting')).toBeInTheDocument()
    })

    test('it should add variation when "Add Targeting" option selected', async () => {
      renderComponent()
      const addTargetingButton = screen.getByText('cf.featureFlags.rules.addTargeting')
      expect(addTargetingButton).toBeInTheDocument()
      userEvent.click(addTargetingButton)

      const variationOptionTrue = screen.getByTestId('variation_option_true')
      expect(variationOptionTrue).toBeInTheDocument()
      userEvent.click(variationOptionTrue)

      expect(screen.getByTestId('true_target_groups')).toBeInTheDocument()
      expect(screen.getByTestId('true_targets')).toBeInTheDocument()
    })

    test('it should remove variation when "trash" icon/button clicked', async () => {
      renderComponent()
      userEvent.click(screen.getByText('cf.featureFlags.rules.addTargeting'))

      expect(screen.getByTestId('remove_variation_false')).toBeInTheDocument()
      userEvent.click(screen.getByTestId('remove_variation_false'))

      expect(screen.queryByTestId('false_target_groups')).not.toBeInTheDocument()
      expect(screen.queryByTestId('false_targets')).not.toBeInTheDocument()
    })
  })

  describe('Percentage Rollout', () => {
    test('it should render percentage rollout correctly when present', async () => {
      renderComponent()

      expect(screen.getByText('cf.featureFlags.percentageRollout')).toBeInTheDocument()
      const targetGroup = document.querySelector('input[name="targetingRuleItems[1].clauses[0].values[0]"]')
      expect(targetGroup).toHaveValue('target_group_1')
      const trueWeight = document.querySelector('input[name="targetingRuleItems[1].variations[0].weight"]')
      expect(trueWeight).toHaveValue(45)
      const falseWeight = document.querySelector('input[name="targetingRuleItems[1].variations[1].weight"]')
      expect(falseWeight).toHaveValue(55)
    })

    test('it should render percentage rollout correctly when added via button click', async () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [
              {
                clauses: [
                  {
                    attribute: '',
                    id: 'd36b6624-c514-4b94-94c7-9f558324badf',
                    negate: false,
                    op: 'segmentMatch',
                    values: ['randomID']
                  }
                ],
                priority: 100,
                ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde',
                serve: { variation: 'false' }
              }
            ],
            state: 'off',
            variationMap: [],
            version: 56
          }
        }
      })
      expect(screen.queryByText('cf.featureFlags.percentageRollout')).not.toBeInTheDocument()

      userEvent.click(screen.getByText('cf.featureFlags.rules.addTargeting'))
      const percentageRolloutOption = screen.getByTestId('variation_option_percentage_rollout')
      await waitFor(() => expect(percentageRolloutOption).toBeInTheDocument())
      userEvent.click(percentageRolloutOption)

      expect(screen.getByTestId('percentage_rollout_item_1')).toBeInTheDocument()
    })

    test('it should render percentage rollout correctly when not present', () => {
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [
              {
                clauses: [
                  {
                    attribute: '',
                    id: 'd36b6624-c514-4b94-94c7-9f558324badf',
                    negate: false,
                    op: 'segmentMatch',
                    values: ['randomID']
                  }
                ],
                priority: 100,
                ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde',
                serve: { variation: 'false' }
              }
            ],
            state: 'off',
            variationMap: [],
            version: 56
          }
        }
      })

      expect(screen.queryByText('cf.featureFlags.percentageRollout')).not.toBeInTheDocument()
    })

    test('it should remove percentage rollout correctly', () => {
      renderComponent()

      userEvent.click(screen.getByTestId('remove_percentage_rollout_1'))

      expect(screen.queryByText('cf.featureFlags.percentageRollout')).not.toBeInTheDocument()
    })

    test('it should not submit form if percentage rollout added but fields incorrect', async () => {
      const saveChangesMock = jest.fn()

      jest.spyOn(usePatchFeatureFlagMock, 'default').mockReturnValue({ saveChanges: saveChangesMock, loading: false })
      renderComponent({
        featureFlagData: {
          ...mockFeature,
          envProperties: {
            defaultServe: { variation: 'false' },
            environment: 'qatest',
            modifiedAt: 1635333973373,
            offVariation: 'false',
            rules: [
              {
                clauses: [
                  {
                    attribute: '',
                    id: 'd36b6624-c514-4b94-94c7-9f558324badf',
                    negate: false,
                    op: 'segmentMatch',
                    values: ['randomID']
                  }
                ],
                priority: 100,
                ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde',
                serve: { variation: 'false' }
              }
            ],
            state: 'off',
            variationMap: [],
            version: 56
          }
        }
      })

      userEvent.click(screen.getByText('cf.featureFlags.rules.addTargeting'))
      const percentageRolloutOption = screen.getByTestId('variation_option_percentage_rollout')
      await waitFor(() => expect(percentageRolloutOption).toBeInTheDocument())
      userEvent.click(percentageRolloutOption)
      expect(screen.getByTestId('percentage_rollout_item_1')).toBeInTheDocument()

      // click save
      const saveButton = screen.getByText('save')
      expect(saveButton).toBeInTheDocument()
      userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getAllByText('cf.featureFlags.rules.validation.valueMustAddTo100')).toHaveLength(2)
        expect(screen.getByText('cf.featureFlags.rules.validation.selectTargetGroup')).toBeInTheDocument()
        expect(saveChangesMock).not.toBeCalled()
      })
    })
  })

  describe('Integration', () => {
    test('it should call saveChanges with correct data on save', async () => {
      const saveChangesMock = jest.fn()

      jest.spyOn(usePatchFeatureFlagMock, 'default').mockReturnValue({ saveChanges: saveChangesMock, loading: false })
      renderComponent()

      // toggle flag off
      const flagToggle = screen.getByTestId('flag-status-switch')
      userEvent.click(flagToggle)
      expect(flagToggle).not.toBeChecked()

      // update default ON variation
      const onVariationDropdown = document.querySelector('input[name="onVariation"]') as HTMLSelectElement
      userEvent.click(onVariationDropdown)
      const trueVariationOption = document.querySelector('li') as HTMLElement
      userEvent.click(trueVariationOption)
      expect(onVariationDropdown).toHaveValue('True')

      // add true variation with targets/target groups
      userEvent.click(screen.getByText('cf.featureFlags.rules.addTargeting'))
      userEvent.click(screen.getByTestId('variation_option_true'))

      await waitFor(() => expect(screen.getByTestId('true-target-groups-input')).toBeInTheDocument())
      userEvent.click(screen.getByTestId('true-target-groups-input'))

      await waitFor(() => expect(screen.getByText('target_group_2')).toBeInTheDocument())
      userEvent.click(screen.getByText('target_group_2'))

      userEvent.click(screen.getByTestId('true-target-input'))
      await waitFor(() => screen.getByText('target_2'))
      userEvent.click(screen.getByText('target_2'))

      // update percentage rollout target grourp
      const targetGroup = document.querySelector(
        'input[name="targetingRuleItems[1].clauses[0].values[0]"]'
      ) as HTMLElement
      userEvent.click(targetGroup)
      await waitFor(() => expect(screen.getByText('target_group_6')).toBeInTheDocument())
      userEvent.click(screen.getByText('target_group_6'))

      // update percentage rollout weights
      const trueWeight = document.querySelector(
        'input[name="targetingRuleItems[1].variations[0].weight"]'
      ) as HTMLElement
      userEvent.clear(trueWeight)
      userEvent.type(trueWeight, '70')

      const falseWeight = document.querySelector(
        'input[name="targetingRuleItems[1].variations[1].weight"]'
      ) as HTMLElement
      userEvent.clear(falseWeight)
      userEvent.type(falseWeight, '30')

      // click save
      const saveButton = screen.getByText('save')
      expect(saveButton).toBeInTheDocument()
      userEvent.click(saveButton)
      await waitFor(() => expect(saveChangesMock).toBeCalledWith(expectedFormValues))
    })

    test('it should reset form correctly when cancel button clicked', async () => {
      renderComponent()

      const flagToggle = screen.getByTestId('flag-status-switch')
      expect(flagToggle).toBeChecked()
      userEvent.click(flagToggle)
      expect(flagToggle).not.toBeChecked()

      const cancelButton = screen.getByText('cancel')
      expect(cancelButton).toBeInTheDocument()

      userEvent.click(cancelButton)
      expect(flagToggle).toBeChecked()
    })
  })
})
