<template>
  <div>
    <div style="display:flex;flex-direction:row;">
    <!-- <select title="Select layer to add to map" :disabled="lefOverLayers.length===0">
      <option  v-for="item in lefOverLayers" :key="item.Name" :value="item.Name" @click="onChange($event)">
        {{ item.Title }}
      </option>
    </select> -->
      <select title="Select layer to add to map"  ref="select"></select>
      <a class="btn" href="#"  title="Add all layers" :disabled="lefOverLayers.length===0" @click="addAll()">
        <font-awesome-icon icon="plus"/>
      </a>
      <a class="btn" href="#"  title="Remove all layers" :disabled="selectedLayers.length===0" @click="removeAll()">
        <font-awesome-icon icon="minus"/>
      </a>
    </div>
    <draggable
      v-model="selectedLayers"
      @start="drag = true"
      @end="
        drag = false;
        onEnd();
      "
    >
      <div
        title="Drag layer to reorder"
        class="list-group-item"
        v-for="item in selectedLayers"
        :key="item.Name"
        :value="item.Name"
      >
        <div>
        {{ item.Title }}
        </div>
        <div style="display:flex;flex-direction:row;">
          <select title="Select style"
            v-if="item.selectedStyle"
            @change="onEnd()"
            :disabled="item.Style.length<=1"
            v-model="item.selectedStyle">
            <option v-for="style in item.Style" :value="style" :key="style.Name">
              {{ style.Title ? style.Title: style.Name }}
            </option>
          </select>
          <button @click="zoomTo(item)" title="Zoom to layer" v-if="maxScaleDenominator(item) != ''">
            <font-awesome-icon title="Zoom to Layer" icon="search-plus" />
          </button>
          <a class="btn" href="#" title="Remove layer" @click.prevent="onClick($event, item.Name)">
            <font-awesome-icon icon="minus" />
          </a>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimes, faPlus, faMinus  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add([faTimes,faPlus,faMinus]);

import draggable from "vuedraggable";
export default {
  components: {
    draggable,
    FontAwesomeIcon
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
  computed: {
    
  },
  mounted() {
    this.updateSelect()
  },
  methods: {
    options(){
    //   <select title="Select layer to add to map" :disabled="lefOverLayers.length===0">
    //   <option  v-for="item in lefOverLayers" :key="item.Name" :value="item.Name" @click="onChange($event)">
    //     {{ item.Title }}
    //   </option>
    // </select> 
      let result = []
      this.lefOverLayers.forEach(lyr=> {
        let option = document.createElement('option')
        option.value = lyr.Name
        option.innerText = lyr.Title
        option.addEventListener('click', (e)=>{
          this.onChange(e)
        })
        result.push(option)
      })
      return result
    },
    maxScaleDenominator(lyr) {     
      let selLayer = this.selectedLayers.find((x) => x.Name === lyr.Name)
      if (selLayer.MaxScaleDenominator !== undefined) {
        return selLayer.MaxScaleDenominator;
      }
      return "";
    },
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
    zoomTo: function (lyr) {
      this.$emit("zoom-to", lyr);
    },
    onClick: function (_, name) {
      this.selectedLayers = this.selectedLayers.filter((x) => x.Name !== name);
      const toAdd = this.layers.find((x) => x.Name === name);
      this.lefOverLayers.push(toAdd);
      this.updateSelect()
      this.onEnd();
    },
    updateSelect(){
      this.$refs.select.innerHTML = '';
      let options =  this.options()
      options.forEach(option=>this.$refs.select.appendChild(option))      
      this.$refs.select.disabled = (options.length===0)
    },
    onChange(event) {
      let sel = this.lefOverLayers.find((x) => x.Name == event.target.value);
      this.lefOverLayers = this.lefOverLayers.filter(
        (x) => x.Name !== event.target.value
      );
      this.updateSelect()
      if (sel.Style){
        sel["selectedStyle"] = sel.Style[0]
      }
      this.selectedLayers.unshift(sel);
      this.onEnd();
    },
  },
};
</script>
<style scoped>
*{
line-height:11px;
}
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