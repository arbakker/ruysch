<template>
  <div>
    <select :disabled="lefOverLayers.length===0">
      <option  v-for="item in lefOverLayers" :key="item.Name" :value="item.Name" @click="onChange($event)">
        {{ item.Title }}
      </option>
    </select>
    <button  :disabled="lefOverLayers.length===0" @click="addAll()">Add all</button>
    <button  :disabled="selectedLayers.length===0" @click="removeAll()">Remove all</button>
    <draggable
      v-model="selectedLayers"
      @start="drag = true"
      @end="
        drag = false;
        onEnd();
      "
    >
      <div
        class="list-group-item"
        v-for="item in selectedLayers"
        :key="item.Name"
        :value="item.Name"
      >
        {{ item.Title }}

        <select @change="onEnd()"
        :disabled="item.Style.length<=1"
          v-model="item.selectedStyle"
        >
          <option v-for="style in item.Style" :value="style" :key="style.Name">
            {{ style.Title ? style.Title: style.Name }}
          </option>
        </select>
        <a href="#" @click.prevent="onClick($event, item.Name)">x</a>
      </div>
    </draggable>
  </div>
</template>

<script>
// 
// import Vue from 'vue'
import draggable from "vuedraggable";
export default {
  components: {
    draggable,
  },
  name: "LayerControl",
  data: function () {
    return {
      selectedLayers: [],
      lefOverLayers: JSON.parse(JSON.stringify(this.layers)),
      //Vue.util.extend({}, this.layers)
    };
  },
  props: {
    layers: { required: true, type: Array },
  },
  computed: {},
  mounted() {},
  methods: {
    removeAll: function(){
      while (this.selectedLayers.length>0){
        this.onClick(null, this.selectedLayers[0].Name)
      }
    },
    addAll: function(){
      this.lefOverLayers.forEach(el => {
        let e = {}
        e.target = {}
        e.target.value = el.Name
        this.onChange(e)
      })
    },
    onEnd: function () {
      this.$emit("layers-changed", this.selectedLayers);
    },
    onClick: function (_, name) {
      this.selectedLayers = this.selectedLayers.filter((x) => x.Name !== name);
      const toAdd = this.layers.find((x) => x.Name === name);
      this.lefOverLayers.push(toAdd);
      this.onEnd();
    },
    onChange(event) {
      let sel = this.lefOverLayers.find((x) => x.Name == event.target.value);
      this.lefOverLayers = this.lefOverLayers.filter(
        (x) => x.Name !== event.target.value
      );
      sel["selectedStyle"] = sel.Style[0]
      this.selectedLayers.unshift(sel);
      this.onEnd();
    },
  },
};
</script>
<style scoped>
.list-group-item > button {
  float: right;
}
.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
}
</style>