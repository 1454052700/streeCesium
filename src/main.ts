import { createApp } from 'vue'
const app = createApp(App)
import './style.scss'
import './common.scss'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./router"
import { Ion } from "cesium"

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

import { Request, Request2, Request3, Request4 } from './utils/request';
import VueAxios from 'vue-axios'

window.CESIUM_BASE_URL = '/libs/cesium/';
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOTNkMWU3NS0wM2JiLTQ4NmMtYTgyNi05NWU3MWVjMWEzMmYiLCJpZCI6NzE0MzQsImlhdCI6MTYzNTIxNjIyMX0.QnoSt0kZkqKMAL_9EHw6toCwONY-Ao2mRwYpS36FLAk";

import i18n from "./utils/lang/i18n";
app.use(i18n)

// 
app.use(router).use(ElementPlus).use(VueAxios, Request.init()).use(VueAxios, Request2.init()).use(VueAxios, Request3.init()).use(VueAxios, Request4.init()).mount('#app')
