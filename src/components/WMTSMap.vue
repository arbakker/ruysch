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
      <service-info
        :serviceObject="serviceObject"
        :record="record"
      ></service-info>
    </div>
    <div id="container" class="main" v-show="!capVis && !serviceInfoVis">
      <div id="map" ref="map-root"></div>
      <div id="sidebar">
        <div id="meta" v-if="cswLoaded"></div>
        <div class="mapControl">
          <h3 v-if="serviceObject && serviceObject.title">
            {{ serviceObject.title }}
            {{
              !serviceObject.title.includes("WMTS") &&
              !serviceObject.title.includes("Web Map Tile Service")
                ? "- WMTS"
                : ""
            }}
          </h3>
          <div>
            <button @click="serviceInfoVis = true">
              <font-awesome-icon title="Show service info" icon="info-circle" />
            </button>
            <button @click="capVis = true">
              <font-awesome-icon
                title="Show capabilities document"
                icon="file-code"
              />
            </button>
          </div>
        </div>
        <div class="mapControl">
          <div>
            <select
              title="Select layer to add to map"
              v-model="selectedLayer"
              v-if="cswLoaded"
              :disabled="!layers || layers.length <= 1"
            >
              <option
                v-for="layer in layers"
                :value="layer"
                :key="layer.identifier"
              >
                {{ layer.identifier }}
              </option>
            </select>
          </div>
        </div>
        <div class="mapControl" v-if="selectedLayer">
          <layer-info
            :itemType="'Layer'"
            :item="selectedLayerComp"
          ></layer-info>
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
// import { get as getProjection } from "ol/proj";
import { FullScreen, defaults as defaultControls } from "ol/control";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { getTopLeft } from "ol/extent";
import "ol/ol.css";
// import { fromLonLat } from 'ol/proj'
import proj4 from "proj4";
import Projection from "ol/proj/Projection";
import { register } from "ol/proj/proj4.js";

// fa
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTimes,
  faClipboard,
  faSearchPlus,
  faFileCode,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add([faClipboard, faTimes, faSearchPlus, faFileCode, faInfoCircle]);

// code highlighting
import Prism from "vue-prism-component";
import "prismjs";
import "prismjs/themes/prism.css";

// local
import csw from "../lib/csw";
import serviceInfo from "../lib/serviceInfo";

// vue
import { mapFields } from "vuex-map-fields";

// components
import LayerInfo from "./LayerInfo.vue";
import ServiceInfo from "./ServiceInfo.vue";

// other imports
import Jsonix from "jsonix";

// schema imports
var OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
var Filter_2_0 = require("ogc-schemas").Filter_2_0;
var XLink_1_0 = require("w3c-schemas").XLink_1_0;
var WMTS_1_0 = require("ogc-schemas").WMTS_1_0;
var GML_3_1_1 = require("ogc-schemas").GML_3_1_1;
var SMIL_2_0_Language = require("ogc-schemas").SMIL_2_0_Language;
var SMIL_2_0 = require("ogc-schemas").SMIL_2_0;

export default {
  name: "WMSMap",
  components: {
    Prism,
    FontAwesomeIcon,
    LayerInfo,
    ServiceInfo,
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    selectedLayerComp() {
      return {
        Title: this.selectedLayer.title,
        Abstract: this.selectedLayer.abstract,
        Name: this.selectedLayer.identifier,
      };
    },
    getCapUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      return `${url}?request=GetCapabilities&service=WMTS`;
    },
    getBaseUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      return url;
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
    olWmsLayer: {},
    serviceObject: {},
    capXml: "",
    tileMatrixSetId: "EPSG:28992",
    projection: null,
    wmtsCap: null,
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
          // TODO: simplify with ol buildin WMTS Cap parser
          let context = new Jsonix.Context([
            XLink_1_0,
            Filter_2_0,
            OWS_1_1_0,
            GML_3_1_1,
            WMTS_1_0,
            SMIL_2_0_Language,
            SMIL_2_0,
          ]);
          let unmarshaller = context.createUnmarshaller();
          this.wmtsCap = unmarshaller.unmarshalString(text);
          this.capXml = text;
          this.serviceObject = serviceInfo.getServiceInfoWMTS(this.wmtsCap);
          this.layers =
            this.wmtsCap.value.contents.datasetDescriptionSummary.map((obj) => {
              return this.unpackWMTSLayer(obj);
            });

          this.selectedLayer = this.layers[0];
        });
      this.cswLoaded = true;
    });
    proj4.defs(
      "EPSG:28992",
      "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs"
    );
    register(proj4);
    this.projection = new Projection({
      code: "EPSG:28992",
      extent: [-285401.92, 22598.08, 595401.92, 903401.92],
    });
    this.olMap = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          opacity: 0.4,
          source: new WMTS({
            url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0",
            layer: "grijs",
            matrixSet: this.tileMatrixSetId,
            format: "image/png",
            projection: this.projection,
            tileGrid: this.getTileGridByZoomLevels(15),
            style: "default",
            wrapX: true,
          }),
        }),
      ],

      view: new View({
        zoom: 7,
        center: [681820.9487, 6832242.7535],
        constrainResolution: true,
      }),
    });
    setTimeout(() => {
      this.olMap.updateSize();
    }, 200);
  },
  watch: {
    selectedLayer: function () {
      this.switchLayer();
    },
    capVis: function () {
      if (this.capVis) {
        this.olWmsLayer.render();
      }
    },
  },
  methods: {
    getTileGridByZoomLevels(zoomlevels) {
      let matrixIds = new Array(zoomlevels);
      let resolutions = new Array(zoomlevels);
      for (let i = 0; i < zoomlevels; ++i) {
        matrixIds[i] = i;
        resolutions[i] = 3440.64 * Math.pow(2, -i);
      }
      matrixIds = matrixIds.map((x) => `EPSG:28992:${x}`);
      return new WMTSTileGrid({
        origin: getTopLeft(this.projection.getExtent()),
        resolutions: resolutions,
        matrixIds: matrixIds,
      });
    },
    getTileGrid(tilesetidentifer) {
      // retrieve layer object based on identifier
      let lyr = this.layers.find((x) => x.identifier === tilesetidentifer);
      if (lyr === null) {
        // TODO: improve error handling
        alert(
          `ERROR: layer ${tilesetidentifer} not found in capabilities document`
        );
        return null;
      }
      // assuming a layer has one EPSG:28992 TMS definded, retrieve the appropriate TMS identifier
      let tmsIdentifier = lyr.tileMatrixSets.find((x) =>
        x.startsWith("EPSG:28992")
      );
      if (tmsIdentifier === null) {
        alert(
          `ERROR: TileMatrixSet  EPSG:28992 not found in capabilities document`
        );
        return null;
      }
      // retrieve TMS object by tmsIdentifier, en check nr of zoomlevels
      let rdTMS = this.wmtsCap.value.contents.tileMatrixSet.find(
        (x) => x.identifier.value === tmsIdentifier
      );
      let zoomlevels = rdTMS.tileMatrix.length;
      return this.getTileGridByZoomLevels(zoomlevels);
    },

    unpackWMTSLayer(obj) {
      let val = obj.value;
      return {
        title: val.title[0].value,
        identifier: val.identifier.value,
        bbox:
          val.boundingBox[0].value.lowerCorner.join(",") +
          "," +
          val.boundingBox[0].value.upperCorner.join(","),
        tileMatrixSets: val.tileMatrixSetLink.map((obj) => {
          return obj.tileMatrixSet;
        }),
        style: val.style.map((obj) => {
          return { identifier: obj.identifier.value, isDefault: obj.isDefault };
        }),
      };
    },
    switchLayer() {
      if (this.olWmsLayer) {
        this.olMap.removeLayer(this.olWmsLayer);
      }
      let newLayer = this.getLayer();
      if (newLayer === null) {
        return;
      }
      this.olWmsLayer = newLayer;
      this.olMap.addLayer(this.olWmsLayer);
      this.olMap.render();
    },
    getLayer() {
      let tileGrid = this.getTileGrid(this.selectedLayer.identifier);
      if (tileGrid === null) {
        return null;
      }
      return new TileLayer({
        opacity: 1,
        source: new WMTS({
          url: this.getBaseUrl,
          layer: this.selectedLayer.identifier,
          matrixSet: "EPSG:28992",
          format: "image/png",
          projection: this.projection,
          tileGrid: tileGrid,
          style: "default",
          wrapX: true,
        }),
      });
    },
  },
};
</script>
<style scoped>
pre[class*="language-"] {
  text-align: left;
  padding: 0px;
  margin: 0px;
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
#legend {
  padding: 0.2em;
  border: lightgrey dotted 1px;
}
</style>