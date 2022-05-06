import type { SelectOption } from '@harness/uicore'

enum SLOCondition {
  ERROR_BUDGET_REMAINING_PERCENTAGE = 'errorBudgetRemaningPercentage',
  ERROR_BUDGET_REMAINING_minutes = 'errorBudgetRemaningMinutes',
  ERROR_BUDGET_BURN_RATE_IS_ABOVE = 'errorBudgetBurnRateIsAbove'
}

export const sloConditionOptions: SelectOption[] = [
  { label: 'Error Budget remaining percentage', value: SLOCondition.ERROR_BUDGET_REMAINING_PERCENTAGE },
  { label: 'Error Budget remaining minutes ', value: SLOCondition.ERROR_BUDGET_REMAINING_minutes },
  { label: 'Error Budget Burn Rate is above ', value: SLOCondition.ERROR_BUDGET_BURN_RATE_IS_ABOVE }
]
