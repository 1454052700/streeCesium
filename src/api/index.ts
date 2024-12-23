import axios from "axios";
import { Request, Request3, Request4 } from '../utils/request';

export const instance = axios.create({
    timeout: 10000 // 10秒超时
});

export function getDirection(parameter: any) {
    return Request3.axiosInstance({
        url: `/v3/direction/walking?origin=${parameter.origin}&destination=${parameter.destination}&output=${parameter.output}&key=${parameter.key}`
    })
}

export function pipelineallpoint(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/treeListNew',
        method: 'get',
        params: parameter
    })
}


export function reconstructionList(parameter: any) {
    return Request.axiosInstance({
        url: '/reconstruction/reconstruction/list',
        method: 'get',
        params: parameter
    })
}

export function reconstructionSubmit(parameter: any) {
    return Request.axiosInstance({
        url: '/reconstruction/reconstruction/update',
        method: 'post',
        data: parameter
    })
}

export function removeModel(parameter: any) {
    return Request.axiosInstance({
        url: '/reconstruction/reconstruction/remove',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

export function poiList(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/list2',
        method: 'get',
        params: parameter
    })
}

export function attributeList(parameter: any) {
    return Request.axiosInstance({
        url: '/Attribute/Attribute/list',
        method: 'get',
        params: parameter
    })
}

export function iconList(parameter: any) {
    return Request.axiosInstance({
        url: '/icon/icon/list',
        method: 'get',
        params: parameter
    })
}

export function poiSubmit(parameter: any) {
    return Request.axiosInstance({
        url: '/poi/poi/submit',
        method: 'post',
        data: parameter
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

export function uploadImages(parameter: any) {
    return Request.axiosInstance({
        url: '/files/upload/images',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

export const roadList = async () => {
    const res = await instance.get("/road_new/scenetree.json");
    return res.data;
}