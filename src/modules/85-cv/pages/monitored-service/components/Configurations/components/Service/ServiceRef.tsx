/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import Service from './Service'
import type { ServiceTabInterface } from './Service.types'

export default function ServiceRef(props: ServiceTabInterface, formikRef: any) {
  const serviceRef = React.useRef<any | null>()

  React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return serviceRef?.current?.resetForm()
    },
    submitForm() {
      return serviceRef?.current?.submitForm()
    },
    getErrors() {
      return serviceRef?.current?.getErrors() || {}
    }
  }))
  return <Service {...props} formikRef={formikRef} />
}

export const ServiceWithRef = React.forwardRef(ServiceRef)
