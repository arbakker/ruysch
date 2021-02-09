  <template>
  <div>
    <div id="content" v-html="feedHtml" @click="handleClick"></div>
  </div>
</template>

<script>
// import Prism from "vue-prism-component";
import csw from "../lib/csw";
// import "prismjs";
// import "prismjs/themes/prism.css";
import { mapFields } from "vuex-map-fields";

export default {
  name: "Atom",
  components: {
    // Prism,
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
  },
  data: () => ({
    capVis: false,
    capXml: "",
    xslt: "",
    serviceId: "",
    cswLoaded: false,
    record: {},
    serviceObject: {},
    dataFeedObjects: [],
    feedHtml: "",
  }),
  mounted() {
    this.serviceId = this.$route.params.serviceId;
    let cswEndpoint = this.cswBaseUrl;

    csw.getCSWRecord(cswEndpoint, this.serviceId).then((result) => {
      this.record = result;
      let url = this.record.url;

      let promises = [];
      promises.push(fetch(url));
      promises.push(fetch("./style.xslt"));

      Promise.all(promises).then((values) => {
        Promise.all(
          values.map((result) => {
            return result.text();
          })
        ).then((textResults) => {
          this.capXml = textResults[0];
          this.xslt = textResults[1];
          this.updateHtml()
        });
      });

      this.cswLoaded = true;
    });
  },
  watch: {},
  methods: {
    updateHtml(){
          let parser = new DOMParser();
          let xslDoc = parser.parseFromString(this.xslt, "text/xml");
          let xsltProcessor = new XSLTProcessor();
          xsltProcessor.importStylesheet(xslDoc);
          let xmlDoc = parser.parseFromString(this.capXml, "text/xml");
          let transformedDoc = xsltProcessor.transformToDocument(xmlDoc);
          const serializer = new XMLSerializer();
          this.feedHtml = serializer
            .serializeToString(transformedDoc)
    },
    updateAtomHTLM(url){
       fetch(url)
        .then((response) => {
          return response.text();
        })
        .then((text) => {
          this.capXml = text
          this.updateHtml()
        })
    },
    handleClick(e) {
      if (e.target.matches("a.atom-feed")) {
        e.preventDefault();
        this.updateAtomHTLM(e.target.href);
        return
      }
      if (e.target.matches("a.html-md")) {
        e.preventDefault();
        let url = new URL(e.target.href)
        let id = ''
        if (url.searchParams.get("id")){
          id = url.searchParams.get("id")
        }else if (url.searchParams.get("uuid")){
          id = url.searchParams.get("uuid")
        }
        let urlString = `${url.protocol}//${url.host}/geonetwork/srv/dut/catalog.search#/metadata/${id}`
        window.location.href = urlString
      }

    },
  },
};
</script>
<style >
pre[class*="language-"] {
  text-align: left;
  padding: 0px;
  margin: 0px;
  height: 89vh;
  overflow: auto;
}
#container {
  height: 93vh;
  display: flex; /* Magic begins */
  flex: 0 0 100%;
}
#map {
  width: 100%;
  height: 70vh;
}
#main {
  display: flex;
  flex-direction: column;
  width: 100%;
}

a.atom-feed{
  text-decoration: none;
  color:#2c3e50;
}

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
  height: 93vh;
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
#content{
  margin:1em;
}

.entry{
    margin-left:1em;
}

body{
    margin:auto;
}

div{
    text-align:left;
}

.entry{
    position: relative;
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,.1);
    margin: 2em 0;
    margin-top: 1em;
    margin-right: 0px;
    margin-bottom: 1em;
    margin-left: 0px;
    padding: 16px;
    clear: both;
}

a.download{
    margin-top:1em;
}
.hide{
    display: none;
}


.content{
    margin-top: 0em;
    margin:auto;
    max-width: 720px;
}

div#app{
    margin-top: 0px!important;
}

h1,
h2,
h3,
h4,
h5,
h6{
    margin-top:0px
}


table, caption, tbody, tfoot, thead, tr, th, td {
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
    margin-left:-50px;
  }

  a:hover{
      color:#38e9ff;
  }


  a { cursor: pointer; text-decoration:underline; }

  ul{
      list-style: none;
      padding-left:1em;
  }
  
  
</style>