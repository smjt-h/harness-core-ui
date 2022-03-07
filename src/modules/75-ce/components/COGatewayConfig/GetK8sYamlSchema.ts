/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty as _isEmpty } from 'lodash-es'
import { Utils } from '@ce/common/Utils'

interface K8sYamlSchemaProps {
  isEdit: boolean
}

const getK8sYamlSchema = ({ isEdit }: K8sYamlSchemaProps) => ({
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  title: 'The root schema',
  required: ['kind', 'apiVersion', 'metadata', 'spec'],
  properties: {
    kind: {
      $id: '#/properties/kind',
      type: 'string',
      title: 'The kind schema'
    },
    apiVersion: {
      $id: '#/properties/apiVersion',
      type: 'string',
      title: 'The apiVersion schema'
    },
    metadata: {
      $id: '#/properties/metadata',
      type: 'object',
      title: 'The metadata schema',
      required: ['name', 'namespace', 'annotations'],
      properties: {
        name: {
          $id: '#/properties/metadata/properties/name',
          type: 'string',
          title: 'The name schema',
          maxLength: 32,
          readOnly: isEdit
        },
        namespace: {
          $id: '#/properties/metadata/properties/namespace',
          type: 'string',
          title: 'The namespace schema'
        },
        annotations: {
          $id: '#/properties/metadata/properties/annotations',
          type: 'object',
          title: 'The annotations schema',
          required: [],
          additionalProperties: true
        }
      },
      additionalProperties: true
    },
    spec: {
      $id: '#/properties/spec',
      type: 'object',
      title: 'The spec schema',
      description: '',
      required: ['hideProgressPage'],
      properties: {
        service: {
          $id: '#/properties/spec/properties/service',
          type: 'object',
          required: ['name', 'port'],
          properties: {
            name: {
              $id: '#/properties/spec/properties/service/properties/name',
              type: 'string'
            },
            port: {
              $id: '#/properties/spec/properties/service/properties/port',
              type: 'integer'
            }
          }
        },
        ingress: {
          $id: '#/properties/spec/properties/ingress',
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              $id: '#/properties/spec/properties/ingress/properties/name',
              type: 'string'
            },
            controllerName: {
              $id: '#/properties/spec/properties/ingress/properties/controllerName',
              type: 'string'
            }
          }
        },
        idleTimeMins: {
          $id: '#/properties/spec/properties/idleTimeMins',
          type: 'integer',
          title: 'The idleTimeMins schema',
          description: '',
          maximum: 600
        },
        hideProgressPage: {
          $id: '#/properties/spec/properties/hideProgressPage',
          type: 'boolean',
          title: 'The hideProgressPage schema',
          description: ''
        },
        dependencies: {
          $id: '#/properties/spec/properties/dependencies',
          type: 'array',
          title: 'The dependencies schema',
          description: '',
          additionalItems: true,
          items: {
            $id: '#/properties/spec/properties/dependencies/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/dependencies/items/anyOf/0',
                type: 'object',
                title: 'Dependency Object',
                description: '',
                required: ['selector', 'wait'],
                properties: {
                  selector: {
                    $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/selector',
                    type: 'object',
                    title: 'The selector schema',
                    description: '',
                    required: ['ruleName'],
                    properties: {
                      ruleName: {
                        $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/selector/properties/ruleName',
                        type: 'string',
                        title: 'The ruleName schema',
                        description: ''
                      }
                    },
                    additionalProperties: true
                  },
                  wait: {
                    $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/wait',
                    type: 'integer',
                    title: 'The wait schema',
                    description: ''
                  }
                },
                additionalProperties: true
              }
            ]
          }
        },
        serviceName: {
          $id: '#/properties/spec/properties/serviceName',
          type: 'string',
          title: 'The serviceName schema',
          description: ''
        }
      },
      // oneOf: [
      //   {
      //     required: ['ingress']
      //   },
      //   {
      //     required: ['serviceName']
      //   }
      // ],
      additionalProperties: true
    },
    status: {
      $id: '#/properties/status',
      type: 'object',
      title: 'The status schema',
      required: [],
      additionalProperties: true
    }
  },
  additionalProperties: true
})

const getK8sIngressTemplate = ({
  name,
  idleTime,
  cloudConnectorId,
  hideProgressPage,
  deps,
  namespace = 'default'
}: Record<string, any>) => {
  const modifiedName = Utils.getHyphenSpacedString(name)
  return {
    apiVersion: 'ccm.harness.io/v1',
    kind: 'AutoStoppingRule',
    metadata: {
      name: modifiedName,
      namespace,
      annotations: {
        'harness.io/cloud-connector-id': cloudConnectorId
      }
    },
    spec: {
      service: { name: '<replace with your service name>', port: 80 },
      ingress: {
        name: '<replace with ingress name>',
        controllerName: 'nginx'
      },
      idleTimeMins: idleTime,
      hideProgressPage: Boolean(hideProgressPage),
      ...(!_isEmpty(deps) && { dependencies: deps })
    }
  }
}

export { getK8sYamlSchema, getK8sIngressTemplate }
