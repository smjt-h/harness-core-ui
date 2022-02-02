/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import axios from 'axios';
import adapter from "axios/lib/adapters/http";

axios.defaults.adapter = adapter;

export class API {

    constructor(url) {
        this.url = url
    }

    // withPath(path) {
    //     if (!path.startsWith("/")) {
    //         path = "/" + path
    //     }
    //     return `${this.url}${path}`
    // }


    async getVersion() {
        return axios.get(this.url+"/api/version", {
        })
            .then(r => r.data);
    }

    async getInvalidProperty() {
        return axios.get(this.url+"/invalid", {
        })
            .then(r => r.data);
    }
}

export default new API(process.env.REACT_APP_API_BASE_URL);
