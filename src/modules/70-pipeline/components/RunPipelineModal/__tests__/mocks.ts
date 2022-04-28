export const getMockFor_useGetPipeline = (): any => ({
  data: {
    data: {
      resolvedTemplatesPipelineYaml: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
      name: Stage1
      identifier: Stage1
      description: ""
      type: Approval
      spec:
        execution:
          steps:
            - step:
                name: Approval
                identifier: approval
                type: HarnessApproval
                timeout: 1d
                spec:
                  includePipelineExecutionHistory: true
                  approvers:
                    disallowPipelineExecutor: false
                    minimumCount: 2
                    userGroups:
                      - Chirag
                  approverInputs: []
                  approvalMessage: ABC
      tags: {}
      variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>`,
      yamlPipeline: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
        name: Stage1
        identifier: Stage1
        description: ""
        type: Approval
        spec:
          execution:
            steps:
              - step:
                  name: Approval
                  identifier: approval
                  type: HarnessApproval
                  timeout: 1d
                  spec:
                    includePipelineExecutionHistory: true
                    approvers:
                      disallowPipelineExecutor: false
                      minimumCount: 2
                      userGroups:
                        - Chirag
                    approverInputs: []
                    approvalMessage: ABC
        tags: {}
        variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>`
    }
  }
})

export const getMockFor_useGetInputSetsListForPipeline = (): any => ({
  refetch: jest.fn(),
  data: {
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId',
          inputSetErrorDetails: {
            uuidToErrorResponseMap: {
              a: {
                errors: [{ fieldName: 'a', message: 'a field invalid' }]
              }
            }
          }
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset3',
          inputSetType: 'INPUT_SET',
          name: 'is3',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ov1',
          pipelineIdentifier: 'PipelineId',
          overlaySetErrorDetails: {
            b: 'overlay field invalid'
          }
        }
      ]
    }
  }
})

export const getMockFor_Generic_useMutate = (mutateMock?: jest.Mock): any => ({
  loading: false,
  refetch: jest.fn(),
  mutate:
    mutateMock ||
    jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
})

export const getMockFor_useGetTemplateFromPipeline = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      hasInputSets: true,
      inputSetTemplateYaml: `pipeline:
  identifier: "First"
  variables:
    - name: "checkVariable1"
      type: "String"
      value: "<+input>"`
    }
  })
})

export const getMockFor_useGetMergeInputSetFromPipelineTemplateWithListInput = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      pipelineYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "valuefrominputsetsmerge"\n'
    }
  })
})
