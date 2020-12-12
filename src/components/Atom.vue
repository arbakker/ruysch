  <template>
  <div>
     <prism language="xml">
        {{ capXml }}
      </prism>
  </div>
</template>

<script>
import Prism from "vue-prism-component";
import csw from "../lib/csw";
import "prismjs";
import "prismjs/themes/prism.css";
import { mapFields } from "vuex-map-fields";


export default {
  name: "Atom",
  components: {
    Prism,
  },
  computed: {
      ...mapFields({
      cswBaseUrl: "cswBaseUrl", 
      serviceOwner: "serviceOwner"
    }),
  },
  data: () => ({
    capVis: false,
    capXml: "",
    serviceId: "",
    cswLoaded: false,
    record: {},
    serviceObject: {},
    dataFeedObjects: [],
  }),
  mounted() {
    this.serviceId = this.$route.params.serviceId;
    let cswEndpoint = this.cswBaseUrl;

    csw.getCSWRecord(cswEndpoint, this.serviceId).then((result) => {
      this.record = result;
      let url = this.record.url;
      fetch(url)
        .then((response) => {
          return response.text();
        })
        .then((text) => {
          this.capXml = text;
         
        });
        this.cswLoaded = true;
    });

  },
  watch: {
  },
  methods: {
  },
};
</script>
<style scoped>
pre[class*="language-"] {
  text-align: left;
  padding:0px;
  margin: 0px;
  height: 89vh;
  overflow:auto;
}
#container {
  height: 93vh;
  display: flex; /* Magic begins */
  flex: 0 0 100%;
}
#map{
  width: 100%;
  height: 70vh;
}
#main {
  display:flex;
  flex-direction: column;
  width:100%;
}

#meta{
  width:100%;
  overflow:auto;
}
#mapControls * {
  margin:0.2em;
  max-width: 90%;
}
#mapControls{
  flex-basis:20%;
  height: 93vh;
  overflow:auto;
  text-align:left;
}


#capbar{
  height: 4vh;
  text-align: left;
}

#capbar button{
  margin:0.3em;
}
#capbar button{
  height: 2em;
}
</style>