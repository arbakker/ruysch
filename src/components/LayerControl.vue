<template>
  <div>
    <select @change="onChange($event)">
      <option v-for="item in lefOverLayers" :key="item.Name" :value="item.Name" >
        {{ item.Name }}
      </option>
    </select>
    <ul>
      <li v-for="item in selectedLayers" :key="item.Name">
        {{ item.Name }}
      </li>
    </ul>
  </div>
</template>

<script>
// import Vue from 'vue' 
export default {
  name: "LayerControl",
  data: function() {
return {
    selectedLayers: [],
    lefOverLayers: JSON.parse(JSON.stringify(this.layers))
    //Vue.util.extend({}, this.layers)
  };
}
  ,
  props: {
    layers: { required: true, type: Array },
  },
  computed: {},
  mounted() {
    console.log(this.layers)
    console.log(this.lefOverLayers)

  },
  methods: {
        onChange(event) {
          let sel = this.lefOverLayers.find(x => x.Name == event.target.value)
          this.selectedLayers.unshift(sel)
        }
    }
};
</script>
<style scoped>

</style>