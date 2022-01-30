/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'

import { pick } from 'lodash-es'

import { VisualYamlSelectedView } from '@harness/uicore'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import {
  TemplateContext,
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

import templateContextProviderProps from './__tests__/mocks/templateContextProvider.json'

export interface TemplateContextWrapperProps extends TestWrapperProps {
  templateContextValues?: Partial<TemplateContextInterface>
}

export const TemplateContextTestWrapper: React.FC<TemplateContextWrapperProps> = props => {
  const { defaultAppStoreValues, templateContextValues } = props
  const [view, setView] = React.useState<VisualYamlSelectedView>(VisualYamlSelectedView.VISUAL)
  return (
    <TestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CD']
        },
        isGitSyncEnabled: true,
        connectivityMode: 'DELEGATE',
        ...defaultAppStoreValues
      }}
    >
      <TemplateContext.Provider
        value={
          {
            view: view,
            setView: setView,
            ...templateContextProviderProps,
            ...templateContextValues,
            state: {
              ...templateContextProviderProps.state,
              ...templateContextValues?.state,
              yamlHandler: {
                getLatestYaml: () => '',
                getYAMLValidationErrorMap: () => new Map()
              }
            }
          } as TemplateContextInterface
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </TemplateContext.Provider>
    </TestWrapper>
  )
}
