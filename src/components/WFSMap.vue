  <template>
   <div class="main">
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
    <div id="container" v-show="!capVis && !serviceInfoVis">
      <div id="main">
        <div id="map" ref="map-root"></div>
        <div class="popup" ref="popup" v-show="currentCoordinate">
          <span class="icon-close" @click="closePopup">✖</span>
          <div class="content" v-html="featureInfo"></div>
        </div>
        <div id="meta" v-if="cswLoaded"></div>
      </div>
      <div id="sidebar">
        <div  class="mapControl">
        <h3
          v-if="
            serviceObject &&
            serviceObject.title
          "
        >
            {{ serviceObject.title }} {{ !serviceObject.title.includes("WFS")? '- WFS': ''}}
        </h3>
        <div>
          <button @click="serviceInfoVis = true">
              <font-awesome-icon title="Show service info" icon="info-circle" />
            </button>
            <button @click="capVis = true" title="Show capabilities document">
              <font-awesome-icon icon="file-code" />
            </button>
        </div>
        </div>
        <div class="mapControl">
          <div class="row">
            <select
              v-model="selectedFeature"
              :disabled="features.length <= 1"
              v-if="cswLoaded"
            >
              <option v-for="ft in features" :value="ft" :key="ft.Name">
                {{ ft.Title }}
              </option>
            </select>
             <button @click="loadFeatures()" title="Load features on map">
              <font-awesome-icon icon="download" />
            </button>
          </div>
          <div>
            <label>maxFeatures</label
            ><input title="Set maximum number of features to retrieve" type="number" v-model="maxFeatures" />
          </div>
        </div>
        <div class="mapControl">
          <layer-info
            :itemType="'FeatureType'"
            :item="selectedFeature"
          ></layer-info>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// openlayers
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import {FullScreen, defaults as defaultControls} from 'ol/control';
import "ol/ol.css";
import proj4 from "proj4";
import Projection from "ol/proj/Projection";
import { register } from "ol/proj/proj4.js";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { getTopLeft, getWidth } from "ol/extent";


// fa icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faTimes,
  faClipboard,
  faFileCode,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
library.add([faTimes, faClipboard, faFileCode, faDownload]);

// code highlighting
import Prism from "vue-prism-component";
import "prismjs";
import "prismjs/themes/prism.css";

// other imports
import { mapFields } from "vuex-map-fields";
import Jsonix from "jsonix";

// components
import LayerInfo from "./LayerInfo.vue";
import ServiceInfo from "./ServiceInfo.vue";

// local imports
import csw from "../lib/csw";
import defaultStyles from "../lib/styles";
import serviceInfo from '../lib/serviceInfo';

// schema imports
var WFS_2_0 = require("ogc-schemas").WFS_2_0;
var OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
var Filter_2_0 = require("ogc-schemas").Filter_2_0;
var XLink_1_0 = require("w3c-schemas").XLink_1_0;



export default {
  name: "WFSMap",
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
    getCapUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      return `${url}?request=GetCapabilities&service=WFS&version=2.0.0`;
    },
    getFeatureUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      return `${url}?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application/json&srsname=EPSG:28992`;
    },
  },
  data: () => ({
    capVis: false,
    olMap: null,
    vectorLayer: null,
    serviceId: "",
    cswLoaded: false,
    record: {},
    features: [],
    selectedFeature: {},
    serviceObject: {},
    maxFeatures: 100,
    capXml: "",
    overlay: null,
    featureInfo: "",
    currentCoordinate: null,
    serviceInfoVis: false
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
          let context = new Jsonix.Context([
            XLink_1_0,
            Filter_2_0,
            OWS_1_1_0,
            WFS_2_0,
          ]);
          let unmarshaller = context.createUnmarshaller();
          let wfsObject = unmarshaller.unmarshalString(text);
          this.serviceObject =  serviceInfo.getServiceInfoWFS(
          {serviceIdentification: wfsObject.value.serviceIdentification, serviceProvider: wfsObject.value.serviceProvider});
          this.features = [];
          wfsObject.value.featureTypeList.featureType.forEach((ft) => {
            let ftName = `${ft.name.prefix}:${ft.name.localPart}`;
            let ftTitle = ft.title[0].value;
            let ftAbstract = ft._abstract[0].value;
            this.features.push({
              Name: ftName,
              Title: ftTitle,
              Abstract: ftAbstract,
            });
          });
          this.selectedFeature = this.features[0];
        });
      this.cswLoaded = true;
    });
    this.overlay = new Overlay({
      element: this.$refs.popup, // popup tag, in html
      autoPan: true, // If the pop-up window is at the edge of the base image, the base image will move
      autoPanAnimation: {
        // Basemap moving animation
        duration: 250,
      },
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
      target: this.$refs["map-root"],
      overlays: [this.overlay],
      controls: defaultControls().extend([new FullScreen()]),
      layers: [
        new TileLayer({
          source: new WMTS({
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
        projection:  this.projection
      }),
    });
    this.olMap.on("click", (evt) => {
      const coordinate = evt.coordinate; // get coordinates
      if (this.currentCoordinate) {
        this.closePopup();
        return;
      }
      // const hdms = toStringHDMS(toLonLat(coordinate)); // Convert coordinate format
      this.currentCoordinate = coordinate; // save coordinate points
      let fts = this.olMap.getFeaturesAtPixel(evt.pixel, {
        layerFilter: (layer) => {
          if (layer === this.vectorLayer) {
            return true;
          }
          return false;
        },
      });
      if (fts.length > 0) {
        let ft = fts[0];
        let props = ft.getProperties();
        delete props.geometry;
        if (
          Object.keys(ft).includes("id_") &&
          !Object.keys(props).includes("id")
        ) {
          props["id"] = ft.id_;
        }
        const tableObj = this.genTableFromKVPs(props);
        this.featureInfo = tableObj.outerHTML;
      } else {
        this.featureInfo = "";
        return;
      }
      setTimeout(() => {
        // Set the position of the pop-up window
        // Set the timer here, otherwise the pop-up window will appear for the first time, and the base map will be off-track
        this.overlay.setPosition(coordinate);
      }, 0);
    });
    setTimeout(() => {
      this.olMap.updateSize();
    }, 200);
  },
  watch: {},
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
    closePopup() {
      // Set the position of the pop-up window to undefined, and clear the coordinate data
      this.overlay.setPosition(undefined);
      this.currentCoordinate = null;
    },
    genTableFromKVPs(kvps) {
      var table = document.createElement("table");
      table.classList.add("styled-table");
      Object.keys(kvps).forEach(function (key) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        let val = kvps[key];
        td2.innerText = val !== null ? val.toString() : "null ";
        td1.innerText = key.toString();
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
      });
      return table;
    },
    geometryStyle(feature) {
      let styles = {
        MultiPolygon: defaultStyles.polygonStyle,
        Polygon: defaultStyles.polygonStyle,
        MultiLineString: defaultStyles.linestringStyle,
        LineString: defaultStyles.linestringStyle,
        Point: defaultStyles.pointStyle,
        MultiPoint: defaultStyles.pointStyle,
      };
      let geometry_type = feature.getGeometry().getType();

      return styles[geometry_type];
    },
    loadFeatures: function () {
      const extent = this.olMap.getView().calculateExtent();
      const extentString = extent.join(",");
      const getFeatureUrl = `${this.getFeatureUrl}&count=${this.maxFeatures}&typename=${this.selectedFeature.Name}&bbox=${extentString},EPSG:28992`;

      fetch(getFeatureUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          var vectorSource = new VectorSource({
            features: new GeoJSON({
              defaultDataProjection: 'EPSG:28992',
              featureProjection: 'EPSG:28992'
            }).readFeatures(data),
          });
          
          if (this.vectorLayer) {
            this.olMap.removeLayer(this.vectorLayer);
          }
          this.vectorLayer = new VectorLayer({
            source: vectorSource,
            style: this.geometryStyle,
          });
          this.olMap.addLayer(this.vectorLayer);
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
#container {
  height: 100%;
  display: flex;
  flex: 0 0 100%;
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
.popup {
  min-width: 280px;
  position: relative;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  transform: translate(-50%, calc(-100% - 12px));
}
.popup::after {
  display: block;
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  border: 12px solid transparent;
  border-top-color: #fff;
  bottom: -23px;
  left: 50%;
  transform: translateX(-50%);
}
.icon-close {
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 10px;
}
</style>