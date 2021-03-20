<template>
  <div class="root">
    <button v-if="ftCollection.features.length > 1" @click="previous()">
      previous
    </button>
    <button v-if="ftCollection.features.length > 1" @click="next()">
      next
    </button>
    <p>
      {{ ftCollection.features.length }} feature{{
        ftCollection.features.length > 1 ? "s" : ""
      }}
    </p>
      <table class="styled-table" v-for="(ft, index) in ftCollection.features"
      :key="ft.id"
      :class="
        (index !== selectedIndex ? 'hidden' : '') +
        ' ' +
        index +
        ' ' +
        selectedIndex
      ">
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
        <tr v-if="'id' in ft && !('id' in ft.properties)">
          <td>id</td>
          <td>{{ ft.id }}</td>
        </tr>
        <tr v-for="prop in Object.keys(ft.properties)" :key="prop">
          <td>{{ prop }}</td>
          <td>{{ ft.properties[prop] }}</td>
        </tr>
      </table>
  </div>
</template>

<script>
export default {
  name: "FeatureInfoTable",
  props: {
    ftCollection: { required: true, type: Object },
  },
  data: function() {
    return {
        selectedIndex: 0
      };
},
  computed: {},
  watch: {
    ftCollection() {
      this.selectedIndex = 0
    }
  },
  methods: {
    next(){
      let newIndex = this.selectedIndex+1
      if (newIndex>(this.ftCollection.features.length -1)){
        newIndex = 0
      }
      this.selectedIndex = newIndex
    },
    previous(){
      let newIndex = this.selectedIndex-1
      if (newIndex<0){
        newIndex = this.ftCollection.features.length -1
      }
      this.selectedIndex = newIndex
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
  },
  mounted() {
    this.selectedIndex = 0
  },
};
</script>
<style scoped>
.hidden {
  display: none;
}
table {
  margin: 0.1em;
  /* table-layout: fixed; */
}

.root{
  width: 100%;
  height: 100%;
}
.table {
  width: 100%;
  height: 100%;
}
</style>