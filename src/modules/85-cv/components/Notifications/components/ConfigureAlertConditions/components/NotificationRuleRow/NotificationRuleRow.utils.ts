import type { SelectOption } from '@harness/uicore'
import { defaultOption } from '../../ConfigureAlertConditions.constants'

export const getValueFromEvent = (e: React.FormEvent<HTMLElement>): number | SelectOption => {
  return (e?.target as any)?.value || defaultOption
}
