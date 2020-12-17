<template>
  <div id="serviceInfo">
    <h3>service info</h3>
    <dl>
      <dt>title</dt>
      <dd>{{ serviceObject.title }}</dd>
      <dt>service type</dt>
      <dd>{{ record.protocol }}</dd>
      <dt>service url</dt>
      <dd><a :href="getCapUrl">{{ getCapUrl }}</a></dd>
      <dt>service metadata url</dt>
      <dd><a :href="getHtmlMdUrl">{{ getHtmlMdUrl }}</a></dd>
      <dt>abstract</dt>
      <dd>{{ serviceObject.abstract }}</dd>
      <dt>keywords</dt>
      <dd v-for="kw in  serviceObject.keywords" :key="kw">{{ kw }}</dd>
      <dt>fees</dt>
      <dd>{{ serviceObject.fees }}</dd>
      <dt>accessconstraints</dt>
      <dd>{{ serviceObject.accessConstraints }}</dd>
      <dt>contact organization</dt>
      <dd>{{serviceObject.contactOrganization}}</dd>
      <dt>contact name</dt>
      <dd>{{serviceObject.contactName}}</dd>
      <dt>contact email</dt>
      <dd>{{serviceObject.contactEmail}}</dd>
    </dl>
  </div>
</template>

<script>
// vue
import { mapFields } from "vuex-map-fields";


export default {
  name: "ServiceInfo",
  props: {
    serviceObject: { required: true, type: Object },
    record: { required: true, type: Object },
  },
  methods: {
     getService(protocol){
      let lookup = {
        'OGC:WMS': "WMS",
        'OGC:WFS': "WFS"
      }
      return lookup[protocol]
    }
  },
   computed: {
    ...mapFields({
      cswBaseUrl: "cswBaseUrl",
      serviceOwner: "serviceOwner",
    }),
     getHtmlMdUrl() {
      let htmlServiceUrl = this.cswBaseUrl.replace("csw", "catalog.search");
      return `${htmlServiceUrl}#/metadata/${this.record.id}`;
    },
     getCapUrl() {
      let url = this.record.url;
      if (url.includes("?")) {
        url = url.split("?")[0];
      }
      let serviceString = this.getService(this.record.protocol)
      return `${url}?request=GetCapabilities&service=${serviceString  }`;
    },
  },
  mounted() {
    
  },
};
</script>
<style scoped>
dt {
  font-weight: bold;
  font-style: italic;
}
dd {
  margin: 0;
  padding: 0 0 0.5em 0;
}
#serviceInfo{
  margin:1em;
}
</style>