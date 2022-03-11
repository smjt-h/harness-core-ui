# Cypress tests for harness-core-ui

## Running tests locally

## Running tests on CI

**How parallel runs are configured on CI?**

1. A base (docker) image is created using `cypress-base.Dockerfile` as config. Lets call this `BaseImage`. This image has all the packages/tools required to run cypress on CI. This is done only when there is a change in config.
2. Given a commit, a second image is created using the `BaseImage` as a staring point and `cypress.Dockerfile` as config. Lets call this as `TestImage`. The image is tagged using the "Build Id" of the CI pipeline. This image has all the (cypress) tests, compiled code for `harness-core-ui` and mock API server. All of this is linked together via a nginx server.
3. The `TestImage` is used as a ["Service depenedency"](https://ngdocs.harness.io/article/rch2t8j1ay-ci-enterprise-concepts#service_dependencies) and also to run the test cases in parallel.
4. Once the run is complete, `TestImage` is deleted.

The following diagram gives an illustartion of how Cypress is configured:

![parallel-cypress](./_images/parallel-cypress.jpg)
