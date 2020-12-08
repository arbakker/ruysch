<template>
  <div id="app">
    <div class="nav">
      <router-link to="/home"><img class="nav-image" alt="PDOK logo" src="./assets/pdok-logo.png" /></router-link>
  </div>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "App",
  components: {
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
