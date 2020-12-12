<template>
  <div>
    <h3>{{itemType}} info</h3>
    <dl>
      <dt>name</dt>
      <dd>{{ item.Name }}</dd>
      <dt>title</dt>
      <dd>{{ item.Title }}</dd>
      <dt>abstract</dt>
      <dd>{{ item.Abstract }}</dd>
    </dl>
  </div>
</template>

<script>
export default {
  name: "LayerInfo",
  props: {
    item: { required: true, type: Object },
    itemType: { required: true, type: String },
  },
  computed: {},
  mounted() {},
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
dl{
    margin:unset;
}
</style>