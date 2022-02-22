import { useMemo } from 'react'
import { noop } from 'lodash-es'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useStrings } from 'framework/strings'
import { useHarnessEnvironmentModal } from '@common/modals/HarnessEnvironmentModal/HarnessEnvironmentModal'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { ADD_NEW_VALUE } from '@cv/constants'

export interface MultiselectEnv {
  options: SelectOption[]
  onNewCreated(value: EnvironmentResponseDTO): void
}
export interface MultiSelectReturn {
  environmentOptions: SelectOption[]
  openHarnessEnvironmentModal: () => void
}

export const useEnvironmentSelectOrCreate = ({ options, onNewCreated }: MultiselectEnv): MultiSelectReturn => {
  const { getString } = useStrings()
  const environmentOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...options
    ],
    [options]
  )

  const onSubmit = async (values: any): Promise<void> => {
    onNewCreated(values)
  }

  const { openHarnessEnvironmentModal } = useHarnessEnvironmentModal({
    data: {
      name: '',
      description: '',
      identifier: '',
      tags: {}
    },
    isEnvironment: true,
    isEdit: false,
    onClose: noop,
    modalTitle: getString('newEnvironment'),
    onCreateOrUpdate: onSubmit
  })
  return { environmentOptions, openHarnessEnvironmentModal }
}
