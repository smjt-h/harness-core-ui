import React from 'react'

export const RunPipelineFormCacheContext = React.createContext({})

export function RunPipelineFormCacheContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  return <RunPipelineFormCacheContext.Provider value={{}}>{props.children}</RunPipelineFormCacheContext.Provider>
}
