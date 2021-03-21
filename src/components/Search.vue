<template>
  <div class="main">
    <a class="gh-banner" href="https://github.com/arbakker/ruysch"
      ><img
        loading="lazy"
        width="149"
        height="149"
        src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149"
        class="attachment-full size-full"
        alt="Fork me on GitHub"
        data-recalc-dims="1"
    /></a>
    <div id="header">
      <loader-control
        v-if="!cswLoaded"
        :message="'Loading records from ' + cswBaseUrlHost"
      ></loader-control>
      <div v-if="cswLoaded">
        <input
          type="text"
          v-model="query"
          @keydown="search"
          :placeholder="
            'search in ' + records.length + ' services from ' + serviceOwner
          "
        />
        <p>
          <span
            v-bind:class="{ selected: filter.ATOM }"
            v-on:click="serviceTypeClicked('ATOM')"
            class="serviceTypeSelector"
          >
            ATOM
          </span>
          <span
            v-bind:class="{ selected: filter.WFS }"
            v-on:click="serviceTypeClicked('WFS')"
            class="serviceTypeSelector"
          >
            WFS
          </span>
          <span
            v-bind:class="{ selected: filter.WMS }"
            v-on:click="serviceTypeClicked('WMS')"
            class="serviceTypeSelector"
          >
            WMS
          </span>
          <span
            v-bind:class="{ selected: filter.WMTS }"
            v-on:click="serviceTypeClicked('WMTS')"
            class="serviceTypeSelector"
          >
            WMTS
          </span>
        </p>

        <p id="resultSummrary">
          {{ displayItems.length }} results in {{ cswBaseUrlHost }}
        </p>
      </div>
      <div id="results">
        <ul>
          <template v-for="item in displayItems">
            <list-item :item="item" :key="item.id"></list-item>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import ListItem from "./ListItem.vue";
import Fuse from "fuse.js";
import { mapFields } from "vuex-map-fields";
import csw from "../lib/csw";
import pdokServices from "../assets/cached-services.json";
import LoaderControl from "./LoaderControl.vue";
import { serviceTypes, cachedConfig } from "../config.js";

export default {
  name: "Search",
  components: {
    ListItem,
    LoaderControl,
  },
  watch: {
    filter: {
      handler() {
        this.search();
      },
      deep: true,
    },
  },
  data: () => ({
    serviceTypes: "",
  }),
  props: {},
  computed: {
    ...mapFields({
      records: "records",
      displayItems: "displayItems",
      cswLoaded: "cswLoaded",
      fuse: "fuse",
      query: "query",
      filter: "filter",
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    cswBaseUrlHost() {
      return new URL(this.cswBaseUrl).hostname;
    },
  },
  methods: {
    serviceTypeClicked(svcType) {
      let keys = Object.keys(this.filter);
      if (keys.every((item) => this.filter[item])) {
        keys.forEach((item) => (this.filter[item] = false));
        this.filter[svcType] = true;
      } else if (
        keys.filter((item) => this.filter[item]).length === 1 &&
        this.filter[svcType]
      )
        keys.forEach((item) => (this.filter[item] = true));
      else {
        this.filter[svcType] = !this.filter[svcType];
      }
    },
    search() {
      let searchRecords = this.searchFilter();
      this.displayItems = this.serviceTypeFilter(this.filter, searchRecords);
    },
    serviceTypeFilter(val, records) {
      return records.filter(function (service) {
        if (
          (service.serviceType === "OGC:WMS" && val.WMS) ||
          (service.serviceType === "OGC:WFS" && val.WFS) ||
          (service.serviceType === "OGC:WMTS" && val.WMTS) ||
          (service.serviceType === "INSPIRE Atom" && val.ATOM)
        ) {
          return service;
        }
      });
    },
    compare(a, b) {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    },
    getCQLQuery(serviceOwner, protocol) {
      return `type=%27service%27%20AND%20organisationName=%27${serviceOwner.replace(
        " ",
        "%20"
      )}%27%20AND%20protocol=%27${protocol.replace(" ", "%20")}%27`;
    },
    searchFilter() {
      if (this.query === "") {
        return this.records;
      }
      const searchResult = this.fuse.search(this.query, {});
      return searchResult.map(({ item }) => item).sort(this.compare);
    },
    init(result) {
      // filter out duplicate records, ngr returns duplicated records occasionally
      result = result.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );
      this.records = result;
      this.displayItems = result;
      const options = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        minMatchCharLength: 3,
        ignoreLocation: true,
        keys: ["title", "abstract", "keywords", "id"],
      };
      this.fuse = new Fuse(this.records, options);
      this.cswLoaded = true;
      this.search();
    },
  },

  mounted() {
    if (!this.cswLoaded) {
      let cswBaseUrlQueryParam = this.$route.query.cswBaseUrl;
      if (cswBaseUrlQueryParam) {
        this.cswBaseUrl = cswBaseUrlQueryParam;
      }

      let queries = [];
      this.serviceTypes = serviceTypes.join(", ");

      if (
        cachedConfig.url === this.cswBaseUrl &&
        cachedConfig.owner === this.serviceOwner
      ) {
        this.init(pdokServices);
      } else {
        for (let i = 0; i < serviceTypes.length; i++) {
          queries.push(this.getCQLQuery(this.serviceOwner, serviceTypes[i]));
        }
        let promises = [];
        queries.forEach((query) => {
          promises.push(csw.getCSWRecords(this.cswBaseUrl, query));
        });

        Promise.all(promises).then((values) => {
          let newValues = [];
          for (let i = 0; i < values.length; i++) {
            newValues.push(
              values[i].map((obj) => ({ ...obj, serviceType: serviceTypes[i] }))
            );
          }

          let result = [].concat.apply([], newValues);
          result.sort(this.compare);
          this.init(result);
        });
      }
    }
  },
};
</script>

<style scoped>
input {
  width: 20em;
  border: #ddd solid 1px;
  line-height: 1.5;
  margin-top: 1em;
  padding: 0.4em;
}
ul {
  padding: unset;
}

#resultSummrary {
  font-style: italic;
}

.serviceTypeSelector {
  margin-left: 0.4em;
  border-radius: 34px;
  background-color: #fff;
  padding: 0.3em 0.6em 0.3em 0.6em;
  color: #7b7b7b;
  border: 1px solid #a0a0a0;
  cursor: default;
}

.serviceTypeSelector.selected {
  background-color: var(--secondary-color);
  color: #fff;
  border: 1px solid var(--secondary-color);
}

.serviceTypeSelector:hover {
  font-weight: 600;
}

#results {
  margin: 1em;
}
#header {
  margin: 1em;
}

.gh-banner {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
