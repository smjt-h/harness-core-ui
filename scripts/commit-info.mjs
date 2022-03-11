import 'zx/globals'
;(async () => {
  const COMMIT_INFO_BRANCH = (await quiet($`git rev-parse --abbrev-ref HEAD`)).stdout.trim()
  const COMMIT_INFO_SHA = (await quiet($`git show -s --pretty=%H`)).stdout.trim()
  const COMMIT_INFO_REMOTE = (await quiet($`git config --get remote.origin.url`)).stdout.trim()
  const COMMIT_INFO_MESSAGE = (await quiet($`git show -s --pretty=%B`)).stdout.trim()
  const COMMIT_INFO_AUTHOR = (await quiet($`git show -s --pretty=%an`)).stdout.trim()
  const COMMIT_INFO_EMAIL = (await quiet($`git show -s --pretty=%ae`)).stdout.trim()
  console.log(
    JSON.stringify(
      {
        COMMIT_INFO_AUTHOR,
        COMMIT_INFO_BRANCH,
        COMMIT_INFO_EMAIL,
        COMMIT_INFO_MESSAGE,
        COMMIT_INFO_REMOTE,
        COMMIT_INFO_SHA
      },
      null,
      2
    )
  )
})()
