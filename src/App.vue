<template>
  <div id="app">
    <div class="nav">
      <router-link to="/home"
        ><img class="nav-image" alt="PDOK logo" src="./assets/pdok-logo.png"
      /></router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";

export default {
  name: "App",
  components: {},
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
    }),
  },
  mounted() {},
};
</script>

<style>

:root {
    --nav-height: 3em;
    --sidebar-width: 35%;
  }

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.nav{
  height: var(--nav-height);
  background-color:  #1a1e4f;
  position: relative;
  vertical-align:center;
}

#container{
  height: calc(100vh - var(--nav-height));
}
.main {
  height: calc(100vh - var(--nav-height));
  overflow-y: auto;
}

#comp-root{
  height:100%;
}
#map{
  flex: calc(100% - var(--sidebar-width));
  height: calc(100vh - var(--nav-height));
}
#sidebar {
  flex: var(--sidebar-width);
  flex-grow: 0;     
  flex-shrink: 0; 
  padding: 1em;
  box-sizing: border-box; 
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box;    
  overflow-y: auto;
  height: calc(100vh - var(--nav-height));
}
body{
padding: 0px;
margin: 0px;
}
.nav-image{
  margin:1em;
  height: 20px;
  width: 52px;
}

.nav a{
  color:white;
  margin: 0.2em;
}

button:not([disabled]){
  border:0.15em solid #CCCCCC;
  color:#000000;
  background-color:#CCCCCC;
}

button{
  display: inline-block;
  padding:0.2em 1.45em;
  margin:0.1em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Segoe UI','Roboto',sans-serif;
  font-weight:400;
  text-align:center;
  position:relative;
}



button:active:hover:not([disabled]){
border-color:#7a7a7a;
}
button:active:not([disabled]){
background-color:#999999;
}

@media all and (max-width:30em){
  button{
    display:block;
    margin:0.2em auto;
 }
}

#container {
  height:100%;
  display: flex;
  flex: 1;
  flex-grow: initial;
  flex-shrink: initial;
}

#main {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-basis: 70%;
}
.mapControl {
  /* margin-bottom: 1em; */
  border-bottom: lightgrey solid 1px;
  margin-bottom: 1em;
}
.mapControl div {
  margin-bottom: 0.5em;
}
.mapControl select {
  width: 95%;
}

label {
  margin-right: 0.5em;
}
h3{
  margin:unset;
  margin-bottom: 0.5em;}

  dt {
  font-weight: bold;
  font-style: italic;
}
dd {
  margin: 0;
  margin-left: 0.2em;
  padding: 0 0 0.5em 0;
}
dl{
    margin:unset;
}
 .styled-table  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  .styled-table  {
    table-layout: auto;
    border-collapse: separate;
    white-space: nowrap;
    margin: 1em;
    border-spacing: 0.2em;
  }
  .styled-table td{
    padding: 0.3em;
  }
  .styled-table tr td:nth-child(1){
    font-weight: 600;
  }
</style>