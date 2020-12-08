// store/index.js

import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        records: [],
        displayItems: [],
        cswLoaded: false,
        fuse: {}
    },
    getters: {
        getField,
    },
    mutations: {
        updateField,
    },
    actions: {}
});