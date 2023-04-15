<template>
  <VueForceGraph3D graphData="{myData}" />
</template>

<script>
import HelloWorldVue from "./components/HelloWorld.vue";
import {
  VueForceGraph2D,
  VueForceGraph3D,
  VueForceGraphVR,
  VueForceGraphAR,
  GraphContextMenu,
} from "vue-force-graph";

export default {
  name: "App",
  components: {
    VueForceGraph3D,
  },
  data() {
    return {
      myData: {
        nodes: {},
      },
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
