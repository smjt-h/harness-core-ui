/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
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
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { AllowedTypes, ConnectorIcons, ConnectorMap, ConnectorLabelMap, ConnectorTypes } from '../CloudFormationHelper'

import css from './AWSConnector.module.scss'

interface ConnectorStepOneProps {
  isReadonly: boolean
  showNewConnector: boolean
  allowableTypes: MultiTypeInputType[]
  setShowNewConnector: (bool: boolean) => void
  selectedConnector: string
  setSelectedConnector: (type: string) => void
  initialValues: any
  onSubmit: (values: any) => void
  isParam: boolean
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
  onSubmit,
  isParam
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const title = isParam ? 'cd.cloudFormation.paramFileConnector' : 'cd.cloudFormation.templateFileConnector'

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector && getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
  } ${getString('connector')}`

  useEffect(() => {
    if (showNewConnector) {
      setSelectedConnector('')
      nextStep?.()
    }
  }, [showNewConnector])

  const errorMsg = Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError'))
  const connectorSchema = {
    spec: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: errorMsg
        })
      })
    })
  }
  const paramSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        parameters: Yup.object().shape({
          parametersFile: Yup.object().shape({
            ...connectorSchema
          })
        })
      })
    })
  }
  const templateSchema = {
    spec: Yup.object().shape({
      configuration: Yup.object().shape({
        templateFile: Yup.object().shape({
          ...connectorSchema
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
          onSubmit(data)
          setSelectedConnector('')
          nextStep?.()
        }}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {() => {
          let name: string
          if (isParam) {
            name = 'spec.configuration.parameters.parametersFile.spec.store.spec.connectorRef'
          } else {
            name = 'spec.configuration.templateFile.spec.store.spec.connectorRef'
          }

          return (
            <>
              <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                {AllowedTypes.map(item => (
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
                </div>
                <Layout.Horizontal spacing="xxlarge">
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={false}
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
