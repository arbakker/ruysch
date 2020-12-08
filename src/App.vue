<template>
  <div id="app">
    <div class="nav">
      
      <router-link to="/home"><img class="nav-image" alt="PDOK logo" src="./assets/pdok-logo.png" /></router-link>
      <router-link to="/bar">Go to Bar</router-link>  
  </div>

    <router-view></router-view>
  
    <!-- <Search class="search" v-bind:searchItems="items" v-if="isLoaded" /> -->
    
  </div>
</template>

<script>
// import Search from "./components/Search.vue";



export default {
  name: "App",
  components: {
  },
  data: () => ({
    items: {},
    isLoaded: false,
  }),
  mounted() {
    // let cqlQuery =
    //   "type=%27service%27%20AND%20organisationName=%27Beheer%20PDOK%27%20AND%20protocol=%27OGC:WMS%27";
    // let cswEndpoint =
    //   "https://ngr.acceptatie.nationaalgeoregister.nl/geonetwork/srv/dut/csw";
    // let recordsPromise = getCSWRecordsWithUrl(cswEndpoint, cqlQuery, 50);
    // recordsPromise.then((result) => {
    //   result.sort(this.compare)
    //   console.log(result)
    //   this.items = result;
    //   this.isLoaded = true;
    // });
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
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.nav{
  background-color: #373D62;
}
body{
padding: 0px;
margin: 0px;
}
.nav-image{
  margin:1em;
  height: 30px;
}

.nav a{
  color:white;
  margin: 0.2em;
}

</style>
