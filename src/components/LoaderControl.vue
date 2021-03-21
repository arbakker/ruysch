<template>
  <div class="loader-wrapper">
    <div>
      <div class="loader"></div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoaderControl",
  props: {
    message: { required: true, type: String },
  },
  computed: {},
  mounted() {},
};
</script>
<style scoped>
.loader-wrapper{
  margin: auto;
  max-width: 980px;
  text-align:center;  
  margin-top:2em;
}
.loader{
  margin:auto;
}

.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid var(--primary-color); /* Blue */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>