<template>
  <div ref="map-root" style="width: 100%; height: 100%"></div>
</template>

<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";


export default {
  name: "WMSMap",
  components: {},
  props: {
    wmsUrl: String,
  },
  computed: {
  },
  data: () => ({
    olMap: null,
  }),
  mounted() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [], // the vector layer is now created empty
      }),
      style: this.openStyle
    });
    this.olMap = new Map({
      // the map will be created using the 'map-root' ref
      target: this.$refs["map-root"],
      layers: [
        // adding a background tiled layer
        new TileLayer({
          source: new OSM(), // tiles are served by OpenStreetMap
        }),
        this.vectorLayer,
      ],

      // the map view will initially show the whole world
      view: new View({
        zoom: 0,
        center: [0, 0],
        constrainResolution: true,
      }),
    });
  },
  watch: {
  },
  methods: {
  },
};
</script>
