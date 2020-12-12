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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.nav{
  background-color: #373D62;
  height: 7vh;
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

button{
  display: inline-block;
  padding:0.2em 1.45em;
  margin:0.1em;
  border:0.15em solid #CCCCCC;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Segoe UI','Roboto',sans-serif;
  font-weight:400;
  color:#000000;
  background-color:#CCCCCC;
  text-align:center;
  position:relative;
}

button:hover{
border-color:#7a7a7a;
}
button:active{
background-color:#999999;
}

@media all and (max-width:30em){
  button{
    display:block;
    margin:0.2em auto;
 }
}
#mapControls {
  height: 93vh;
  overflow: auto;
  text-align: left;
  flex-basis: 30%;
}
#main {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-basis: 70%;
}
.mapControl {
  margin: 0.3em;
  max-width: 95%;
  /* margin-bottom: 1em; */
  border: lightgrey solid 1px;
  padding: 0.4em;
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
#map {
  width: 100%;
  height: 93vh;
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