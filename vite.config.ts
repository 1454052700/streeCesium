import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
// import postCssPxToRem from "postcss-pxtorem"
// http://xqkme.kuchuangnet.com:20010/prod-api/api/screen/progress
// https://xqkme.kuchuangnet.com:20011/prod-api/api/screen/progress
let testUrl = 'http://xqkme.kuchuangnet.com:20010/';
let masterUrl = 'https://xqkme.kuchuangnet.com:20011/'; //'hj.easyar.cn';

let ip = testUrl;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    server: {
        proxy: {
            "/api": {
                target: ip,
                secure: false, // 请求是否为https
                changeOrigin: true, // 是否跨域
                rewrite: (path) => path.replace(/^\/api/, "")
            },
            "/dgApi": {
                target: "http://" + ip + ":18215/",//"http://120.237.115.74:18215/",http://47.238.143.171:18215/
                secure: false, // 请求是否为https
                changeOrigin: true, // 是否跨域
                rewrite: (path) => path.replace(/^\/dgApi/, "")
            },
            "/imgApi": {
                target: "http://" + ip + ":18214/",
                secure: false, // 请求是否为https
                changeOrigin: true, // 是否跨域
                rewrite: (path) => path.replace(/^\/imgApi/, "")
            },
            "/3001UrlApi": {
                target: "http://" + ip + (ip == masterUrl ? ":18215/" : ':8088/'),
                secure: false, // 请求是否为https
                changeOrigin: true, // 是否跨域
                rewrite: (path) => path.replace(/^\/3001UrlApi/, "")
            },
            //废弃
            "/3001Api": {
                target: "http://" + ip + ":3001/", // 请求域名 
                secure: false, // 请求是否为https
                changeOrigin: true, // 是否跨域
                rewrite: (path) => path.replace(/^\/3001Api/, "")
            },
        }
    },
    resolve: {
        // 配置路径别名
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        // 此代码为适配移动端px2rem
        postcss: {
            plugins: [
                // postCssPxToRem(
                //     {
                //         rootValue: 37.5, // 1rem的大小
                //         propList: ['*', "!border"], // 需要转换的属性，这里选择全部都进行转换
                //         selectorBlackList: [".el-"]
                //     }
                // )
            ]
        }
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
})
