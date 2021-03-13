<template>
  <div class="content" v-if="feedData.feed">
    <div class="entrywrapper" v-show="!xmlVisible">
      <div class="entry feedTitleContainer">
        <h1 class="feedTitleText" v-if="isParent">
          Service Feed - {{ feedData.feed.title._text }}
        </h1>
        <h1 class="feedTitleText" v-if="!isParent">
          Data Feed - {{ feedData.feed.title._text }}
        </h1>
        <p id="feedSubtitleText" class="subtitle">
          {{ feedData.feed.subtitle._text }}
        </p>
        <table class="mainTable">
          <tr v-if="!isParent && showParent">
            <td>Main page</td>
            <td>
              <router-link
                tag="a"
                :to="{
                  name: 'INSPIRE Atom',
                  params: { serviceId: serviceId },
                }"
                >Parent</router-link
              >
            </td>
          </tr>
          <tr v-if="isParent && feedData.feed.author">
            <td>Service Provider</td>
            <td>
              <a :href="'mailto:' + feedData.feed.author.email._text">
                {{ feedData.feed.author.name._text }}
              </a>
            </td>
          </tr>

          <tr v-if="!isParent">
            <td>Rights</td>
            <td>
              {{ feedData.feed.rights._text }}
            </td>
          </tr>
          <tr v-if="feedData.feed.updated">
            <td>Updated</td>
            <td>
              {{ feedData.feed.updated._text.split("T")[0] }}
            </td>
          </tr>
          <tr>
            <td v-if="isParent">Service Metadata</td>
            <td v-if="!isParent">Dataset Metadata</td>
            <td>
              <a :href="feedMetadataUrl">XML</a>
            </td>
          </tr>
          <tr>
            <td>ATOM Feed URL</td>
            <td>
              <a :href="feedData.feed.id._text" title="ATOM Feed URL">URL</a>
            </td>
          </tr>
          <tr>
            <td>ATOM Feed XML</td>
            <td>
              <button @click="xmlVisible = !xmlVisible">Show</button>
            </td>
          </tr>
        </table>
      </div>
      <div id="feedContent" v-if="showDataFeed">
        <div
          class="entry"
          v-for="entry in feedData.feed.entry"
          :key="entry.id._text"
        >
          <div class="entrywrapper">
            <h3 class="feedEntryTitle" v-if="!hasDownloads">
              <router-link
                tag="a"
                :to="{
                  name: 'INSPIRE Atom',
                  params: {
                    serviceId: serviceId,
                    dataFeedId: entry.id._text,
                  },
                }"
                >Data Feed - {{ entry.title._text }}</router-link
              >
            </h3>
            <h3 class="feedEntryTitle" v-else>
              Download - {{ entry.title._text }}
            </h3>
            <p v-if="!isParent && entry.content">
              {{ entry.content._text }}
            </p>
            <table>
              <tr v-if="entry.updated">
                <td>Updated</td>
                <td>
                  {{ entry.updated._text.split("T")[0] }}
                </td>
              </tr>
              <tr v-if="entry.category">
                <td>Projection</td>
                <td>
                  <a :href="entry.category._attributes.term">
                    {{ entry.category._attributes.label }}
                  </a>
                </td>
              </tr>
            </table>
            <p v-if="hasDownloads">
              <download-link :entry="entry"></download-link>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="codeWrapper entry" v-if="xmlVisible">
      <a @click="xmlVisible = !xmlVisible">
        <font-awesome-icon icon="times" />
      </a>
      <prism language="markup">{{ feedXml }}</prism>
    </div>
  </div>
</template>
<script>
import "prismjs";
import "prismjs/themes/prism.css";
import Prism from "vue-prism-component";
import { mapFields } from "vuex-map-fields";
import { JSONPath } from "jsonpath-plus";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTimes,
  faClipboard,
  faFileCode,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import DownloadLink from "./DownloadLink.vue";
library.add([faTimes, faClipboard, faFileCode, faDownload]);

export default {
  name: "AtomFeed",
  components: {
    Prism,
    DownloadLink,
    FontAwesomeIcon,
  },
  props: {
    feedData: { required: true, type: Object },
    feedXml: { required: true, type: String },
    showDataFeed: { required: true, type: Boolean },
    showParent: { required: true, type: Boolean },
    isParent: { required: true, type: Boolean },
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    serviceId: function () {
      return this.$route.params.serviceId;
    },
    parentUrl: function () {
      const feedData = this.feedData;
      let jsonPath = "$.feed.link[?(@._attributes.rel === 'up')]";
      return JSONPath({ path: jsonPath, json: feedData })[0].text;
    },
    feedHasMetadata: function () {
      const feedData = this.feedData;
      // <xsl:if test="atom:feed/atom:link[@rel='describedby']/@href">
      let jsonPath =
        "$.feed.entry[?(@.link._attributes.rel === 'describedby')]";
      return JSONPath({ path: jsonPath, json: feedData }).lenght === 1;
    },
    hasDownloads: function () {
      let jsonPath =
        "$.feed.entry[*].link[?(@._attributes.rel == 'alternate' && @._attributes?.type !== 'application/atom+xml' )]";

      const feedData = this.feedData;
      let result = JSONPath({ path: jsonPath, json: feedData }).length > 0;
      return result;
    },
    feedMetadataUrl: function () {
      const feedData = this.feedData;
      let jsonPath =
        "$.feed.link[?(@._attributes.rel === 'describedby')]._attributes.href";
      let result = JSONPath({ path: jsonPath, json: feedData });
      return result.length >= 1 ? result[0] : "";
    },
  },
  data: () => ({
    capVis: false,
    capXml: "",
    xslt: "",
    dataFeedId: "",
    atomLoaded: false,
    record: {},
    serviceObject: {},
    dataFeedObjects: [],
    feedHtml: "",
    isVisible: {},
    xmlVisible: false,
  }),
  created() {},
  mounted() {},

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
  },
};
</script>
<style scoped>
.codeWrapper > a {
  position: relative;
  top: 1em;
  right: 1em;
}

.entry {
  position: relative;
  /* border: 1px solid #eee; */
  /* border-radius: 4px; */
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); */
  /* margin: 2em 0;
  margin-right: 0px;
  margin-bottom: 1em;
  margin-left: 0px; */
  margin-top: 1em;
  padding-bottom: 1em;
  
  clear: both;
  border-bottom: lightgrey solid 1px;
}
.feedTitleText{
  margin:unset;
}
</style>