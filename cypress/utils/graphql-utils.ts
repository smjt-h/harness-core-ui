export const hasOperationName: (req: any, operationName: string) => boolean = (req, operationName) => {
  const { body } = req
  // eslint-disable-next-line no-prototype-builtins
  return body.hasOwnProperty('operationName') && body.operationName === operationName
}

export const aliasQuery: (req: any, operationName: string) => void = (req, operationName) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}Query`
  }
}
