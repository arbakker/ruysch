  <template>
  <div id="comp-root" style="position: relative">
    <h2 v-if="!cswLoaded">Loading...</h2>
    
    <div v-show="capVis && capXml !== ''">
      <div id="capbar">
        <button v-clipboard="() => capXml">
          <font-awesome-icon icon="clipboard" />
        </button>
        <button @click="capVis = false">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <prism language="xml">
        {{ capXml }}
      </prism>
    </div>
    
    <div v-if="serviceInfoVis">
      <div id="capbar">
        <button @click="serviceInfoVis = false">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      <service-info :serviceObject="serviceObject" :record="record"></service-info>
    </div>

    <div id="container" class="main" v-show="!capVis && !serviceInfoVis">
      
      <div id="map" ref="map-root"></div>
      <div id="sidebar">
        <div id="meta" v-if="cswLoaded">
        <div class="mapControl">
           
        <h3
          v-if="
            serviceObject &&
            serviceObject.title
          "
        >
          {{ serviceObject.title }}
        </h3>
         <dl>
          <dt>service type</dt>
          <dd>OGC:WMS</dd>
         </dl>
        </div>
        <div class="mapControl">
          <layer-control  v-if="cswLoaded" :layers="layers"></layer-control>
          <div>
            <label>layer</label>
          <select
            v-model="selectedLayer"
            v-if="cswLoaded"
            :disabled="!layers || layers.length <= 1"
          >
            <option v-for="layer in layers" :value="layer" :key="layer.Name">
              {{ layer.Title }}
            </option>
          </select>
          </div>

          <div>
            <label>style</label>
            <select
              v-model="selectedStyle"
              v-if="cswLoaded"
              :disabled="!styles || styles.length <= 1"
            >
              <option v-for="style in styles" :value="style" :key="style.Name">
                {{ style.Title }}
              </option>
            </select>
          </div>
          <div>
          <button @click="zoomTo" v-if="maxScaleDenominator != ''">
             <font-awesome-icon title="Zoom to Layer" icon="search-plus" />
          </button>
          <button @click="serviceInfoVis = true">
             <font-awesome-icon title="Show service info" icon="info-circle" />
          </button>
          <button @click="capVis = true">
             <font-awesome-icon title="Show capabilities document" icon="file-code" />
          </button>
        </div>
        </div>
        <div class="mapControl" v-if="selectedLayer">
          <layer-info :itemType="'Layer'" :item="selectedLayer"></layer-info>
        </div>
        <div class="mapControl" v-if="(legendUrl !== '')">
          <h3>Legend</h3>
          <div style="overflow-x:auto;">
          <img id="legend"
            v-if="(legendUrl !== '') | (legendUrl === undefined)"
            v-bind:src="legendUrl"
          />
          </div>
        </div>
        
      </div>
    </div>
  </div>
  </div>
</template>

<script>
// ol
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import WMSCapabilities from "ol/format/WMSCapabilities";
import { get as getProjection } from "ol/proj";
import {FullScreen, defaults as defaultControls} from 'ol/control';
import "ol/ol.css";
import proj4 from "proj4";
import Projection from "ol/proj/Projection";
import { register } from "ol/proj/proj4.js";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { getTopLeft, getWidth } from "ol/extent";


// fa
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimes, faClipboard, faSearchPlus, faFileCode, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add([faClipboard, faTimes, faSearchPlus, faFileCode, faInfoCircle]);

// code highlighting
import Prism from "vue-prism-component";
import "prismjs";
import "prismjs/themes/prism.css";

// local
import csw from "../lib/csw";
import serviceInfo from '../lib/serviceInfo';

// vue
import { mapFields } from "vuex-map-fields";

// components
import LayerInfo from "./LayerInfo.vue";
import ServiceInfo from "./ServiceInfo.vue";
import LayerControl from "./LayerControl.vue";


export default {
  name: "WMTSMap",
  components: {
    Prism,
    FontAwesomeIcon,
    LayerInfo,
    ServiceInfo,
    LayerControl
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),

    getCapUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      return `${url}?request=GetCapabilities&service=WMS`;
    },
    styles() {
      if (this.selectedLayer) {
        return this.selectedLayer.Style;
      }
      return [];
    },
    maxScaleDenominator() {
      if (this.selectedLayer.MaxScaleDenominator !== undefined) {
        return this.selectedLayer.MaxScaleDenominator;
      }
      return "";
    },
    minScaleDenominator() {
      if (Object.keys(this.selectedLayer).includes("MinScaleDenominator")) {
        return this.selectedLayer.MinScaleDenominator;
      }
      return "";
    },
  },
  data: () => ({
    capVis: false,
    serviceInfoVis: false,
    olMap: null,
    serviceId: "",
    cswLoaded: false,
    record: {},
    layers: [],
    selectedLayer: {},
    selectedStyle: {},
    olWmsLayer: {},
    legendUrl: "",
    serviceObject: {},
    capXml: "",
  }),
  mounted() {
    this.serviceId = this.$route.params.serviceId;
    csw.getCSWRecord(this.cswBaseUrl, this.serviceId).then((result) => {
      this.record = result;
      let url = this.getCapUrl;
      fetch(url)
        .then((response) => {
          return response.text();
        })
        .then((text) => {
          this.capXml = text;
          const parser = new WMSCapabilities();
          let parsedCap = parser.read(text);
          this.serviceObject = serviceInfo.getServiceInfoWMS(parsedCap.Service);
          let layers = [];
          this.layers = this.unpackLayers(parsedCap.Capability, layers);
          this.selectedLayer = this.layers[0];
          this.layers.forEach((lyr) => {
            lyr.Style = lyr.Style.filter(
              (v, i, a) => a.findIndex((t) => t.Name === v.Name) === i
            );
          });

          this.selectedStyle = this.layers[0].Style[0];
          this.cswLoaded = true;
        });
     
    });

    register(proj4);
    this.projection = new Projection({
      code: "EPSG:28992",
      extent: [-285401.92, 22598.08, 595401.92, 903401.92],
    });

    this.projectionExtent = this.projection.getExtent();
    var size = getWidth(this.projectionExtent) / 256;
    this.resolutions = new Array(20);
    this.matrixIds = new Array(20);
    for (var z = 0; z < 20; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      this.resolutions[z] = size / Math.pow(2, z);
      this.matrixIds[z] = z;
    }
    let projString = "EPSG:28992";

    this.olMap = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          source: new WMTS({
            attributions: "PDOK",
            url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts",
            layer: "brtachtergrondkaartgrijs",
            matrixSet: projString,
            format: "image/png",
            projection: this.projection,
            tileGrid: this.getTileGrid(projString),
            style: "default",
            wrapX: true,
          }),
        }),
      ],
      view: new View({
        zoom: 3,
        center: [156371.3422,461945.6757],
        constrainResolution: true,
        projection: this.projection
      }),
    });
    setTimeout( ()=> {this.olMap.updateSize();}, 200);
    this.olMap.getView().on("change:resolution", () => {
      this.updateLegendUrl();
    });
  },
  watch: {
    // whenever question changes, this function will run
    selectedLayer: function () {
      this.switchLayer();
      this.selectedStyle = this.selectedLayer.Style[0];
    },
    selectedStyle: function () {
      this.switchLayer();
    },
    capVis: function () {
      if (this.capVis) {
        this.olWmsLayer.render();
      }
    },
  },
  methods: {
    getTileGrid(gridIdentifier) {
      const resolutions = [
        3440.64,
        1720.32,
        860.16,
        430.08,
        215.04,
        107.52,
        53.76,
        26.88,
        13.44,
        6.72,
        3.36,
        1.68,
        0.84,
        0.42,
        0.21,
        0.105,
        0.05025,
      ];
      const matrixIds = new Array(15);
      if (gridIdentifier === "EPSG:28992") {
        for (let i = 0; i < 15; ++i) {
          matrixIds[i] = i;
        }
      } else if (gridIdentifier === "EPSG:28992:16") {
        for (let i = 0; i < 17; ++i) {
          matrixIds[i] = i;
        }
      }
      return new WMTSTileGrid({
        origin: getTopLeft(this.projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
      });
    },
    zoomTo() {
      const INCHES_PER_M = 39.37;
      const DOTS_PER_INCH = 96;
      if (!isNaN(this.maxScaleDenominator)) {
        const resolution =
          this.maxScaleDenominator / (INCHES_PER_M * DOTS_PER_INCH);
        this.olMap.getView().setResolution(resolution);
      }
    },
    updateLegendUrl() {
      let resolution = this.olMap.getView().getResolution();
      let graphicUrl = this.olWmsLayer.getSource().getLegendUrl(resolution);
      if (graphicUrl.indexOf("&SCALE=NaN") !== -1) {
        graphicUrl = graphicUrl.replace("&SCALE=NaN", "");
      }
      graphicUrl = `${graphicUrl}&SLD_VERSION=1.1.0`;
      graphicUrl = `${graphicUrl}&STYLE=${this.selectedStyle.Name}`;
      this.legendUrl = graphicUrl;
    },
    switchLayer() {
      if (this.olWmsLayer) {
        this.olMap.removeLayer(this.olWmsLayer);
      }
      this.olWmsLayer = this.getLayer([this.selectedLayer.Name]);
      this.olMap.addLayer(this.olWmsLayer);
      this.olMap.render();
      this.updateLegendUrl();
    },
    getLayer() {
      let layers = [this.selectedLayer.Name];
      let styles = [this.selectedStyle.Name];
      let wmsSource = new ImageWMS({
        url: this.record.url.split("?")[0],
        params: { LAYERS: layers.join(","), STYLES: styles.join(",") }, //STYLES: styleSwitcher.value
        ratio: 1,
        hidpi: false,
        serverType: "mapserver",
        projection: getProjection("EPSG:28992"),
      });
      return new ImageLayer({
        source: wmsSource,
      });
    },
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
    },
  },
};
</script>
<style scoped>
pre[class*="language-"] {
  text-align: left;
  padding: 0px;
  margin: 0px;
  height: 89vh;
  overflow: auto;
}

#meta {
  width: 100%;
  overflow: auto;
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
#legend{
  padding: 0.2em;
}
</style>