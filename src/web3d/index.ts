import { CesiumUtils } from "./cesium/cesiumUtils";

// 项目中所有的3D内容都用Web3DUtils这个对象拓展出来，例如cesium、echarts
export const Web3DUtils = {
    cesiumUtils: null as unknown as CesiumUtils, // 访问时注意：这里最开始是null，真正成为CesiumUtils在App.vue中赋值。
}

// 用于方便开发调试，发布版不建议放出
// if(import.meta.env.DEV){
window.Web3DUtils = Web3DUtils;
// }