<template>
    <div class="container">
        <!-- :locale="lang[language]" -->
        <el-config-provider>
            <router-view v-if="flag"></router-view>
        </el-config-provider>
    </div>
</template>
<script lang="ts" setup>
import { reactive, toRefs, defineComponent, ref, nextTick, provide, computed } from "vue";
//引入下面两项
import { ElConfigProvider } from "element-plus";

const flag = ref(true);
const reload = () => {
    flag.value = false;
    nextTick(() => {
        flag.value = true;
    });
};
provide("reload", reload);
</script>

<style lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.tooltipBox {
    margin-right: 10px !important;
}

//
* {
    margin: 0;
    padding: 0;
}

.el-input__wrapper {
    background-color: transparent !important;
    box-shadow: inherit !important;
}


.required {
    position: relative;

    &::before {
        content: "*";
        color: red;
        margin-right: 4px;
    }
}

.zhizhen {
    position: absolute;
    left: 16px;
    bottom: 16px;
    background-color: #2E3436;
    border-radius: 20px;
    width: 37px;
    height: 37px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
        width: 24px;
        height: 24px;
    }
}

.ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    cursor: pointer;
}
</style>
