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

    <div id="container"  v-show="!capVis && !serviceInfoVis">
       <div id="main">
        <div id="map" ref="map-root"></div>
        <div class="popup" ref="popup" v-show="currentCoordinate" >
            <span class="icon-close" @click="closePopup">✖</span>
            <feature-info-control :ftCollections="featureInfo" v-if="featureInfo.length>0"></feature-info-control>
        </div>
       </div>
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
          <layer-control  v-if="cswLoaded" :layers="layers" @layers-changed="layersChanged"></layer-control>
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
        <div class="mapControl">
          <h3>Legend</h3>
          <div style="overflow-x:auto;">
          
          <div class="legend"  v-for="legend in legendUrls" :key="legend.layerTitle">
            <h4>{{ legend.layerTitle }}</h4>
             <img 
            v-bind:src="legend.url"
          />

          </div>
         
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
import Overlay from "ol/Overlay";
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
import ServiceInfo from "./ServiceInfo.vue";
import LayerControl from "./LayerControl.vue";
import FeatureInfoControl from "./FeatureInfoControl.vue";


export default {
  name: "WMSMap",
  components: {
    Prism,
    FontAwesomeIcon,
    ServiceInfo,
    LayerControl,
    FeatureInfoControl
  },
  computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
    legendUrls(){
      const result = []

      // loop backwards to account for layer order
      for (let index = this.olWmsLayers.length - 1; index >= 0; index--) {
        let wmsLyr = this.olWmsLayers[index]
        let resolution = this.olMap.getView().getResolution();
        let graphicUrl = wmsLyr.getSource().getLegendUrl(resolution);
        if (graphicUrl.indexOf("&SCALE=NaN") !== -1) {
          graphicUrl = graphicUrl.replace("&SCALE=NaN", "");
        }
        let capWmsLyr = wmsLyr.get("wmsLyr")
        graphicUrl = `${graphicUrl}&SLD_VERSION=1.1.0`;
        graphicUrl = `${graphicUrl}&STYLE=${capWmsLyr.selectedStyle.Name}`;  
        result.push({url: graphicUrl, layerTitle: capWmsLyr.Title});
      }
      return result
    },
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
    overlay: null,
    cswLoaded: false,
    record: {},
    layers: [],
    selectedLayers: [],
    olWmsLayers: [],
    legendUrl: "",
    serviceObject: {},
    capXml: "",
    featureInfo: [],
    currentCoordinate: null,
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
          // filter out duplicate styles, seems bug in cap parser
          this.layers.forEach((lyr) => {
            lyr.Style = lyr.Style.filter(
              (v, i, a) => a.findIndex((t) => t.Name === v.Name) === i
            );
          });
          let parentStyles = []
          parentStyles = this.parentStyles(parsedCap.Capability, parentStyles).flat();         
          this.layers.map(x => 
            x.Style = x.Style.filter(y=> 
              ! parentStyles.includes(y)
            )
          )
          
          

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

    this.overlay = new Overlay({
      element: this.$refs.popup, // popup tag, in html
      autoPan: true, // If the pop-up window is at the edge of the base image, the base image will move
      autoPanAnimation: {
        // Basemap moving animation
        duration: 250,
      },
    });
    this.olMap = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      overlays: [this.overlay],
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

    this.olMap.on('click', (evt) => {
      const coordinate = evt.coordinate; // get coordinates
      if (this.currentCoordinate) {
        this.closePopup();
        return;
      }
      this.currentCoordinate = coordinate;
      var viewResolution = /** @type {number} */ (this.olMap.getView().getResolution());
      var urls = this.olWmsLayers.map(x=> x.getSource().
        getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
         this.projection,
        {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': '10'}
      ))
      urls = urls.filter(x => x !== undefined)
      Promise.all(urls.map(u=>this.getUrl(u))).then(result =>
           {
        result = result.map(x => {
          let url = x.url
          let data = x.data
          const params = new URLSearchParams(url)
          let layer = params.get("LAYERS")
          if (!layer) layer = params.get("QUERYLAYERS")
          data.name = layer
          return data
        })
        result = result.filter(x=> x.features.length>0)
        this.featureInfo = result
        if (result.length>0){
          setTimeout(() => {
        // Set the position of the pop-up window
        // Set the timer here, otherwise the pop-up window will appear for the first time, and the base map will be off-track
        this.overlay.setPosition(coordinate);
        this.$refs.popup.scrollTop = 0;
      }, 0);
        }
        
      })
    });
    setTimeout( ()=> {this.olMap.updateSize();}, 200);
    this.olMap.getView().on("change:resolution", () => {
      this.updateLegendUrl();
    });
  },
  watch: {
    capVis: function () {
      if (this.capVis) {
        this.olWmsLayers.render();
      }
    },
  },
  methods: {
    async getUrl(url){
      let response = await fetch(url);
      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        return {data: json, url: url}
      } else {
        alert("HTTP-Error: " + response.status);
      }
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
    closePopup() {
      // Set the position of the pop-up window to undefined, and clear the coordinate data
      this.featureInfo = []
      this.overlay.setPosition(undefined);
      this.currentCoordinate = null;
    },
    layersChanged(value){
      this.switchLayer(value)
    },
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
    switchLayer(layers) {
      this.selectedLayers = layers
      this.olWmsLayers.forEach(lyr => this.olMap.removeLayer(lyr))    
      this.olWmsLayers = this.getLayers(layers).reverse();
      this.olWmsLayers.forEach(lyr => this.olMap.addLayer(lyr))    
      this.olMap.render();
      this.updateLegendUrl();
    },
    getLayers(layers) {
      // let styles = [this.selectedStyle.Name];
      // layers.reverse()
      
      return layers.map(lyr=>{
          let wmsSource = new ImageWMS({
          url: this.record.url.split("?")[0],
          params: { LAYERS: lyr.Name, STYLES: lyr.selectedStyle.Name }, //STYLES: styleSwitcher.value STYLES: ""
          ratio: 1,
          hidpi: false,
          serverType: "mapserver",
          projection: getProjection("EPSG:28992"),
          });  
          let result = new ImageLayer({
             source: wmsSource,
          });
          result.set("wmsLyr", lyr)
          return result
      })

      
     
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
    parentStyles(capObj, result) {
      if (!Array.isArray(capObj)) {
        capObj = [capObj];
      }
      capObj.forEach((lyr) => {
        if ("Layer" in lyr) {
          result.push(lyr.Style);
          this.parentStyles(lyr.Layer, result);
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
img.legend{
  padding: 0.2em;
  display: block;
}
.popup {
  max-width: 60vw;
  height: 40vh;
  position: relative;
  background: #fff;
  display: flex;
  flex-direction: column;
  transform: translate(-50%, calc(-100% - 12px));
  resize: horizontal; 
  overflow-x:hidden;
  overflow-y:auto; 
  padding: 0.5em;
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
  position:absolute;
  top:0px;
  right:0px;
  cursor:pointer;
}
</style>