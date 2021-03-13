<template>
  <a
    :href="downloadLink._attributes.href"
    class="download btn"
    download
    :title="downloadLink._attributes.title"
    >Download</a
  >
</template>

<script>
import { JSONPath } from "jsonpath-plus";

export default {
  name: "DownloadLink",
  props: {
    entry: { required: true, type: Object },
  },
  computed: {
    downloadLink: function () {
      let jsonPath =
        "$.link[?(@._attributes.rel == 'alternate' && @._attributes?.type !== 'application/atom+xml' )]";
      let result = JSONPath({ path: jsonPath, json: this.entry });
      return result[0];
    },
  },
  mounted() {},
};
</script>
<style scoped>

.btn:hover{
  border-color: #7a7a7a;
}
.btn {
  background-color: #CCCCCC;;
  border: 0.15em solid #CCCCCC;
  color: #000000;;
  padding: 0.2em 1.45em;
  cursor: pointer;
  font-weight: 400;
  text-decoration: unset;
  margin: 0.1em;
  font-family: 'Segoe UI','Roboto',sans-serif;
  display: inline-block;
  cursor: pointer;
}

</style>