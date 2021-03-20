<template lang="html">
  
</template>

<script>
import FeatureInfoTable from './FeatureInfoTable.vue'

export default {
  components: {
    FeatureInfoTable
   },
  props: {
    ftCollections: {type:Array},
    mode: {
      type: String,
      default: 'light',
    }
  },
  data () {
    return {
        selectedIndex: 0, // the index of the selected tab,
        tabs: []    // all of the tabs
    }
  },
  created () {
    this.tabs = this.$children
  },
  computed: {
    selectedFtCollection(){
      return this.ftCollections[this.selectedIndex]
    }
    // featureInfoTable(){
    //   let ftCollection = 
    //   let result = ''
    //   ftCollection.features.forEach(ft => {
    //     let table = this.genTableFromKVPs(ft.properties)
    //     result += table.outerHTML
    //   })
    //   return result
    // }
  },
  mounted () {
    this.selectTab(0)
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
}
</script>

<style lang="css">

 

</style>