  <template>
  <div>
    <loader-control v-if="!atomLoaded" :message="'Processing Atom Feed - ' + record.url"></loader-control>
    <atom-feed v-if="atomLoaded"
      :feedData="feedData"
      :feedXml="feedXml"
      :showDataFeed="showDataFeed"
      :showParent="true"
      :isParent="isParent"
    ></atom-feed>
    <atom-feed 
      v-if="loadChildFeed"
      :feedData="childFeedData"
      :feedXml="childFeedXml"
      :showDataFeed="true"
      :showParent="false"
      :isParent="false"
    ></atom-feed>
  </div>
</template>

<script>
import csw from "../lib/csw";
import xml from "../lib/xml";
import "prismjs";
import "prismjs/themes/prism.css";
// import Prism from "vue-prism-component";
import { mapFields } from "vuex-map-fields";
import { JSONPath } from "jsonpath-plus";

import { library } from "@fortawesome/fontawesome-svg-core";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import AtomFeed from "./AtomFeed.vue";
import LoaderControl from "./LoaderControl.vue";


import {
  faTimes,
  faClipboard,
  faFileCode,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
library.add([faTimes, faClipboard, faFileCode, faDownload]);

export default {
  name: "Atom",
  components: {
    AtomFeed,
    LoaderControl
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    isParent: function () {
      return this.$route.params.dataFeedId === undefined;
    },
  },
  data: () => ({
    capVis: false,
    capXml: "",
    xslt: "",
    serviceId: "",
    dataFeedId: "",
    atomLoaded: false,
    record: {},
    serviceObject: {},
    dataFeedObjects: [],
    feedHtml: "",
    feedData: {},
    feedXml: "",
    isVisible: {},
    showDataFeed: true,
    loadChildFeed: false,
    childFeedData: {},
    childFeedXml: "",
  }),
  mounted() {
    this.init();
  },
  watch: {
    $route() {
      this.init();
    },
  },
  methods: {
    addDownloadLink() {
      this.feedData.feed.entry.map((el) => {
        let jsonPath =
          "$.link[?(@._attributes?.rel === 'alternate' && @._attributes?.type !== 'application/atom+xml')]";
        let result = JSONPath({ path: jsonPath, json: el });
        if (result.length === 1) {
          el["downloadLink"] = result[0];
        }
      });
    },
    addFeedLink() {
      this.feedData.feed.entry.map((el) => {
        let jsonPath =
          "$.link[?(@._attributes?.rel == 'alternate' && @._attributes?.type == 'application/atom+xml')]";
        let result = JSONPath({ path: jsonPath, json: el });
        if (result.length === 1) {
          el["dataFeedLink"] = result[0];
        }
      });
    },
    init() {
      this.serviceId = this.$route.params.serviceId;
      let cswEndpoint = this.cswBaseUrl;
      this.dataFeedId = this.$route.params.dataFeedId;

      csw.getCSWRecord(cswEndpoint, this.serviceId).then((result) => {
        this.record = result;
        let url = this.record.url;
        if (this.dataFeedId !== undefined) {
          url = this.dataFeedId;
        }
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            this.feedXml = data;
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(data, "text/xml");
            let json = xml.xmlToJson(xmlDoc);
            let feedData = xml.removeKeys(json, ["_text"]);
            // casting objects to array
            if (!Array.isArray(feedData.feed.entry)) {
              feedData.feed.entry = [feedData.feed.entry];
            }
            feedData.feed.entry.map((x) => {
              if (!Array.isArray(x.link)) {
                x.link = [x.link];
              }
            });
            this.feedData = feedData;
            this.addDownloadLink();
            this.addFeedLink();
            if (
              this.feedData.feed.entry.length === 1 &&
              this.feedData.feed.entry[0].dataFeedLink
            ) {
              let url = this.feedData.feed.entry[0].dataFeedLink._attributes
                .href;
              fetch(url)
                .then((response) => response.text())
                .then((data) => {
                  this.childFeedXml = data;
                  let parser = new DOMParser();
                  let xmlDoc = parser.parseFromString(data, "text/xml");
                  let json = xml.xmlToJson(xmlDoc);
                  let feedData = xml.removeKeys(json, ["_text"]);
                  // casting objects to array
                  if (!Array.isArray(feedData.feed.entry)) {
                    feedData.feed.entry = [feedData.feed.entry];
                  }
                  feedData.feed.entry.map((x) => {
                    if (!Array.isArray(x.link)) {
                      x.link = [x.link];
                    }
                  });
                  this.childFeedData = feedData;
                  this.addDownloadLink();
                  this.showDataFeed = false;
                  this.loadChildFeed = true;
                });
            }
            this.atomLoaded = true;
          });
      });
    },
  },
};
</script>
<style scoped>



#meta {
  width: 100%;
  overflow: auto;
}
#mapControls * {
  margin: 0.2em;
  max-width: 90%;
}
#mapControls {
  flex-basis: 20%;
  height: 100%;
  overflow: auto;
  text-align: left;
}

#capbar {
  height: 4vh;
  text-align: left;
}

#capbar button {
  margin: 0.3em;
}
#capbar button {
  height: 2em;
}
#content {
  margin: 1em;
}

.entry {
  margin-left: 1em;
}

body {
  margin: auto;
}

div {
  text-align: left;
}


.codeWrapper.entry {
  padding: 0px;
}

a.download {
  margin-top: 1em;
  background-color: #373d62;
  color: white;
  padding: 0.5em 1em;
  text-decoration: none;
  text-transform: uppercase;
}
.hide {
  display: none;
}

.content {
  margin-top: 0em;
  margin: auto;
  max-width: 980px;
}

div#app {
  margin-top: 0px !important;
}

.hide-xml {
  text-decoration: none;
}
.codeWrapper > a {
  position: absolute;
  top: 1em;
  right: 1em;
}
.codeWrapper {
  position: relative;
  top: 0;
  left: 0;
}

pre[class*="language-"] {
  font-size: 0.9em;
  margin: 0;
}

code {
  white-space: break-spaces !important;
  /* white-space: pre-wrap !important; */
  word-break: break-word !important;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-top: 0px;
}

table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
table {
  border-collapse: separate;
  border-spacing: 50px 0;
  margin-left: -50px;
}

a:hover {
  color: #38e9ff;
}

a {
  cursor: pointer;
  text-decoration: underline;
  color: black;
}

ul {
  list-style: none;
  padding-left: 1em;
}
h3 > a {
  text-decoration: underline !important;
}
.subtitle {
  font-style: italic;
}

.show-xml.hide-xml {
  position: fixed;
  top: 1em;
  right: 1em;
  z-index: 200;
}


</style>