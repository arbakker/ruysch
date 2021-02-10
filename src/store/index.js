// store/index.js

import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from 'vuex-map-fields';
import { cswBaseUrl } from '../config'
import { serviceOwner } from '../config'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        cswBaseUrl: cswBaseUrl,
        serviceOwner: serviceOwner,
        records: [],
        displayItems: [],
        query: "",
        cswLoaded: false,
        fuse: {},
        filter: {
            WMS: true,
            ATOM: true,
            WFS: true,
            WMTS: true
          }
    },
    getters: {
        getField,
    },
    mutations: {
        updateField,
    },
    actions: {}
});