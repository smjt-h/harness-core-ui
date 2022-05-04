/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import isMatch from 'lodash-es/isMatch'
import has from 'lodash-es/has'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineInfoConfig } from 'services/cd-ng'
import {
  validateCICodebase,
  getErrorsList,
  validatePipeline,
  shouldRenderRunTimeInputView,
  shouldRenderRunTimeInputViewWithAllowedValues,
  getAllowedValuesFromTemplate
} from '../StepUtil'
import {
  pipelineTemplateWithRuntimeInput,
  pipelineWithNoBuildInfo,
  pipelineWithBranchBuild,
  pipelineWithTagBuild,
  pipelineWithDeploymentStage,
  templateWithRuntimeTimeout
} from './mock'

jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn(() => Promise.resolve(new Map())),
  useValidationError: () => ({ errorMap: new Map() })
}))

describe('Test StepUtils', () => {
  test('Test validateCICodebase method for pipeline without build info', () => {
    const errors = validateCICodebase({
      // eslint-disable-next-line
      // @ts-ignore
      pipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      originalPipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: {} } } } })).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with build as run time info', () => {
    const errors = validateCICodebase({
      // eslint-disable-next-line
      // @ts-ignore
      pipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      originalPipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: {} } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.type')).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with branch build', () => {
    const errors = validateCICodebase({
      pipeline: pipelineWithBranchBuild as PipelineInfoConfig,
      originalPipeline: pipelineWithBranchBuild as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: { spec: {} } } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.spec.branch')).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with tag build', () => {
    const errors = validateCICodebase({
      pipeline: pipelineWithTagBuild as PipelineInfoConfig,
      originalPipeline: pipelineWithTagBuild as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: { spec: {} } } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.spec.tag')).toBeTruthy()
  })
  test('Test validateCodebase method for pipeline with deployment stage', () => {
    const errors = validatePipeline({
      pipeline: pipelineWithDeploymentStage as PipelineInfoConfig,
      originalPipeline: pipelineWithDeploymentStage as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: templateWithRuntimeTimeout as PipelineInfoConfig,
      viewType: StepViewType.DeploymentForm
    })
    expect(isMatch(errors, { timeout: 'Invalid syntax provided' })).toBeTruthy()
  })

  test('Test getErrorsList method', () => {
    const errors = {
      properties: { ci: { codebase: 'CI Codebase is a required field' } },
      stages: [
        {
          stage: {
            spec: {
              execution: {
                steps: [{ step: { spec: { image: 'Image is a required field', type: 'Type is a required field' } } }]
              }
            }
          }
        }
      ]
    }
    const { errorStrings, errorCount } = getErrorsList(errors)
    expect(errorStrings.length).toBe(3)
    expect(errorCount).toBe(3)
  })

  test('Test shouldRenderRunTimeInputView method', () => {
    expect(shouldRenderRunTimeInputView('sample-value')).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>')).toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>.allowedValues(ecr,docker)')).toBeTruthy()
    expect(shouldRenderRunTimeInputView('<+input>.regex(abc*)')).toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: '<+input>' })).toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: 'sample-value' })).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView({ key1: 'sample-value', key2: '<+input>' })).toBeTruthy()
    expect(
      shouldRenderRunTimeInputView({ key1: 'sample-value', key2: '<+input>.allowedValues(ecr,docker)' })
    ).toBeTruthy()
    expect(shouldRenderRunTimeInputView(123)).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView(null)).not.toBeTruthy()
    expect(shouldRenderRunTimeInputView(undefined)).not.toBeTruthy()
  })

  test('Test shouldRenderRunTimeInputViewWithAllowedValues method', () => {
    expect(
      shouldRenderRunTimeInputViewWithAllowedValues('a.b.c', {
        a: { b: { c: '<+input>.allowedValues(val1,val2,val3)' } }
      })
    ).toBeTruthy()
    expect(shouldRenderRunTimeInputViewWithAllowedValues('')).not.toBeTruthy()
    expect(shouldRenderRunTimeInputViewWithAllowedValues('a.b.c')).not.toBeTruthy()
    expect(
      shouldRenderRunTimeInputViewWithAllowedValues('a.b.c', {
        a: { b: { c: '<+input>' } }
      })
    ).not.toBeTruthy()
    expect(
      shouldRenderRunTimeInputViewWithAllowedValues('a.b.c', {
        a: { b: { c: 'some-value' } }
      })
    ).not.toBeTruthy()
  })

  test('Test getAllowedValuesFromTemplate method', () => {
    expect(
      getAllowedValuesFromTemplate(
        {
          a: { b: { c: '<+input>.allowedValues(val1,val2,val3)' } }
        },
        'a.b.c'
      ).length
    ).toBe(3)
    expect(
      getAllowedValuesFromTemplate(
        {
          a: { b: { c: '<+input>' } }
        },
        'a.b.c'
      ).length
    ).toBe(0)
    expect(
      JSON.stringify(
        getAllowedValuesFromTemplate(
          {
            a: { b: { c: '<+input>.allowedValues(val1)' } }
          },
          'a.b.c'
        )
      )
    ).toBe(JSON.stringify([{ label: 'val1', value: 'val1' }]))
  })
})
