<template>
  
    <router-link tag="li" :to="{ name: item.serviceType, params: { serviceId: item.id }}">{{ item.title }}</router-link>
  
</template>

<script>
export default {
name: 'ListItem',
  props: {
    item: { required: true, type: Object },
  },
  computed:{
  },
  mounted(){
  }
};
</script>
<style scoped>
li{
    display: block ;
    padding: 8px 16px;
    border-bottom: 1px solid #ddd;
}
li:hover{
    background-color: var(--secondary-color); 
}
</style>