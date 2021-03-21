<template>
  <div id="app" :style="cssVars">
    <div class="nav">
      <router-link to="/home"
        ><img class="nav-image" alt="PDOK logo" :src="logo"
      /></router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";
import config from "./config";

export default {
  name: "App",
  components: {},
  data: function () {
    return {
      logo: `${config.logo}`,
    };
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
    }),
    cssVars() {
      return {
        "--primary-color": config.primaryColor,
        "--secondary-color": config.secondaryColor,
        "--secondary-color-r": config.secondaryColorR,
        "--secondary-color-g": config.secondaryColorG,
        "--secondary-color-b": config.secondaryColorB,
      };
    },
  },
  methods: {
    
  },
  mounted() {
  },
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
.nav {
  height: var(--nav-height);
  background-color: var(--primary-color);
  position: relative;
  vertical-align: center;
}

#container {
  height: calc(100vh - var(--nav-height));
}
.main {
  height: calc(100vh - var(--nav-height));
  overflow-y: auto;
}

#comp-root {
  height: 100%;
}
#map {
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
body {
  padding: 0px;
  margin: 0px;
}
.nav-image {
  margin: 1em;
  height: 20px;
}

.nav a {
  color: white;
  margin: 0.2em;
}

.btn,
button {
  border: 0.15em solid #cccccc;
  color: #000000;
  background-color: #cccccc;
}
button,
.btn {
  display: inline-block;
  padding: 0.2em 1.45em;
  box-sizing: border-box;
  text-decoration: none;
  font-family: "Segoe UI", "Roboto", sans-serif;
  font-weight: 400;
  text-align: center;
  position: relative;
  margin-left: 0.1em;
  margin-right: 0.1em;
  margin-top: 0;
  margin-bottom: 0;
  cursor: pointer;
}

.btn.primary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  color: white;
}
.btn:hover:not([disabled]),
button:hover:not([disabled]) {
  filter: brightness(85%);
}

button:active:hover:not([disabled]) {
  border-color: #7a7a7a;
}
button:active:not([disabled]) {
  background-color: #999999;
}
.btn[disabled="disabled"],
button[disabled="disabled"] {
  color: dimgray;
  cursor: default;
}

@media all and (max-width: 30em) {
  button {
    display: block;
    margin: 0.2em auto;
  }
} 

#container {
  height: 100%;
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
  padding-bottom: 0.1em;
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
h3 {
  margin: unset;
  margin-bottom: 0.5em;
}

dt {
  font-weight: bold;
  font-style: italic;
}
dd {
  margin: 0;
  margin-left: 0.2em;
  padding: 0 0 0.5em 0;
}
dl {
  margin: unset;
}
.styled-table tr:nth-child(even) {
  background-color: #f2f2f2;
}
.styled-table {
  table-layout: auto;
  border-collapse: separate;
  white-space: nowrap;
  margin: 1em;
  border-spacing: 0.2em;
}
.styled-table td {
  padding: 0.3em;
}
.styled-table tr td:nth-child(1) {
  font-weight: 600;
}
.row {
  display: flex;
  flex-direction: row;
}
footer{
  height:10em;
  background-color:#2c3e50;
  widows: 100%;
}
.ol-control button { background-color: rgba(var(--secondary-color-r), var(--secondary-color-g), var(--secondary-color-b), 0.5) !important; }

</style>