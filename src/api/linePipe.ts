import { Request, Request2 } from '../utils/request';
const projectId = '';

// 范围
export function allRange(parameter: any) {
    return Request.axiosInstance({
        url: '/blade-system/dict-biz/dictionary',
        method: 'get',
        params: parameter
    })
}

export function uploadExcel(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/import-pipeline-excel',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

export function uploadMdb(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/importRegionMdbAll',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

export function uploadShp(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/import-pipeline-shp-all',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

export function uploadFiles(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/importPipeline',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        data: parameter
    })
}

// 提交
export function importPipelineSubmit(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/importPipelineSubmit',
        method: 'post',
        data: parameter
    })
}

// 管线统计
export function pipelineCount(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/pipelineCount',
        method: 'get',
        params: parameter
    })
}

// 管线信息（加载地图用）
export function queryPointList(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/queryPointList',
        method: 'get',
        params: parameter
    })
}


// 查询管点详情
export function pointDetail(parameter: any) {
    return Request.axiosInstance({
        url: 'pipelineallpoint/detail',//'/pipeline/pipeline/pointDetail',
        method: 'get',
        params: parameter
    })
}


export function pipelinelineList(parameter: any) {
    return Request.axiosInstance({
        url: 'pipelineallpoint/treeList',//pipeline/pipeline/pipelineManageTreeList',
        method: 'get',
        params: parameter
    })
}

// 管线图幅号列表
export function pipelineManageSubList(parameter: any) {
    return Request.axiosInstance({
        url: 'pipeline/pipeline/pipelineManageSubList',
        method: 'get',
        params: parameter
    })
}

// 获取管线模型
export function getPipelineModel(modelId: string) {
    return Request.axiosInstance({
        url: `/model/model/detail?id=${modelId}&projectId=${projectId}`
    })
}
// 批量获取管线模型
export function getMultiPipelineModel(ids: string, projectId: string) {
    return Request.axiosInstance({
        url: `/model/model/batchDetail?ids=${ids}&projectId=${projectId}`
    })
}
// 导入管线URL
export function importUrl(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/importUrl',
        method: 'get',
        params: parameter
    })
}

// 地下管线列表
export function pipelineListDoit(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipelinepoint/list',
        method: 'get',
        params: parameter
    })
}
// 地下管点列表
export function pipelineList(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/list',
        method: 'get',
        params: parameter
    })
}
// 获取管线信息
export function getPipelineInfo(params: {
    code: string,
    connectCode: string,
    pSn: string,
    projectId: string
}) {
    return Request.axiosInstance({
        url: `/pipeline/pipelineline/detail?code=${params.code}&connectCode=${params.connectCode}&pSn=${params.pSn}&projectId=${params.projectId}`,
        method: 'get',
    })
}



export function getDpInfo(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/dropbundles/getDpInfo',
        method: 'get',
        params: parameter
    })
}

// 地下管点列表
export function cancelUpload(parameter: any) {
    return Request.axiosInstance({
        url: '/pipeline/pipeline/cancelUpload',
        method: 'post',
        data: parameter
    })
}


// 登录
export function login3001(parameter: any) {
    return Request2.axiosInstance2({
        url: '/user/login',
        method: 'post',
        data: {
            ...parameter
        }
    })
}

// 查询管线数据批次及PSN
export function getPsn(parameter: any) {
    return Request.axiosInstance({
        url: 'pipelineallpoint/getPsn',
        method: 'get',
        params: parameter
    })
}

export function rangePoint(parameter: any) {
    return Request.axiosInstance({
        url: 'line-point/linepoint/selectLinePointRangeByAllPoint',
        method: 'get',
        params: parameter
    })
}

export function deletePipe(parameter: any) {
    return Request.axiosInstance({
        url: 'pipelineallpoint/delByPsn',
        method: 'post',
        headers: {
            'Content-Type': 'mutipart/form-data'
        },
        params: parameter
    })
}

export function calibration(parameter: any) {
    return Request.axiosInstance({
        url: '/pipelineallpoint/submit',
        method: 'post',
        data: parameter
    })
}