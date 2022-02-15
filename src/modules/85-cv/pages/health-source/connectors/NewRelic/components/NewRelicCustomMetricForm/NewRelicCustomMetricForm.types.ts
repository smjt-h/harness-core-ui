import type { CustomMappedMetric } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { InitNewRelicCustomFormInterface } from '../../NewRelicHealthSource.types'

export interface NewRelicCustomFormInterface {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  formikValues: InitNewRelicCustomFormInterface
  formikSetField: (key: string, value: any) => void
  connectorIdentifier: string
}
