<template>
   <div  ref="root" class='tabs__light'>
    <ul class='tabs__header'>
      <li v-for='(tab, index) in ftCollections'
        :key='tab.name'
        @click='selectTab(index)'
        :class='{"tab__selected": (index == selectedIndex)}'>
        {{ tab.name }}
      </li>      
    </ul>
    <feature-info-table :ftCollection="selectedFtCollection"></feature-info-table>
  </div>
</template>

<script>
import FeatureInfoTable from './FeatureInfoTable.vue'

export default {
  components: {
    FeatureInfoTable
   },
  data(){
    return{
      selectedIndex: 0
    }
  },
   watch: {
    ftCollections() {
      this.$refs.root.scrollTo(0,0);
    }
  },
  name: "FeatureInfo",
  props: {
    ftCollections: { required: true, type: Array },
  },
  computed: {
    selectedFtCollection(){
      return this.ftCollections[this.selectedIndex]
    }
  },
  mounted() {
    this.selectTab(0)
  },
  created () {
    this.tabs = this.$children
  },
  methods: {
      selectTab (i) {
      this.selectedIndex = i
      // loop over all the tabs
      this.tabs.forEach((tab, index) => {
        tab.isActive = (index === i)
      })
    }
  }
};
</script>
<style scoped>
   ul.tabs__header {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  ul.tabs__header > li {
    padding: 5px 10px;
    border-radius: 10px;
    margin: 0;
    display: inline-block;
    margin-right: 0.2em;
    cursor: pointer;
    margin-bottom: 0.2em;
  }

  ul.tabs__header > li.tab__selected {
    font-weight: bold;
    background-color: var(--secondary-color);
    color:white;

  }
  .tabs__light li {
    background-color: #ddd;
    color: #aaa;
  }

  .tabs__light li.tab__selected {
    background-color: #fff;
    color: #494D4B;
  }
</style>