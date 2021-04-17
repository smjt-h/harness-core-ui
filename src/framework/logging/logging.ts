import type { ModuleName } from 'framework/exports'

declare global {
  interface Window {
    bugsnagClient: any // eslint-disable-line
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
type LogFunction = (message: string, obj?: object) => void

interface Logger {
  error: LogFunction
  info: LogFunction
  warn: LogFunction
  debug: LogFunction
}

const ERROR = 'ERROR'
const WARN = 'WARN'
const INFO = 'INFO'
const DEBUG = 'DEBUG'

function log(type: string, module: ModuleName, subModule?: string) {
  return function (message: string, obj = {}) {
    // Message format: `ModuleName/SubModuleName: Actual Message`, obj
    // This format will make it easier to query logs against a module
    const _message = `${module}${subModule ? `/${subModule}` : ''}: ${message}`

    // Log to Bugsnag if it's available
    window.bugsnagClient?.notify?.(new Error(_message), {
      severity: type === ERROR ? 'error' : type === WARN ? 'warning' : 'info',
      user: obj
    })

    if (type === ERROR) {
      console.error(_message, obj) // eslint-disable-line
    } else if (type === INFO) {
      console.info(_message, obj) // eslint-disable-line
    } else if (type === DEBUG) {
      console.debug(_message, obj) // eslint-disable-line
    } else if (type === WARN) {
      console.warn(_message, obj) // eslint-disable-line
    }
  }
}

export const loggerFor = (module: ModuleName, subModule?: string): Logger => ({
  error: log(ERROR, module, subModule),
  info: log(INFO, module, subModule),
  warn: log(WARN, module, subModule),
  debug: log(DEBUG, module, subModule)
})
