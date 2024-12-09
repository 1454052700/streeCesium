<template>
	<div class="intensity-Control">
		<el-slider :percentage="sliderVal" @input="slidingBlock" v-model="sliderVal" vertical height="120px">
		</el-slider>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { Web3DUtils } from "@/web3d";
const sliderVal = ref(100);

// slidingBlock(sliderVal.value);
function slidingBlock(val: any) {
	sliderVal.value = val;
	Web3DUtils.cesiumUtils.setSceneAlpha(val);
}
</script>