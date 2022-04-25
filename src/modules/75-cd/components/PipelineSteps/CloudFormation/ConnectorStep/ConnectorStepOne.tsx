/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {find} from 'lodash-es'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Heading,
  Formik,
  Card,
  Icon,
  Text,
  Color,
  Button,
  ButtonVariation,
  ButtonSize,
  StepProps,
  MultiTypeInputType,
  MultiTypeInput,
  MultiSelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { AllowedTypes, ConnectorIcons, ConnectorMap, ConnectorLabelMap, ConnectorTypes } from '../CloudFormationHelper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AWSConnector.module.scss'

interface ConnectorStepOneProps {
  isReadonly: boolean
  showNewConnector: boolean
  allowableTypes: MultiTypeInputType[]
  setShowNewConnector: (bool: boolean) => void
  selectedConnector: string
  setSelectedConnector: (type: string) => void
  initialValues: any
  isParam: boolean
  index?: number
  regions: MultiSelectOption[]
}

const ConnectorStepOne: React.FC<StepProps<any> & ConnectorStepOneProps> = ({
  allowableTypes,
  isReadonly = false,
  nextStep,
  setShowNewConnector,
  showNewConnector,
  selectedConnector,
  setSelectedConnector,
  initialValues,
  isParam,
  index,
  regions
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const title = isParam ? 'cd.cloudFormation.paramFileConnector' : 'cd.cloudFormation.templateFileConnector'
  const [allowedTypes, setAllowedTypes] = useState<string[]>(AllowedTypes)
  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector && getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
  } ${getString('connector')}`

  useEffect(() => {
    const connectorType = isParam
      ? initialValues.spec.configuration.parameters[index!]?.store?.type
      : initialValues?.spec?.configuration?.templateFile?.spec?.store?.type
    setSelectedConnector(connectorType === "S3Url" ? 'S3' : connectorType)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  useEffect(() => {
    if (!isParam) {
      setAllowedTypes(AllowedTypes.filter(item => item !== 'S3'))
    }
  }, [isParam])

  useEffect(() => {
    if (showNewConnector) {
      nextStep?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewConnector])

  const isS3 = selectedConnector && selectedConnector === 'S3'
  const errorMsg = Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError'))
  const connectorSchema = {
    store: Yup.object().shape({
      spec: Yup.object().shape({
        connectorRef: errorMsg
      })
    })
  }
  const paramSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        parameters: Yup.object().shape({
          ...connectorSchema
        })
      })
    })
  }

  const templateSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        templateFile: Yup.object().shape({
          spec:Yup.object().shape({
            ...connectorSchema
          })
        })
      })
    })
  }
  const validationSchema = isParam ? paramSchema : templateSchema
  return (
    <Layout.Vertical padding="small" className={css.awsForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString(title)}
      </Heading>
      <Formik
        formName="awsConnector"
        enableReinitialize={true}
        onSubmit={data => {
          setSelectedConnector('')
          nextStep?.(data)
        }}
        initialValues={
          isParam
            ? { spec: { configuration: { parameters: { ...initialValues.spec.configuration.parameters[index!] } } } }
            : { ...initialValues }
        }
        validationSchema={validationSchema}
      >
        {({ values, setFieldValue }) => {
          let disabled = !values?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
          let name = 'spec.configuration.templateFile.spec.store.spec.connectorRef'
          if (isParam) {
            disabled = !(
              values?.spec?.configuration?.parameters?.store?.spec?.connectorRef &&
              values?.spec?.configuration?.parameters?.store?.spec?.region
            )
            name = `spec.configuration.parameters.store.spec.connectorRef`
          }
          return (
            <>
              <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                {allowedTypes.map(item => (
                  <div key={item} className={css.squareCardContainer}>
                    <Card
                      className={css.connectorIcon}
                      selected={item === selectedConnector}
                      data-testid={`connector-${item}`}
                      onClick={() => setSelectedConnector(item as ConnectorTypes)}
                    >
                      <Icon name={ConnectorIcons[item]} size={26} />
                    </Card>
                    <Text color={Color.BLACK_100}>{item}</Text>
                  </div>
                ))}
              </Layout.Horizontal>
              <Form className={css.formComponent}>
                <div className={css.formContainerStepOne}>
                  <Layout.Horizontal className={css.horizontalFlex} spacing={'medium'}>
                    <FormMultiTypeConnectorField
                      label={
                        <Text style={{ display: 'flex', alignItems: 'center' }}>
                          {ConnectorMap[selectedConnector]} {getString('connector')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={`${ConnectorMap[selectedConnector]} ${getString('connector')}`}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      }
                      type={ConnectorMap[selectedConnector]}
                      width={400}
                      name={name}
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions, allowableTypes }}
                      disabled={!selectedConnector}
                    />
                    {selectedConnector && (
                      <Button
                        className={css.newConnectorButton}
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly}
                        id="new-connector"
                        text={newConnectorLabel}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => setShowNewConnector(true)}
                      />
                    )}
                  </Layout.Horizontal>
                  {isS3 && (
                    <Layout.Horizontal>
                      <Layout.Horizontal className={stepCss.formGroup}>
                        <MultiTypeInput
                          name={`spec.configuration.parameters.store.spec.region`}
                          selectProps={{
                            addClearBtn: false,
                            items: regions
                          }}
                          width={300}
                          value={find(regions, ['value', values?.spec?.configuration?.parameters?.store?.spec?.region])}
                          onChange={({ value }: any) => {
                            setFieldValue(`spec.configuration.parameters.store.spec.region`, value)
                          }}
                        />
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                  )}
                </div>
                <Layout.Horizontal spacing="xxlarge">
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={disabled}
                  />
                </Layout.Horizontal>
              </Form>
            </>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ConnectorStepOne
