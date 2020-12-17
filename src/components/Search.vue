<template>
  <div class="search">
    <div id="loader" v-if="!cswLoaded">
      <div class="loader"></div>
      <p>Loading records from {{ cswBaseUrlHost }}</p>
    </div>
    <div v-if="cswLoaded">
      <input
        type="text"
        v-model="query"
        v-on:change="search"
        :placeholder="
          'search in ' + records.length + ' services from ' + serviceOwner
        "
      />
      <p id="resultSummrary">
        {{ displayItems.length }} results in {{ cswBaseUrlHost }}
      </p>
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

export default {
  name: "Search",
  components: {
    ListItem,
  },
  data: () => ({
    query: "",
    serviceTypes: "",
  }),
  props: {},
  computed: {
    ...mapFields({
      records: "records",
      displayItems: "displayItems",
      cswLoaded: "cswLoaded",
      fuse: "fuse",
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    cswBaseUrlHost() {
      return new URL(this.cswBaseUrl).hostname;
    },
  },
  methods: {
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
    search() {
      if (this.query === "") {
        this.displayItems = this.records;
        return;
      }
      const searchResult = this.fuse.search(this.query, {});
      this.displayItems = searchResult
        .map(({ item }) => item)
        .sort(this.compare);
    },
  },

  mounted() {
    if (!this.cswLoaded) {
      let cswBaseUrlQueryParam = this.$route.query.cswBaseUrl;
      if (cswBaseUrlQueryParam) {
        this.cswBaseUrl = cswBaseUrlQueryParam;
      }

      let queries = [];
      const serviceTypes = ["OGC:WMS", "OGC:WFS", "INSPIRE Atom", "OGC:WMTS"];
      this.serviceTypes = serviceTypes.join(", ");
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
        this.records = result;
        this.displayItems = result;
        const options = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          minMatchCharLength: 3,
          ignoreLocation: true,
          keys: ["title", "abstract", "keywords"],
        };
        this.fuse = new Fuse(this.records, options);
        this.cswLoaded = true;
      });
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
.search {
  height: 93vh;
  overflow-y: auto;
  margin-left: 3em;
}
#resultSummrary {
  font-style: italic;
}

.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #373d62; /* Blue */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
#loader {
  margin: 2em;
}
</style>
