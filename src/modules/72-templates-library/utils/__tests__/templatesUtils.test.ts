/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set, unset } from 'lodash-es'
import produce from 'immer'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import {
  pipelineTemplateMock,
  stageTemplateMock,
  stepTemplateMock
} from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import {
  getAllowedTemplateTypes,
  getScopeBasedQueryParams,
  getTemplateInputsCount,
  getVersionLabelText,
  hasSameRunTimeInputs
} from '@templates-library/utils/templatesUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('templatesUtils tests', () => {
  test('Test getVersionLabelText method', () => {
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('v1')
    expect(getVersionLabelText({ ...stageTemplateMock, stableTemplate: true }, getString)).toEqual(
      'templatesLibrary.stableVersion'
    )
    unset(stageTemplateMock, 'versionLabel')
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('templatesLibrary.alwaysUseStableVersion')
  })

  test('Test getAllowedTemplateTypes method', () => {
    expect(getAllowedTemplateTypes(getString, 'cd', true)).toEqual([
      { disabled: false, label: 'step', value: 'Step' },
      { disabled: false, label: 'common.stage', value: 'Stage' },
      { disabled: false, label: 'common.pipeline', value: 'Pipeline' },
      { disabled: true, label: 'service', value: 'Service' },
      { disabled: true, label: 'infrastructureText', value: 'Infrastructure' },
      { disabled: true, label: 'stepGroup', value: 'StepGroup' },
      { disabled: true, label: 'executionText', value: 'Execution' }
    ])
    expect(getAllowedTemplateTypes(getString, 'cv', false)).toEqual(
      expect.arrayContaining([
        {
          disabled: false,
          label: 'connectors.cdng.monitoredService.label',
          value: 'MonitoredService'
        }
      ])
    )
  })

  test('Test getScopeBasedQueryParams method', () => {
    const queryParams: ProjectPathProps = {
      accountId: 'accountId',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier'
    }
    expect(getScopeBasedQueryParams(queryParams, Scope.PROJECT)).toEqual({
      accountIdentifier: 'accountId',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier'
    })
    expect(getScopeBasedQueryParams(queryParams, Scope.ORG)).toEqual({
      accountIdentifier: 'accountId',
      orgIdentifier: 'orgIdentifier'
    })
    expect(getScopeBasedQueryParams(queryParams, Scope.ACCOUNT)).toEqual({
      accountIdentifier: 'accountId'
    })
  })

  test('Test getTemplateInputsCount method', () => {
    expect(getTemplateInputsCount(stepTemplateMock)).toEqual(2)
    expect(getTemplateInputsCount(stageTemplateMock)).toEqual(2)
    expect(getTemplateInputsCount(pipelineTemplateMock)).toEqual(0)
  })

  test('Test hasSameRunTimeInputs method', () => {
    const example1 = produce(stageTemplateMock, draft => {
      set(draft, 'spec.spec.serviceConfig.serviceRef', 'another_Service')
    })
    expect(hasSameRunTimeInputs(stageTemplateMock, example1)).toEqual(true)
    const example2 = produce(stageTemplateMock, draft => {
      set(draft, 'spec.spec.serviceConfig.serviceRef', RUNTIME_INPUT_VALUE)
    })
    expect(hasSameRunTimeInputs(stageTemplateMock, example2)).toEqual(false)
  })
})
