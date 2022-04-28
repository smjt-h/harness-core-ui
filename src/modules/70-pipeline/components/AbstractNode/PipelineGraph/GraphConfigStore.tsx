import { createContext } from 'react'
interface GraphConfig {
  graphScale: number
  isLoading: boolean
}
const GraphConfigStore = createContext<GraphConfig>({ graphScale: 1, isLoading: false })

export default GraphConfigStore
