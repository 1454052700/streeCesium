// import { AddGLTFPosition, Jesium } from "@even_jie/jesium";
import { Jesium } from "../jesium.js";
import { DrawTools } from "../DrawTool_polyLine.js";
import proj4 from 'proj4';
import * as Cesium from "cesium"
import * as turf from "@turf/turf"
import Billboard from "cesium/Source/Scene/Billboard";
import Label from "cesium/Source/Scene/Label";
import { getMultiPipelineModel, getPipelineInfo, pipelineList, getPipelineModel, login3001, getDpInfo } from "../../api/linePipe.js";
import dayjs from "dayjs";
import { CONFIG } from "../../config/config";
import { Ref, nextTick, ref } from "vue";
import { ElMessage } from "element-plus";
import {
    memberList,
    getGeoPosition
} from "../../api/tuceng";
import { Cartesian3, Cartographic, Color, HeightReference, HorizontalOrigin, Material, ScreenSpaceEventType, VerticalOrigin, Viewer, Cartesian2, Entity, CallbackProperty, DistanceDisplayCondition, PolygonHierarchy, LabelStyle } from "cesium";
import { cartesian3ToLonLat, twoToCenter } from "@/utils/util.js";
import i18n from "@/utils/lang/i18n";
import { attributeList } from "@/api/index.js";
import { Cartesian2turfPolygon, CubeInfo, CutAndFillResult, getAreaFromCartograohics, getBounds, intersect, pickCartesian } from "./computeCutAndFillVolumeVoronoi.js";
const projectId = '';

const t: any = i18n.global.t;
const distance = t('lang.distance');
const depth = t('lang.depth');
const m = t('lang.m');
const v_449 = 0;// 449.45;

export enum BaseImageryType {
    IMAGERY = "imagery",
    ELECTRONCIS = "electroncis"
}

export declare type AddGLTFPosition = {
    longitude: number;
    latitude: number;
    rotationY: number;
    rotationX: number;
    rotationZ: number;
    scale: number;
    height: number;
    curModelCustomProperty?: any;
};
/**
 * 管点icon图片地址枚举
 */
export enum pipePointIconEnum {
    // 待分配
    WILL_DISTRIBUTION = "/images/cesium/WillDistribution.png",
    // 待核查
    WILL_CHECK = "/images/cesium/WillCheck.png",
    // 异常
    WARNING = "/images/cesium/wentiPoint.png",
    // 已核查
    CHECKED = "/images/cesium/hechaing.png"
}


/**
 * 管线区域状态枚举（颜色）
 */
export const pipeAreaStatusColorMap = {
    // 待分配（灰色）
    WILL_DISTRIBUTION: [255 / 255, 255 / 255, 255 / 255],
    // 延期（红色）
    POSTPONE: [255 / 255, 0 / 255, 0 / 255],
    // 待完成（蓝色）
    WILL_FINISH: [0 / 255, 162 / 255, 255 / 255],
    // 完成（绿色）
    FINISH: [6 / 255, 252 / 255, 156 / 255]
}

/**
 * 管线区域状态枚举（颜色）
 */
export const tuceng = {
    J: Cesium.Color.fromCssColorString('#00B2FF'),
    W: Cesium.Color.fromCssColorString('#F03C83'),
    Y: Cesium.Color.fromCssColorString('#6DC344'),
    R: Cesium.Color.fromCssColorString('#E95527'),
    L: Cesium.Color.fromCssColorString('#B79B07'),
    D: Cesium.Color.fromCssColorString('#7A168D'),
}

/**
 * 管线类型字典
 */
export const PipeLineType = {
    // 污水
    2: "/images/cesium/WuShuiFlowLine.png",
    // 给水
    1: "/images/cesium/JiShuiFlowLine.png",
    // 电信
    6: "/images/cesium/DianXinFlowLine.png",
    // 燃气
    4: "/images/cesium/TianRanQiFlowLine.png",
    // 雨水
    3: "/images/cesium/YuShuiFlowLine.png",
    // 移动
    5: "/images/cesium/YiDongFlowLine.png",
    // 联通
    7: "/images/cesium/LianTongFlowLine.png",
    // 有线电视
    8: "/images/cesium/YouXianDianShiFlowLine.png",
    // 交通信号
    9: "/images/cesium/JiaoTongXinHaoFlowLine.png",
    // 监控信号
    10: "/images/cesium/JianKongXinHaoFlowLine.png",
    // 路灯
    11: "/images/cesium/LuDengFlowLine.png",
    // 电力
    12: "/images/cesium/DianXianFlowLine.png"
}

export const pipeLineColor = {
    'A': "Red",
    'B': "Green",
    'C': "Blue",
    'D': "Yellow",
    'E': "White",
    'F': "Gray",
    'G': "Brown",
    'Z': "Empty",
    "null": 'Empty',
    "": 'Empty',
}

export const category = {
    1: 'Feeder',
    2: 'Branch',
    3: 'Distribution',
    4: 'Drop',
    5: 'Indoor',
    6: 'Backbone',
    7: 'L1 Distribution',
    8: 'L2 Distribution',
    "null": 'Empty',
    "": '',
}

export const bundle_size = {
    '1*7/4': "microduct type 7/4",
    '1*10/6': "microduct type 10/6",
    '2*7/4': "2 microduct type 7/4",
    '2*12/8': "2 microducts type 12/8",
    '7*10/6': "7 microducts type 10/6",
    '7*12/8': "7 microducts type 12/8",
    '7*14/10': "7 microtubes type 14/10",
    '7*16/12': "7 microtubes type 16/12",
    "7*20/16": '7 microducts type 20/16',
    "12*7*4": '12 microducts type 7*4',
    "12*7/4": '12 microducts type 7/4',
    "12*10/6": '12 microducts type 10/6',
    "16*20/16": '16 microducts type 20/16',
    "24*7/4": '24 microducts type 7/4',
}


export class CesiumUtils {
    jesium: Jesium

    private oId: any;

    // 管线数据
    private pipeData: any = [];
    private pipeLineData: any = [];

    // 最小最大高度
    private globeMiniumHeight: number = 0;
    private curMiniumHeight = 21.926520017468043

    /* polygon面积测量相关属性 */
    private __polygonCoords: Cesium.Cartesian3[] = []
    private __dynamicPolygon: Cesium.Entity | null = null
    private __polygon: Cesium.Entity | null = null
    private __polygonLeftClick: (() => void) | undefined
    private __polygonMouseMove: (() => void) | undefined
    private __polygonRightClick: (() => void) | undefined
    private __polygonPeoplePOI: [Billboard, Label] | undefined;
    private __polygonList: Cesium.Entity[] = []; // 所有绘制的多边形数组
    removeSelectPolygon: (() => void) | undefined
    private __polygonPeoplePOIList: [Billboard, Label][] = []

    /* 添加poi功能相关属性 */
    private poiPosition: Cesium.Cartesian3 | null = null
    private poiBillboard: Billboard | null = null
    private poiLabel: Label | null = null
    private poiList: [Billboard, Label][] = []
    quitAddPoiMode: (() => void) | null = null

    private glTimer: any = null;
    private realbillboard: any = null;

    /* 固定POI相关属性 */
    private gudingPOIList: [Entity, Label][] = []
    clickPOICallBack: ((property: any) => void) | null = null
    private currentShowLabel: Label | null = null;

    // clickclenCallBack: ((poi1: any, poi2: any, clType: any, number: any) => void) | null = null
    clickclenCallBack: ((list: any, rId?: any) => void) | null = null

    /* 管线加载相关属性 */
    private __pipleBillboards: Billboard[] = [] // 管线加载的所有广告牌
    private __pipelineLines: Cesium.Entity[] = [] // 管线加载的所有line
    private __pipelineGLBCollection: any = null;
    // 分配核查任务的POI点添加函数，用于选择完人员后调用
    addSelectPolygonPOI: ((areaProperties: any, pickedPipeData: any[]) => void) | null = null
    cancelSelectPolygon: (() => void) | null = null
    SelectPolygonList: any = []

    /* 加载已分配核查区域相关属性 */
    // 图幅号和cesium内容映射字典
    psnAndCesiumContentMap: {
        [psn: string]: {
            billboards: Billboard[],
            labels: Label[],
            modelCollection: any[],
            polygonAndPolylineEntity: Cesium.Entity[],
            areaContent: {
                billboard: Cesium.Billboard,
                labelList: Cesium.Label[],
                polygonEntity: Cesium.Entity,
                areaInfo: any
            }[],
            psnData?: {
                lineType: any,
                psn: any,
                normalPipeData: any,
                distributionPipeData: any,
                warningPipeData: any
            }
        }
    } = {}

    // 场景所有3dtiles的uuid集合
    private __scene3DTilesUUIDSet: string[] = []


    /* 搜索管点相关属性 */
    curSearchedPipeModel: any;

    /* 当前场景透明度相关属性 */
    curSceneAlpha = 100
    sceneAlphaChangeEvent: ((curAlpha: number) => void) | undefined

    /* 当前场景透明度相关属性 */
    curSceneAlpha2 = 100
    sceneAlphaChangeEvent2: ((curAlpha: number) => void) | undefined

    /* 点击管线管点相关属性 */
    processQueryPipeInfoCallBack: ((data: any) => void) | undefined

    curHeightLightPipeline: Cesium.Entity | undefined
    curHeightLightPipePointPOI: Cesium.Entity | undefined
    images: string[] = []
    imageIndex: number = 0;
    curFocusPipeData: any

    oldFetureList: any[] = []

    /* polyline线段测量相关属性 */
    private __polylineCoords: Cartesian3[] = [] // polyline点列表
    private __dynamicPolyline: Entity | null = null // 动态绘制的polyline
    private __polylineBillboards: Billboard[] = []  // polyline的点的广告牌
    private __polylineLabels: any[] = [] // polyline的点的label

    private __polylines: any[] = []
    private __polyline: Entity | null = null
    removeMouseMovePoi!: () => void;
    removeLeftClickPoi!: () => void;
    myLocationDta: any;
    imageCanvasBase64: any;
    movelongitude: any;
    movelatitude: any;
    private clBillboards: any[] = [];
    private clpolyline: any[] = [];
    entityCollection: any;
    handler: any;
    private PolylineDash: any[] = [];
    volumeBillboards: any[] = [];
    baseHeight: any = 1;

    constructor(container: HTMLDivElement, private sceneLoaded: (() => void)) {
        this.jesium = new Jesium(container);

        for (let i = 1; i < 77; i++) {
            this.images.push(`/images/cesium/hl/hl (${i}).png`);
        }
    }
    // 当前实时位置
    addnowLocation(location: any) {
        // var billboard: any = null;
        // let id = this.jesium.viewer.entities.getById(`real`);
        if (this.realbillboard) {
            this.jesium.modelUtils.removeBillboard(this.realbillboard);
        }

        this.realbillboard = this.jesium.modelUtils.addBillboard({
            image: "/img/qid.png",
            id: 'real',
            position: Cesium.Cartesian3.fromDegrees(
                Number(location[0]),
                Number(location[1]),
                0
            ),
            width: 40,
            height: 47,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, 0),
        });
    }

    getHeading(pointA: any, pointB: any) {
        console.log(pointA, pointB)
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        //向量AB
        const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
        //AB为世界坐标中的向量
        //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
        const vector = Cesium.Matrix4.multiplyByPointAsVector(
            Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
            positionvector,
            new Cesium.Cartesian3()
        );
        //归一化
        const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
        //heading
        let heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        heading = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
        // Cesium.Math.toDegrees(heading);
        return heading;
    }


    openTranslucency(isOpen: any) {
        // // 开启地表透明
        // this.jesium.viewer.scene.globe.translucency.enabled = isOpen;
        // this.jesium.viewer.scene.screenSpaceCameraController.enableCollisionDetection = !isOpen; //相机与地形的碰撞检测
        // this.jesium.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
        //     new Cesium.NearFarScalar(1.5e2, 1, 8.0e6, 1);
        // this.jesium.viewer.scene.globe.translucency.backFaceAlpha = 1;
        // this.changeTranslucency(1)

        this.jesium.viewer.scene.globe.depthTestAgainstTerrain = !isOpen;
        this.jesium.viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5;//调整相机惯性缩放时长
        this.jesium.viewer.scene.screenSpaceCameraController.enableCollisionDetection = !isOpen;//禁用相机与地形的碰撞检测
        // this.jesium.viewer.scene.highDynamicRange = !isOpen;//关闭高动态范围渲染
        // this.jesium.viewer.scene.skyAtmosphere.show = !isOpen;//关闭大气
        // this.jesium.viewer.scene.skyBox.show = !isOpen;//关闭天空盒
        // this.jesium.viewer.scene.fog.enabled = !isOpen;//关闭雾
        this.jesium.viewer.scene.globe.baseColor = Color.BLACK;//透明黑

        //当相机在地下或地球是半透明时渲染地球背面的颜色，根据相机的距离与地球颜色混合。
        this.jesium.viewer.scene.globe.undergroundColor = Color.BLACK;
        //获取或设置 Globe#undergroundColor 与地球颜色混合的近距离和远距离
        this.jesium.viewer.scene.globe.undergroundColorAlphaByDistance.near = 1000;
        this.jesium.viewer.scene.globe.undergroundColorAlphaByDistance.far = 1000000;
        this.jesium.viewer.scene.globe.undergroundColorAlphaByDistance.nearValue = 0;
        this.jesium.viewer.scene.globe.undergroundColorAlphaByDistance.farValue = 1;

        this.changeTranslucency(1)
    }

    changeTranslucency(alpha?: any) {
        alpha = Cesium.Math.clamp(alpha ? alpha : 1, 0.0, 1.0);

        // this.jesium.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue = alpha;//相机范围下限的值。
        // this.jesium.viewer.scene.globe.translucency.frontFaceAlphaByDistance.farValue = alpha;//相机范围上限的值。


        if (this.jesium.viewer.imageryLayers && this.jesium.viewer.imageryLayers.length > 0) {
            // 遍历所有的影像，把影像透明度调整为0.7
            for (let index = 0; index < this.jesium.viewer.imageryLayers.length; index++) {
                const layer = this.jesium.viewer.imageryLayers.get(index);
                layer.alpha = alpha;
            }
        }

        /**
         * 
         * 
        * 触发场景透明度变化事件
        */
        if (this.sceneAlphaChangeEvent2) {
            this.sceneAlphaChangeEvent2(this.curSceneAlpha2);
        }
    }

    /**基于本地的ENU坐标系的偏移，也就是垂直于地表向上为Z，东为X，北为Y
 * @param tileset Cesium3DTileset
 * @param dx x轴偏移量。单位：米
 * @param dy y轴偏移量。单位：米
 * @param dz z轴偏移量。单位：米
 */
    translate3dTileset(tileset: Cesium.Cesium3DTileset, dx: number, dy: number, dz: number) {
        if (dx === 0 && dy === 0 && dz === 0) return
        // 对于3DTileset，我们需要的结果是一个模型矩阵，那么平移就是计算一个世界坐标下的平移矩阵。
        // 获取中心点
        const origin = tileset.boundingSphere.center
        // 以该点建立ENU坐标系
        const toWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin)
        // 该坐标系下平移后的位置
        const translatePosition = new Cartesian3(dx, dy, dz)
        // 获取平移后位置的世界坐标
        const worldPosition = Cesium.Matrix4.multiplyByPoint(toWorldMatrix, translatePosition, new Cartesian3())
        // 计算世界坐标下的各个平移量
        const offset = Cartesian3.subtract(worldPosition, origin, new Cartesian3())
        // 从世界坐标下的平移量计算世界坐标的平移矩阵
        const translateMatrix = Cesium.Matrix4.fromTranslation(offset)
        // 应用平移矩阵。这里应该与原本的模型矩阵点乘，而不是直接赋值
        tileset.modelMatrix = Cesium.Matrix4.multiply(translateMatrix, tileset.modelMatrix, new Cesium.Matrix4())
        return tileset;
    }

    /**基于本地的ENU坐标系的缩放，也就是垂直于地表向上为Z，东为X，北为Y
 * @param tileset Cesium3DTileset
 * @param sx x轴缩放倍数
 * @param sy y轴缩放倍数
 * @param sz z轴缩放倍数
 */
    scale3dTileset(tileset: Cesium.Cesium3DTileset, sx: number, sy?: number, sz?: number) {
        // if (sx <= 0 || sy <= 0 || sz <= 0) throw Error('缩放倍数必须大于0')
        // if (sx === 1 && sy === 1 && sz === 1) return
        // 具体步骤是将3DTileset先转为ENU坐标系，再在ENU坐标系下计算缩放后的结果，再转回世界坐标系。一个步骤代表一个矩阵

        // //缩放 修改缩放比例
        // var scale = Cesium.Matrix4.fromUniformScale(sx);
        // var m = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);
        // Cesium.Matrix4.multiply(m, scale, m);
        // //赋值给tileset
        // tileset.root.transform = m;
        nextTick(() => {
            // 获取中心点。
            const origin = tileset.boundingSphere.center
            // 以该点建立ENU坐标系
            const toWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin)
            // 获取ENU矩阵的逆矩阵。也就是可以将世界坐标重新转为ENU坐标系的矩阵
            const toLocalMatrix = Cesium.Matrix4.inverse(toWorldMatrix, new Cesium.Matrix4())
            // 计算缩放矩阵
            const scaleMatrix = Cesium.Matrix4.fromScale(new Cartesian3(sx, sx, sx))
            // ENU坐标系下的结果矩阵
            const localResultMatrix = Cesium.Matrix4.multiply(scaleMatrix, toLocalMatrix, new Cesium.Matrix4())
            // 世界坐标系下的结果矩阵
            const worldResultMatrix = Cesium.Matrix4.multiply(toWorldMatrix, localResultMatrix, new Cesium.Matrix4())
            // 应用结果
            tileset.modelMatrix = Cesium.Matrix4.multiply(worldResultMatrix, tileset.modelMatrix, new Cesium.Matrix4())
        })
    }


    /**基于本地的ENU坐标系的旋转，也就是垂直于地表向上为Z，东为X，北为Y
     * @param tileset Cesium3DTileset
     * @param rx 绕X轴旋转的角度。单位：度
     * @param ry 绕Y轴旋转的角度。单位：度
     * @param rz 绕Z轴旋转的角度。单位：度
     */
    rotate3dTileset(tileset: any, rx: number, ry: number, rz: number) {
        if (rx === 0 && ry === 0 && rz === 0) return
        // 获取中心点。
        const origin = tileset.boundingSphere.center
        // 以该点建立ENU坐标系
        const toWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin)
        // 获取ENU矩阵的逆矩阵。也就是可以将世界坐标重新转为ENU坐标系的矩阵
        const toLocalMatrix = Cesium.Matrix4.inverse(toWorldMatrix, new Cesium.Matrix4())
        // 计算旋转矩阵
        const rotateMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY)
        if (rx !== 0) {
            const rotateXMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rx)))
            Cesium.Matrix4.multiply(rotateXMatrix, rotateMatrix, rotateMatrix)
        }
        if (ry !== 0) {
            const rotateYMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(ry)))
            Cesium.Matrix4.multiply(rotateYMatrix, rotateMatrix, rotateMatrix)
        }
        if (rz !== 0) {
            const rotateZMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rz)))
            Cesium.Matrix4.multiply(rotateZMatrix, rotateMatrix, rotateMatrix)
        }
        // ENU坐标系下的结果矩阵
        const localResultMatrix = Cesium.Matrix4.multiply(rotateMatrix, toLocalMatrix, new Cesium.Matrix4())
        // 世界坐标系下的结果矩阵
        const worldResultMatrix = Cesium.Matrix4.multiply(toWorldMatrix, localResultMatrix, new Cesium.Matrix4())
        // 应用结果
        tileset.modelMatrix = Cesium.Matrix4.multiply(worldResultMatrix, tileset.modelMatrix, new Cesium.Matrix4())

        return tileset;
    }

    // 调整位置
    realign3dTileset(row?: any, val?: any, type?: any, callback: ((coords: any) => void) = () => { }) {
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            // if (tileset.name.indexOf(row.name) != -1) {
            switch (type) {
                case 1:
                    tileset = this.translate3dTileset(tileset, val, 0, 0)
                    break;
                case 2:
                    tileset = this.translate3dTileset(tileset, 0, val, 0)
                    break;
                case 3:
                    tileset = this.translate3dTileset(tileset, 0, 0, val)
                    break;
                case 7:
                    tileset = this.rotate3dTileset(tileset, val, 0, 0)
                    break;
                case 8:
                    tileset = this.rotate3dTileset(tileset, 0, val, 0)
                    break;
                case 9:
                    tileset = this.rotate3dTileset(tileset, 0, 0, val)
                    break;
                default:
                    break;
            }
            // 获取矩阵
            nextTick(() => {
                console.log(tileset, 'tileset')
                var data = JSON.stringify(Cesium.Matrix4.toArray(tileset.modelMatrix))
                callback(data)
            })
            // }
        })
    }

    // 刨切
    slicing(clipObj: any, positions: any) {

        //计算坐标转换需要用到的矩阵的方法,参数：模型
        function getInverseTransform(tileSet: any) {
            let transform
            let tmp = tileSet._root.transform
            if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
                // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
                transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileSet.boundingSphere.center)
            } else {
                transform = Cesium.Matrix4.fromArray(tileSet.root.transform)
            }
            return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())
        }

        //对点进行坐标转换的方法
        function getOriginCoordinateSystemPoint(point: any, inverseTransform: any) {
            let val = Cesium.Cartesian3.fromDegrees(point[0], point[1])
            return Cesium.Matrix4.multiplyByPoint(inverseTransform, val, new Cesium.Cartesian3(0, 0, 0))
        }

        function createPlane(p1: any, p2: any, inverseTransform: any) {
            // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
            let p1C3 = getOriginCoordinateSystemPoint(p1, inverseTransform)
            let p2C3 = getOriginCoordinateSystemPoint(p2, inverseTransform)

            // 定义一个垂直向上的向量up
            let up = new Cesium.Cartesian3(0, 0, 10)
            //  right 实际上就是由p1指向p2的向量
            let right = Cesium.Cartesian3.subtract(p1C3, p2C3, new Cesium.Cartesian3())

            // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
            let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
            normal = Cesium.Cartesian3.normalize(normal, normal)

            //由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
            let planeTmp = Cesium.Plane.fromPointNormal(p1C3, normal)
            return Cesium.ClippingPlane.fromPlane(planeTmp)
        }

        let planes: any = [];
        positions.forEach((element: any) => {
            var clippingPlanesss = createPlane(element.poi1, element.poi2, getInverseTransform(clipObj));
            var plane = new Cesium.ClippingPlane(clippingPlanesss.normal, clippingPlanesss.distance * -1)
            planes.push(plane);
        });

        // var latLngArr = positions

        // var clippingPlanesss0 = createPlane(latLngArr[0], latLngArr[1], getInverseTransform(clipObj))
        // var clippingPlanesss1 = createPlane(latLngArr[1], latLngArr[2], getInverseTransform(clipObj))
        // var clippingPlanesss2 = createPlane(latLngArr[2], latLngArr[3], getInverseTransform(clipObj))
        // var clippingPlanesss3 = createPlane(latLngArr[3], latLngArr[0], getInverseTransform(clipObj))

        // var plane0 = new Cesium.ClippingPlane(clippingPlanesss0.normal, clippingPlanesss2.distance * -1)
        // var plane1 = new Cesium.ClippingPlane(clippingPlanesss1.normal, clippingPlanesss3.distance * -1)
        // var plane2 = new Cesium.ClippingPlane(clippingPlanesss2.normal, clippingPlanesss0.distance * -1)
        // var plane3 = new Cesium.ClippingPlane(clippingPlanesss3.normal, clippingPlanesss1.distance * -1)

        let clippingPlanes = new Cesium.ClippingPlaneCollection({
            // 切面
            planes: planes,//[plane0, plane1, plane2, plane3],
            unionClippingRegions: true,//true：多边形外部被裁剪 false 多边形内部被裁剪
            edgeWidth: 2,// 切面与模型相交线的线宽，如果不需要切面边线，可设置为0
            edgeColor: Cesium.Color.RED, // 平面切割时模型的边缘颜色
        })

        clipObj.clippingPlanes = clippingPlanes;
    }

    // 添加广告牌
    addTestBillboard(x: any, y: any, code: any) {
        // 模型
        var model: any = this.jesium.viewer.entities.add({
            name: code,
            id: code,
            position: Cesium.Cartesian3.fromDegrees(x, y, 30),
            model: {
                uri: '/cesium/dljxj.glb',
                scale: 150,
            },
        });

        // 跳动最大高度
        const maxHeight = 5;
        // 跳动速率
        const step = 0.15;
        // 过程高度
        let height = 0;
        // 跳动反转标记
        let statusForBounce = true;

        // 弹跳回调
        model.position = new Cesium.CallbackProperty(function (time, result) {
            if (statusForBounce) {
                height = height - step;
                if (height <= 0) {
                    statusForBounce = false;
                }
            } else {
                height = height + step;
                if (height >= maxHeight) {
                    statusForBounce = true;
                }
            }
            return Cesium.Cartesian3.fromDegrees(x, y, height + 34);
        }, false);
    }

    // 点击road
    clickRoadGetDetail(tableData: any, callback: ((data: any) => void)) {
        var _this = this;
        const hightLighted: any = {
            feautre: null,
            originalColor: new Cesium.Color(),
        };
        this.jesium.viewer.screenSpaceEventHandler.setInputAction(
            function onMouseClick(this: any, click?: any) {
                //自己需要写逻辑的地方
                const pickedFeature = _this.jesium.viewer.scene.pick(click.position);
                if (Cesium.defined(pickedFeature)) {
                    let id = pickedFeature.getProperty ? pickedFeature.getProperty("id") : null;
                    callback(id)
                    // if (!id) {
                    //     return
                    // }
                    // if (_this.oId == id && Cesium.defined(hightLighted.feature)) {
                    //     hightLighted.feature.color =
                    //         hightLighted.originalColor;
                    //     hightLighted.feature = undefined;
                    //     return;
                    // }

                    // //清除之前的高亮元素
                    // if (Cesium.defined(hightLighted.feature)) {
                    //     hightLighted.feature.color =
                    //         hightLighted.originalColor;
                    //     hightLighted.feature = undefined;
                    // }
                    // // 存储选中要素的信息
                    // hightLighted.feature = pickedFeature;
                    // Cesium.Color.clone(
                    //     pickedFeature.color,
                    //     hightLighted.originalColor
                    // );
                    // pickedFeature.color = Cesium.Color.fromCssColorString('#4477EE');
                    // nextTick(() => {
                    //     _this.oId = id;
                    // })

                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //鼠标移动的事件
        const nameOverlay = document.createElement("div");
        this.jesium.viewer.container.appendChild(nameOverlay);
        nameOverlay.className = "backdrop";
        nameOverlay.style.display = "none";
        nameOverlay.style.position = "absolute";
        nameOverlay.style.bottom = "0";
        nameOverlay.style.left = "0";
        nameOverlay.style["pointer-events" as any] = "none";
        nameOverlay.style["font-size" as any] = "12px";
        nameOverlay.style["border-radius" as any] = "5px";
        nameOverlay.style.padding = "4px";
        nameOverlay.style.color = "#fff";
        nameOverlay.style.backgroundColor = "rgba(5, 13, 19, 0.4)";
        this.jesium.viewer.screenSpaceEventHandler.setInputAction(function (movement?: any) {　　//获取鼠标位置，camera.pickEllipsoid()返回一个cartesian类型位置
            const pickedFeature = _this.jesium.viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(pickedFeature)) {
                let id = pickedFeature._batchId && pickedFeature.getProperty("id") ? pickedFeature.getProperty("id") : '';
                if (!id) {
                    nameOverlay.style.display = "none";
                    if (hightLighted.feature) {
                        hightLighted.feature.color =
                            hightLighted.originalColor;
                    }
                    hightLighted.feature = undefined;
                    return
                }

                //清除之前的高亮元素
                if (Cesium.defined(hightLighted.feature)) {
                    hightLighted.feature.color =
                        hightLighted.originalColor;
                    hightLighted.feature = undefined;
                }

                // 选择新要素
                if (!Cesium.defined(pickedFeature)) {
                    return;
                }

                // 存储选中要素的信息
                hightLighted.feature = pickedFeature;
                Cesium.Color.clone(
                    pickedFeature.color,
                    hightLighted.originalColor
                );
                // 高亮选中元素透明
                if (pickedFeature.primitive.name.indexOf('road') != -1) {
                    pickedFeature.color = Cesium.Color.fromCssColorString('#4477EE');
                }
                // console.log(pickedFeature, 'pickedFeature')

                nameOverlay.style.display = "block";
                nameOverlay.style.bottom = `${_this.jesium.viewer.canvas.clientHeight - movement.endPosition.y
                    }px`;
                nameOverlay.style.left = `${movement.endPosition.x}px`;
                const fid: any = pickedFeature.getProperty("id");
                tableData.forEach((e: any, i: any) => {
                    if (e.id == fid) {
                        nameOverlay.textContent = 'k' + (i + 25);
                    }
                });


            } else {
                if (Cesium.defined(hightLighted.feature)) {
                    hightLighted.feature.color =
                        hightLighted.originalColor;
                    hightLighted.feature = undefined;
                }
                nameOverlay.style.display = "none";
                return;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)//ScreenSpaceEventType
    }

    // 点击管点管线
    clickPipeGetDetail(callback: ((data: any) => void)) {

        var _this = this;
        var ordercode: any = null;
        const hightLighted: any = {
            feautre: null,
            originalColor: new Cesium.Color(),
        };

        const nameOverlay = document.createElement("div");
        this.jesium.viewer.container.appendChild(nameOverlay);
        nameOverlay.className = "backdrop";
        nameOverlay.style.display = "none";
        nameOverlay.style.position = "absolute";
        nameOverlay.style.bottom = "0";
        nameOverlay.style.left = "0";
        nameOverlay.style["pointer-events" as any] = "none";
        nameOverlay.style["font-size" as any] = "12px";
        nameOverlay.style["border-radius" as any] = "5px";
        nameOverlay.style.padding = "4px";
        nameOverlay.style.color = "#fff";
        nameOverlay.style.backgroundColor = "rgba(5, 13, 19, 0.4)";

        this.jesium.viewer.screenSpaceEventHandler.setInputAction(
            function onMouseClick(this: any, click?: any) {
                //自己需要写逻辑的地方
                const pickedFeature = _this.jesium.viewer.scene.pick(click.position);
                if (Cesium.defined(pickedFeature)) {
                    let id = pickedFeature.getProperty ? pickedFeature.getProperty("id") : null;
                    // console.log(pickedFeature.getPropertyIds(), 'id')
                    // console.log(id, 'id')
                    if (!id) {
                        return
                    }

                    //清除之前的高亮元素
                    if (Cesium.defined(hightLighted.feature)) {
                        // console.log(hightLighted.feature, 'hightLighted.feature')
                        hightLighted.feature.color =
                            hightLighted.originalColor;
                        hightLighted.feature = undefined;
                    }

                    // 存储选中要素的信息
                    hightLighted.feature = pickedFeature;
                    Cesium.Color.clone(
                        pickedFeature.color,
                        hightLighted.originalColor
                    );

                    if (_this.oId != id) {
                        pickedFeature.color = Cesium.Color.fromCssColorString('#4477EE');
                    }

                    nextTick(() => {
                        _this.oId = id;
                    })

                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //鼠标移动的事件
        // this.jesium.viewer.screenSpaceEventHandler.setInputAction(function (movement?: any) {　　//获取鼠标位置，camera.pickEllipsoid()返回一个cartesian类型位置
        //     const pickedFeature = _this.jesium.viewer.scene.pick(movement.endPosition);
        //     if (Cesium.defined(pickedFeature)) {
        //         let id = pickedFeature._batchId && pickedFeature.getProperty("id") ? pickedFeature.getProperty("id") : '';
        //         if (!id) {
        //             nameOverlay.style.display = "none";
        //             if (hightLighted.feature) {
        //                 hightLighted.feature.color =
        //                     hightLighted.originalColor;
        //             }
        //             hightLighted.feature = undefined;
        //             return
        //         }

        //         //清除之前的高亮元素
        //         if (Cesium.defined(hightLighted.feature)) {
        //             hightLighted.feature.color =
        //                 hightLighted.originalColor;
        //             hightLighted.feature = undefined;
        //         }

        //         // 选择新要素
        //         if (!Cesium.defined(pickedFeature)) {
        //             return;
        //         }

        //         // 存储选中要素的信息
        //         hightLighted.feature = pickedFeature;
        //         Cesium.Color.clone(
        //             pickedFeature.color,
        //             hightLighted.originalColor
        //         );
        //         // 高亮选中元素透明
        //         if (pickedFeature.primitive.name.indexOf('rebuild3d') != -1) {
        //             pickedFeature.color = Cesium.Color.WHITE.withAlpha(0.4); //new Cesium.Color(1.0, 1.0, 0.0, 0.4);//Cesium.Color.fromCssColorString('#4477EE');
        //         }
        //         // console.log(pickedFeature, 'pickedFeature')

        //         // nameOverlay.style.display = "block";
        //         // nameOverlay.style.bottom = `${_this.jesium.viewer.canvas.clientHeight - movement.endPosition.y
        //         //     }px`;
        //         // nameOverlay.style.left = `${movement.endPosition.x}px`;
        //         // const name = pickedFeature.getProperty("id");
        //         // nameOverlay.textContent = name;

        //     } else {
        //         if (Cesium.defined(hightLighted.feature)) {
        //             hightLighted.feature.color =
        //                 hightLighted.originalColor;
        //             hightLighted.feature = undefined;
        //         }
        //         nameOverlay.style.display = "none";
        //         return;
        //     }
        // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)//ScreenSpaceEventType
    }

    // 加载新管线和任务区域
    async loadInitPipeAndTask(lineType: number, psn: string, normalPipeData: any[], distributionPipeData: any[], warningPipeData: any[]) {

        await this.initPipe(psn)
        // 加载已分配核查多边形
        this.loadPipeCheckArea(distributionPipeData, psn);
        // 处理管点billboard核查状态
        this.handlePipePointBillboardCheckStatus(distributionPipeData, psn);
        // 处理管点billboard异常状态
        this.handlePipePointBillboardWarningStatus(warningPipeData, psn);
    }

    init2DpipeLine(pipeData?: any, pipeLineData?: any, index?: any) {
        // 去重
        let list: any = [];
        let pipeFilterData = pipeData.filter((item: any) => !list.includes(item.code) && list.push(item.code));

        // 加载管点
        pipeFilterData.forEach((element: any) => {
            var pipelinesize = element.pipelinesize.includes('*') ? element.pipelinesize.split('*')[0] : element.pipelinesize;
            // if (pipelinesize) {
            //     console.log(element, 'elee')
            // }
            var height: any = Number(element.height);
            var position: any = Cesium.Cartesian3.fromDegrees(Number(element.locationx), Number(element.locationy), height);
            let pipe = this.jesium.viewer.entities.add({
                id: element.code,//'pipe' + element.id,
                name: "管点" + [element.projectSn ? element.projectSn : (element.type + element.project)],
                position,
                point: {
                    pixelSize: Number(pipelinesize) / 25,
                    color: Cesium.Color.fromCssColorString('#fff'),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000),//可视距离
                    scaleByDistance: new Cesium.NearFarScalar(200, 1, 1000, 0.5),//近大远小
                }
            })
            this.pipeData.unshift(pipe)
        });
        // 加载管线
        pipeLineData.forEach((element: any) => {
            let data = pipeData.find((i: any) => {
                return i.code == element.connectcode;
            });

            if (data) {
                element.locationx2 = (data.locationx);
                element.locationy2 = (data.locationy);
                element.height2 = (data.height);

                const positions: any = [Number(element.locationx), Number(element.locationy), Number(element.height), Number(element.locationx2), Number(element.locationy2), Number(element.height2)];

                let pipelinesize = element.pipelinesize.indexOf('*') != -1 ? element.pipelinesize.split('*')[0] : element.pipelinesize;

                // const material = this.jesium.materialUtils.getPolylineTrailLinkMaterialProperty(4000, './images/fl.png');
                let pipeLine = this.jesium.viewer.entities.add({
                    id: element.code + '_' + element.connectcode,//'pipeLine' + element.id,
                    name: "管线" + [element.projectSn ? element.projectSn : (element.type + element.project)],//文件名
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                        width: Number(pipelinesize) / 50,
                        material: Cesium.Color.fromCssColorString(element.color),
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000),//可视距离
                    },
                })

                this.pipeLineData.unshift(pipeLine)
            }
        });

        // flyTo
        this.jesium.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(Number(pipeLineData[index].locationx), Number(pipeLineData[index].locationy), 800)
        })
    }


    //
    init3dtilesetColor() {
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            tileset.readyPromise.then((tileset: any) => {
                tileset.style = null;
                // console.log(tileset.style, 'tileset')
            });
        })

        // this.handler?.destroy()//销毁监听

    }

    checkTilesetExists(tilesetUrl: any) {
        return fetch(tilesetUrl)
            .then(response => {
                if (response.status === 404) {
                    // console.log('tileset not found');
                    // 处理404错误
                    return false;
                }
                if (!response.ok) {
                    // console.error('Network response was not ok');
                    // 处理其他网络错误
                    return false;
                }
                // console.log('tileset exists');
                // 处理成功的情况
                return true;
            })
            .catch(error => {
                // console.error('Fetch error:', error);
                // 处理获取tileset时的异常
                return false;
            });
    }

    flyToRoad(val: any, show?: any) {
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            let defaultColor: any = "color('" + ('#fff') + "')";
            let newColor: any = "color('#4477EE')";
            let color: any = null;
            if (color && color == newColor) {
                color = defaultColor;
            } else {
                color = newColor;
            }
            if (tileset && tileset.name == 'road') {
                // tileset.style = new Cesium.Cesium3DTileStyle({
                //     color: {
                //         conditions: [
                //             ["${id} === " + "'" + val.id + "'", (show ? color : defaultColor)],
                //             ["true", defaultColor],
                //         ],
                //     },
                // });
                if (val.sphere && show) {
                    let center = new Cesium.Cartesian3(val.sphere[0], val.sphere[1], val.sphere[2]);
                    const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(center));
                    this.jesium.viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(degrees.longitude, degrees.latitude, 2000)//degrees.longitude, degrees.latitude 112.44304333, 22.99698513
                    });
                }
            }
        });
    }


    moveModel(tileset: { boundingSphere: { center: Cesium.Cartesian3; }; modelMatrix: any; }, longitude: number, latitude: number, height: any) {
        //计算世界坐标系中的目标位置offset
        var cartographic: any = Cesium.Cartographic.fromCartesian(
            tileset.boundingSphere.center
        );
        var offset = Cesium.Cartesian3.fromDegrees(longitude, latitude, cartographic.height + height);

        //将模型位移至地心
        const origin = tileset.boundingSphere.center;
        const originMatrix = tileset.modelMatrix;//模型的初始变换矩阵
        const backToEarthCenter = new Cesium.Cartesian3(-origin.x, -origin.y, -origin.z);//初始位置到地心的位移向量
        let backToEarthCenterMatrix = Cesium.Matrix4.fromTranslation(backToEarthCenter);//初始位置到地心的变换矩阵
        Cesium.Matrix4.multiply(backToEarthCenterMatrix, originMatrix, backToEarthCenterMatrix);//移动模型到地心的矩阵

        // 旋转模型使得Z轴与世界坐标Z轴重合
        let arrowX = new Cesium.Cartesian3(1, 0, 0);
        let arrowZ = new Cesium.Cartesian3(0, 0, 1);
        let angleToXZ = Cesium.Cartesian3.angleBetween(arrowX, new Cesium.Cartesian3(origin.x, origin.y, 0));//局部Z轴在世界坐标系XY平面上投影到X轴角度，即绕Z顺时针旋转这个角度可以到XZ平面上
        let angleToZ = Cesium.Cartesian3.angleBetween(origin, arrowZ);//然后绕Y轴顺时针旋转此角度可使得Z轴与世界坐标系Z轴重合
        const rotationAngleToXZ = Cesium.Matrix3.fromRotationZ((origin.y > 0 ? -1 : +1) * angleToXZ);//绕Z轴旋转的Matrix3矩阵，正角度逆时针旋转
        const rotationAngleToZ = Cesium.Matrix3.fromRotationY(-angleToZ);//绕Y轴旋转的Matrix3矩阵，负角度顺时针旋转
        let rotationAngleToZMatrix = Cesium.Matrix3.multiply(rotationAngleToZ, rotationAngleToXZ, new Cesium.Matrix3);//连续旋转的Matrix3矩阵，即先绕Z轴旋转，后绕Y旋转的矩阵。
        rotationAngleToZMatrix = Cesium.Matrix4.fromRotationTranslation(rotationAngleToZMatrix);//连续旋转的Matrix4矩阵
        Cesium.Matrix4.multiply(rotationAngleToZMatrix, backToEarthCenterMatrix, rotationAngleToZMatrix);//将移动至地心模型，旋转至Z轴重合的矩阵

        // 旋转模型使得X，Y轴与世界坐标X，Y轴重合
        const rotationZ = Cesium.Matrix3.fromRotationZ(-Math.PI / 2); // 绕Z轴旋转90°的Matrix3变换矩阵
        let rotationMatrix = Cesium.Matrix4.fromRotationTranslation(rotationZ); // 绕Z轴旋转90°的Matrix4变换矩阵
        Cesium.Matrix4.multiply(rotationMatrix, rotationAngleToZMatrix, rotationMatrix);//将移动至地心模型的物体坐标系，旋转到与世界坐标系重合的矩阵

        //在地心位置，旋转物体坐标系和世界坐标系重合的模型，使得与目标坐标系重合
        const offsetToWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(offset);//获取到以目标位置为原点,的eastNorthUp局部坐标系的变换矩阵
        const backToEarthCenterOffset = new Cesium.Cartesian3(-offset.x, -offset.y, -offset.z);//目标位置到地心的位移向量
        let backToEarthCenterMatrixOffset = Cesium.Matrix4.fromTranslation(backToEarthCenterOffset);//目标位置到地心的变换矩阵
        Cesium.Matrix4.multiply(backToEarthCenterMatrixOffset, offsetToWorldMatrix, backToEarthCenterMatrixOffset);//获得从世界坐标系旋转至目标坐标系的旋转矩阵（只有旋转，没有位移）
        Cesium.Matrix4.multiply(backToEarthCenterMatrixOffset, rotationMatrix, backToEarthCenterMatrixOffset);//将移动至地心模型的物体坐标系，旋转到与目标坐标系重合的矩阵（完成模型的最终旋转，没有位移）

        //移动到目标位置
        const backToOriginMatrix = Cesium.Matrix4.fromTranslation(offset);//地心到目标位置位移向量
        const lastMatrix = Cesium.Matrix4.multiply(backToOriginMatrix, backToEarthCenterMatrixOffset, new Cesium.Matrix4());//最终矩阵，即将地心位置的模型移动到目标位置（完成模型的最终旋转，最终位移）
        console.log('最终变换矩阵', lastMatrix);
        return lastMatrix //返回最终变换矩阵
    }

    init3dtilesetJSON() {
        // ``````````````````````````````````````````````````````````````````
        // 02百度
        // 起点：112.686578,23.075547
        // 终点：112.434531,23.002631

        // 84高德
        // 112.68147319551686,23.07832093820937
        // 112.42921248274365,23.005209491704836

        // 112.789675,23.103256

        // 112.427171,22.996361
        // 112.690468,23.071807

        // 九山：112.565016,23.01549

        var point1: any = turf.point([112.42059906, 22.99940059]);
        var point2: any = turf.point([112.64468422, 23.05941131]);

        var midpoint: any = turf.midpoint(point2, point1);

        // 贴图纹理```······································
        var customShader = new Cesium.CustomShader({
            // lightingModel: Cesium.LightingModel.UNLIT,
            //  lightingModel: Cesium.LightingModel.PBR,
            //设置变量，由顶点着色器传递给片元着色器
            varyings: {
                v_normalMC: Cesium.VaryingType.VEC3,
                v_st: Cesium.VaryingType.VEC3
            },
            //外部传给顶点着色器或者片元着色器
            uniforms: {
                u_texture: {
                    value: new Cesium.TextureUniform({
                        url: '/road/d.jpeg'
                    }),
                    type: Cesium.UniformType.SAMPLER_2D
                },
                u_texture1: {
                    value: new Cesium.TextureUniform({
                        url: '/road/d.jpeg'
                    }),
                    type: Cesium.UniformType.SAMPLER_2D
                }
            },
            //贴纹理
            //顶点着色器
            // vertexShaderText: `
            //     void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
            //           v_normalMC = vsInput.attributes.normalMC;
            //           v_st=vsInput.attributes.positionMC;   
            //     }`,
            //片元着色器
            fragmentShaderText: `
               void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                  vec3 positionMC = fsInput.attributes.positionMC;
                  int featureId = fsInput.featureIds.featureId_0;
                  //这里是设置要贴图的图片的尺寸，设置小了会重复
                  float width = 100.0;
                  float height = 100.0;
                  vec3 rgb;
                  material.diffuse = vec3(1.0, 0.0, 0.0);
                  //这是是设置了屋顶的颜色，当和法向量平行时，就是屋顶，这里设置0.95，相当于垂直，建筑物四周开始贴图
                //   if (dot(vec3(0.0, 1.0, 0.0), v_normalMC) > 0.95) {
                //     material.diffuse = vec3(1.0, 0.0, 0.0);
                //   } else {
                    float textureX = 0.0;
                    float dotYAxis = dot(vec3(0.0, 0.0, 1.0), v_normalMC);
                    // cos(45deg) 约等于 0.71，这里是建筑物四周的向量与法向量会大于四十五度夹角
                    float c= 0.3;
                    // if (dotYAxis > c || dotYAxis < -c) {
                    // // x代表的是前后面
                      textureX = mod(positionMC.x, width) / width;
                    // } else {
                    // z代表的是左右面
                    //   textureX = mod(positionMC.x, width);
                    // }
                    float textureY = mod(positionMC.y, height) / height;
                    //我这里是根据建筑物高度贴了两张不同的图片
                    // if (positionMC.y > 30.0) {
                    //    rgb = texture2D(u_texture1, vec2(textureX, textureY)).rgb;       
                    // } else {
                            rgb = texture2D(u_texture, vec2(textureX, textureY)).rgb;
                    // }

                    if (featureId == 4 || featureId == 5) {
                        material.diffuse = rgb;
                    }else{
                        material.diffuse = vec3(1.0);
                    }
                //   }
              }`
        })




        // end······································

        // var position: any = Cesium.Cartesian3.fromDegrees(Number(112.44304333), Number(22.99698513));
        // console.log(position, 'positon')
        this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles('road/tileset.json', 'road', false));
        this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles('road2/tileset.json', 'road2', false));
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);

            // tileset.customShader = customShader;//纹理
            // console.log(customShader, 'customShader')

            if (tileset && tileset.name == 'road2') {
                tileset.tileLoad.addEventListener((tile: any) => {
                    let content = tile.content;
                    if (content && content.featuresLength > 0) {
                        const featuresLength = content.featuresLength;
                        for (let i = 0; i < featuresLength; ++i) {
                            const feature = content.getFeature(i);
                            let id = feature.getProperty("id");
                            feature.show = false;
                            let name = feature.getProperty("name");
                            if (name == '道路2_27') {
                                feature.show = true;
                            }
                        }

                    }

                });
            }

            if (tileset && tileset.name == 'road') {
                tileset.tileLoad.addEventListener((tile: any) => {
                    let content = tile.content;
                    if (content && content.featuresLength > 0) {
                        const featuresLength = content.featuresLength;
                        let defaultColor: any = "color('" + ('#fff') + "')";
                        let yellow: any = "color('" + ('#E6A23C') + "')";
                        let Green: any = "color('" + ('#67C23A') + "')";
                        let list: any = [
                            ["${id} === " + "'" + 'd67d8ab4f4c10bf22aa353e27879133c' + "'", yellow],
                            ["${id} === " + "'" + 'd645920e395fedad7bbbed0eca3fe2e0' + "'", yellow],
                        ];
                        // list.push(["true", defaultColor]);
                        // tileset.style = new Cesium.Cesium3DTileStyle({
                        //     color: {
                        //         conditions: list,
                        //     },
                        // });


                        for (let i = 0; i < featuresLength; ++i) {
                            const feature = content.getFeature(i);
                            // feature.color = Cesium.Color.WHITE.withAlpha(0.1);
                            let name = feature.getProperty("name");
                            // if (id == '6c8349cc7260ae62e3b1396831a8398f_0') {
                            if (name == '道路2_27') {
                                // feature.color = Cesium.Color.WHITE.withAlpha(0);
                                feature.show = false;
                            } else if (name == '道路2_13') {
                                feature.color = Cesium.Color.YELLOW;
                            }
                            // }
                            // let newColor: any = "color('" + this.getRandomColor() + "')";
                            // list.push(["${id} === " + "'" + id + "'", newColor])
                        }

                    }

                });
                tileset.readyPromise.then((tileset: any) => {
                    let lng = midpoint.geometry.coordinates[0];//112.789675,23.103256;
                    let lat = midpoint.geometry.coordinates[1];
                    // 假设你已经有一个3D Tileset实例叫tileset
                    // 并且这个tileset已经被加载到Cesium的Viewer实例中，叫app

                    // 计算3D Tileset的当前中心点
                    // var boundingSphere = tileset.boundingSphere;
                    // var oldCenter = Cesium.Cartesian3.clone(boundingSphere.center);

                    // 设置新的中心点，假设我们要把中心点移动到经纬度为longitude和latitude，高程为height的位置
                    // var newCenter = Cesium.Cartesian3.fromDegrees(lng, lat, 0);

                    // 计算移动的偏移量
                    // var translation = Cesium.Cartesian3.subtract(newCenter, oldCenter, new Cesium.Cartesian3());

                    // 移动3D Tileset
                    // tileset.modelMatrix = [0.9904856831189405, -0.0465703700633231, 0.129496378978606, 0, 0.07957035563848916, 0.9615607043026339, -0.26281090244620187, 0, -0.1122794283917136, 0.2706145091697557, 0.9561177319696788, 0, -13517.659248067997, 6486.004929155111, -11945.898363439832, 1];//[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -77169.34087948734, 1037557.5408604145, -1594505.5402563005, 1]
                    // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
                    // this.jesium.viewer.zoomTo(tileset);


                    // let height = 0
                    // let modelMatrix = this.moveModel(tileset, 112.93382735, 23.0994609, height)
                    // tileset.modelMatrix = modelMatrix;//移动模型
                    // let boundingSphere = new Cesium.BoundingSphere(
                    //     tileset.boundingSphere.center,
                    //     tileset.boundingSphere.radius
                    // );
                    // //飞向该包围盒
                    // this.jesium.viewer.camera.flyToBoundingSphere(boundingSphere);
                    // ···········································111

                    // const cartographic = Cesium.Cartographic.fromCartesian(
                    //     tileset.boundingSphere.center
                    // );

                    // console.log(cartographic, 'cartographic')
                    // const surface = Cesium.Cartesian3.fromRadians(
                    //     cartographic.longitude, //经度
                    //     cartographic.latitude, //纬度
                    //     0.0 //高度
                    // );
                    // // // 84坐标
                    // let lng = midpoint.geometry.coordinates[0];//9.10228201;
                    // let lat = midpoint.geometry.coordinates[1];//48.60771172;

                    // const offset = Cesium.Cartesian3.fromRadians(
                    //     lng,
                    //     lat,
                    //     1
                    // );

                    // const translation = Cesium.Cartesian3.subtract(
                    //     offset, //根据中心点坐标和height值计算出的新的坐标点
                    //     surface, //根据中心点坐标计算出的地表坐标点
                    //     new Cesium.Cartesian3()
                    // );
                    // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

                });
            }
        })
    }

    setInputAction3Dtileset() {
        //高亮显示代码
        // console.log(this.handler, 'this.handler')
        this.handler = new Cesium.ScreenSpaceEventHandler(this.jesium.viewer.canvas);//获取地图对象
        this.handler.setInputAction((movement: any) => {
            var pickingEntity = this.jesium.viewer.scene.pick(movement.position);


            // 判断是否是管线
            if (pickingEntity?._batchId) {
                return false;
            }

            if (sessionStorage.getItem('clShow') == 'true') {
                return false;
            }

            //判断选择是否为Cesium3DTileFeature
            if (pickingEntity?.primitive instanceof Cesium.Cesium3DTileset) {
                let newColor: any = "color('" + this.generateRandomShallowColor() + "')";

                // ceshi```·······························
                let isTrue2 = sessionStorage.getItem('volumenShow') ? sessionStorage.getItem('volumenShow') : false;
                if (isTrue2) {
                    return false;
                }
                // ceshi·······················

                if (pickingEntity.primitive.style) {
                    pickingEntity.primitive.style = null;
                } else {
                    let isTrue = sessionStorage.getItem('addPoiBtnShow') ? sessionStorage.getItem('addPoiBtnShow') : false;
                    let isTrue2 = sessionStorage.getItem('volumenShow') ? sessionStorage.getItem('volumenShow') : false;
                    if (isTrue) {
                        return false;
                    }

                    if (isTrue2) {
                        return false;
                    }

                    pickingEntity.primitive.style = new Cesium.Cesium3DTileStyle({
                        color: newColor,
                        transparent: true,
                        opacity: 0.5
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    // 随机颜色
    getRandomColor() {
        var letters = '0123456789ABCDEF';//'5678956789defdef';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    generateRandomShallowColor() {
        // 定义RGB的最小值和最大值  
        // 浅色意味着较高的RGB值，所以我们从较高的值开始  
        const min = 150; // 你可以根据需要调整这个值  
        const max = 255;

        // 生成随机的RGB值  
        const r = Math.floor(Math.random() * (max - min + 1)) + min;
        const g = Math.floor(Math.random() * (max - min + 1)) + min;
        const b = Math.floor(Math.random() * (max - min + 1)) + min;

        // 返回一个rgb字符串  
        return `rgb(${r}, ${g}, ${b})`;
    }
    // 加载管线-新
    initPipe(psn: string, color?: string) {
        var url: any = null;
        login3001({
            password: "cybergeo301",
            phone: "18570414200",
        }).then((res: any) => {
            url = '/3001Api/3dtiles/' + psn + '/tileset.json?t=1683514380200&token=' + res.headers.token;
            let list = this.__scene3DTilesUUIDSet.filter(i => i.indexOf('新一代'))//过滤掉新一代

            // console.log(list, 'list')
            // return;

            // console.log(this.__scene3DTilesUUIDSet, '添加之前')
            if (list.length > 0) {

                if (list[list.length - 1].indexOf(psn) == -1) {
                    this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles(url, psn, false));
                }

                // list.forEach(i => {
                //     let p = i.split('-')[0];
                //     if (p != psn) {
                //         // 不存在psn添加
                //         console.log("不存在psn添加", p, psn)
                //         this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles(url, psn, false));
                //     }
                // })
            } else {
                // 数组为空直接添加
                this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles(url, psn, false));
            }

            // console.log(this.__scene3DTilesUUIDSet, '添加之后')
            // console.log(color, 'color')
            this.initPipeColor(psn, color)
        });



    }

    // 管线颜色
    initPipeColor(psn?: any, color?: any) {
        // 设置新管线颜色
        this.__scene3DTilesUUIDSet.forEach(tilesetUUID => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            // console.log(tileset.name, "tileSet")
            // 设置管线高度
            // if (tilesetUUID.indexOf('新一代') == -1) {
            //     tileset.readyPromise.then((tileset: any) => {
            //         var boundingSphere = tileset.boundingSphere;
            //         var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
            //         var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
            //         var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 5);
            //         var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            //         tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            //     });
            // }

            if (tileset.name == psn) {//psn匹配是哪个管线，再对应颜色
                tileset.tileLoad.addEventListener(function (tile: any) {
                    let content = tile.content;
                    let featuresLength = content.featuresLength;
                    for (let index = 0; index < featuresLength; index++) {
                        let feature = content.getFeature(index);
                        feature.color = Cesium.Color.fromCssColorString(color);
                    }
                });
            }


        })
    }

    //移除新一代
    removeXinyiDai() {
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            if (tilesetUUID.indexOf('新一代') != -1) {
                tileset.show = false;
                this.__scene3DTilesUUIDSet.splice(index, 1);
            }
        })
    }


    // 移除新管线
    removeTrench(psn?: string, type?: Boolean) {
        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            if (tilesetUUID.indexOf(psn as any) != -1) {
                tileset.show = type;
            }
        })
    }

    // 移除新管线
    removePipe(psn?: string) {

        if (!psn) {
            this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
                let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
                if (tileset) {
                    tileset.show = false;
                    this.jesium.viewer.scene.primitives.remove(tileset);
                }
                // this.__scene3DTilesUUIDSet.splice(index, 1);
            })
        }

        let f: any = this.jesium.viewer.entities.values.filter((i: any) => {
            return i.name && i.name.indexOf(psn) != -1;
        })

        f.forEach(((i: any) => {
            this.jesium.viewer.entities.remove(i);
        }))

        this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
            let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
            if (tilesetUUID.indexOf(psn as any) != -1) {
                tileset.show = false;
                this.__scene3DTilesUUIDSet.splice(index, 1);
            }
        })
    }

    // 添加单个poi点
    addsinglePoi(poi: any, iconUrl: any) {
        let location: any = poi.split(",");
        let poiAll = this.jesium.viewer.dataSources.getByName('poiAll');
        poiAll[0].entities.add({
            billboard: {
                image: '/imgApi' + iconUrl,
                width: 32,
                height: 32,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//设置广告牌贴地
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            position: Cesium.Cartesian3.fromDegrees(Number(location[0]), Number(location[1])),
        })
    }


    //     /**
    //  * @description: 点聚合功能效果
    //  * @param {*} viewer
    //  * @return {*}
    //  */
    initCluster(geojson: any, iconList: any) {
        new Cesium.GeoJsonDataSource().load(geojson).then(dataSource => {
            dataSource.name = 'poiAll';
            this.jesium.viewer.dataSources.add(dataSource);
            // 设置聚合参数
            dataSource.clustering.enabled = true;
            dataSource.clustering.pixelRange = 20;//小于这个距离就会被聚合，以像素为单位
            dataSource.clustering.minimumClusterSize = 2;

            //Primitive方式\
            // dataSource.entities.show = false;
            // var pointPrimitives = this.jesium.viewer.scene.primitives.add(
            //     new Cesium.PointPrimitiveCollection()
            // );
            // var color = Cesium.Color.fromCssColorString('#84B0FF').withAlpha(1);

            // dataSource.entities.values.forEach((entity: any) => {
            //     var position = Cesium.Cartesian3.fromDegrees(Number(entity.properties.x._value), Number(entity.properties.y._value), 50);
            //     var primitive = pointPrimitives.add({
            //         pixelSize: 30,
            //         color: color,
            //         position: position
            //     });
            // });


            // foreach用于调用数组的每个元素，并将元素传递给回调函数。
            dataSource.entities.values.forEach((entity: any) => {
                entity.name = entity.properties.proChildName._value;
                // 将点拉伸一定高度，防止被地形压盖
                if (entity.position) {
                    if (entity.properties._z._value >= v_449) {
                        // console.log(entity.position, 'entity.properties')
                        let x = Number(entity.properties._x._value);
                        let y = Number(entity.properties._y._value);
                        let z = Number(entity.properties._z._value) - v_449;
                        entity.position = Cesium.Cartesian3.fromDegrees(x, y, z);
                    }

                    // 使用大小为64*64的icon，缩小展示poi
                    let size = 1;
                    if (Number(entity.properties.iconSize._value)) {
                        size = Number(entity.properties.iconSize._value);
                    }
                    // entity.properties.status._value == 1 ? '/img/poi.png' :
                    entity.billboard = {
                        image: entity.properties.iconUrl ? ('/dgApi' + entity.properties.iconUrl._value) : "/img/poi.png",
                        width: 30,
                        height: 33,
                        scale: size,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//设置广告牌贴地
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000),//可视距离
                    };
                }
            });




            var _this = this;
            // 添加监听函数
            dataSource.clustering.clusterEvent.addEventListener(
                function (clusteredEntities, cluster) {
                    // 关闭自带的显示聚合数量的标签
                    cluster.label.show = false;
                    cluster.billboard.show = true;
                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    cluster.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 80000);//可视距离
                    cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;//代表无穷大，即一直禁用深度检测

                    // 根据聚合数量的多少设置不同层级的图片以及大小
                    if (clusteredEntities.length >= 20) {
                        cluster.billboard.image = _this.combineIconAndLabel('/img/b.png', clusteredEntities.length, 90);
                        cluster.billboard.width = 72;
                        cluster.billboard.height = 72;
                    } else if (clusteredEntities.length >= 12) {
                        cluster.billboard.image = _this.combineIconAndLabel('/img/r.png', clusteredEntities.length, 90);
                        cluster.billboard.width = 56;
                        cluster.billboard.height = 56;
                    } else if (clusteredEntities.length >= 8) {
                        cluster.billboard.image = _this.combineIconAndLabel('/img/y.png', clusteredEntities.length, 90);
                        cluster.billboard.width = 48;
                        cluster.billboard.height = 48;
                    } else {
                        cluster.billboard.image = _this.combineIconAndLabel('/img/b.png', clusteredEntities.length, 90);
                        cluster.billboard.width = 40;
                        cluster.billboard.height = 40;
                    }
                }
            )

            _this.watchMouseMoveGuDingPOI();//监听鼠标移动固定POI
            _this.watchClickGuDingPOI(); // 监听点击固定POI
            _this.mouseMoveGetHeight(); // 监听场景高度
        });
    }

    /**
   * 画单样式文本canvas 内嵌型---------wy:不好用
   * @param {*} img
   * @param {*} textOptions { fontOptions:{},text:"",padding:""}
   * @returns
   */
    async drawSingleTextCanvas(img: any, textOptions: any) {
        let canvas: any = document.createElement('canvas')
        let context: any = canvas.getContext('2d')
        let text = ''
        let padding: any = [];
        let font = '14px sans-serif'
        let fillStyle = '#333'
        let strokeStyle = '#333'
        let fontSize = 14
        let textWidth = 0
        let textHeight = 0
        let canvasWidth = 0
        let canvasHeight = 0
        if (Cesium.defined(textOptions)) {
            text = Cesium.defaultValue(textOptions.text, text)
            padding = Cesium.defaultValue(textOptions.padding, padding)
            if (Cesium.defined(textOptions.fontOptions)) {
                font = Cesium.defaultValue(textOptions.fontOptions.font, font)
                fillStyle = Cesium.defaultValue(
                    textOptions.fontOptions.fillColor,
                    fillStyle
                )
                strokeStyle = Cesium.defaultValue(
                    textOptions.fontOptions.strokeColor,
                    strokeStyle
                )
            }
        }
        // 确认字的大小
        let fontArray = font.split(' ')
        fontArray.forEach(item => {
            if (item.indexOf('px') >= 0) {
                fontSize = parseFloat(item)
                return
            }
        })
        // 根据字的个数判断
        textWidth = fontSize * text.trim().length
        textHeight = fontSize
        // 设置padding[上,右,下,左]
        canvasWidth = padding[1] + padding[3] + textWidth
        canvasHeight = padding[0] + padding[2] + textHeight
        // 设置canvas大小
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        // 绘制图片 100%填充
        let imgWidthScale = canvasWidth / img.width
        let imgHeightScale = canvasHeight / img.height
        context.scale(imgWidthScale, imgHeightScale)
        context.drawImage(img, 0, 0)
        // 绘制文字
        // context.scale(1 / imgWidthScale, 1 / imgHeightScale)
        // context.lineWidth = 4;
        await document.fonts.load(font)
        context.font = font
        context.strokeStyle = strokeStyle
        context.fillStyle = fillStyle
        context.strokeText(text.trim(), padding[3], padding[0] + fontSize / 1)
        context.fillText(text.trim(), padding[3], padding[0] + fontSize / 1)
        return canvas
    }

    // /**
    //  * @description: 将图片和文字合成新图标使用（参考Cesium源码）
    //  * @param {*} url：图片地址
    //  * @param {*} label：文字
    //  * @param {*} size：画布大小
    //  * @return {*} 返回canvas
    //  */
    combineIconAndLabel(url: any, label: any, size: any) {
        // 创建画布对象
        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx: any = canvas.getContext("2d");
        //@ts-ignore
        let promise = new Cesium.Resource.fetchImage(url).then((image: any) => {
            // 异常判断
            try {
                ctx.drawImage(image, 0, 0);
            } catch (e) {
                console.log(e);
            }

            // 渲染字体
            // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
            ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
            ctx.font = 'bold 32px Microsoft YaHei';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, size / 2, size / 2);

            return canvas;
        });
        return promise;
    }

    combineIconAndLabel2(url: any, label: any, size: any, height: any) {
        // 创建画布对象
        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = height;
        var ctx: any = canvas.getContext("2d");
        //@ts-ignore
        let promise = new Cesium.Resource.fetchImage(url).then((image: any) => {
            // 异常判断
            try {
                ctx.drawImage(image, 0, 0, size, height);
            } catch (e) {
                console.log(e);
            }

            // 渲染字体
            // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
            ctx.fillStyle = Cesium.Color.BLACK.toCssColorString();
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, size / 2, height / 2);

            return canvas;
        });
        return promise;
    }

    // 还原poi选中放大
    unCheckPoi() {
        var dataSource = this.jesium.viewer.dataSources.get(0);
        var entities = dataSource?.entities.values;
        for (var i = 0; i < entities.length; i++) {
            var entity: any = entities[i];
            entity.billboard.scale = 1;
        }
    }


    // 新飞到指定位置
    flyToLocation(row: any, z: any, isCheck?: any, colors?: any) {
        var wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs  ';
        var cgcs2000 = '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs';
        var locationx = Number(row.locationx ? row.locationx : row.x)
        var locationy = Number(row.locationy ? row.locationy : row.y)
        var proj4Poi = proj4(cgcs2000, wgs84, [locationx, locationy]);
        var lx = locationx > 180 ? proj4Poi[0] : locationx;
        var ly = locationy > 90 ? proj4Poi[1] : locationy;//84 2000坐标判断


        // 飞到指定位置
        this.jesium.viewer.camera.flyTo({
            // fromDegrees()方法，将经纬度和高程转换为世界坐标
            destination: Cesium.Cartesian3.fromDegrees(
                lx,
                ly,
                z
            ),
        });


        var dataSource = this.jesium.viewer.dataSources.get(0);
        var entities = dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
            var entity: any = entities[i];
            if (Number(entity.properties.x) == lx) {
                entity.billboard.scale = 1.5;
            }
        }

        if (!isCheck) {
            // 非树状勾选，而是点击高亮
            clearInterval(this.glTimer);
            this.glTimer = null;

            var id: any = row.appendage ? (row.connectcode + '_' + row.code) : row.code//无拼接的是管点
            this.__scene3DTilesUUIDSet.forEach(tilesetUUID => {
                if (tilesetUUID.indexOf(row.projectSn) != -1) {
                    let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
                    // console.log(tileset, 'tileset')

                    let defaultColor: any = "color('" + colors + "')";
                    let newColor: any = "color('red')";
                    let color: any = null;

                    this.glTimer = setInterval(() => {

                        if (color && color == newColor) {
                            color = defaultColor;
                        } else {
                            color = newColor;
                        }

                        // console.log(color, 'color')
                        tileset.style = new Cesium.Cesium3DTileStyle({
                            color: {
                                conditions: [
                                    ["${id} === " + "'" + id + "'", color],
                                    ["true", defaultColor]
                                ],
                            },
                        });
                    }, 500);
                }
            })

        }

    }



    /**
     * 处理分割线所有坐标的高度
     */
    processLineCoordArrayHeight(coordCar3Array: Cesium.Cartesian3[]) {
        // 当前线最小的高度，默认取第一个点的高度，如果有比他更小的就更新
        let miniumHeight = Cesium.Cartographic.fromCartesian(coordCar3Array[0]).height;
        // console.log(miniumHeight, 'miniumHeight')
        // 把当前car3坐标转成经纬度坐标存起来
        let wgs84Array = coordCar3Array.map((car3, index) => {
            const cato = Cesium.Cartographic.fromCartesian(car3);
            const lon = Cesium.Math.toDegrees(cato.longitude);
            const lat = Cesium.Math.toDegrees(cato.latitude);
            // 如果当前点的高程比当前线段的最小高程小，那么就更新线段的最小高程
            if (cato.height < miniumHeight) {
                miniumHeight = cato.height;
            }
            return {
                lon,
                lat,
                height: cato.height
            }
        })
        console.log("当前线的最小高度：", coordCar3Array, miniumHeight);

        if (this.globeMiniumHeight === 0) { // 如果当前全局的最小高度是0，那么我们就把当前的高度直接赋值给他
            this.globeMiniumHeight = miniumHeight;
        } else { // 如果当时全局高度已经不是0那么就进行比较，小的话才更新
            if (miniumHeight < this.globeMiniumHeight) {
                this.globeMiniumHeight = miniumHeight;
            }
        }

        // 当前线段的最小高度和全局最小高度的差
        const dvalue = miniumHeight - this.curMiniumHeight;
        if (dvalue > 4) { // 如果他们之间的差大于4米，那么就说明当前这条线的高度整个不可用因为差别太大，直接使用最小高度
            wgs84Array = wgs84Array.map((wgs84) => {
                return {
                    lon: wgs84.lon,
                    lat: wgs84.lat,
                    height: this.curMiniumHeight
                }
            })
        } else { // 如果他们之间的差没有大于4米，那么久说明这条线里面有高度是可用的
            wgs84Array = wgs84Array.map((wgs84) => {
                if (wgs84.height - miniumHeight > 1) { // 如果当前点的高程和当前线的高程相差1的高度，那么就把这个高度携程当前最小高度
                    return {
                        lon: wgs84.lon,
                        lat: wgs84.lat,
                        height: miniumHeight
                    }
                } else {
                    return wgs84;
                }
            })
        }

        // wgs84Array.forEach((wgs84) => {
        //     this.jesium.viewer.entities.add({
        //         position: Cesium.Cartesian3.fromDegrees(wgs84.lon, wgs84.lat, wgs84.height),
        //         point: {
        //             pixelSize: 2,
        //             color: Cesium.Color.YELLOW
        //         }
        //     })
        // })

        return wgs84Array;
    }

    /**
     * 在3dtiles上获取点的高程
     */
    async getPointHeightOn3DTiles(car3s: Cesium.Cartesian3[]) {
        console.log(car3s, 'getPointHeightOn3DTiles')
        const car3Array = await this.jesium.viewer.scene.clampToHeightMostDetailed(car3s);
        console.log(car3Array, 'car3Array')
        // 处理线分割之后所有坐标的高度
        return this.processLineCoordArrayHeight(car3Array);
    }

    /**
    * 切换底图影像
    * @param baseImageryType 底图影像类型 
    */
    toggleBaseImagery(baseImageryType?: BaseImageryType) {
        if (!baseImageryType) {
            // this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.closeArcGisImageryImageryProvider());
            this.jesium?.viewer.imageryLayers.removeAll()
            return false;
        }
        /* 
            0是地图
            1是标记地图
            底图只需要换0就好了
        */
        this.jesium?.viewer.imageryLayers.remove(this.jesium.viewer.imageryLayers.get(0));
        switch (baseImageryType) {
            case BaseImageryType.IMAGERY: // 影像地图
                this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getArcGisImageryImageryProvider(), 0);
                break;
            case BaseImageryType.ELECTRONCIS: // 电子地图
                this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getAmapImageryProvider({
                    style: 'elec', // style: img、elec、cva
                    crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
                }), 0);

                // this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getBaiduImageryProvider({
                //     crs: 'WGS84',
                //     style: 'custom',
                // }) as any)
                break;
        }
    }
    toggleBaseImagery2(baseImageryType?: BaseImageryType) {
        /* 
            0是地图
            1是标记地图
            底图只需要换0就好了
        */
        this.jesium?.viewer.imageryLayers.remove(this.jesium.viewer.imageryLayers.get(0));
        switch (baseImageryType) {
            case BaseImageryType.IMAGERY: // 影像地图
                this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getArcGisImageryImageryProvider(), 0);
                break;
            case BaseImageryType.ELECTRONCIS: // 电子地图

                this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getTianDiTuBiaoJiImageryProvider(), 1);
                // this.jesium?.viewer.imageryLayers.addImageryProvider(this.jesium.imageryUtils.getAmapImageryProvider({
                //     style: 'elec', // style: img、elec、cva
                //     crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
                // }), 0);
                break;
        }
    }
    // 实时改变相机位置
    realCameraLocation() {
        let location = [CONFIG.init_position.longitude, CONFIG.init_position.latitude, CONFIG.init_position.height]
        this.jesium.cameraUtils.setViewByCoordArray(location)
    }

    /**
     * 初始化场景
     */
    initScene() {
        /* 开启地形深度检测 */
        this.jesium.enableDepthTestAgainstTerrain(true);

        // 限制相机最大高度和最小高度   
        // this.jesium.cameraUtils.limitCamera({
        //     maxHeight: CONFIG.CAMERA_MAX_HEIGHT,
        //     minHeight: CONFIG.CAMERA_MIN_HEIGHT,
        // })

        // 监听场景高度
        // this.mouseMoveGetHeight()


        // 监听鼠标移动固定POI
        this.watchMouseMoveGuDingPOI();

        // 取消鼠标双击追踪事件
        this.jesium.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // ```````````````````````````````
        this.watchSceneLoadedEvent();//监听场景加载完成事件


        // this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
        //     let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
        //     if (tileset && tileset.name == 'testJson') {
        //         tileset.readyPromise.then((tileset: any) => {
        //             this.jesium.viewer.zoomTo(tileset);
        //         });
        //     }
        // })
    }

    pipeLineDG(i?: any, show?: any, is_trenchAll?: any) {
        if (show) {
            nextTick(() => {
                this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
                    let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
                    // console.log(tileset, 'tileset')
                    if (tileset) {
                        tileset.readyPromise.then((tileset: any) => {
                            if (i.psn == tileset.name) {
                                // this.jesium.viewer.zoomTo(tileset);
                                this.jesium.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-84), tileset.boundingSphere.radius / 5));
                            }
                        });
                    }
                })
            })
            return;
        }

        // is_trench：1沟
        if (is_trenchAll) {
            this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles('/3001UrlApi/' + (i.psn) + '/3dtiles/tileset.json', i.psn, false));
        } else {
            if (i.is_trench == 0) {
                this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles('/3001UrlApi/' + (i.psn) + '/3dtiles/tileset.json', i.psn, false));
            }
        }
        nextTick(() => {
            this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
                let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
                if (tileset) {
                    tileset.readyPromise.then((tileset: any) => {
                        // 不是沟
                        var heightOffset = 0;
                        if (tileset?.name == i.psn) {
                            heightOffset = (i.is_trench == 0 ? Number(i.height_offset) : 0);//i.height_offset
                            //计算tileset的绑定范围
                            var boundingSphere = tileset.boundingSphere;
                            //计算中心点位置
                            var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
                            //计算中心点位置坐标
                            var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude,
                                cartographic.latitude, 0);
                            //偏移后的三维坐标
                            var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude,
                                cartographic.latitude, heightOffset);
                            var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
                            //tileset.modelMatrix转换
                            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
                        }

                        // heading pitch range
                        // this.jesium.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-84), tileset.boundingSphere.radius));
                        // this.jesium.viewer.zoomTo(tileset);
                    });
                }
            })
        })
    }

    hasDuplicates(array: any) {
        return new Set(array).size !== array.length;
    }

    // 修改管线颜色
    changePipeLineColor(i?: any) {
        nextTick(() => {
            this.__scene3DTilesUUIDSet.forEach((tilesetUUID, index) => {
                let tileset: any = this.jesium.modelUtils.get3DTilesByUUID(tilesetUUID);
                if (tileset) {
                    tileset.readyPromise.then((tileset: any) => {
                        if (tileset.name == i.psn) {
                            pipelineList({
                                size: -1,
                                projectSn: i.psn,
                            })
                                .then((res) => {
                                    if (res.data.code == 200) {
                                        let list: any = [];
                                        let pipeLineList: any = res.data.data.records.filter((i: any) => { return i.code && i.connectcode });//管线
                                        let appendage: any = res.data.data.records.filter((i: any) => { return i.appendage });//附属物

                                        pipeLineList.forEach((element: any, i: any) => {
                                            let attributes = JSON.parse(element.attributes);
                                            let Colours = attributes.filter((o: any) => { return o.name.indexOf('Colour') != -1 })
                                            // console.log(Colours, 'Colours[0].model')
                                            if (!Colours.length) {
                                                return false;
                                            }
                                            let color = (pipeLineColor as any)[Colours[0].model];
                                            let w = 'white';

                                            //管线
                                            list.push(["${id} === " + "'" + element.code + '_' + element.connectcode + "'", "color('" + (color != 'Empty' ? color : w) + "')"],)

                                            // 管点:判断管点不存在附属物再赋值颜色
                                            let data = appendage.find((i2: any) => { return i2.code == element.code })
                                            if (!data) {
                                                list.push(["${id} === " + "'" + element.code + "'", "color('" + (color != 'Empty' ? color : w) + "')"],)
                                            }

                                            // if (!element.appendage) {// 没有附属物的(color != 'Empty' ? color : w)
                                            //     list.push(["${id} === " + "'" + element.code + "'", "color('" + (color != 'Empty' ? color : w) + "')"],)
                                            // }

                                            // if (element.appendage) {//附属物
                                            //     list.push(["${id} === " + "'" + element.code + "'", "color('white')"],)
                                            // }
                                        });

                                        list.push(["true", "color('white')"]);//默认颜色
                                        tileset.style = new Cesium.Cesium3DTileStyle({
                                            color: {
                                                conditions: list,
                                            },
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err, "err");
                                });


                        }
                    });
                }
            })
        })
    }


    limitHeading() {
        // 设置一个最大倾斜角度阈值，例如45度
        var maxTiltAngle = Cesium.Math.toRadians(45);

        // 监听相机移动事件
        this.jesium.viewer.scene.preRender.addEventListener(() => {
            var heading = Cesium.Math.toDegrees(this.jesium.viewer.camera.heading);
            var pitch = Cesium.Math.toDegrees(this.jesium.viewer.camera.pitch);
            // console.log(Math.abs(pitch))
            // if (Math.abs(pitch) > 45) {
            //     this.jesium.viewer.scene.screenSpaceCameraController.enableTilt = false;
            // } else {
            //     this.jesium.viewer.scene.screenSpaceCameraController.enableTilt = true;
            // }
        });
    }

    mouseMoveLocation(websock?: any) {
        // 监听相机移动事件
        this.jesium.viewer.scene.camera.moveEnd.addEventListener(() => {
            // 获取相机的位置（世界坐标系）
            var position = this.jesium.viewer.scene.camera.position;

            // 将世界坐标转换为地理坐标（经纬度）
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);

            // ··················
            // // 设置允许的最小和最大倾斜角度（单位：弧度）
            // var minPitch = -Math.PI / 6; // 最小倾斜角度 30度
            // var maxPitch = Math.PI / 2;  // 最大倾斜角度 90度
            // var pitch = this.jesium.viewer.scene.camera.pitch;
            // // 如果当前倾斜角度超出范围，则重设它
            // console.log(Cesium.Math.toDegrees(pitch), Cesium.Math.toDegrees(minPitch), 'minpitch')
            // if (pitch < minPitch) {
            //     this.jesium.viewer.scene.camera.lookAt(this.jesium.viewer.scene.camera.position, new Cesium.HeadingPitchRange(this.jesium.viewer.scene.camera.heading, minPitch));
            // } else if (pitch > maxPitch) {
            //     this.jesium.viewer.scene.camera.lookAt(this.jesium.viewer.scene.camera.position, new Cesium.HeadingPitchRange(this.jesium.viewer.scene.camera.heading, maxPitch));
            // }

            // var heading = Cesium.Math.toDegrees(this.jesium.viewer.camera.heading);
            // var pitch = Cesium.Math.toDegrees(this.jesium.viewer.camera.pitch);
            // var roll = Cesium.Math.toDegrees(this.jesium.viewer.camera.roll);
            // console.log(heading, pitch, roll)

            var rotateAngle: any = Cesium.Math.toDegrees(this.jesium.viewer.camera.heading).toFixed(2);
            // console.log('经度: ' + longitude + ', 纬度: ' + latitude, rotateAngle); // 输出经纬度坐标
            let params: any = {
                type: 'moveLocation',
                data: {
                    location: longitude + ',' + latitude,
                    rotateAngle
                },
            };

            if (longitude < 0 || longitude > 180 || latitude < 0 || latitude > 90) {
                return false;
            }

            if (longitude == this.movelongitude && latitude == this.movelatitude) {
                return false;
            }

            this.movelongitude = longitude;
            this.movelatitude = latitude;
            websock?.send(JSON.stringify(params))

        });

        this.limitHeading();
    }

    myLocation(l?: any) {
        let location: any = l ? l.split(',') : [];
        if (!location.length) {
            return false;
        }

        location = location.map(Number);
        let position = Cartesian3.fromDegrees(location[0], location[1]);
        this.jesium.viewer.entities.remove(this.myLocationDta);
        this.myLocationDta = null;

        this.myLocationDta = this.jesium.viewer.entities.add({
            name: '当前位置',
            id: 'myLocation',
            position,
            billboard: {
                image: '/img/loc.png',
                width: 40,
                height: 47,
                scale: 1,
                // pixelOffset: new Cartesian2(-40, 0),
                // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//设置广告牌贴地
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  //确定文字在坐标点的位置, CENTER  RIGHT  LEFT
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),//可视距离
                scaleByDistance: new Cesium.NearFarScalar(3000, 1, 10000, 0.3),//近大远小
            },

        });

        sessionStorage.setItem('myLocation', location.toString())
        location[2] = CONFIG.init_position.height;
        this.jesium.cameraUtils.setViewByCoordArray(location)
    }

    // 判断管线_
    judgeIds(i = "") {
        let ids = i.split('_');
        let newIds: any = ids;
        if (ids.length == 3 && ids[2].length < 5) {
            newIds = [ids[0], ids[1] + '_' + ids[2]];
        } else if (ids.length == 2) {
            newIds = ids;
        } else if (ids.length == 4) {
            newIds = [ids[0] + '_' + ids[1], ids[2] + '_' + ids[3]];
        } else if (ids.length == 3 && ids[1].length < 5) {
            newIds = [ids[0] + '_' + ids[1], ids[2]];
        }

        return newIds;
    }


    /**
    * 监听鼠标移动固定POI：用于鼠标悬浮固定poi显示poi名字
    */
    watchMouseMoveGuDingPOI() {
        const nameOverlay = document.createElement("div");
        this.jesium.viewer.container.appendChild(nameOverlay);

        nameOverlay.style.display = "none";
        nameOverlay.style.position = "absolute";
        nameOverlay.style.bottom = "0";
        nameOverlay.style.left = "0";
        nameOverlay.style["pointer-events" as any] = "none";
        nameOverlay.style["font-size" as any] = "12px";
        nameOverlay.style["border-radius" as any] = "3px";
        nameOverlay.style.padding = "5px 10px";
        nameOverlay.style.color = "#fff";
        nameOverlay.style.cursor = "pointer";
        nameOverlay.style.height = "fit-content";
        nameOverlay.style['line-height' as any] = "20px";
        nameOverlay.style['white-space' as any] = "pre-wrap";
        nameOverlay.style.backgroundColor = "rgba(46, 52, 54, 0.4)";

        this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            const pick = this.jesium.viewer.scene.pick(event.endPosition);
            const position = event.endPosition;
            var primitive: any = null;
            if (pick?.primitive?._url?.indexOf('3001UrlApi') == 1) {
                let code = this.judgeIds(pick.content.batchTable._properties.id[pick.featureId])[0];
                let connectcode = this.judgeIds(pick.content.batchTable._properties.id[pick.featureId])[1];
                // 管线
                if (code && connectcode) {
                    // pipelineList({
                    //     code: code,
                    //     connectcode: connectcode,
                    //     projectId,

                    // }).then((res: any) => {
                    //     let params = res.data.data.records.length ? res.data.data.records[0] : null;
                    //     if (params) {
                    //         nameOverlay.style.display = "block";
                    //         // 管线
                    //         nameOverlay.textContent = t('lang.propertiesBundleId') + '：' + params?.propertiesBundleId + '\n'
                    //             + t('lang.propertiesName') + '：' + params?.propertiesName + '\n'
                    //             + t('lang.propertiesBundleSize') + '：' + (params?.propertiesBundleSize != 'null' ? (bundle_size as any)[params?.propertiesBundleSize] : '') + '\n'
                    //             + t('lang.propertiesDuctLabelColour') + '：' + (pipeLineColor as any)[params?.propertiesDuctLabelColour] + '\n'
                    //             + t('lang.propertiesCategory') + '：' + (category as any)[params.propertiesCategory] + '\n'
                    //             + t('lang.propertiesLength') + '：' + params?.propertiesLength + 'm' + '\n'
                    //         nameOverlay.style.left = `${position.x + 15}px`;
                    //         nameOverlay.style.top = `${position.y - 35}px`;
                    //     } else {
                    //         nameOverlay.style.display = "none";
                    //     }
                    // })

                } else if (code && !connectcode) {
                    // // 附属物
                    // getDpInfo({
                    //     code: code,
                    //     projectId,
                    // }).then((res: any) => {
                    //     let params = res.data.data.records.length ? res.data.data.records[0] : null;
                    //     if (params) {
                    //         nameOverlay.style.display = "block";
                    //         // 附属物
                    //         nameOverlay.textContent =
                    //             t('lang.propertiesBundleId') + '：' + params?.propertiesBundleId + '\n'
                    //             + t('lang.propertiesName') + '：' + params?.propertiesName + '\n'
                    //             + t('lang.longitude') + '：' + params?.locationx + '\n'
                    //             + t('lang.latitude') + '：' + params?.locationy + '\n'
                    //             + t('lang.deviceModel') + '：' + '' + '\n'
                    //             + t('lang.propertiesCategory') + '：' + (category as any)[params.propertiesCategory] + '\n'
                    //         // console.log(params, 'params?.propertiesName')
                    //         nameOverlay.style.left = `${position.x + 15}px`;
                    //         nameOverlay.style.top = `${position.y - 35}px`;
                    //     } else {
                    //         nameOverlay.style.display = "none";
                    //     }
                    // })
                }
                return;
            }

            if (pick && pick.primitive.id) {
                primitive = pick.primitive.id;
                if (this.jesium.viewer.dataSources.getByName('poiAll').length == 0 && pick.id.entityCollection?.owner) {
                    let name = pick.id.entityCollection?.owner?.name.split('.json')[0];
                    nameOverlay.textContent = name + '：' + primitive.name;
                    nameOverlay.style.display = "block";
                } else {
                    if (primitive.id == 'myLocation') { nameOverlay.textContent = '当前位置'; return false; };
                    if (primitive.name?.indexOf('管') != -1) { nameOverlay.style.display = "none"; return false; };
                    // 数据回显
                    if (primitive._properties) {
                        nameOverlay.style.display = "block";
                        let street = primitive._properties._street._value;
                        let attributeId = primitive._properties._attributeId._value;
                        let attributes = primitive._properties._attributes._value ? JSON.parse(primitive._properties._attributes._value) : [];
                        let propertyList: any = [];
                        if (street) {
                            attributeList({
                                current: 1,
                                size: -1,
                                type: street,
                            })
                                .then((res: any) => {
                                    if (res.data.code == 200) {

                                        let list = res.data.data.records.filter((i: any) => { return i.id == attributeId });
                                        let tmp = JSON.parse(list[0].attributes);
                                        tmp.forEach((element: any) => {
                                            let data = attributes.find((i: any) => {
                                                return element.name == i.name;
                                            })

                                            if (data) {
                                                element.model = data.model;
                                                if (element.webShow) {
                                                    propertyList.push(element)
                                                }
                                            }
                                        });

                                        // console.log(propertyList, 'propertyList')
                                        nameOverlay.textContent = propertyList.map((e: any) => (e.name + '：' + e.model + '\n')).join(' ');
                                    }
                                })
                                .catch((err: any) => { });
                        }
                    }
                    // var params = primitive._properties._address._value ? JSON.parse(primitive._properties._address._value) : null;
                    // console.log(primitive._properties)
                    // var locationx = primitive._properties._x._value;
                    // var locationy = primitive._properties._y._value;
                    // if (params) {//poi的管线数据
                    //     if (params.locationx) {
                    //         locationx = params.locationx;
                    //     }
                    //     if (params.locationy) {
                    //         locationy = params.locationy;
                    //     }

                    //     if (params.objectType == "Trench") {
                    //         nameOverlay.textContent =
                    //             t('lang.propertiesName') + '：' + params?.propertiesName + '\n'
                    //             + t('lang.gLength') + '：' + params?.propertiesLength + '\n'
                    //             + t('lang.ConstructionMode') + '：' + params?.propertiesConstructionMode + '\n'
                    //             + t('lang.Depth') + '：' + params?.propertiesDepth + '\n'
                    //             + t('lang.Width') + '：' + params?.propertiesWidth + '\n'
                    //     } else if (params.objectType == "Duct") {
                    //         nameOverlay.textContent = t('lang.propertiesName') + '：' + params?.propertiesName + '\n'
                    //             + t('lang.propertiesBundleSize') + '：' + ((bundle_size as any)[params?.propertiesBundleSize] ? (bundle_size as any)[params?.propertiesBundleSize] : params?.propertiesBundleSize) + '\n'
                    //             + t('lang.propertiesDuctLabelColour') + '：' + (pipeLineColor as any)[params?.propertiesDuctLabelColour] + '\n'
                    //     } else if (params.objectType == "Device") {
                    //         nameOverlay.textContent = t('lang.propertiesName') + '：' + params?.propertiesName + '\n'
                    //             + t('lang.longitude') + '：' + locationx + '\n'
                    //             + t('lang.latitude') + '：' + locationy + '\n'
                    //             + t('lang.deviceModel') + '：' + params?.propertiesModelId + '\n'
                    //             + t('lang.propertiesCategory') + '：' + ((category as any)[params?.propertiesNetworkLevel] ? (category as any)[params?.propertiesNetworkLevel] : params?.propertiesNetworkLevel) + '\n'
                    //     }
                    // }
                }
                nameOverlay.style.left = `${position.x + 15}px`;
                nameOverlay.style.top = `${position.y - 35}px`;
            } else if (pick && pick.id) {
                if (pick.id.entityCollection?.owner) {
                    let name = pick.id.entityCollection?.owner?.name?.split('.json')[0];
                    if (!pick.id.entityCollection?.owner?.name) {
                        return false;
                    }
                    nameOverlay.style.display = "block";
                    nameOverlay.textContent = name;

                    nameOverlay.style.left = `${position.x + 15}px`;
                    nameOverlay.style.top = `${position.y - 35}px`;
                }
            } else if (pick && pick.primitive?.name && pick.primitive?.name.indexOf('rebuild3d') != -1) {
                // 三維重建的
                nameOverlay.style.display = "block";
                let r = pick.primitive?.name.split('rebuild3d_')[1];
                nameOverlay.textContent = r.split('_gid')[0];

                nameOverlay.style.left = `${position.x + 15}px`;
                nameOverlay.style.top = `${position.y - 35}px`;
            } else {
                nameOverlay.style.display = "none";
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    // 基础geojson
    removeGeoJson(url: any) {
        var lis = url.split('/');
        this.jesium.viewer.dataSources.remove(this.jesium.viewer.dataSources.getByName(lis[lis.length - 1])[0])
    }

    // 加载geojson
    loadGeoJson(url: any, isAR?: any) {

        var lis = url.split('/');
        let smcPromise = Cesium.GeoJsonDataSource.load(url, {
            stroke: Cesium.Color.WHITE,
            fill: Cesium.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 2,
            clampToGround: true,
        });
        smcPromise.then((dataSource) => {
            dataSource.name = lis[lis.length - 1];
            this.jesium.viewer.dataSources.add(dataSource);
            if (isAR) {
                this.jesium.viewer.flyTo(dataSource);
            }

            let entities = dataSource.entities.values;
            let colorHash: any = {};
            for (let i = 0; i < entities.length; i++) {
                let entity: any = entities[i];
                let name: any = entity.name; //geojson里面必须得有一个name属性，entity.name对应
                let color = colorHash[name]; //可以使两个同名要素使用同一种颜色。。。
                if (!color) {
                    color = Cesium.Color.fromRandom({
                        alpha: 1.0,
                    });
                    colorHash[name] = color;
                }

                if (entity.polyline) {
                    entity.polyline.material = color; //设置要素颜色
                    entity.polyline.outline = false;
                }

                entity.billboard = undefined;
                entity.label = {
                    text: name,
                    font: '20px sans-serif',
                    fillColor: color,        //字体颜色
                    style: Cesium.LabelStyle.FILL,           //FILL不要轮廓 , OUTLINE只要轮廓,FILL_AND_OUTLINE轮廓加填充
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,  //确定文字在坐标点的位置, CENTER  RIGHT  LEFT
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1000),//可视距离
                    scaleByDistance: new Cesium.NearFarScalar(300, 1, 1000, 0.5),//近大远小
                    // translucencyByDistance: new Cesium.NearFarScalar(1.5, 1.0, 1.5, 0.0),半透明

                }
                // entity.point = new Cesium.PointGraphics({ color: Cesium.Color.WHITE, pixelSize: 10 });
            }
        });
    }

    //点击WMS查询
    clickWMSLayers() {
        let handler = new Cesium.ScreenSpaceEventHandler(this.jesium.viewer.canvas)
        let _this = this
        handler.setInputAction(async function (event?: any) {
            _this.jesium.viewer.selectedEntity = undefined;
            var pickRay: any = _this.jesium.viewer.camera.getPickRay(event.position);
            var featurePromise = await _this.jesium.viewer.imageryLayers.pickImageryLayerFeatures(pickRay, _this.jesium.viewer.scene);
            // console.log(featurePromise, 'featurePromise')
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    changeScale(scaleNum?: any) {
        this.jesium.viewer.zoomTo(this.jesium.viewer.entities, new Cesium.HeadingPitchRange(0.0, -0.5, scaleNum));
    }

    // 加載wms
    wmsService(url: any, layer: any, toUnityLocation?: any) {
        let layers = this.jesium.viewer.scene.globe.imageryLayers;
        let rectangle2 = Cesium.Rectangle.fromDegrees(113.93241295996599, 22.507518528988193, 113.94045167144036, 22.51286343366625);
        // console.log(rectangle2, 'rectangle2')
        let wms = new Cesium.WebMapServiceImageryProvider({
            url: url, //如'http://106.12.xxx/geoserver/xxx/wms'
            layers: layer, //'数据源:图层名'
            // rectangle: rectangle2,//服务的经纬度区间
            // maximumLevel: 12,
            parameters: {
                service: "WMS",
                format: "image/png", //返回格式为png格式
                transparent: true,
            },
        });

        layers.addImageryProvider(wms);

        // 查詢图层位置
        let location = [CONFIG.init_position.longitude, CONFIG.init_position.latitude, CONFIG.init_position.height]
        this.jesium.cameraUtils.setViewByCoordArray(location)

        this.entryAddPOIMode(toUnityLocation); // 进入cesium添加POI模式
    }

    // 倾斜
    initqinxie() {
        memberList({
            status: 1,
            size: 999,
        })
            .then((res) => {
                if (res.data.code == 200) {
                    let list = res.data.data.records;
                    login3001({
                        password: "cybergeo301",
                        phone: "18570414200",
                    }).then((res: any) => {

                        list.forEach((element: any) => {

                            if (element.url && element.url.includes('tileset.json')) {
                                let url = '/imgApi/' + element.url + '?t=1683514380200&token=' + res.headers.token;
                                // this.__scene3DTilesUUIDSet.push(this.jesium.modelUtils.add3DTiles(url, element.name, false));
                            } else if (element.url && element.url.includes('wms')) {
                                // this.wmsService(element.url, element.geoLayer);
                                // this.wmsService(element.url, "ganzhou:PS_gd_Project1");
                            } else if (element.url && element.url.includes('geojson')) {
                                // this.loadGeoJson('/imgApi/' + element.url)
                            }
                        });

                    });


                }
            })
            .catch((err) => {
                // ElMessage({
                //     type: "error",
                //     message: "出错了" + err,
                // });
            });
    }

    // 监听鼠标----相机高度300的时候取消聚合
    mouseMoveGetHeight() {
        //鼠标滚轮的事件
        var _this = this;
        this.jesium.viewer.screenSpaceEventHandler.setInputAction(function (WHEEL?: any) {　　//获取鼠标位置，camera.pickEllipsoid()返回一个cartesian类型位置
            let height = _this.jesium.cameraUtils.getCameraInfo().height;

            // console.log(_this.jesium.viewer.scene.globe.imageryLayers, 'this.jesium.viewer.scene.globe.imageryLayers')

            if (_this.jesium.viewer.dataSources.getByName('poiAll').length > 0) {
                if (height < 300) {
                    // _this.jesium.viewer.dataSources.getByName('poiAll')[0].clustering.enabled = false;
                } else {
                    // _this.jesium.viewer.dataSources.get(0).clustering.enabled = true;
                    // _this.jesium.viewer.dataSources.getByName('poiAll')[0].clustering.enabled = true;
                }
            }


        }, Cesium.ScreenSpaceEventType.WHEEL)
    }


    /**
     * 监听场景加载完成事件
     */
    watchSceneLoadedEvent() {
        const removeCallBack = this.jesium.viewer.scene.globe.tileLoadProgressEvent.addEventListener((listener: any) => {
            if (this.jesium.viewer.scene.globe.tilesLoaded === true) {
                this.sceneLoaded();
                removeCallBack();
            }
        })
        // var helper = new Cesium.EventHelper();
        // helper.add(this.jesium.viewer.scene.globe.tileLoadProgressEvent, function (e) {
        //     console.log('每次加载地图服务矢量切片都会进入这个回调', e);
        //     if (e == 0) {
        //         console.log("矢量切片加载完成时的回调");
        //     }
        // });

    }
    /**
     * 设置场景透明度
     * @param alpha 
     */
    setSceneAlpha(alpha: number) {
        this.curSceneAlpha = alpha;
        /* 设置所有3dtiles透明度 */
        this.__scene3DTilesUUIDSet.forEach(tilesetUUID => {
            this.jesium.modelUtils.set3DTilesOpacityByUUID(tilesetUUID, alpha / 100);
        })
        /**
         * 触发场景透明度变化事件
         */
        if (this.sceneAlphaChangeEvent) {
            this.sceneAlphaChangeEvent(this.curSceneAlpha);
        }

    }
    /**
     * 加载管线
     * @param features 管线features
     */
    async loadPipleLine(features: any[], psn: string, lineType: number, isPipelineManager: boolean = false, psnInfo?: {
        lineType: any,
        psn: any,
        normalPipeData: any,
        distributionPipeData: any,
        warningPipeData: any
    }) {

        const modelIdList: string[] = [];
        let newmodelIdList: string[] = [];
        features.forEach((feature) => {
            if (feature.properties.modelId !== -1) {
                modelIdList.push(feature.properties.modelId);
            }
        })

        // console.log(modelIdList, 'modeidLIst1')
        // console.log(Array.from(new Set(modelIdList)), 'modeidLIst2')

        newmodelIdList = Array.from(new Set(modelIdList));

        const modelIds = newmodelIdList.join(",");
        const modelAndIdMap = (await getMultiPipelineModel(modelIds, projectId)).data.data;
        // console.log(modelAndIdMap, "模型");

        const cesiumContent = this.getCesiumContentBypsn(psn);
        if (psnInfo) {
            cesiumContent.psnData = psnInfo;
        }

        const pipePointList: {
            [key: string]: any[]
        } = {};
        // glbUrl对应positions的字典
        const glbUrlAndPositionsMap: {
            // glbUrl：glb位置数组
            [glbUrl: string]: AddGLTFPosition[]
        } = {};
        features.forEach(async (feature: any, index: number) => {

            const lon = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];
            const height = feature.geometry.coordinates[2];
            const pipeModelProperty = { ...feature };

            /* -------------------加载管点billboard---------------------- */
            if (!isPipelineManager) { // 如果当前不是管线管理再加载
                const beenHaveBillboard = cesiumContent.billboards.find(billboard => {
                    // @ts-ignore
                    return billboard.property.properties.code === feature.properties.code;
                })
                if (!beenHaveBillboard) {
                    const car3 = Cesium.Cartesian3.fromDegrees(lon, lat, height + 0.2);
                    const billboard = this.jesium.modelUtils.addBillboard({
                        image: pipePointIconEnum.WILL_DISTRIBUTION,
                        position: car3,
                        width: 40,
                        height: 40,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
                    });
                    (billboard as any).property = feature;
                    (billboard as any).property.billboardStatus = "未分配"
                    // 将加载的内容放入对应图幅号的cesium内容里
                    cesiumContent.billboards.push(billboard);
                }
            }

            /* ------------------处理管线line----------------------------- */
            const pipelineCoord = [feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.geometry.coordinates[2]];
            if (pipePointList[`${feature.properties.code}`]) { // 判断当前管code是否有线对象了
                pipePointList[`${feature.properties.code}`].push({
                    position: pipelineCoord,
                    connectCode: feature.properties.connectCode,
                    feature,
                });
            } else {
                pipePointList[`${feature.properties.code}`] = [{
                    position: pipelineCoord,
                    connectCode: feature.properties.connectCode,
                    feature,
                }];
            }


            /* ------------------------------加载管点----------------------------- */
            const modelId = feature.properties.modelId;

            /* 如果modelId不等于-1就说明是这个模型需要通过接口获取 */
            if (modelId !== -1) {
                /* 获取构件 */
                let glbUrl = modelAndIdMap[modelId].glbUrl;
                glbUrl = "/imgApi" + glbUrl;
                /* 判断是不是有position数组了，没有就加一个，有就直接添加position */
                if (glbUrlAndPositionsMap[glbUrl]) {
                    const beenHavePipePoint = glbUrlAndPositionsMap[glbUrl].find((position) => {
                        return position.curModelCustomProperty.properties.code === pipeModelProperty.properties.code;
                    })
                    if (!beenHavePipePoint) { // 判断当前管点是否存在，不存在再添加
                        glbUrlAndPositionsMap[glbUrl].push({
                            longitude: feature.geometry.coordinates[0],
                            latitude: feature.geometry.coordinates[1],
                            height: feature.geometry.coordinates[2] - 1,
                            rotationX: 0,
                            rotationY: 0,
                            rotationZ: 0,
                            scale: 1,
                            curModelCustomProperty: pipeModelProperty
                        })
                    }
                } else {
                    glbUrlAndPositionsMap[glbUrl] = [];
                    glbUrlAndPositionsMap[glbUrl].push({
                        longitude: feature.geometry.coordinates[0],
                        latitude: feature.geometry.coordinates[1],
                        height: feature.geometry.coordinates[2] - 1,
                        rotationX: 0,
                        rotationY: 0,
                        rotationZ: 0,
                        scale: 1,
                        curModelCustomProperty: pipeModelProperty
                    })
                }
            } else {
                /* 判断是不是有position数组了，没有就加一个，有就直接添加position */
                if (glbUrlAndPositionsMap["/data/glb/PipePoint.glb"]) {
                    const beenHavePipePoint = glbUrlAndPositionsMap["/data/glb/PipePoint.glb"].find((position) => {
                        return position.curModelCustomProperty.properties.code === pipeModelProperty.properties.code;
                    })
                    if (!beenHavePipePoint) {
                        glbUrlAndPositionsMap["/data/glb/PipePoint.glb"].push({
                            longitude: feature.geometry.coordinates[0],
                            latitude: feature.geometry.coordinates[1],
                            height: feature.geometry.coordinates[2] - 1,
                            rotationX: 0,
                            rotationY: 1,
                            rotationZ: 0,
                            scale: 1,
                            curModelCustomProperty: pipeModelProperty
                        })
                    }

                } else {
                    glbUrlAndPositionsMap["/data/glb/PipePoint.glb"] = [];
                    glbUrlAndPositionsMap["/data/glb/PipePoint.glb"].push({
                        longitude: feature.geometry.coordinates[0],
                        latitude: feature.geometry.coordinates[1],
                        height: feature.geometry.coordinates[2] - 1,
                        rotationX: 0,
                        rotationY: 1,
                        rotationZ: 0,
                        scale: 1,
                        curModelCustomProperty: pipeModelProperty
                    })
                }
            }

            /* 如果glb字典都处理完了就开始加载glb到地图上 */
            if (index === features.length - 1) {
                for (let key in glbUrlAndPositionsMap) {
                    const modelInstanceCollection = this.jesium.modelUtils.addGLTFByI3DM({
                        url: key,
                        positionArr: glbUrlAndPositionsMap[key]
                    });
                    // 将加载的内容放入对应图幅号的cesium内容里
                    cesiumContent.modelCollection.push(modelInstanceCollection);
                }
            }
        });

        /* 加载管线 */
        for (let key in pipePointList) {
            pipePointList[key].forEach(line => {
                if (pipePointList[line.connectCode]) {
                    const origin = line;
                    const target = pipePointList[line.connectCode][0];
                    const code = key;
                    const connectCode = line.connectCode;
                    const pSn = origin.feature.properties.psn

                    // 起始点和结束点放在管线上用于查询管线属性
                    const originAndTarget = [origin, target];
                    const flowLineImg = (PipeLineType as any)[lineType];
                    const material = this.jesium.materialUtils.getPolylineTrailLinkMaterialProperty(3000, flowLineImg);
                    const pipeline = this.jesium.viewer.entities.add({
                        name: "管线",
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                                origin.position[0],
                                origin.position[1],
                                origin.position[2] - 0.5,

                                target.position[0],
                                target.position[1],
                                target.position[2] - 0.5,
                            ]),
                            width: 8,
                            material: material, //修改抛物线材质
                        },
                    });
                    (pipeline as any).pipePointInfo = {
                        code,
                        connectCode,
                        pSn
                    };

                    (pipeline as any).originAndTarget = originAndTarget;
                    // (pipeline as any).property = res.data.data;
                    (pipeline as any).originMaterial = material;
                    (pipeline as any).curColor = "LineMaterial";
                    // 将加载的内容放入对应图幅号的cesium内容里
                    cesiumContent.polygonAndPolylineEntity.push(pipeline)
                } else {
                    // console.log("没有连接点的管线点号：", pipePointList[key].connectCode);
                }
            })
        }
    }
    /**
     * 处理场景透明度
     * 如果场景内的透明度不是100就不管他，如果是100那么就把他设置成20
     */
    handleSceneAlpha() {
        if (this.curSceneAlpha === 100) {
            this.setSceneAlpha(20);
        }
    }
    /**
     * 加载管线表
     * @param psn 管线表编号
     * @param normalPipeData 正常管线数据
     * @param distributionPipeData 已分配管线数据
     * @param warningPipeData 异常管线数据
     */
    async loadPipelineSheet(lineType: number, psn: string, normalPipeData: any[], distributionPipeData: any[], warningPipeData: any[]) {
        // console.log("sheet", lineType, psn, normalPipeData, distributionPipeData, warningPipeData);
        // 加载默认管线
        await this.loadPipleLine(normalPipeData, psn, lineType, false, {
            lineType,
            psn,
            normalPipeData,
            distributionPipeData,
            warningPipeData
        })
        // 加载已分配核查多边形
        this.loadPipeCheckArea(distributionPipeData, psn);
        // 处理管点billboard核查状态
        this.handlePipePointBillboardCheckStatus(distributionPipeData, psn);
        // 处理管点billboard异常状态
        this.handlePipePointBillboardWarningStatus(warningPipeData, psn);
    }
    /**
     * 根据图幅号获取对应的cesium内容
     * @param psn 图幅号
     * @returns cesium内容
     */
    getCesiumContentBypsn(psn: string) {
        let cesiumContent = this.psnAndCesiumContentMap[psn];

        if (!cesiumContent) {
            cesiumContent = {
                billboards: [],
                labels: [],
                modelCollection: [],
                polygonAndPolylineEntity: [],
                areaContent: [],
                psnData: undefined
            }

            this.psnAndCesiumContentMap[psn] = cesiumContent;

        }
        return cesiumContent;
    }
    /**
     * 根据图幅号移除cesium内容
     * @param psn 
     */
    async removeCesiumContentBypsn(psn: string) {
        if (this.psnAndCesiumContentMap[psn]) {
            const cesiumContent = this.psnAndCesiumContentMap[psn];
            cesiumContent.billboards.forEach(billbaord => {
                this.jesium.modelUtils.removeBillboard(billbaord);
            })
            cesiumContent.labels.forEach(label => {
                this.jesium.modelUtils.removeLabel(label);
            })
            cesiumContent.modelCollection.forEach(modelCollection => {
                this.jesium.viewer.scene.primitives.remove(modelCollection);
            })
            cesiumContent.polygonAndPolylineEntity.forEach(entity => {
                this.jesium.viewer.entities.remove(entity);
            });
            cesiumContent.areaContent.forEach(content => {
                this.jesium.modelUtils.removeBillboard(content.billboard);
                content.labelList.forEach(label => {
                    this.jesium.modelUtils.removeLabel(label)
                })
                this.jesium.viewer.entities.remove(content.polygonEntity);
            });
            await delete this.psnAndCesiumContentMap[psn];
        }

        this.removePipe(psn);
    }
    /**
     * 处理管点billboard核查状态
     * @param areaList 
     */
    handlePipePointBillboardCheckStatus(areaList: any[], psn: string) {
        areaList.forEach(area => {
            const areaPipePointList: any[] = area.taskList;
            areaPipePointList.forEach(pipePoint => {
                const pipePointStatus = pipePoint.status;
                const code = pipePoint.code; // 管点号
                const billboard = this.inBillboardsFindBillboardByCode(psn, code);
                if (billboard) {
                    if (pipePointStatus === 0) { // 已核查
                        billboard.image = pipePointIconEnum.CHECKED;
                        (billboard as any).property.billboardStatus = "已核查"
                    } else if (pipePointStatus === 1) { // 待核查
                        billboard.image = pipePointIconEnum.WILL_CHECK;
                        (billboard as any).property.billboardStatus = "待核查"
                    }
                }
            })
        })
    }
    /**
     * 处理选择多边形管点billboard状态
     */
    processSelectPolygonPipePointBillboardStatus(psn: string, pipePointList: any[]) {
        pipePointList.forEach(pipePoint => {
            const billboard = this.inBillboardsFindBillboardByCode(psn, pipePoint.code);
            if (billboard) {
                billboard.image = pipePointIconEnum.WILL_CHECK;
                (billboard as any).property.billboardStatus = "待核查"
            }
        })
    }
    /**
     * 处理管点billboard异常状态
     * @param warningList 
     */
    handlePipePointBillboardWarningStatus(warningList: any[], psn: string) {
        warningList.forEach(warning => {
            const code = warning.code;
            const billboard = this.inBillboardsFindBillboardByCode(psn, code);
            // 判断是否搜索到了匹配的billboard
            if (billboard) {
                billboard.image = pipePointIconEnum.WARNING;
                (billboard as any).property.billboardStatus = "异常"
            }
        })
    }
    /**
     * 在billboards中通过psn和code找billboard
     * @param code 
     */
    inBillboardsFindBillboardByCode(psn: string, code: string) {
        const cesiumContent = this.psnAndCesiumContentMap[psn];
        return cesiumContent.billboards.find(billboard => {
            // 判断code是否相等
            return (billboard as any)?.property?.properties?.code === code;
        })
    }
    /**
     * 在billboards中通过psn和code找billboard
     * @param code 
     */
    inPipeLineFindPipeLineByCode(psn: string, code: string, connectCode: string) {
        const cesiumContent = this.psnAndCesiumContentMap[psn];
        return cesiumContent?.polygonAndPolylineEntity.find(entity => {
            // 判断code是否相等
            return ((entity as any)?.pipePointInfo?.code === code && (entity as any)?.pipePointInfo?.connectCode === connectCode)
                ||
                ((entity as any)?.pipePointInfo?.code === connectCode && (entity as any)?.pipePointInfo?.connectCode === code);
        })
    }

    /**
     * 在modelInstance中通过psn和code找model
     * @param code 
     */
    inModelInstanceFindPipePoint(psn: string, code: string) {
        const cesiumContent = this.psnAndCesiumContentMap[psn];
        let model = null;
        cesiumContent.modelCollection.forEach(modelInstanceCollection => {
            // 判断code是否相等
            modelInstanceCollection._instances.forEach((modelInstance: any) => {
                if (modelInstance.instanceId.properties.code === code) {
                    model = modelInstance;
                }
            });
        })
        return model;
    }


    /**
     * 加载管线已分配核查区域
     */
    loadPipeCheckArea(areaList: any[], psn: string) {
        const cesiumContent = this.getCesiumContentBypsn(psn);
        let tileset: any = null;
        setTimeout(() => {
            tileset = this.jesium.modelUtils.get3DTilesByUUID(this.__scene3DTilesUUIDSet[0])

            areaList.forEach(area => {
                // 多边形坐标集合
                const polygonCoordList: number[] = [];

                // 处理后端返回的多边形坐标字符串成坐标并放入多边形坐标集合
                const polygonCoordArrayList = area.area.split(",").map((coordString: string) => {
                    const singleCoordStrList = coordString.split("=");
                    polygonCoordList.push(+singleCoordStrList[0], +singleCoordStrList[1]);
                    return [+singleCoordStrList[0], +singleCoordStrList[1]]
                });

                // console.log(polygonCoordArrayList, 'polygonCoordArrayList')
                // `````````````````````````````````

                // this.slicing(tileset, polygonCoordArrayList)

                // ````````````


                const postpone = dayjs().isAfter(dayjs(area.endTime));
                const status = area.status;
                let color: any = undefined;

                if (postpone) { // 延期
                    color = pipeAreaStatusColorMap.POSTPONE
                } else if (status === 1) { // 未完成
                    color = pipeAreaStatusColorMap.WILL_FINISH
                } else if (status === 3) { // 完成 //2
                    color = pipeAreaStatusColorMap.FINISH
                }

                if (color) { // 判断颜色判断是否正常-多边形
                    const entity = this.jesium.viewer.entities.add({
                        polygon: {
                            hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polygonCoordList)),
                            material: new Cesium.Color(...color, 0.5),
                            height: 28,
                            heightReference: Cesium.HeightReference.NONE
                        },
                        // polyline: {
                        //     positions: Cesium.Cartesian3.fromDegreesArray(polygonCoordList),
                        //     material: new Cesium.Color(...color, 1),
                        //     clampToGround: false,
                        // }
                    })

                    const turfPolygon = turf.polygon([polygonCoordArrayList]);
                    const distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 500);//可视距离
                    // 多边形中心点
                    const turfCenter = turf.centroid(turfPolygon);
                    const polygonCenter = Cesium.Cartesian3.fromDegrees(turfCenter.geometry.coordinates[0], turfCenter.geometry.coordinates[1], 30)
                    /* 分配人物POI */
                    const billboard = this.jesium.modelUtils.addBillboard({
                        image: "/images/cesium/PolygonPOI.png",
                        width: 268,//184.15,
                        height: 160,//138.5,
                        position: polygonCenter,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        pixelOffset: new Cesium.Cartesian2(0, 0),//-100),
                        distanceDisplayCondition: distanceDisplayCondition,
                    })
                    const totalTaskPipePoint = area.taskList.length; // 总管点任务数
                    let finishTaskPipePointCount = 0; // 完成的任务管点数量
                    area.taskList.forEach((pipePoint: any) => {
                        if (pipePoint.status === 0) {
                            finishTaskPipePointCount++;
                        }
                    })
                    const peopleName = this.jesium.modelUtils.addLabel({
                        text: area.userName,
                        position: polygonCenter,
                        font: "16px 雅黑",
                        style: Cesium.LabelStyle.FILL,
                        fillColor: Cesium.Color.WHITE,
                        pixelOffset: new Cesium.Cartesian2(-60, 0),//负数越大靠左
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        distanceDisplayCondition: distanceDisplayCondition,
                    })
                    const areaName = this.jesium.modelUtils.addLabel({
                        text: area.areaName,
                        position: polygonCenter,
                        font: "18px 雅黑",
                        style: Cesium.LabelStyle.FILL,
                        fillColor: Cesium.Color.WHITE,
                        pixelOffset: new Cesium.Cartesian2(-20, -45),
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        distanceDisplayCondition: distanceDisplayCondition,
                    })
                    const task = this.jesium.modelUtils.addLabel({
                        text: `(${finishTaskPipePointCount}/${totalTaskPipePoint})`,
                        position: polygonCenter,
                        font: "16px 雅黑",
                        style: Cesium.LabelStyle.FILL,
                        fillColor: Cesium.Color.WHITE,
                        pixelOffset: new Cesium.Cartesian2(-60, 45),
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        distanceDisplayCondition: distanceDisplayCondition//new Cesium.DistanceDisplayCondition(0, 200),
                    })



                    /* 往字典里面塞入加载的cesium内容 */
                    cesiumContent.areaContent.push({
                        billboard: billboard,
                        labelList: [peopleName, areaName, task],
                        polygonEntity: entity,
                        areaInfo: area
                    })

                }
            })
        }, 500)
    }
    /**
     * 清空所有框选的多边形区域
     */
    removeAllSelectPolygon() {
        // 清空所有框选的多边形区域
        this.__polygonList.forEach(polygon => {
            this.jesium.viewer.entities.remove(polygon);
        })

        this.__polygonPeoplePOIList.forEach(poi => {
            this.jesium.modelUtils.removeBillboard(poi[0]);
            this.jesium.modelUtils.removeLabel(poi[1]);
        })
        this.__polygonPeoplePOIList = [];
    }

    cancelselectionPolygonArea() {

        if (this.removeSelectPolygon) {
            this.removeSelectPolygon();
        }

        if (this.volumeBillboards.length > 0) {
            this.volumeBillboards.forEach((billboard: any) => {
                this.jesium.modelUtils.removeBillboard(billboard);
            })
            this.volumeBillboards = [];
        }

        if (this.SelectPolygonList.length) {
            this.SelectPolygonList.forEach((polygon: any) => {
                this.jesium.viewer.entities.remove(polygon);
            });
        }
        this.removeSelectPolygon = () => {
            // 移除正在绘制多的polygon
            if (this.__dynamicPolygon) {
                this.jesium.viewer.entities.remove(this.__dynamicPolygon)
                this.__dynamicPolygon = null
            }


            // 清空坐标点
            this.__polygonCoords = []
            // 移除所有鼠标事件
            if (this.__polygonLeftClick) {
                this.__polygonLeftClick();
                this.__polygonLeftClick = undefined
            }
            if (this.__polygonRightClick) {
                this.__polygonRightClick();
                this.__polygonRightClick = undefined
            }
            if (this.__polygonMouseMove) {
                this.__polygonMouseMove();
                this.__polygonMouseMove = undefined
            }
        }
    }

    // 绘制点线
    drawPointLine(destory?: any) {
        const drawTools = new DrawTools();
        drawTools.init(this.jesium.viewer);
        if (destory) {
            console.log('销毁')
            drawTools.destory();
        }
        return;

        document.body.style.cursor = "crosshair";
        var distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 1000);//可视距离
        const removeLeftClick = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            var position: any = this.jesium.viewer.scene.pickPosition(event.position);
            let pickedObject = this.jesium.viewer.scene.pick(event.position);
            console.log(pickedObject, 'pickedObject')

            if (pickedObject) {
                const isStr = typeof (pickedObject.id) === "string";
                if (!isStr && pickedObject.id instanceof Cesium.Entity && pickedObject.id.name.indexOf('diyPL') != -1) {
                    //    管线
                    console.log('点击管线')
                    // pickedObject.id.polyline.positions = new Cesium.CallbackProperty((e) => {
                    //     return polylinePostions;
                    // }, false);

                    this.__polylines.forEach((i: any) => {
                        if (i.id == pickedObject.id.id) {
                            i.polyline.material.color._value = Cesium.Color.YELLOW;
                            i.polyline.depthFailMaterial.color._value = Cesium.Color.YELLOW;
                        }
                    })
                    return;
                } else if (isStr && pickedObject.primitive instanceof Cesium.Billboard && pickedObject.id.indexOf('diyPL') != -1) {
                    // 管点
                    console.log('点击管点');
                    if (position) {
                        pickedObject.primitive.position = new Cesium.CallbackProperty(() => {
                            return position
                        }, false);
                    }

                    // this.__polylines.forEach((i) => {
                    //     let id = pickedObject.id.split('diyPL')[1];
                    //     i.polyline.positions._value.forEach((e:any) => {
                    //         if(e.x==id){
                    //             e = position
                    //         }
                    //     });
                    //     console.log(i.polyline.positions._value, pickedObject.id, 'i')
                    // })


                    const removeMouseMove = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
                        const position = this.jesium.viewer.scene.pickPosition(event.endPosition);
                        if (position) {
                            pickedObject.primitive.position = new Cesium.CallbackProperty(() => {
                                return position
                            }, false);
                        }
                        // this.__polylines.forEach((element, index) => {
                        //     const polylinePostions = element.polyline.positions.getValue() // polyline 线上的点坐标
                        //     element.polyline.positions = new Cesium.CallbackProperty((e) => {
                        //         return [position, polylinePostions[polylinePostions.length - 1]];
                        //     }, false);
                        // });

                    }, ScreenSpaceEventType.MOUSE_MOVE);

                    const removeRightClick = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
                        removeMouseMove();
                    }, ScreenSpaceEventType.RIGHT_CLICK);
                    return;
                }

            }

            if (!position) {
                position = this.jesium.viewer.camera.pickEllipsoid(event.position, this.jesium.viewer.scene.globe.ellipsoid);
            }

            if (position) {
                this.__polylineCoords.push(position);
                if (this.__dynamicPolyline === null) {
                    // 线
                    this.__dynamicPolyline = this.jesium.viewer.entities.add({
                        name: 'diyPL',
                        polyline: {
                            positions: new CallbackProperty(() => {
                                return [...this.__polylineCoords]
                            }, false),
                            width: 6,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineArrowMaterialProperty(
                                Cesium.Color.YELLOW
                            ),
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(
                                Cesium.Color.YELLOW
                            ),
                        },
                    })
                }
                this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                    id: 'diyPL' + position.x,
                    name: 'diyPL',
                    image: "/img/linePoint.png",
                    position: position,
                    scale: 0.6,
                    distanceDisplayCondition,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
                }))
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
        const removeMouseMove = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            const position = this.jesium.viewer.scene.pickPosition(event.endPosition);
            if (position) {
                if (this.__dynamicPolyline) {
                    if (this.__polylineCoords.length > 1) {
                        this.__polylineCoords.pop();
                    }
                    this.__polylineCoords.push(position);
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
        const removeRightClick = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            if (!(this.__polylineCoords.length - 1 >= 2)) return;
            if (this.__dynamicPolyline)
                this.jesium.viewer.entities.remove(this.__dynamicPolyline);
            this.__dynamicPolyline = null;
            this.__polylineCoords.pop();
            // 结束线
            this.__polylines.push(this.jesium.viewer.entities.add({
                name: 'diyPL',
                polyline: {
                    positions: [...this.__polylineCoords],
                    width: 4,
                    clampToGround: false,
                    distanceDisplayCondition,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        color: Cesium.Color.BLUE,
                    }),
                    depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                        color: Cesium.Color.BLUE,
                    }),
                },
            }))


            // 结束回传数组
            const listArr: any = [];
            const clickclenCallBackList: any = [];

            this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
            })

            let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
            listArr2.forEach((element: any, i: any) => {
                let height = element[0][2] - element[1][2];
                const turfLine = turf.lineString(element);
                const turfLength = turf.length(turfLine, {
                    units: "meters"
                })

                // clickclenCallBackList.push({
                //     "code": element[0][0],
                //     "connectcode": element[1][0],
                //     "locationX": element[0][0],
                //     "locationY": element[0][1],
                //     "height": element[0][2],
                //     "propertiesDuctLabelColour": "A",
                //     "address": "长沙",
                //     "pipelinesize": "100",
                // })
            });

            console.log(listArr2, 'clickclenCallBackList')
            // if (this.clickclenCallBack) this.clickclenCallBack(clickclenCallBackList, rId);//回传测量数据

            this.__polylineCoords = [];
        }, ScreenSpaceEventType.RIGHT_CLICK);


        return (e?: any) => {
            //esc退出不清除
            if (!e) {
                // 移除正在绘制多的polyline
                if (this.__dynamicPolyline) {
                    this.jesium.viewer.entities.remove(this.__dynamicPolyline)
                    this.__dynamicPolyline = null;
                }

                // 移除所有billboard
                if (this.__polylineBillboards.length > 0) {
                    this.__polylineBillboards.forEach((billboard: any) => {
                        this.jesium.modelUtils.removeBillboard(billboard);
                    })
                    this.__polylineBillboards = [];
                }

                if (this.__polyline) {
                    this.jesium.viewer.entities.remove(this.__polyline)
                    this.__polyline = null;
                }

                if (this.__polylines.length > 0) {
                    this.__polylines.forEach((polyline: any) => {
                        this.jesium.viewer.entities.remove(polyline)
                    })
                    this.__polylines = [];
                }

                if (this.PolylineDash.length > 0) {
                    this.PolylineDash.forEach((polyline: any) => {
                        this.jesium.viewer.entities.remove(polyline)
                    })
                    this.PolylineDash = [];
                }
                // 清空坐标点
                this.__polylineCoords = [];
            }
            // 移除所有鼠标事件
            removeLeftClick();
            removeMouseMove();
            removeRightClick();
        }
    }

    selectionPolygonArea(finish: ((coords: number[][]) => void) = () => { }) {
        document.body.style.cursor = "crosshair";
        if (this.removeSelectPolygon) {
            this.removeSelectPolygon();
        }

        if (this.volumeBillboards.length > 0) {
            this.volumeBillboards.forEach((billboard: any) => {
                this.jesium.modelUtils.removeBillboard(billboard);
            })
            this.volumeBillboards = [];
        }
        this.__polygonLeftClick = this.selectionPolygonAreaLeftClick();
        this.__polygonMouseMove = this.selectionPolygonAreaMouseMove();
        this.__polygonRightClick = this.selectionPolygonAreaRightClick(finish);
        this.removeSelectPolygon = () => {
            // 移除正在绘制多的polygon
            if (this.__dynamicPolygon) {
                this.jesium.viewer.entities.remove(this.__dynamicPolygon)
                this.__dynamicPolygon = null
            }
            // 清空坐标点
            this.__polygonCoords = []
            // 移除所有鼠标事件
            if (this.__polygonLeftClick) {
                this.__polygonLeftClick();
                this.__polygonLeftClick = undefined
            }
            if (this.__polygonRightClick) {
                this.__polygonRightClick();
                this.__polygonRightClick = undefined
            }
            if (this.__polygonMouseMove) {
                this.__polygonMouseMove();
                this.__polygonMouseMove = undefined
            }
        }
    }
    private selectionPolygonAreaLeftClick() {
        return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            var position: any = this.jesium.viewer.scene.pickPosition(event.position);
            var extrudedHeight = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(position)).height;
            var distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 1000);//可视距离
            if (position) {
                // 测试点
                // this.jesium.viewer.entities.add({
                //     position: position,
                //     point: {
                //         pixelSize: 10,
                //         color: Cesium.Color.RED,
                //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
                //     },
                // });
                this.__polygonCoords.push(position);
                /* 1. 判断是否有正在动态绘制的polyline
                        没有： 创建一个
                        有： 不用创建了，MOUSE_MOVE会用到
                */

                if (this.__dynamicPolygon === null) {
                    this.__dynamicPolygon = this.jesium.viewer.entities.add({
                        polygon: {
                            // 这个方法上面有重点说明
                            hierarchy: new CallbackProperty(() => {
                                // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                                return new PolygonHierarchy(this.__polygonCoords);
                            }, false),
                            extrudedHeight: extrudedHeight,  // 多边体的高度（多边形拉伸高度）
                            material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_DISTRIBUTION, 0.8),
                        },
                        polyline: {
                            positions: new CallbackProperty(() => {
                                return [...this.__polygonCoords]
                            }, false),
                            distanceDisplayCondition,
                            width: 6,
                            // clampToGround: true,
                            // classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
                            material: new Cesium.PolylineArrowMaterialProperty(
                                new Cesium.Color(...pipeAreaStatusColorMap.WILL_DISTRIBUTION, 1)
                            ),
                        },

                    })
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
    }
    private selectionPolygonAreaMouseMove() {
        return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            // 射线
            // const ray = this.jesium.viewer.camera.getPickRay(event.endPosition) as Cesium.Ray;
            // const position = this.jesium.viewer.scene.globe.pick(ray, this.jesium.viewer.scene);
            const position = this.jesium.viewer.scene.pickPosition(event.endPosition);

            if (position) {

                /* 1. 有动态绘制的entity才需要跟随鼠标移动 */
                if (this.__dynamicPolygon) {
                    // 不止一个点才开始动态添加最后一个点
                    if (this.__polygonCoords.length > 1) {
                        // 删掉最后一个点
                        this.__polygonCoords.pop();
                    }
                    // 当前鼠标移动的位置才是最后一个点
                    this.__polygonCoords.push(position);
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }
    private selectionPolygonAreaRightClick(finishCallback: ((coords: number[][]) => void)) {
        return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            var position: any = this.jesium.viewer.scene.pickPosition(event.position);
            var extrudedHeight = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(position)).height;//position的高度
            console.log(extrudedHeight, 'extrudedHeight')
            if (!(this.__polygonCoords.length - 1 >= 2)) return;

            if (this.__dynamicPolygon)
                this.jesium.viewer.entities.remove(this.__dynamicPolygon);
            this.__dynamicPolygon = null;
            this.__polygonCoords.pop();
            // document.body.style.cursor = "auto";
            /* 处理返回的坐标 */
            const positions: number[][] = [];
            this.__polygonCoords.forEach(coord => {
                const degress = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(coord));
                positions.push([degress.longitude, degress.latitude, degress.height]);
            })

            finishCallback(positions);
            this.processCameraPositionOnSelectArea(false);

            /* 计算多边形中心点 */
            const degreesCoords: any = [];
            this.__polygonCoords.forEach((coord) => {
                const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(coord));
                degreesCoords.push([degrees.longitude, degrees.latitude, degrees.height]);
            })
            // 让多边形闭合
            degreesCoords.push([degreesCoords[0][0], degreesCoords[0][1]]);
            const turfPolygon = turf.polygon([degreesCoords]);
            const turfCenter = turf.centroid(turfPolygon);
            // 多边形中心点
            const polygonCenter = Cesium.Cartesian3.fromDegrees(turfCenter.geometry.coordinates[0], turfCenter.geometry.coordinates[1], extrudedHeight + 0.2)


            const p: any = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.jesium.viewer.scene, polygonCenter)  // 输出屏幕坐标
            var cartesian = this.jesium.viewer.scene.pickPosition(p);//获取中心点到沟的位置点
            let height = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(cartesian)).height;

            const polygon: any = this.jesium.viewer.entities.add({
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(this.__polygonCoords),
                    material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_FINISH, 0.8),
                    heightReference: Cesium.HeightReference.NONE,
                    height: height,//多边形下表面到地球表面的高度
                    extrudedHeight: extrudedHeight,//多边体的高度 + height`（多边形上表面到地球表面的高度）
                },
            })

            // 构建网格
            // ·························································································
            let result = this.computeCutAndFillVolumeVoronoi(this.__polygonCoords)
            console.log(result, 'result')
            // ··························································································

            this.SelectPolygonList.push(polygon)
            /* 绑定取消当前区域绘制的函数 */
            this.cancelSelectPolygon = () => {
                this.jesium.viewer.entities.remove(polygon);
            }
            /* 计算多边形面积 */
            // 面积
            // const measureOfArea = turf.area(turfPolygon);
            // console.log(measureOfArea, '面积')


            // 假设 area 是已知的正方形面积，height 是立方体的高度
            // var area = measureOfArea; // 例如，正方形面积是100平方米
            // var h = extrudedHeight - height; // 例如，高度是50米

            // 计算立方体的边长
            // var sideLength = Math.sqrt(area);

            // 使用边长乘以高度计算体积

            const degrees0 = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.__polygonCoords[0]))
            const degrees1 = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.__polygonCoords[1]))
            const degrees2 = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.__polygonCoords[2]))
            var from = turf.point([degrees0.longitude, degrees0.latitude]);
            var to = turf.point([degrees1.longitude, degrees1.latitude]);
            var to2 = turf.point([degrees2.longitude, degrees2.latitude]);
            var chang = turf.distance(from, to, { units: "meters" });
            var kuan = turf.distance(to, to2, { units: "meters" });
            var gao = extrudedHeight - height;

            console.log(chang, kuan, gao, 'changkuangao')
            var volume = chang * kuan * gao;//sideLength * sideLength * h;

            console.log('立方体体积是:', volume + 'm³');
            let width = 70;
            let h1 = 20;
            this.volumeBillboards.push(this.jesium.modelUtils.addBillboard({
                position: polygonCenter,
                image: this.combineIconAndLabel2('/img/bg.png', volume.toFixed(2) + 'm³', width, h1),
                width: width,
                height: h1,
                scale: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(0, 0),//10往上
                // distanceDisplayCondition
            }))


            this.__polygonCoords = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    private computeCutAndFillVolumeVoronoi(positions: Cesium.Cartesian3[]): CutAndFillResult {
        const result = new CutAndFillResult();
        //声明屏幕坐标数组
        const windowPositions: Cesium.Cartesian2[] = [];
        //先遍历一下多边形节点，获取最低高程点，作为基准高程
        //同时将Cartesian3转为屏幕坐标，存放在数组中
        positions.forEach(element => {
            const cartographic = Cesium.Cartographic.fromCartesian(element);
            this.baseHeight = Math.min(cartographic.height, this.baseHeight);
            windowPositions.push(Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.jesium.viewer.scene, element));
        })
        //构建泰森多边形的过程
        const bounds = getBounds(windowPositions);
        const points = turf.randomPoint(50, { bbox: [bounds[0], bounds[1], bounds[2], bounds[3]] });
        const mainPoly = Cartesian2turfPolygon(windowPositions);
        const voronoiPolygons = turf.voronoi(points, { bbox: [bounds[0], bounds[1], bounds[2], bounds[3]] });
        console.log(voronoiPolygons, 'voronoiPolygons')

        //遍历泰森多边形
        voronoiPolygons.features.forEach(element => {
            const intersectPoints = intersect(mainPoly, element.geometry);
            if (intersectPoints.length > 0) {
                //计算每个多边形的面积和高度
                const cubeInfo = this.computeCubeInfo(intersectPoints);
                //低于基准面，填方
                if (this.baseHeight > cubeInfo.avgHeight) {
                    result.fillVolume += (this.baseHeight - cubeInfo.avgHeight) * result.baseArea;
                } else { //高于基准面，挖方
                    result.cutVolume += (cubeInfo.avgHeight - this.baseHeight) * result.baseArea;
                }
                result.maxHeight = Math.max(result.maxHeight, cubeInfo.maxHeight);
                result.minHeight = Math.min(result.minHeight, cubeInfo.minHeight);
                result.baseArea += cubeInfo.baseArea;
            }
        });
        return result;
    }

    private computeCubeInfo(positions: Cesium.Cartesian2[]) {
        let worldPositions: Cesium.Cartographic[] = [];
        let minHeight = Number.MAX_VALUE;
        let maxHeight = Number.MIN_VALUE;
        let sumHeight = 0.0;
        positions.forEach(element => {
            const worldPostion = pickCartesian(this.jesium.viewer, element).cartesian;
            const cartographic = Cesium.Cartographic.fromCartesian(worldPostion);
            worldPositions.push(cartographic);
            minHeight = Math.min(minHeight, cartographic.height);
            maxHeight = Math.max(maxHeight, cartographic.height);
            sumHeight += cartographic.height;
        });
        const avgHeight = sumHeight / positions.length;
        const result = new CubeInfo();
        result.minHeight = minHeight;
        result.maxHeight = maxHeight;
        result.avgHeight = avgHeight;
        result.baseArea = getAreaFromCartograohics(worldPositions);
        return result;
    }
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~·

    /**
     * 框选多边形区域
     */
    // selectionPolygonArea(psn: string, finish: ((coords: number[][]) => void) = () => { }) {
    //     setTimeout(() => {
    //         const map = this.psnAndCesiumContentMap[Object.keys(this.psnAndCesiumContentMap)[0]];
    //         const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(map.billboards[0].position));
    //         this.jesium.viewer.camera.flyTo({
    //             destination: Cesium.Cartesian3.fromDegrees(degrees.longitude, degrees.latitude, 800)
    //         })
    //     }, 1000)
    //     // this.processCameraPositionOnSelectArea(true);
    //     if (this.removeSelectPolygon) {
    //         this.removeSelectPolygon();
    //     }
    //     this.__polygonLeftClick = this.selectionPolygonAreaLeftClick();
    //     this.__polygonMouseMove = this.selectionPolygonAreaMouseMove();
    //     this.__polygonRightClick = this.selectionPolygonAreaRightClick(psn, finish);
    //     this.removeSelectPolygon = () => {
    //         // 移除正在绘制多的polygon
    //         if (this.__dynamicPolygon) {
    //             this.jesium.viewer.entities.remove(this.__dynamicPolygon)
    //             this.__dynamicPolygon = null
    //         }
    //         // 清空坐标点
    //         this.__polygonCoords = []
    //         // 移除所有鼠标事件
    //         if (this.__polygonLeftClick) {
    //             this.__polygonLeftClick();
    //             this.__polygonLeftClick = undefined
    //         }
    //         if (this.__polygonRightClick) {
    //             this.__polygonRightClick();
    //             this.__polygonRightClick = undefined
    //         }
    //         if (this.__polygonMouseMove) {
    //             this.__polygonMouseMove();
    //             this.__polygonMouseMove = undefined
    //         }
    //     }
    // }
    // private selectionPolygonAreaLeftClick() {
    //     return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
    //         const ray = this.jesium.viewer.camera.getPickRay(event.position) as Cesium.Ray;
    //         const position = this.jesium.viewer.scene.globe.pick(ray, this.jesium.viewer.scene);
    //         if (position) {
    //             this.__polygonCoords.push(position);
    //             /* 1. 判断是否有正在动态绘制的polyline
    //                     没有： 创建一个
    //                     有： 不用创建了，MOUSE_MOVE会用到
    //             */
    //             if (this.__dynamicPolygon === null) {
    //                 this.__dynamicPolygon = this.jesium.viewer.entities.add({
    //                     polygon: {
    //                         // 这个方法上面有重点说明
    //                         hierarchy: new Cesium.CallbackProperty(() => {
    //                             // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
    //                             return new Cesium.PolygonHierarchy(this.__polygonCoords);
    //                         }, false),
    //                         material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_DISTRIBUTION, 0.22),
    //                         heightReference: Cesium.HeightReference.NONE
    //                     },
    //                     polyline: {
    //                         positions: new Cesium.CallbackProperty(() => {
    //                             return [...this.__polygonCoords, this.__polygonCoords[0]]
    //                         }, false),
    //                         clampToGround: false,
    //                         width: 4,
    //                         material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_DISTRIBUTION, 1)
    //                     },
    //                 })
    //             }
    //         }
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }
    // private selectionPolygonAreaMouseMove() {
    //     return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
    //         const ray = this.jesium.viewer.camera.getPickRay(event.endPosition) as Cesium.Ray;
    //         const position = this.jesium.viewer.scene.globe.pick(ray, this.jesium.viewer.scene);
    //         if (position) {
    //             /* 1. 有动态绘制的entity才需要跟随鼠标移动 */
    //             if (this.__dynamicPolygon) {
    //                 // 不止一个点才开始动态添加最后一个点
    //                 if (this.__polygonCoords.length > 1) {
    //                     // 删掉最后一个点
    //                     this.__polygonCoords.pop();
    //                 }
    //                 // 当前鼠标移动的位置才是最后一个点
    //                 this.__polygonCoords.push(position);
    //             }
    //         }
    //     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // }
    // private selectionPolygonAreaRightClick(psn: string, finishCallback: ((coords: number[][]) => void)) {
    //     const cesiumContent = this.getCesiumContentBypsn(psn);
    //     return this.jesium.controlUtils.addMouseEventWatch((event: any) => {
    //         if (!(this.__polygonCoords.length - 1 >= 2)) return;
    //         if (this.__polygonMouseMove) {
    //             this.__polygonMouseMove();
    //             this.__polygonMouseMove = undefined
    //         }
    //         if (this.__dynamicPolygon)
    //             this.jesium.viewer.entities.remove(this.__dynamicPolygon);
    //         this.__dynamicPolygon = null;
    //         this.__polygonCoords.pop();

    //         /* 处理返回的坐标 */
    //         const positions: number[][] = [];
    //         this.__polygonCoords.forEach(coord => {
    //             const degress = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(coord));
    //             positions.push([degress.longitude, degress.latitude]);
    //         })
    //         finishCallback(positions);
    //         this.processCameraPositionOnSelectArea(false);
    //         const polygon = this.jesium.viewer.entities.add({
    //             polygon: {
    //                 hierarchy: new Cesium.PolygonHierarchy(this.__polygonCoords),
    //                 material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_FINISH, 0.22),
    //                 heightReference: Cesium.HeightReference.NONE,
    //             },
    //             polyline: {
    //                 positions: [...this.__polygonCoords, this.__polygonCoords[0]],
    //                 clampToGround: false,
    //                 width: 4,
    //                 material: new Cesium.Color(...pipeAreaStatusColorMap.WILL_FINISH, 1)
    //             },
    //         })
    //         cesiumContent.polygonAndPolylineEntity.push(polygon);
    //         /* 绑定取消当前区域绘制的函数 */
    //         this.cancelSelectPolygon = () => {
    //             this.jesium.viewer.entities.remove(polygon);
    //         }
    //         /* 计算多边形中心点 */
    //         const degreesCoords: [number, number][] = [];
    //         this.__polygonCoords.forEach((coord) => {
    //             const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(coord));
    //             degreesCoords.push([degrees.longitude, degrees.latitude]);
    //         })
    //         // 让多边形闭合
    //         degreesCoords.push([degreesCoords[0][0], degreesCoords[0][1]]);
    //         const turfPolygon = turf.polygon([degreesCoords]);
    //         // 多边形中心点
    //         const turfCenter = turf.centroid(turfPolygon);
    //         const polygonCenter = Cesium.Cartesian3.fromDegrees(turfCenter.geometry.coordinates[0], turfCenter.geometry.coordinates[1], 10)

    //         /* 绑定当前区域添加poi的函数 */
    //         this.addSelectPolygonPOI = (areaProperties: any, pickedPipeData: any[]) => {
    //             /* 分配人物POI */
    //             const billboard = this.jesium.modelUtils.addBillboard({
    //                 image: "/images/cesium/PolygonPOI.png",
    //                 width: 184.15,
    //                 height: 138.5,
    //                 position: polygonCenter,
    //                 horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //                 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //                 pixelOffset: new Cesium.Cartesian2(0, 3),
    //                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
    //             })
    //             const peopleName = this.jesium.modelUtils.addLabel({
    //                 text: areaProperties.checkUser,
    //                 position: polygonCenter,
    //                 font: "12px 雅黑",
    //                 pixelOffset: new Cesium.Cartesian2(-66, -89),
    //                 horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    //                 verticalOrigin: Cesium.VerticalOrigin.TOP,
    //                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
    //             })
    //             const areaName = this.jesium.modelUtils.addLabel({
    //                 text: areaProperties.areaName,
    //                 position: polygonCenter,
    //                 font: "12px 雅黑",
    //                 pixelOffset: new Cesium.Cartesian2(-66, -56),
    //                 horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    //                 verticalOrigin: Cesium.VerticalOrigin.TOP,
    //                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
    //             })
    //             const task = this.jesium.modelUtils.addLabel({
    //                 text: `(0/${pickedPipeData.length})`,
    //                 position: polygonCenter,
    //                 font: "12px 雅黑",
    //                 pixelOffset: new Cesium.Cartesian2(-66, -21),
    //                 horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    //                 verticalOrigin: Cesium.VerticalOrigin.TOP,
    //                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000)
    //             })
    //             cesiumContent.billboards.push(billboard);
    //             cesiumContent.labels.push(peopleName, areaName, task);
    //         }


    //         /* 计算多边形面积 */
    //         // 面积
    //         const measureOfArea = turf.area(turfPolygon);
    //         this.__polygonCoords = [];
    //         if (this.__polygonLeftClick) {
    //             this.__polygonLeftClick();
    //             this.__polygonLeftClick = undefined
    //         }
    //         if (this.__polygonRightClick) {
    //             this.__polygonRightClick();
    //             this.__polygonRightClick = undefined
    //         }
    //         this.removeSelectPolygon = undefined;
    //     }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    // }
    /**
     * 搜索管点并聚焦 加载当前管点聚焦
     * @param pipePointData 管点数据
     */
    async searchPipePoint(pipePointData: any) {
        /* 判断是否有之前搜索的时候加载的管点模型 有：删除之前的模型 没有不做操作 */
        if (this.curSearchedPipeModel) {
            this.jesium.viewer.scene.primitives.remove(this.curSearchedPipeModel);
            this.curSearchedPipeModel = undefined;
        }
        /* 1. 加载管点模型 */
        const modelId = pipePointData.properties.modelId;
        const lon = pipePointData.geometry.coordinates[0];
        const lat = pipePointData.geometry.coordinates[1];
        let hei = pipePointData.geometry.coordinates[2];
        let modelUrl = "/data/glb/PipePoint.glb"; // 默认管点模型
        if (modelId !== -1) { // 使用接口返回的模型
            const res = await getPipelineModel(modelId);
            const data = res.data.data;
            modelUrl = "/imgApi" + data.glbUrl;
            hei = hei - 1;
        }
        const modelInstanceCollection = this.jesium.modelUtils.addGLTFByI3DM({
            url: modelUrl,
            positionArr: [{
                longitude: lon,
                latitude: lat,
                height: hei,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                scale: 1,
                curModelCustomProperty: pipePointData
            }]
        });
        // 复制给当前搜索的管点模型
        this.curSearchedPipeModel = modelInstanceCollection;

        /* 2. 飞向管点位置 */
        this.jesium.cameraUtils.flyToByCoordArray([lon, lat, 100]);
    }

    /**
    * 监听点击POI
    */
    watchClickGuDingPOI() {
        this.jesium.controlUtils.addMouseEventWatch((event: any) => {

            /* 过滤不是固定POI的POI */
            const pick = this.jesium.viewer.scene.pick(event.position);
            if (pick) {
                const primitive = pick.primitive.id;
                // console.log(primitive.properties.address._value, 'primitive')
                // /* 进行回调，这个回调参数通过外部填入 */
                if (this.clickPOICallBack) {
                    if (primitive) {
                        this.clickPOICallBack(primitive.properties);
                    }
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
    }


    /**
    * 加载固定POI
    */
    async addGuDingPOI(features: any[], type: number) {
        this.removeAllGuDingPOI();
        features.forEach((feature: any) => {
            this.loadOnceGuDingPOI(feature);
        })
    }
    /**
     * 删除所有固定POI
     */
    removeAllGuDingPOI() {
        this.jesium.viewer.dataSources?.removeAll();
        this.gudingPOIList.forEach(poi => {
            this.jesium.viewer.entities.remove(poi[0]);
            this.jesium.modelUtils.removeLabel(poi[1]);
        })
        this.gudingPOIList = [];

    }



    /**
     * 加载一个固定POI
     * @param feature 
     * @returns 
     */
    loadOnceGuDingPOI(feature: any): [Entity, Label] | undefined {
        /* 文物：lb 古树：gsbhjb 建筑：lb 非遗：level 博物馆：type */

        /* 处理不同接口的属性名 */
        let name = "";
        let position = Cartesian3.fromDegrees(+feature.x, +feature.y);
        let image: string | CallbackProperty = ""
        let scale = 1;
        let eye = new Cartesian3(0, 0, -100);

        /* 如果position没有的话就不渲染点 */
        if (!position) return;

        /* 加载POI */
        const billboard: Entity = this.jesium.viewer.entities.add({
            billboard: {
                image: '/imgApi' + feature.iconUrl,//'/img/poiIco.png'
                scale: 0.4,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//CLAMP_TO_GROUND/RELATIVE_TO_GROUND//
                pixelOffset: new Cartesian2(0, -14),
                // eyeOffset: new Cartesian3(0, 0, -400)// -14),
            },
            position,
        });
        // if (scale) {
        //     if (billboard.billboard)
        //         billboard.billboard.scale = scale as any;
        // }
        // if (eye && billboard.billboard) {
        //     billboard.billboard.eyeOffset = eye as any;
        // }
        (billboard as any).property = feature;
        const label = this.jesium.modelUtils.addLabel({
            text: name,
            position,
            font: "16px 雅黑",
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian2(0, -32),
            // eyeOffset: new Cartesian3(0, 0, -400),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//CLAMP_TO_GROUND/RELATIVE_TO_GROUND//
            // eyeOffset: new Cartesian3(0, 0, -14),
            // style: LabelStyle.FILL_AND_OUTLINE,
            fillColor: new Color(1, 1, 1, 1),
            showBackground: true,
            backgroundColor: new Color(0, 0, 0),
            show: false
        });
        /* 把属性放入POI里面方便后续点击操作 */
        (label as any).property = feature;
        /* 存入列表 */
        this.gudingPOIList.push([billboard, label]);
        return [billboard, label];
    }

    /**
     * 添加poi模式添加poI函数
     * @param poiTitle label内容
     */
    poiModeAddPOI(
        poiTitle: string,
        finishCallBack: ((option: {
            name: string,
            x: number,
            y: number,
            z: number
        }) => void)
    ) {
        /* 判断是否有POI position */
        if (this.poiPosition) {
            /* 添加POI */
            // this.poiLabel = this.jesium.modelUtils.addLabel({
            //     text: poiTitle,
            //     position: this.poiPosition,
            //     font: "16px 雅黑",
            //     showBackground: true,
            //     backgroundColor: Color.BLACK.withAlpha(0.51),
            //     horizontalOrigin: HorizontalOrigin.CENTER,
            //     verticalOrigin: VerticalOrigin.BOTTOM,
            //     pixelOffset: new Cartesian2(0, -38),
            //     // eyeOffset: new Cartesian3(0, 0, -400),//-14)
            //     disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//CLAMP_TO_GROUND/RELATIVE_TO_GROUND//
            // })
            // 添加进入POI列表
            // if (this.poiBillboard && this.poiLabel) {
            //     this.poiList.push([this.poiBillboard, this.poiLabel]);
            // }

            // console.log(this.poiBillboard, 'this.poiBillboard')

            /* 调用完成回调函数 */
            const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.poiPosition));
            finishCallBack({
                name: poiTitle,
                x: degrees.longitude,
                y: degrees.latitude,
                z: degrees.height,
            })

            /* 还原缺省值 */
            this.poiPosition = null;
            if (this.poiBillboard) {
                this.jesium.modelUtils.removeBillboard(this.poiBillboard)
                this.poiBillboard = null;
            }

        }
    }

    // 还原
    initPoi() {
        this.poiPosition = null;
        if (this.poiBillboard) {
            this.jesium.modelUtils.removeBillboard(this.poiBillboard)
            this.poiBillboard = null;
        }
    }

    un_entryAddPOIMode() {
        /* 还原普通模式 */
        const tipEle = document.querySelector(".add-poi-tip") as HTMLDivElement;
        tipEle.style.display = "none";
        if (this.removeMouseMovePoi) {
            this.removeMouseMovePoi();
        }
        if (this.removeLeftClickPoi) {
            this.removeLeftClickPoi();
        }
        document.body.style.cursor = "auto";
    }
    /**
    * 进入添加POI模式
    */
    entryAddPOIMode(visible?: any, ruleForm?: any, pipeLine_tableData?: any) {
        ElMessage.success("开启打点模式");
        /* 把鼠标变成十字架,还有获取提示element */
        document.body.style.cursor = "crosshair";
        const tipEle = document.querySelector(".add-poi-tip") as HTMLDivElement;
        // console.log(tipEle, 'tipEle')

        /* 监听鼠标移动事件,并把提示element显示出来,跟随鼠标 */
        this.removeMouseMovePoi = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            const position = event.endPosition;
            tipEle.style.display = "block"
            tipEle.style.left = `${position.x + 20}px`;
            tipEle.style.top = `${position.y - 40}px`;
        }, ScreenSpaceEventType.MOUSE_MOVE)

        /* 监听左键点击事件,点击就代表要添加POI */
        this.removeLeftClickPoi = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            /* 把点击的位置保存下来 */
            let pickedObject = this.jesium.viewer.scene.pick(event.position);
            var cartographic: any = null;
            // 判断是否拾取到模型

            if (Cesium.defined(pickedObject)) {//有倾斜的时候拾取倾斜的位置
                let cartesian: any = this.jesium.viewer.scene.pickPosition(event.position);
                // 是否获取到空间坐标
                if (Cesium.defined(cartesian)) {
                    cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                }
            } else {
                const start_point: any = this.jesium.viewer.scene.camera.pickEllipsoid(
                    event.position,
                    this.jesium.viewer.scene.globe.ellipsoid
                ); // 获取点的世界坐标
                // 笛卡尔坐标转弧度
                cartographic = Cesium.Cartographic.fromCartesian(
                    start_point,
                    this.jesium.viewer.scene.globe.ellipsoid,
                    new Cesium.Cartographic()
                );
            }

            // Cesium.Math.toDegrees 弧度转度，将弧度转换成经纬度
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            let height = cartographic.height;//Cesium.Math.toDegrees(cartographic.height);

            this.poiPosition = Cesium.Cartesian3.fromDegrees(lng, lat, height);
            this.poiBillboard = this.jesium.modelUtils.addBillboard({
                image: "/img/addPOI.png",
                position: this.poiPosition,
                scale: 0.6,
                pixelOffset: new Cartesian2(0, -16),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            })

            /* 还原普通模式 */
            tipEle.style.display = "none";
            if (this.removeMouseMovePoi) {
                this.removeMouseMovePoi();
            }
            if (this.removeLeftClickPoi) {
                this.removeLeftClickPoi();
            }
            document.body.style.cursor = "auto";

            visible.value = true;
            const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(this.poiPosition));

            ruleForm.x = Math.round(degrees.longitude * 100000000) / 100000000;
            ruleForm.y = Math.round(degrees.latitude * 100000000) / 100000000;
            ruleForm.z = Math.round(degrees.height * 10000) / 10000 + v_449; //保留8位小数

            if (pickedObject?.getProperty && pickedObject?.getProperty('id')) {
                ruleForm.source = pickedObject.getProperty('id');//code_connectCode
            }

            // if (pickedObject.primitive.name) {
            //     pipeLine_tableData.forEach((element: any) => {
            //         if (element.psn == pickedObject.primitive.name) {
            //             ruleForm.areaCode = element.sheetNo;
            //         }
            //     });
            // }


            // this.init3dtilesetColor();

        }, ScreenSpaceEventType.LEFT_CLICK)

        /* 退出添加POI点模式 */
        this.quitAddPoiMode = () => {
            /* 还原普通模式 */
            tipEle.style.display = "none";
            if (this.removeMouseMovePoi) {
                this.removeMouseMovePoi();
            }
            if (this.removeLeftClickPoi) {
                this.removeLeftClickPoi();
            }
            document.body.style.cursor = "auto";
            this.quitAddPoiMode = null;
            // this.init3dtilesetColor();
        }
    }

    /**
     * 移除搜索管线模型
     */
    removeSearchedPipeModel() {
        /* 判断是否有之前搜索的时候加载的管点模型 有：删除之前的模型 没有不做操作 */
        if (this.curSearchedPipeModel) {
            this.jesium.viewer.scene.primitives.remove(this.curSearchedPipeModel);
            this.curSearchedPipeModel = undefined;
        }
    }


    /**
     * 绑定场景透明度变化事件
     * @param change 透明度变化回调函数
     */
    bindSceneAlphaChangeEvent(change: ((curAlpha: number) => void)) {
        this.sceneAlphaChangeEvent = change;
    }
    /**
     * 处理查询管信息
     */
    processQueryPipeInfo() {
        this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            const pick = this.jesium.viewer.scene.pick(event.position);
            if (!pick) return;
            if (pick?.instanceId?.properties?.psn) { // 如果点击的东西又instance属性那么就是管点
                const data = pick.instanceId;
                // console.log("当前点击的东西是管点模型", data)
                if (this.processQueryPipeInfoCallBack) {
                    this.processQueryPipeInfoCallBack(data);
                }
            } else if (pick?.id?.pipePointInfo) { // 如果property下面就直接可以拿到psn那么就是管线
                const pipePointInfo = pick?.id?.pipePointInfo;
                getPipelineInfo({
                    code: pipePointInfo.code,
                    connectCode: pipePointInfo.connectCode,
                    pSn: pipePointInfo.pSn,
                    projectId: projectId
                }).then(res => {
                    const data = res.data.data;
                    // console.log("点击的管线信息", data);
                    if (this.processQueryPipeInfoCallBack) {
                        this.processQueryPipeInfoCallBack(data);
                    }
                })
            } else if (pick.primitive?.property?.billboardStatus) { // 管点billboard
                const data = pick.primitive.property;
                // console.log("当前点击的是管点billboard", data);
                if (this.processQueryPipeInfoCallBack) {
                    this.processQueryPipeInfoCallBack(data);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    /**
     * 管线管理加载管线
     */
    pipelineManagerLoadPipeline(psn: string, features: any[], lineType: number) {
        this.loadPipleLine(features, psn, lineType, true);
    }
    /**
     * 绑定处理查询管信息
     * @param callback 
     */
    bindProcessQueryPipeInfo(callback: ((data: any) => void)) {
        this.processQueryPipeInfoCallBack = callback;
    }

    removeAllCl() {
        // 移除
        if (this.clpolyline.length) {
            this.clpolyline.forEach((polyline: any) => {
                this.jesium.viewer.entities.remove(polyline)
            })
            this.clpolyline = [];
        }

        if (this.clBillboards.length) {
            this.clBillboards.forEach((billboard: any) => {
                this.jesium.modelUtils.removeBillboard(billboard);
            })
            this.clBillboards = [];
        }

        // 
        // 移除正在绘制多的polyline
        if (this.__dynamicPolyline) {
            this.jesium.viewer.entities.remove(this.__dynamicPolyline)
            this.__dynamicPolyline = null;
        }

        // 移除所有billboard
        if (this.__polylineBillboards.length > 0) {
            this.__polylineBillboards.forEach((billboard: any) => {
                this.jesium.modelUtils.removeBillboard(billboard);
            })
            this.__polylineBillboards = [];
        }
        // 移除所有label
        if (this.__polylineLabels.length > 0) {
            this.__polylineLabels.forEach((label: any) => {
                // this.jesium.modelUtils.removeLabel(label)
            })
            this.__polylineLabels = [];
        }
        if (this.__polyline) {
            this.jesium.viewer.entities.remove(this.__polyline)
            this.__polyline = null;
        }

        if (this.__polylines.length > 0) {
            this.__polylines.forEach((polyline: any) => {
                this.jesium.viewer.entities.remove(polyline)
            })
            this.__polylines = [];
        }

        if (this.PolylineDash.length > 0) {
            this.PolylineDash.forEach((polyline: any) => {
                this.jesium.viewer.entities.remove(polyline)
            })
            this.PolylineDash = [];
        }
        // 清空坐标点
        this.__polylineCoords = [];
    }
    initClList(data?: any) {
        this.removeAllCl();
        var distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 30);//可视距离
        if (!data.length) {
            return;
        }

        nextTick(() => {
            data.forEach((item: any) => {
                var attributes = item.attributes ? JSON.parse(item.attributes) : [];
                if (!attributes.length) { return }
                let p = {
                    id: '测量',
                    image: "/img/linePoint.png",
                    scale: 0.6,
                    distanceDisplayCondition,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                }
                attributes.forEach((element: any) => {
                    let position = Cesium.Cartesian3.fromDegrees(Number(element.poi1[0]), Number(element.poi1[1]), Number(element.poi1[2]));
                    this.clBillboards.push(this.jesium.modelUtils.addBillboard({
                        ...p,
                        position: position,
                    }))
                    let position2 = Cesium.Cartesian3.fromDegrees(Number(element.poi2[0]), Number(element.poi2[1]), Number(element.poi2[2]));
                    this.clBillboards.push(this.jesium.modelUtils.addBillboard({
                        ...p,
                        position: position2,
                    }))

                    let pointCenter = (twoToCenter([Number(element.poi1[0]), Number(element.poi1[1]), Number(element.poi1[2])], [Number(element.poi2[0]), Number(element.poi2[1]), Number(element.poi2[2])]));
                    var image = new Image()
                    image.src = '/img/bg.png';
                    let width = 145;
                    let h = 20;
                    let d = Math.abs(Number(element.number) * 100).toFixed(2);
                    let option = {
                        image: this.combineIconAndLabel2('/img/bg.png', t(element.clType == 1 ? 'lang.depth' : 'lang.distance') + `：${d}cm`, width, h),
                        width: width,
                        height: h,
                        scale: 1,
                        pixelOffset: new Cesium.Cartesian2(0, -25),
                        distanceDisplayCondition,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                    // 测量线
                    if (element.clType == 0) {
                        // 水平
                        image.onload = () => {
                            ; (async () => {
                                this.clBillboards.push(this.jesium.modelUtils.addBillboard({
                                    position: pointCenter,
                                    ...option
                                }))

                            })()
                        }
                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            name: "测量",
                            polyline: {
                                positions: [position, position2],
                                width: 6,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: new Cesium.PolylineArrowMaterialProperty(
                                    Cesium.Color.fromCssColorString('#fff')
                                ),
                                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(
                                    Cesium.Color.fromCssColorString('#fff')
                                ),
                            },
                        }));
                    } else {
                        // 垂直
                        const degrees1 = { longitude: Number(element.poi1[0]), latitude: Number(element.poi1[1]), height: Number(element.poi1[2]) };
                        const degrees2 = { longitude: Number(element.poi2[0]), latitude: Number(element.poi2[1]), height: Number(element.poi2[2]) };
                        let poi: any = null;
                        var height = degrees1.height - degrees2.height;
                        if ((height) > 0) {
                            // 第一个点更高
                            poi = JSON.parse(JSON.stringify(degrees2 as any));
                            poi.height = JSON.parse(JSON.stringify(degrees1.height as any));
                        } else {
                            poi = JSON.parse(JSON.stringify(degrees1 as any));
                            poi.height = JSON.parse(JSON.stringify(degrees2.height as any));
                        }
                        let positionC = Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude, poi.height);
                        image.onload = () => {
                            ; (async () => {
                                this.clBillboards.push(this.jesium.modelUtils.addBillboard({
                                    position: positionC,
                                    ...option
                                }))

                            })()
                        }


                        // 直角``````````````````````````
                        // 画线
                        // 设置线段总长度和需要的点数
                        // 获取线上均匀分布的N个点  
                        function getPointsOnLine(start: Cesium.Cartesian3, end: Cesium.Cartesian3, numPoints: number) {
                            var points = [];
                            var distance = Cesium.Cartesian3.distance(start, end);
                            var step = distance / (numPoints - 1);

                            for (var i = 0; i < numPoints; i++) {
                                var t = i / (numPoints - 1);
                                var point = Cesium.Cartesian3.lerp(start, end, t, new Cesium.Cartesian3());
                                points.push(point);
                            }

                            return points;
                        }

                        var pointsOnLine1 = getPointsOnLine(position, positionC, 10);//线段上10个点

                        // 转换为Cartographic坐标并应用偏移（这里只是示例，不精确）
                        let p1 = [Number(element.poi1[0]), Number(element.poi1[1]), Number(element.poi1[2])];
                        let p2 = [Number(poi.longitude), Number(poi.latitude), Number(poi.height)];
                        const turfLine = turf.lineString([p1, p2]);
                        const turfLength = turf.length(turfLine, {
                            units: "meters"
                        })
                        var offsetInMeters: any = (turfLength / 10).toFixed(2);
                        var positions1 = [pointsOnLine1[pointsOnLine1.length - 2], positionC];
                        var newPositions1 = positions1.map((position) => {
                            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                            cartographic.height -= offsetInMeters; // 向下偏移  
                            return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                        });

                        // 直角线
                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            polyline: {
                                positions: [positions1[0], newPositions1[0]],
                                width: 2,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: Cesium.Color.WHITE,
                                depthFailMaterial: Cesium.Color.WHITE,
                            },
                        }))
                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            polyline: {
                                positions: newPositions1,
                                width: 2,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: Cesium.Color.WHITE,
                                depthFailMaterial: Cesium.Color.WHITE,
                            },
                        }))

                        // var image2 = new Image()
                        // image2.src = '/img/sq.png';
                        // let square = 20;

                        // image2.onload = () => {
                        //     ; (async () => {
                        //         this.clBillboards.push(this.jesium.modelUtils.addBillboard({
                        //             position: positionC,
                        //             image: this.combineIconAndLabel2('/img/sq.png', '', square, square),
                        //             width: square,
                        //             height: square,
                        //             scale: 1,
                        //             // rotation: rotateAngle,
                        //             pixelOffset: new Cesium.Cartesian2(-(square / 2), square / 2),
                        //             distanceDisplayCondition,
                        //             disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        //         }))
                        //     })()
                        // }
                        // 直角end````````````````````````````

                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            polyline: {
                                positions: [position, position2],
                                width: 2,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: new Cesium.PolylineDashMaterialProperty({
                                    color: Cesium.Color.WHITE,
                                }),
                                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                                    color: Cesium.Color.WHITE,
                                }),
                            },
                        }))
                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            polyline: {
                                positions: [position, positionC],
                                width: 2,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: new Cesium.PolylineDashMaterialProperty({
                                    color: Cesium.Color.WHITE,
                                }),
                                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                                    color: Cesium.Color.WHITE,
                                }),
                            },
                        }))
                        this.clpolyline.push(this.jesium.viewer.entities.add({
                            polyline: {
                                positions: [position2, positionC],
                                width: 8,
                                clampToGround: false,
                                distanceDisplayCondition,
                                material: new Cesium.PolylineArrowMaterialProperty(
                                    Cesium.Color.fromCssColorString('#4477EE')
                                ),
                                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(
                                    Cesium.Color.fromCssColorString('#4477EE')
                                ),
                            },
                        }))
                    }

                });
            });
        })
    }

    createPlane(planeModelMatrix: any, color: any) {
        // 创建平面
        var planeGeometry = new Cesium.PlaneGeometry({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        });

        // 创建平面外轮廓
        var planeOutlineGeometry = new Cesium.PlaneOutlineGeometry();

        var planeGeometryInstance = new Cesium.GeometryInstance({
            geometry: planeGeometry,
            modelMatrix: planeModelMatrix,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
        });

        this.jesium.viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: planeGeometryInstance,
            appearance: new Cesium.PerInstanceColorAppearance({
                closed: false,
                translucent: false
            })
        }));

        var planeOutlineGeometryInstance = new Cesium.GeometryInstance({
            geometry: planeOutlineGeometry,
            modelMatrix: planeModelMatrix,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
            }
        });

        this.jesium.viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: planeOutlineGeometryInstance,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                renderState: {
                    lineWidth: Math.min(2.0, this.jesium.viewer.scene.maximumAliasedLineWidth)
                }
            })
        }));
    }


    /**
    * 启用线测量
    * val:0水平 1垂直 2
    */
    enableLineMeasurement(clType?: any, isEsc?: any) {
        let message = ElMessage({
            showClose: true,
            message: t('lang.escExit'),
            type: 'success',
            duration: 0
        })
        var distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 30);//可视距离
        var rId: any = null;
        if (isEsc) {
            // const tipEle = document.querySelector(".add-poi-tip") as HTMLDivElement;
            // tipEle.style.display = "none";
            message.close();
            document.body.style.cursor = "auto";
            // console.log(event, this.__polylineCoords, 'event')
            if (!(this.__polylineCoords.length - 1 >= 2)) return;
            // removeMouseMove();
            if (this.__dynamicPolyline)
                this.jesium.viewer.entities.remove(this.__dynamicPolyline);
            this.__dynamicPolyline = null;
            this.__polylineCoords.pop();
            // 结束线
            this.__polylines.push(this.jesium.viewer.entities.add({
                polyline: {
                    positions: [...this.__polylineCoords],
                    width: 4,
                    clampToGround: false,
                    distanceDisplayCondition,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        color: Cesium.Color.WHITE,
                    }),
                    depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                        color: Cesium.Color.WHITE,
                    }),
                },
            }))

            // 结束回传数组
            const listArr: any = [];
            const clickclenCallBackList: any = [];

            this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
            })

            let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
            listArr2.forEach((element: any, i: any) => {
                let height = element[0][2] - element[1][2];
                const turfLine = turf.lineString(element);
                const turfLength = turf.length(turfLine, {
                    units: "meters"
                })

                clickclenCallBackList.push({
                    poi1: element[0],
                    poi2: element[1],
                    clType,
                    number: clType == 0 ? turfLength.toFixed(2) : height.toFixed(2)
                })
            });

            if (this.clickclenCallBack) this.clickclenCallBack(clickclenCallBackList, rId);//回传测量数据

            this.__polylineCoords = [];
        }

        /* 把鼠标变成十字架,还有获取提示element */
        document.body.style.cursor = "crosshair";
        // const tipEle = document.querySelector(".distance-measure") as HTMLDivElement;

        var myuuid: any = null;
        const removeLeftClick = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            var position: any = this.jesium.viewer.scene.pickPosition(event.position);
            let pickedObject = this.jesium.viewer.scene.pick(event.position);
            rId = pickedObject.primitive.name.split('_gid')[1];
            console.log(pickedObject.primitive.name, 'pickedObject.primitive.name')
            if (pickedObject?.primitive && pickedObject.primitive instanceof Cesium.Cesium3DTileset) {
                // 当有线段的时候判断是否当前点击的是否是同一个模型
                if (!myuuid) {
                    myuuid = pickedObject.primitive.uuid;
                }

                if (myuuid && pickedObject.primitive.uuid != myuuid) {
                    ElMessage.warning(t('lang.prohibit'))
                    return false;
                }
            }

            if (!position) {
                position = this.jesium.viewer.camera.pickEllipsoid(event.position, this.jesium.viewer.scene.globe.ellipsoid);
            }

            if (position) {
                this.__polylineCoords.push(position);
                /* 1. 判断是否有正在动态绘制的polyline
                        没有： 创建一个
                        有： 不用创建了，MOUSE_MOVE会用到
                */
                if (this.__dynamicPolyline === null) {
                    // 线
                    this.__dynamicPolyline = this.jesium.viewer.entities.add({
                        polyline: {
                            positions: new CallbackProperty(() => {
                                return [...this.__polylineCoords]
                            }, false),
                            width: 6,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineArrowMaterialProperty(
                                clType == 0 ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString('#4477EE')
                            ),
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(
                                clType == 0 ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString('#4477EE')
                            ),
                        },
                    })
                }

                /* 
                    2. 添加点的icon
                */

                this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                    id: '测量_' + position.x,
                    image: "/img/linePoint.png",
                    position: position,
                    scale: 0.6,
                    distanceDisplayCondition,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
                }))

                // 获取中心点````````
                const listArr: any = [];
                this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                    if (length === this.__polylineCoords.length - 1) return;
                    const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                    listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
                })

                let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
                listArr2.forEach((element: any, i: any) => {
                    let pointCenter = (twoToCenter(element[0], element[1]));
                    let height = element[0][2] - element[1][2];
                    const turfLine = turf.lineString(element);
                    const turfLength = turf.length(turfLine, {
                        units: "meters"
                    })
                    if (i == listArr2.length - 1) {
                        var image = new Image()
                        image.src = '/img/bg.png'
                        image.onload = () => {
                            ; (async () => {
                                let option = {
                                    fontOptions: {
                                        font: 'normal 50px 微软雅黑',
                                        fillColor: '#000',
                                        strokeColor: '#000'
                                    },
                                    //设置padding[上,右,下,左]
                                    padding: [20, 0, 0, 80],
                                    text: clType == 0 ? t('lang.distance') + `：${(turfLength * 100).toFixed(2)}cm` : t('lang.depth') + `${Math.abs((Number(height) * 100).toFixed(2) as any)}cm`,
                                }
                                let width = 145;
                                let h = 20;
                                if (clType == 0) {
                                    this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                                        position: pointCenter,
                                        image: this.combineIconAndLabel2('/img/bg.png', option.text, width, h),
                                        width: width,
                                        height: h,
                                        scale: 1,
                                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                        pixelOffset: new Cesium.Cartesian2(0, -25),//10往上
                                        distanceDisplayCondition
                                    }))
                                }

                            })()
                        }
                    }

                });
                // -----

                // 垂直测量
                if (clType == 1 && this.__polylineCoords.length == 3) { // 第2个点直接结束(单线段)
                    if (this.__dynamicPolyline)
                        this.jesium.viewer.entities.remove(this.__dynamicPolyline);
                    this.__dynamicPolyline = null;
                    this.__polylineCoords.pop();

                    // 虚线
                    const degrees1 = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.__polylineCoords[0]))
                    const degrees2 = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(this.__polylineCoords[1]))
                    let poi: any = null;
                    var height = degrees1.height - degrees2.height;
                    if ((height) > 0) {
                        // 第一个点更高
                        poi = JSON.parse(JSON.stringify(degrees2 as any));
                        poi.height = JSON.parse(JSON.stringify(degrees1.height as any));
                    } else {
                        poi = JSON.parse(JSON.stringify(degrees1 as any));
                        poi.height = JSON.parse(JSON.stringify(degrees2.height as any));
                    }

                    let position = Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude, poi.height);

                    this.PolylineDash.push(this.jesium.viewer.entities.add({
                        polyline: {
                            positions: [...this.__polylineCoords],
                            width: 2,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.WHITE,
                            }),
                            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                                color: Cesium.Color.WHITE,
                            }),
                        },
                    }))
                    this.PolylineDash.push(this.jesium.viewer.entities.add({
                        polyline: {
                            positions: [this.__polylineCoords[0], position],
                            width: 2,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.WHITE,
                            }),
                            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                                color: Cesium.Color.WHITE,
                            }),
                        },
                    }))
                    this.PolylineDash.push(this.jesium.viewer.entities.add({
                        polyline: {
                            positions: [this.__polylineCoords[1], position],
                            width: 8,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineArrowMaterialProperty(
                                Cesium.Color.fromCssColorString('#4477EE')
                            ),
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(
                                Cesium.Color.fromCssColorString('#4477EE')
                            ),
                        },
                    }))
                    // 名牌
                    var image = new Image();
                    image.src = '/img/bg.png';
                    image.onload = () => {
                        ; (async () => {
                            let width = 145;
                            let h = 20;
                            this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                                position: position,
                                image: this.combineIconAndLabel2('/img/bg.png', t(clType == 1 ? 'lang.depth' : 'lang.distance') + `：${Math.abs((Number(height) * 100).toFixed(2) as any)}cm`, width, h),
                                width: width,
                                height: h,
                                scale: 1,
                                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                pixelOffset: new Cesium.Cartesian2(0, -25),//10往上
                                distanceDisplayCondition
                            }))

                        })()
                    }

                    // 结束回传数组
                    const listArr: any = [];
                    const clickclenCallBackList: any = [];

                    this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                        const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                        listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
                    })

                    let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
                    listArr2.forEach((element: any, i: any) => {
                        let height = element[0][2] - element[1][2];
                        const turfLine = turf.lineString(element);
                        const turfLength = turf.length(turfLine, {
                            units: "meters"
                        })

                        clickclenCallBackList.push({
                            poi1: element[0],
                            poi2: element[1],
                            clType,
                            number: clType == 0 ? turfLength.toFixed(2) : height.toFixed(2)
                        })
                    });

                    if (this.clickclenCallBack) this.clickclenCallBack(clickclenCallBackList, rId);//回传测量数据

                    this.__polylineCoords = [];
                }

                // 短距离水平测量
                if (clType == 2 && this.__polylineCoords.length == 4) { // 第3个点直接结束(单线段)
                    if (this.__dynamicPolyline)
                        this.jesium.viewer.entities.remove(this.__dynamicPolyline);
                    this.__dynamicPolyline = null;
                    this.__polylineCoords.pop();

                    // `````````````````````````````````````````````````````````````````````

                    // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
                    function findPerpendicularPoint(P: any, A: any, B: any) {
                        // 计算向量 AB
                        var AB = {
                            x: B.x - A.x,
                            y: B.y - A.y,
                            z: B.z - A.z
                        };

                        // 计算向量 AP
                        var AP = {
                            x: P.x - A.x,
                            y: P.y - A.y,
                            z: P.z - A.z
                        };

                        // 计算向量 AB 的模长
                        var ABLength = Math.sqrt(AB.x * AB.x + AB.y * AB.y + AB.z * AB.z);

                        // 计算向量 AB 的单位向量
                        var ABUnit = {
                            x: AB.x / ABLength,
                            y: AB.y / ABLength,
                            z: AB.z / ABLength
                        };

                        // 计算向量 AP 在 AB 方向上的投影长度
                        var projectionLength = (AP.x * ABUnit.x + AP.y * ABUnit.y + AP.z * ABUnit.z);

                        // 计算投影点 P' 的坐标
                        var PPrime = {
                            x: A.x + projectionLength * ABUnit.x,
                            y: A.y + projectionLength * ABUnit.y,
                            z: A.z + projectionLength * ABUnit.z
                        };

                        return PPrime;
                    }


                    // 示例使用
                    var P = this.__polylineCoords[0];
                    var A = this.__polylineCoords[1];
                    var B = this.__polylineCoords[2];


                    var perpendicularPoint: any = findPerpendicularPoint(P, A, B);


                    const pLonLat = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(P));
                    const ALonLat = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(A));
                    const perpendLonLat = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(perpendicularPoint));
                    perpendLonLat.height = JSON.parse(JSON.stringify(pLonLat.height as any));
                    let intersection = Cesium.Cartesian3.fromDegrees(perpendLonLat.longitude, perpendLonLat.latitude, perpendLonLat.height);

                    const turfLine = turf.lineString([[perpendLonLat.longitude, perpendLonLat.latitude, perpendLonLat.height], [ALonLat.longitude, ALonLat.latitude, ALonLat.height]]);
                    const turfLength = turf.length(turfLine, {
                        units: "meters"
                    })


                    this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                        id: '测量_' + intersection.x,
                        image: "/img/linePoint.png",
                        position: intersection,
                        scale: 0.6,
                        distanceDisplayCondition,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,//99000000,
                    }))




                    // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh


                    // // 定义点A和点B的位置（例如使用Cartesian3）
                    // var pointA = this.__polylineCoords[0];
                    // var pointB = this.__polylineCoords[1];

                    // // 计算AB的中点，并延长一个微小的距离来确保C不会和AB重合
                    // var midpoint = twoToCenter([degrees1.longitude, degrees1.latitude, degrees1.height], [degrees2.longitude, degrees2.latitude, degrees2.height]);
                    // // 计算半径（例如使用点A到圆心的距离）
                    // var radius = Cesium.Cartesian3.distance(pointA, midpoint);


                    // 计算原始向量  
                    // const direction = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());

                    // // 创建旋转矩阵，绕Z轴旋转45度（弧度） 
                    // const rotateAngle: any = Cesium.Math.toDegrees(this.jesium.viewer.camera.heading).toFixed(2);
                    // console.log(rotateAngle, 'rotateAngle')
                    // const angleInRadians = Cesium.Math.toRadians(360 - Number(rotateAngle));
                    // const rotationMatrix = Cesium.Matrix3.fromRotationY(angleInRadians);

                    // // 应用旋转矩阵到原始向量  
                    // const rotatedDirection = Cesium.Matrix3.multiplyByVector(rotationMatrix, direction, new Cesium.Cartesian3());

                    // // 计算旋转后的终点  
                    // const rotatedEnd = Cesium.Cartesian3.add(pointA, rotatedDirection, new Cesium.Cartesian3());

                    // // 输出旋转后的终点  
                    // console.log(rotatedEnd);
                    // this.jesium.viewer.entities.add({
                    //     position: perpendicularPoint,
                    //     point: {
                    //         pixelSize: 20,
                    //         color: Cesium.Color.BLUE,
                    //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    //     },
                    // });


                    // 绘制圆
                    // var circle = this.jesium.viewer.entities.add({
                    //     position: midpoint, // 圆心的经纬度
                    //     ellipsoid: {
                    //         radii: new Cesium.Cartesian3(radius, radius, radius), // 圆的半径
                    //         material: Cesium.Color.RED.withAlpha(0.5) // 圆的材质
                    //     }
                    // });

                    // this.jesium.viewer.entities.add({
                    //     position: position,
                    //     point: {
                    //         pixelSize: 10,
                    //         color: Cesium.Color.RED,
                    //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    //     }
                    // });

                    // ```````````````````````````````````````````````````````````````````````````

                    this.PolylineDash.push(this.jesium.viewer.entities.add({
                        polyline: {
                            positions: [intersection, A],//[...this.__polylineCoords],
                            width: 2,
                            clampToGround: false,
                            distanceDisplayCondition,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.WHITE,
                            }),
                            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                                color: Cesium.Color.WHITE,
                            }),
                        },
                    }))

                    let xs: any = [];
                    this.PolylineDash.forEach(element => {
                        let l = element.polyline.positions._value;
                        l.forEach((e: any) => {
                            xs.push(e.x)
                        });
                    });

                    nextTick(() => {
                        let array1: any = [];
                        this.__polylineBillboards.forEach((i: any) => {
                            if (i.id && i.id.indexOf('测量_') != -1) {
                                array1.push(i);
                            }
                        })

                        const elementsNotInArray2 = array1.filter((obj1: { id: string; }) => !xs.some((obj2: any) => obj2 == Number(obj1.id.split('测量_')[1])));
                        // console.log(elementsNotInArray2);
                        elementsNotInArray2.forEach((i: any) => { i.show = false; })
                    })

                    // 名牌
                    var image = new Image();
                    image.src = '/img/bg.png';
                    image.onload = () => {
                        ; (async () => {
                            let width = 145;
                            let h = 20;
                            this.__polylineBillboards.push(this.jesium.modelUtils.addBillboard({
                                position: A,
                                image: this.combineIconAndLabel2('/img/bg.png', (clType == 1 ? 'depth' : 'distance') + `：${(turfLength * 100).toFixed(2)}cm`, width, h),
                                width: width,
                                height: h,
                                scale: 1,
                                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                pixelOffset: new Cesium.Cartesian2(0, -25),//10往上
                                distanceDisplayCondition
                            }))

                        })()
                    }

                    // 结束回传数组
                    const listArr: any = [];
                    const clickclenCallBackList: any = [];

                    this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                        const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                        listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
                    })

                    let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
                    listArr2.forEach((element: any, i: any) => {
                        let height = element[0][2] - element[1][2];
                        const turfLine = turf.lineString(element);
                        const turfLength = turf.length(turfLine, {
                            units: "meters"
                        })

                        clickclenCallBackList.push({
                            poi1: element[0],
                            poi2: element[1],
                            clType,
                            number: clType == 0 ? turfLength.toFixed(2) : height.toFixed(2)
                        })
                    });

                    if (this.clickclenCallBack) this.clickclenCallBack(clickclenCallBackList, rId);//回传测量数据

                    this.__polylineCoords = [];
                }

            }
        }, ScreenSpaceEventType.LEFT_CLICK);
        const removeMouseMove = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            // const position = this.jesium.viewer.camera.pickEllipsoid(event.endPosition, this.jesium.viewer.scene.globe.ellipsoid);
            const position = this.jesium.viewer.scene.pickPosition(event.endPosition);

            if (position) {
                /* 1. 有动态绘制的entity才需要跟随鼠标移动 */
                if (this.__dynamicPolyline) {
                    // 不止一个点才开始动态添加最后一个点
                    if (this.__polylineCoords.length > 1) {
                        // 删掉最后一个点
                        this.__polylineCoords.pop();
                    }
                    // 当前鼠标移动的位置才是最后一个点
                    this.__polylineCoords.push(position);
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
        const removeRightClick = this.jesium.controlUtils.addMouseEventWatch((event: any) => {
            // console.log(event, this.__polylineCoords, 'event')
            if (!(this.__polylineCoords.length - 1 >= 2)) return;
            // removeMouseMove();
            if (this.__dynamicPolyline)
                this.jesium.viewer.entities.remove(this.__dynamicPolyline);
            this.__dynamicPolyline = null;
            this.__polylineCoords.pop();
            // 结束线
            this.__polylines.push(this.jesium.viewer.entities.add({
                polyline: {
                    positions: [...this.__polylineCoords],
                    width: 4,
                    clampToGround: false,
                    distanceDisplayCondition,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        color: Cesium.Color.WHITE,
                    }),
                    depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({  //(被建筑遮挡部分具有穿透效果、虚线)
                        color: Cesium.Color.WHITE,
                    }),
                },
            }))


            // 结束回传数组
            const listArr: any = [];
            const clickclenCallBackList: any = [];

            this.__polylineCoords.forEach((coord: Cesium.Cartesian3, length: number) => {
                const degrees = this.jesium.coordUtils.cato2Lat(Cartographic.fromCartesian(coord))
                listArr.push([degrees.longitude, degrees.latitude, degrees.height]);
            })

            let listArr2 = listArr.slice(0, -1).map((i: any, index: any) => [listArr[index], listArr[index + 1]]);
            listArr2.forEach((element: any, i: any) => {
                let height = element[0][2] - element[1][2];
                const turfLine = turf.lineString(element);
                const turfLength = turf.length(turfLine, {
                    units: "meters"
                })

                clickclenCallBackList.push({
                    poi1: element[0],
                    poi2: element[1],
                    clType,
                    number: clType == 0 ? turfLength.toFixed(2) : height.toFixed(2)
                })
            });

            if (this.clickclenCallBack) this.clickclenCallBack(clickclenCallBackList, rId);//回传测量数据

            this.__polylineCoords = [];
        }, ScreenSpaceEventType.RIGHT_CLICK);

        return (e?: any) => {
            // tipEle.style.display = "none";
            //esc退出不清除
            if (!e) {
                // 移除正在绘制多的polyline
                if (this.__dynamicPolyline) {
                    this.jesium.viewer.entities.remove(this.__dynamicPolyline)
                    this.__dynamicPolyline = null;
                }

                // 移除所有billboard
                if (this.__polylineBillboards.length > 0) {
                    this.__polylineBillboards.forEach((billboard: any) => {
                        this.jesium.modelUtils.removeBillboard(billboard);
                    })
                    this.__polylineBillboards = [];
                }
                // 移除所有label
                if (this.__polylineLabels.length > 0) {
                    this.__polylineLabels.forEach((label: any) => {
                        // this.jesium.modelUtils.removeLabel(label)
                    })
                    this.__polylineLabels = [];
                }
                if (this.__polyline) {
                    this.jesium.viewer.entities.remove(this.__polyline)
                    this.__polyline = null;
                }

                if (this.__polylines.length > 0) {
                    this.__polylines.forEach((polyline: any) => {
                        this.jesium.viewer.entities.remove(polyline)
                    })
                    this.__polylines = [];
                }

                if (this.PolylineDash.length > 0) {
                    this.PolylineDash.forEach((polyline: any) => {
                        this.jesium.viewer.entities.remove(polyline)
                    })
                    this.PolylineDash = [];
                }
                // 清空坐标点
                this.__polylineCoords = [];
            }
            // 移除所有鼠标事件
            message.close();
            removeLeftClick();
            removeMouseMove();
            removeRightClick();
        }
    }


    //position_A绕position_B逆时针旋转angle度（角度）得到新点
    rotatedPointByAngle(position_A: any, position_B: any, angle: any) {
        //以B点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
        var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position_B);
        //求世界坐标到局部坐标的变换矩阵
        var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());
        //B点在局部坐标的位置，其实就是局部坐标原点
        var localPosition_B = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, position_B, new Cesium.Cartesian3());
        //A点在以B点为原点的局部的坐标位置
        var localPosition_A = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, position_A, new Cesium.Cartesian3());
        //根据数学公式A点逆时针旋转angle度后在局部坐标系中的x,y,z位置
        var new_x = localPosition_A.x * Math.cos(Cesium.Math.toRadians(angle)) + localPosition_A.y * Math.sin(Cesium.Math.toRadians(angle));
        var new_y = localPosition_A.y * Math.cos(Cesium.Math.toRadians(angle)) - localPosition_A.x * Math.sin(Cesium.Math.toRadians(angle));
        var new_z = localPosition_A.z;
        //最后应用局部坐标到世界坐标的转换矩阵求得旋转后的A点世界坐标
        return Cesium.Matrix4.multiplyByPoint(localToWorld_Matrix, new Cesium.Cartesian3(new_x, new_y, new_z), new Cesium.Cartesian3());
    }

    /**
     * 处理选择区域时的相机位置
     */
    processCameraPositionOnSelectArea(isStart: boolean) {
        if (isStart) {
            this.jesium.cameraUtils.flyToByOption({
                heading: 6.282257157341694,
                height: 1301.625781270361,
                latitude: 22.57570726805318,
                longitude: 114.05507524505813,
                pitch: -1.5070800344592326,
                roll: 0.0004087997521819986,
            });
            this.jesium.cameraUtils.limitCamera({
                enableTilt: false
            })
        } else {
            this.jesium.cameraUtils.limitCamera({
                enableTilt: true
            })
        }

    }
    focusPipeLineOrPipePointByInfo(info: any) {
        this.resetCurHeightLightPipeline();
        this.resetCurHeightLightPipepoint();
        if (info.locationX) { // 管点
            // console.log("当前是管点", info)
            const lon = +info.locationX;
            const lat = +info.locationY;
            this.curHeightLightPipePointPOI = this.jesium.viewer.entities.add({
                billboard: {
                    image: new Cesium.CallbackProperty(() => {
                        this.imageIndex++;
                        if (this.imageIndex >= this.images.length) {
                            this.imageIndex = 0;
                        }
                        return this.images[this.imageIndex]
                    }, false),
                    width: 140,
                    height: 270,
                    scaleByDistance: new Cesium.NearFarScalar(1, 1.0, 500, 0.8),
                },
                position: Cesium.Cartesian3.fromDegrees(lon, lat, +info.inHeight + 6)
            })
            this.jesium.viewer.flyTo(this.curHeightLightPipePointPOI)
        } else { // 管线
            // console.log("当前是管线", info)
            const code = info.code;
            const entity = this.inPipeLineFindPipeLineByCode(info.psn, code, info.connectCode);
            if (entity) {
                this.jesium.viewer.flyTo(entity)
                // console.log(entity);
                if (entity.polyline) { // 解决ts报错
                    this.curHeightLightPipeline = entity;
                    (entity.polyline as any).material = Cesium.Color.YELLOW;
                    // @ts-ignore
                    entity.curColor = "Yellow"
                }

            } else {
                // console.log("当前管线code没有在场景里", info.code);
                ElMessage({
                    message: "当前管线不在场景内",
                    type: "warning"
                })
            }
        }
    }
    /**
     * 清除所有cesium内容
     */
    removeAllCesiumContent() {
        for (let psn in this.psnAndCesiumContentMap) {
            this.removeCesiumContentBypsn(psn);
        }
    }
    /**
     * 使高亮管线闪烁
     */
    updateHeightLightPipeline() {
        setInterval(() => {
            if (this.curHeightLightPipeline && this.curHeightLightPipeline.polyline) {
                // @ts-ignore
                if (this.curHeightLightPipeline.curColor === "Yellow") {
                    // @ts-ignore
                    this.curHeightLightPipeline.polyline.material = Cesium.Color.TRANSPARENT;
                    // @ts-ignore
                    this.curHeightLightPipeline.curColor = "Transparent";
                } else {
                    // @ts-ignore
                    this.curHeightLightPipeline.polyline.material = Cesium.Color.YELLOW;
                    // @ts-ignore
                    this.curHeightLightPipeline.curColor = "Yellow";
                }
            }
        }, 500);
    }
    resetCurHeightLightPipeline() {
        if (this.curHeightLightPipeline) {
            // @ts-ignore
            this.curHeightLightPipeline.polyline.material = this.curHeightLightPipeline.originMaterial;
            // @ts-ignore
            this.curHeightLightPipeline.curColor = "LineMaterial";
            this.curHeightLightPipeline = undefined;
        }
    }
    resetCurHeightLightPipepoint() {
        if (this.curHeightLightPipePointPOI) {
            this.jesium.viewer.entities.remove(this.curHeightLightPipePointPOI);
            this.curHeightLightPipePointPOI = undefined;
        }
    }
    /**
     * 处理人员区域显示和隐藏
     */
    processPeopleAreaShowOrHide(info: any) {

        const showAllArea = typeof (info) === "string";
        if (!showAllArea) { // 选中了人
            // console.log(info, "选中了人")
            const areaContents = this.psnAndCesiumContentMap[info.psn].areaContent;
            // console.log(areaContents, 'areaContents')
            // 隐藏当前psn里面所有的多边形内容
            this.hideOrShowAreaContent(areaContents, false);
            info.distributionedPipeData.forEach((area: any) => {
                const findedAreaContent = areaContents.find((areaContent) => {
                    return areaContent.areaInfo.id === area.id;
                });
                // console.log(findedAreaContent, 'findedAreaContent')
                if (findedAreaContent) {
                    this.hideOrShowAreaContent([findedAreaContent], true);
                    const degrees = this.jesium.coordUtils.cato2Lat(Cesium.Cartographic.fromCartesian(findedAreaContent.billboard.position));
                    this.jesium.viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(degrees.longitude, degrees.latitude, 400)
                    })
                }
            })
        } else { // 没有选中人，显示全部
            // console.log(" 没有选中人，显示全部")
            const areaContents = this.psnAndCesiumContentMap[info].areaContent;
            this.hideOrShowAreaContent(areaContents, true);
        }
    }
    /**
     * 隐藏区域内容
     */
    private hideOrShowAreaContent(areaContent: {
        billboard: Cesium.Billboard;
        labelList: Cesium.Label[];
        polygonEntity: Cesium.Entity;
        areaInfo: any;
    }[], show: boolean) {
        areaContent.forEach(area => {
            area.billboard.show = show;
            area.labelList.forEach(label => {
                label.show = show;
            })
            area.polygonEntity.show = show;
        })
    }
}