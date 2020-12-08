  <template>
  <div>
    <h2>MAP - {{ serviceId }}</h2>
    <h2 v-if="!cswLoaded">Loading...</h2>
    <div>
      <p>{{ record.url }} - {{ record.id }}</p>
      <div ref="map-root" style="height:400px;width:100%;"></div>
      <div>
         <select class="form-control"  v-model="selectedLayer"  >
            <option v-for="(layer) in layers" :value="layer" :key="layer.Name">{{ layer.Title }}</option>
       </select>
      </div>
    </div>
  </div>
</template>

<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import WMSCapabilities from "ol/format/WMSCapabilities";
// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";
import csw from "../lib/csw"

export default {
  name: "WMSMap",
  components: {},
  props: {
  },
  computed: {
  },
  data: () => ({
    olMap: null,
    serviceId: "",
    cswLoaded: false,
    record: {},
    layers: [],
    selectedLayer: ''
  }),
  mounted() {
    this.serviceId = this.$route.params.serviceId
      let cswEndpoint =
        "https://ngr.acceptatie.nationaalgeoregister.nl/geonetwork/srv/dut/csw";
      
      csw.getCSWRecord(cswEndpoint, this.serviceId).then((result) => {

        fetch(result.url).then((response) => {
        return response.text();
        }).then((text) => {
          const parser = new WMSCapabilities();
          let parsedCap = parser.read(text)
          let layers = [];
          this.layers = this.unpackLayers(parsedCap.Capability, layers);
          this.selectedLayer = this.layers[0]
        })
        this.record = result
        this.cswLoaded = true
      })

    this.olMap = new Map({
      // the map will be created using the 'map-root' ref
      target: this.$refs["map-root"],
      layers: [
        // adding a background tiled layer
        new TileLayer({
          source: new OSM(), // tiles are served by OpenStreetMap
        }),
      ],

      // the map view will initially show the whole world
      view: new View({
        zoom: 7,
        center: [681820.9487,6832242.7535],
        constrainResolution: true,
      }),
    });
  },
  watch: {
  },
  methods: {
     unpackLayers(capObj, result) {
  if (!Array.isArray(capObj)) {
    capObj = [capObj];
  }
  capObj.forEach((lyr) => {
    if ("Layer" in lyr) {
      this.unpackLayers(lyr.Layer, result);
    } else {
      result.push(lyr);
    }
  });
  return result;
}
  },
};
</script>
