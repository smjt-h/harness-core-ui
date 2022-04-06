/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Text,
  ButtonSize,
  ButtonVariation,
  Dialog,
  Formik,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Icon
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Form } from 'formik'
import * as Yup from 'yup'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ManifestToPathLabelMap, ManifestToPathMap } from '../Manifesthelper'
import type { PrimaryManifestType } from '../ManifestInterface'
import DragnDropPaths from '../DragnDropPaths'
import css from '../ManifestSelection.module.scss'

interface AttachPathYamlFlowType {
  manifestType: PrimaryManifestType
  allowableTypes: MultiTypeInputType[]
  expressions: string[]
  attachPathYaml: (formData: ConnectorConfigDTO) => void
  removeValuesYaml: (index: number) => void
  valuesPath: string[]
}

function AttachPathYamlFlow({
  manifestType,
  valuesPath,
  expressions,
  allowableTypes,
  attachPathYaml,
  removeValuesYaml
}: AttachPathYamlFlowType): React.ReactElement | null {
  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} onClose={hideModal}>
        <Formik
          initialValues={{}}
          formName="manifestPath"
          validationSchema={Yup.object().shape({
            valuesPath: Yup.lazy((value): Yup.Schema<unknown> => {
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return Yup.array().of(
                  Yup.object().shape({
                    path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                  })
                )
              }
              return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
            })
          })}
          onSubmit={formData => {
            const pathYamlData =
              typeof (formData as ConnectorConfigDTO)?.valuesPath === 'string'
                ? (formData as ConnectorConfigDTO)?.valuesPath
                : (formData as ConnectorConfigDTO)?.valuesPath?.map((path: { path: string }) => path.path)
            attachPathYaml(pathYamlData)
            hideModal()
          }}
          enableReinitialize={true}
        >
          {formik => (
            <Form>
              <Layout.Vertical>
                <DragnDropPaths
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldPath="valuesPath"
                  pathLabel={ManifestToPathLabelMap[manifestType] && getString(ManifestToPathLabelMap[manifestType])}
                  placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                />
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Dialog>
    ),
    []
  )

  if (ManifestToPathMap[manifestType]) {
    return (
      <section className={css.valuesList}>
        {valuesPath?.map((valuesPathValue: string, index: number) => (
          <section className={css.valuesListItem} key={`${valuesPathValue}-${index}`}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Layout.Horizontal>
                <Text inline lineClamp={1} width={25}>
                  {index + 1}.
                </Text>
                <Icon name="valuesFIle" inline padding={{ right: 'medium' }} size={24} />
                <Text lineClamp={1} inline width={100}>
                  {valuesPathValue}
                </Text>
              </Layout.Horizontal>

              <span>
                <Button iconProps={{ size: 18 }} icon="main-trash" onClick={() => removeValuesYaml(index)} minimal />
              </span>
            </Layout.Horizontal>
          </section>
        ))}
        <Button
          className={css.addValuesYaml}
          id="add-manifest"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          onClick={showModal}
          text={getString('pipeline.manifestType.attachPath', {
            manifestPath: ManifestToPathMap[manifestType]
          })}
        />
      </section>
    )
  }
  return null
}

export default AttachPathYamlFlow
