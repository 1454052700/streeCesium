import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus'
import router from '../router/index'
export class Request {
    public static axiosInstance: AxiosInstance;
    public static init() {
        // 创建axios实例
        this.axiosInstance = axios.create({
            baseURL: '/api',
            // timeout: 120000,//一分钟60000
            headers: {
                'Authorization': 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
            }
        });
        // 初始化拦截器
        // this.initInterceptors();
        return axios;
    }
    // 初始化拦截器
    public static initInterceptors() {
        // 设置post请求头
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';
        /**
         * 请求拦截器
         * 每次请求前，如果存在token则在请求头中携带token
         */
        this.axiosInstance.interceptors.request.use(
            //@ts-ignore
            (config: AxiosRequestConfig) => {
                const token = localStorage.getItem('ACCESS_TOKEN');
                if (token) {
                    //@ts-ignore
                    config.headers['Blade-Auth'] = token;
                } else {
                    router.push('/')
                }
                return config;
            },
            (error: any) => {
                console.log(error);
            },
        );
        // 响应拦截器
        this.axiosInstance.interceptors.response.use(
            // 请求成功
            (response: AxiosResponse) => {
                // if (res.headers.authorization) {
                //     localStorage.setItem('id_token', res.headers.authorization);
                // } else {
                //     if (res.data && res.data.token) {
                //         localStorage.setItem('id_token', res.data.token);
                //     }
                // }
                // console.log(response, 'response')
                if (response.status === 200) {
                    // return Promise.resolve(response.data);
                    if (response.data.code != 200) {
                        // 接口请求错误
                        Request.errorHandle(response);
                    }
                    return response;
                } else {
                    ElMessage({
                        type: "error",
                        message: "连接错误",
                    });
                    // Request.errorHandle(response);
                    // return Promise.reject(response.data);
                    return response;
                }
            },
            // 请求失败
            (error: any) => {
                const { response } = error;
                if (response) {
                    // 请求已发出，但是不在2xx的范围
                    Request.errorHandle(response);
                    return Promise.reject(response.data);
                } else {
                    // 处理断网的情况
                    // eg:请求超时或断网时，更新state的network状态
                    // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
                    // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
                    ElMessage({
                        type: "error",
                        message: "网络连接异常,请稍后再试!",
                    });

                    setTimeout(() => {
                        router.push('/')
                    }, 1000)
                }
            });
    }
    /*
     * http握手错误
     * @param res 响应回调,根据不同响应进行不同操作
     */

    private static errorHandle(res: any) {
        if (res.status == 200 && res.data.code == 400) {
            ElMessage({
                type: "error",
                message: res.data.msg,
            });
            return false;
        }

        // 状态码判断
        console.log(res.status, res.data.code)
        switch (res.data.code) {
            case 401:
                ElMessage.warning('登录超时，请重新登陆...');
                router.push('/')
                break;
            case 500:
                // ElMessage.error('连接错误');
                // router.push('/')
                break;
            // case 404:
            //     ElMessage.error('请求的资源不存在');
            //     break;
            // default:
            //     ElMessage.error('连接错误');
        }
    }
}

export class Request2 {
    public static axiosInstance2: AxiosInstance;
    public static init() {
        // 创建axios实例
        this.axiosInstance2 = axios.create({
            baseURL: '/3001Api',
            // timeout: 60000,
            headers: {
                'Authorization': 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
            }
        });
        // 初始化拦截器
        // this.initInterceptors();
        return axios;
    }
    // 初始化拦截器
    public static initInterceptors() {
        // 设置post请求头
        this.axiosInstance2.defaults.headers.post['Content-Type'] = 'application/json';
        /**
         * 请求拦截器
         * 每次请求前，如果存在token则在请求头中携带token
         */
        this.axiosInstance2.interceptors.request.use(
            //@ts-ignore
            (config: AxiosRequestConfig) => {
                // const token = Vue.ls.get(ACCESS_TOKEN)
                // if (token) {
                //     config.headers['Authorization'] = 'Bearer ' + token
                // }
                // 登录流程控制中，根据本地是否存在token判断用户的登录情况
                // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
                // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
                // if (config.headers.isJwt) {
                // const token = localStorage.getItem('ACCESS_TOKEN');
                // if (token) {
                //     config.headers.Authorization = 'Bearer ' + token;
                // }
                // }

                const token = localStorage.getItem('ACCESS_TOKEN');
                if (token) {
                    //@ts-ignore
                    config.headers['Blade-Auth'] = token;
                } else {
                    router.push('/')
                }
                return config;
            },
            (error: any) => {
                console.log(error);
            },
        );
        // 响应拦截器
        this.axiosInstance2.interceptors.response.use(
            // 请求成功
            (response: AxiosResponse) => {
                // if (res.headers.authorization) {
                //     localStorage.setItem('id_token', res.headers.authorization);
                // } else {
                //     if (res.data && res.data.token) {
                //         localStorage.setItem('id_token', res.data.token);
                //     }
                // }
                if (response.status === 200) {
                    // return Promise.resolve(response.data);
                    if (response.data.code != 200) {
                        // 接口请求错误
                        Request2.errorHandle(response);
                    }
                    return response;
                } else {
                    ElMessage({
                        type: "error",
                        message: "连接错误",
                    });
                    // Request2.errorHandle(response);
                    // return Promise.reject(response.data);
                    return response;
                }
            },
            // 请求失败
            (error: any) => {
                const { response } = error;
                if (response) {
                    // 请求已发出，但是不在2xx的范围
                    Request2.errorHandle(response);
                    return Promise.reject(response.data);
                } else {
                    // 处理断网的情况
                    // eg:请求超时或断网时，更新state的network状态
                    // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
                    // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
                    // ElMessage({
                    //     type: "error",
                    //     message: "网络连接异常,请稍后再试!",
                    // });

                    setTimeout(() => {
                        router.push('/')
                    }, 1000)
                }
            });
    }
    /*
     * http握手错误
     * @param res 响应回调,根据不同响应进行不同操作
     */

    private static errorHandle(res: any) {
        if (res.status == 200 && res.data.code == 400) {
            ElMessage({
                type: "error",
                message: res.data.msg,
            });
            return false;
        }

        // 状态码判断
        console.log(res.status, res.data.code)
        switch (res.data.code) {
            case 401:
                ElMessage.warning('登录超时，请重新登陆...');
                router.push('/')
                break;
            case 500:
                // ElMessage.error('连接错误');
                // router.push('/')
                break;
            // case 404:
            //     ElMessage.error('请求的资源不存在');
            //     break;
            // default:
            //     ElMessage.error('连接错误');
        }
    }
}

export class Request3 {
    public static axiosInstance: AxiosInstance;
    public static init() {
        // 创建axios实例
        this.axiosInstance = axios.create({
            baseURL: '/gdApi',
            // timeout: 60000,
            headers: {
                'Authorization': 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
            }
        });
        // 初始化拦截器
        // this.initInterceptors();
        return axios;
    }
    // 初始化拦截器
    public static initInterceptors() {
        // 设置post请求头
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';
        /**
         * 请求拦截器
         * 每次请求前，如果存在token则在请求头中携带token
         */
        this.axiosInstance.interceptors.request.use(
            //@ts-ignore
            (config: AxiosRequestConfig) => {

                const token = localStorage.getItem('ACCESS_TOKEN');
                if (token) {
                    //@ts-ignore
                    config.headers['Blade-Auth'] = token;
                } else {
                    router.push('/')
                }
                return config;
            },
            (error: any) => {
                console.log(error);
            },
        );
        // 响应拦截器
        this.axiosInstance.interceptors.response.use(
            // 请求成功
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    // return Promise.resolve(response.data);
                    if (response.data.code != 200) {
                        // 接口请求错误
                        Request3.errorHandle(response);
                    }
                    return response;
                } else {
                    ElMessage({
                        type: "error",
                        message: "连接错误",
                    });
                    return response;
                }
            },
            // 请求失败
            (error: any) => {
                const { response } = error;
                if (response) {
                    // 请求已发出，但是不在2xx的范围
                    Request3.errorHandle(response);
                    return Promise.reject(response.data);
                } else {


                    setTimeout(() => {
                        router.push('/')
                    }, 1000)
                }
            });
    }
    /*
     * http握手错误
     * @param res 响应回调,根据不同响应进行不同操作
     */

    private static errorHandle(res: any) {
        if (res.status == 200 && res.data.code == 400) {
            ElMessage({
                type: "error",
                message: res.data.msg,
            });
            return false;
        }

        // 状态码判断
        console.log(res.status, res.data.code)
        switch (res.data.code) {
            case 401:
                ElMessage.warning('登录超时，请重新登陆...');
                router.push('/')
                break;
            case 500:
                break;
        }
    }
}

export class Request4 {
    public static axiosInstance: AxiosInstance;
    public static init() {
        // 创建axios实例
        this.axiosInstance = axios.create({
            baseURL: '/dgApi',
            // timeout: 60000,
            headers: {
                'Authorization': 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
            }
        });
        // 初始化拦截器
        // this.initInterceptors();
        return axios;
    }
    // 初始化拦截器
    public static initInterceptors() {
        // 设置post请求头
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';
        /**
         * 请求拦截器
         * 每次请求前，如果存在token则在请求头中携带token
         */
        this.axiosInstance.interceptors.request.use(
            //@ts-ignore
            (config: AxiosRequestConfig) => {

                const token = localStorage.getItem('ACCESS_TOKEN');
                if (token) {
                    //@ts-ignore
                    config.headers['Blade-Auth'] = token;
                } else {
                    router.push('/')
                }
                return config;
            },
            (error: any) => {
                console.log(error);
            },
        );
        // 响应拦截器
        this.axiosInstance.interceptors.response.use(
            // 请求成功
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    // return Promise.resolve(response.data);
                    if (response.data.code != 200) {
                        // 接口请求错误
                        Request4.errorHandle(response);
                    }
                    return response;
                } else {
                    ElMessage({
                        type: "error",
                        message: "连接错误",
                    });
                    return response;
                }
            },
            // 请求失败
            (error: any) => {
                const { response } = error;
                if (response) {
                    // 请求已发出，但是不在2xx的范围
                    Request4.errorHandle(response);
                    return Promise.reject(response.data);
                } else {


                    setTimeout(() => {
                        router.push('/')
                    }, 1000)
                }
            });
    }
    /*
     * http握手错误
     * @param res 响应回调,根据不同响应进行不同操作
     */

    private static errorHandle(res: any) {
        if (res.status == 200 && res.data.code == 400) {
            ElMessage({
                type: "error",
                message: res.data.msg,
            });
            return false;
        }

        // 状态码判断
        console.log(res.status, res.data.code)
        switch (res.data.code) {
            case 401:
                ElMessage.warning('登录超时，请重新登陆...');
                router.push('/')
                break;
            case 500:
                break;
        }
    }
}