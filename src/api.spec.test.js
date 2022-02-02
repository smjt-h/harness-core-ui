/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import path from "path";
import { Pact } from '@pact-foundation/pact';
import { API } from './api';
// import { Matchers } from '@pact-foundation/pact';
// // import { Product } from './product';
// const { eachLike, like, regex } = Matchers;

const mockProvider = new Pact({
    consumer: 'UI-js',
    provider: process.env.PACT_PROVIDER ? process.env.PACT_PROVIDER : 'CG-Manager',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: "debug",
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    port: 1234,
    host: "localhost",
});

describe('API Pact test', () => {
    beforeAll(() => mockProvider.setup());
    afterEach(() => mockProvider.verify());
    afterAll(() => mockProvider.finalize());


    describe('PACT Test Consumer as UI', () => {
        test('Hitting api/version', async () => {

            await mockProvider.addInteraction({
                state: 'hitting /api/version',
                uponReceiving: 'a request to get a product',
                withRequest: {
                    method: 'GET',
                    path: '/api/version',
                },
                willRespondWith: {
                    status: 200,
                    headers: {"Content-Type": "application/json"},
                    body: "{\"metaData\":{},\"resource\":{\"versionInfo\":{\"version\":\"${build.fullVersion}\",\"buildNo\":\"${build.number}\",\"gitCommit\":\"${gitCommitId}\",\"gitBranch\":\"${gitBranch}\",\"timestamp\":\"${buildTimeStamp}\",\"patch\":\"${build.patch}\"},\"runtimeInfo\":{\"primary\":true,\"primaryVersion\":\"*\",\"deployMode\":\"SAAS\"}},\"responseMessages\":[]}",
                },
            });

            // Act
            const api = new API(mockProvider.mockService.baseUrl);
            const product = await api.getVersion();

            // Assert - did we get the expected response
            expect(product).toStrictEqual({"metaData":{},"resource":{"runtimeInfo":{"deployMode":"SAAS","primary":true,"primaryVersion":"*"},"versionInfo":{"buildNo":"${build.number}","gitBranch":"${gitBranch}","gitCommit":"${gitCommitId}","patch":"${build.patch}","timestamp":"${buildTimeStamp}","version":"${build.fullVersion}"}},"responseMessages":[]});
        });

        test('Hitting invalid url', async () => {

            // set up Pact interactions
            await mockProvider.addInteraction({
                state: 'invalid url',
                uponReceiving: 'a request to get a product',
                withRequest: {
                    method: 'GET',
                    path: '/invalid',
                },
                willRespondWith: {
                    status: 404
                },
            });

            const api = new API(mockProvider.mockService.baseUrl);

            await expect(api.getInvalidProperty()).rejects.toThrow('Request failed with status code 404');
        });
    });
});
