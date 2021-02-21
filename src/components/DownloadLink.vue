<template>
  <a
    :href="downloadLink._attributes.href"
    class="download btn btn-default"
    download
    :title="getDownloadLink._attributes.title"
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
</style>