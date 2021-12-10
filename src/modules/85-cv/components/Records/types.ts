export interface RecordsProps {
  query?: string
  debounceValue?: number
  fetchRecords: () => void
  isQueryExecuted?: boolean
  data?: any
  loading?: boolean
  error?: any
  queryNotExecutedMessage?: string
  recordsClassName?: string
  fetchEntityName?: string
}

export interface HighchartsOptionAndRecords {
  records: string[]
}
