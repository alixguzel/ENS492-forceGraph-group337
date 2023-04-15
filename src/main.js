import { createApp } from "vue";
import App from "./App.vue";

import {
  VueForceGraph2D,
  VueForceGraph3D,
  VueForceGraphVR,
  VueForceGraphAR,
  GraphContextMenu
} from "vue-force-graph";

createApp(App).use(VueForceGraph3D).mount("#app");