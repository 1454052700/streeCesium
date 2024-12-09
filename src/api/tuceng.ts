import { Request } from '../utils/request';
const projectId = '';


// 构建列表
export function memberList(parameter: any) {
    return Request.axiosInstance({
        url: '/layer/layer/list',
        method: 'get',
        params: parameter
    })
}

// 查询构件一二级类型
export function modelType(parameter: any) {
    return Request.axiosInstance({
        url: '/layer_menu/layermenu/list',
        method: 'get',
        params: parameter
    })
}

// 新增构件类型
export function submitType(parameter: any) {
    return Request.axiosInstance({
        url: '/layer_menu/layermenu/submit',
        method: 'post',
        data: parameter
    })
}

// 删除构件类型
export function removeType(parameter: any) {
    return Request.axiosInstance({
        url: '/layer_menu/layermenu/remove',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

// 新增构件
export function submitModel(parameter: any) {
    return Request.axiosInstance({
        url: '/layer/layer/submitnew',
        method: 'post',
        data: parameter
    })
}

// 删除构件
export function removeModel(parameter: any) {
    return Request.axiosInstance({
        url: '/layer/layer/remove',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

// 范围
export function allRange(parameter: any) {
    return Request.axiosInstance({
        url: '/blade-system/dict-biz/dictionary',
        method: 'get',
        params: parameter
    })
}

//分片上传文件
export function getUploadSection(parameter: any) {
    return Request.axiosInstance({
        timeout: 1000 * 60 * 10,
        url: `/files/upload/uploadSection2`,
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter,
    })
}

//合并文件
export function getUploadMerge(parameter: any) {
    return Request.axiosInstance({
        timeout: 1000 * 60 * 10,
        url: `/files/upload/uploadMerge2`,
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter,
    })
}

export function getGeoPosition(parameter: any) {
    return Request.axiosInstance({
        url: '/layer/layer/getGeoPosition',
        method: 'get',
        params: parameter
    })
}