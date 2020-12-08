<template>
  <div>
    <h2 v-if="!cswLoaded">Loading...</h2>
    <div v-if="cswLoaded">
      <input
        type="text"
        v-model="query"
        v-on:change="search"
        placeholder="zoek naar PDOK services"
      />
      <div>
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
import getCSWRecordsWithUrl from "../lib/csw";

export default {
  name: "Search",
  components: {
    ListItem,
  },
  data: () => ({
    query: "",
  }),
  props: {
  },
  computed: {
    ...mapFields({
      records: "records",
      displayItems: "displayItems",
      cswLoaded: "cswLoaded",
      fuse: "fuse",
    }),
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
    search() {
      const searchResult = this.fuse.search(this.query, {});
      console.log(searchResult);

      if (searchResult.length === 0) {
        this.displayItems = this.records;
      } else {
        console.log(searchResult.map(({ item }) => item));
        this.displayItems = searchResult
          .map(({ item }) => item)
          .sort(this.compare);
      }
    },
  },

  mounted() {
    if (!this.cswLoaded) {
      let cqlQuery =
        "type=%27service%27%20AND%20organisationName=%27Beheer%20PDOK%27%20AND%20protocol=%27OGC:WMS%27";
      let cswEndpoint =
        "https://ngr.acceptatie.nationaalgeoregister.nl/geonetwork/srv/dut/csw";
      let recordsPromise = getCSWRecordsWithUrl(cswEndpoint, cqlQuery, 50);
      recordsPromise.then((result) => {
        result.sort(this.compare);
        console.log(result);
        this.records = result;
        this.displayItems = result;
        const options = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          minMatchCharLength: 3,
          ignoreLocation: true,
          keys: ["title"],
        };
        this.fuse =  new Fuse(this.records, options);
        this.cswLoaded = true;
      });
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  width: 50%;
  text-align: center;
  border: #ddd solid 1px;
  line-height: 1.5;
}
</style>
