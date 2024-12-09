import { Request } from '../utils/request';
export function poiList(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/list',
        method: 'get',
        params: parameter
    })
}

export function poiList2(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/list2',
        method: 'get',
        params: parameter
    })
}

// zichangjin
export function childSceneList(parameter: any) {
    return Request.axiosInstance({
        url: '/ChildScene/ChildScene/list',
        method: 'get',
        params: parameter
    })
}

export function childSceneSubmit(parameter: any) {
    return Request.axiosInstance({
        url: '/ChildScene/ChildScene/submit',
        method: 'post',
        data: parameter
    })
}

export function childSceneRemove(parameter: any) {
    return Request.axiosInstance({
        url: '/ChildScene/ChildScene/remove',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

export function getFileNameList(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/getFileNameList',
        method: 'get',
        params: parameter
    })
}

export function delByFileName(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/delByFileName',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

export function removePoi(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/remove',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

// lieixng
export function getcount(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/getcount',
        method: 'get',
        params: parameter
    })
}

export function getZtCount(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/getZtCount',
        method: 'get',
        params: parameter
    })
}

export function addPoisubmit(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/submit',
        method: 'post',
        data: parameter
    })
}

export function uploadExcel(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/import-pipeline-excel',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

export function uploadShp(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/import-pipeline-shp',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

