/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Container,
  FlexExpander,
  Formik,
  FormikForm,
  Layout,
  FormInput,
  Color,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useFetchViewFieldsQuery, QlceViewFieldIdentifierData } from 'services/ce/services'
import { CostBucketWidgetType, CostTargetType, SharedCostType } from '@ce/types'
import {
  BusinessMapping,
  CostTarget,
  SharedCost,
  useCreateBusinessMapping,
  useUpdateBusinessMapping
} from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import CostBucketStep from './CostBucketStep/CostBucketStep'
import Step from './Step/Step'
import ManageUnallocatedCost from './ManageUnallocatedCost/ManageUnallocatedCost'
import css from './BusinessMappingBuilder.module.scss'

interface BusinessMappingForm {
  costTargets: Array<CostTargetType>
  sharedCosts: Array<SharedCostType>
  costTargetsKey?: number
  sharedCostsKey?: number
  accountId?: string
  name: string
  uuid?: string
}

interface BusinessMappingBuilderProps {
  selectedBM: BusinessMapping
  onSave: () => void
}

const BusinessMappingBuilder: (props: BusinessMappingBuilderProps) => React.ReactElement = ({ selectedBM, onSave }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const [{ data }] = useFetchViewFieldsQuery({
    variables: {
      filters: []
    }
  })

  const { getString } = useStrings()

  const { mutate } = useCreateBusinessMapping({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: update } = useUpdateBusinessMapping({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const fieldValuesList = get(data, 'perspectiveFields.fieldIdentifierData') as QlceViewFieldIdentifierData[]

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(),
    costTargets: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().trim().required(),
        rules: Yup.array()
          .of(
            Yup.object().shape({
              viewConditions: Yup.array().of(
                Yup.object().shape({
                  viewOperator: Yup.string(),
                  viewField: Yup.object().shape({
                    fieldId: Yup.string().required(),
                    fieldName: Yup.string(),
                    identifier: Yup.string().required(),
                    identifierName: Yup.string().nullable()
                  }),
                  values: Yup.array()
                    .of(Yup.string())
                    .min(1, getString('ce.businessMapping.errorMessages.viewConditions'))
                })
              )
            })
          )
          .required()
      })
    )
  })

  /* istanbul ignore next */
  const handleSubmit: (values: BusinessMappingForm) => any = async values => {
    const costTargetObj: CostTarget[] = values.costTargets.map(costTarget => {
      return { name: costTarget.name, rules: costTarget.rules }
    })

    const sharedCostObj: SharedCost[] = values.sharedCosts.map(costTarget => {
      return { name: costTarget.name, rules: costTarget.rules, strategy: costTarget.strategy }
    })

    const formValues: BusinessMapping = {
      accountId,
      name: values.name,
      costTargets: costTargetObj,
      sharedCosts: sharedCostObj
    }

    if (selectedBM.uuid) {
      formValues.uuid = selectedBM.uuid
    }

    try {
      const mutateFn = selectedBM.uuid ? update : mutate
      await mutateFn(formValues, {
        queryParams: {
          accountIdentifier: accountId
        }
      })

      showSuccess(getString('ce.businessMapping.created', { name: name }))
      onSave()
    } catch (e) {
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  return (
    <Formik<BusinessMappingForm>
      formName="createBusinessMapping"
      validationSchema={validationSchema}
      initialValues={{
        costTargets: selectedBM.costTargets || [],
        sharedCosts: selectedBM.sharedCosts || [],
        name: selectedBM.name || '',
        costTargetsKey: 0,
        sharedCostsKey: 0
      }}
      onSubmit={
        /* istanbul ignore next */ values => {
          handleSubmit(values)
        }
      }
      render={formikProps => {
        return (
          <FormikForm>
            <Layout.Horizontal
              padding="large"
              border={{
                bottom: true
              }}
            >
              <FormInput.Text
                name="name"
                placeholder={getString('ce.businessMapping.form.businessMappingPlaceholder')}
              />
              <FlexExpander />
              <Button
                loading={formikProps.isSubmitting}
                icon="upload-box"
                intent="primary"
                text={getString('ce.businessMapping.form.saveText')}
                type="submit"
              />
            </Layout.Horizontal>
            <Container
              className={css.container}
              padding={{
                left: 'large',
                right: 'large',
                bottom: 'large'
              }}
            >
              <CostBucketStep
                formikProps={formikProps}
                namespace={'costTargets'}
                value={formikProps.values.costTargets}
                fieldValuesList={fieldValuesList}
                widgetType={CostBucketWidgetType.CostBucket}
                stepProps={{
                  color: Color.GREEN_900,
                  background: Color.GREEN_100,
                  total: 3,
                  current: 1,
                  defaultOpen: true
                }}
              />
              <CostBucketStep
                formikProps={formikProps}
                namespace={'sharedCosts'}
                value={formikProps.values.sharedCosts}
                fieldValuesList={fieldValuesList}
                isSharedCost={true}
                widgetType={CostBucketWidgetType.SharedCostBucket}
                stepProps={{
                  color: Color.PURPLE_900,
                  background: Color.PURPLE_100,
                  total: 3,
                  current: 2,
                  defaultOpen: false
                }}
              />
              <Step
                stepProps={{
                  color: Color.YELLOW_900,
                  background: Color.YELLOW_100,
                  total: 3,
                  current: 3,
                  defaultOpen: false
                }}
                title={getString('ce.businessMapping.manageUnallocatedCost.title')}
              >
                <ManageUnallocatedCost />
              </Step>
            </Container>
          </FormikForm>
        )
      }}
    ></Formik>
  )
}

export default BusinessMappingBuilder
