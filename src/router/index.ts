// import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// 路由类型:RouteRecordRaw
const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: () => import("../pages/Home.vue"),
    },
];

const router = createRouter({
    // 路由模式
    history: createWebHistory(),
    routes,
});

export default router;
