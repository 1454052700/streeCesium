
import * as Cesium from "cesium"
import * as turf from "@turf/turf"

export function getBounds(points: Cesium.Cartesian2[]): number[] {
    let bounds: number[] = [];
    let left = Number.MAX_VALUE;
    let right = Number.MIN_VALUE;
    let top = Number.MAX_VALUE;
    let bottom = Number.MIN_VALUE;
    points.forEach(element => {
        left = Math.min(left, element.x);
        right = Math.max(right, element.x);
        top = Math.min(top, element.y);
        bottom = Math.max(bottom, element.y);
    });
    bounds.push(left);
    bounds.push(top);
    bounds.push(right);
    bounds.push(bottom);
    return bounds;
}


export function Cartesian2turfPolygon(positions: Cesium.Cartesian2[]): turf.helpers.Polygon {
    var coordinates: number[][][] = [[]];
    positions.forEach(element => {
        coordinates[0].push([element.x, element.y]);
    });
    coordinates[0].push([positions[0].x, positions[0].y]);
    const polygon = turf.polygon(coordinates);
    return polygon.geometry;
}

export function turfPloygon2CartesianArr(geometry: turf.Polygon): Cesium.Cartesian2[] {
    const positionArr: Cesium.Cartesian2[] = [];
    geometry.coordinates.forEach((pointArr: any[]) => {
        pointArr.forEach(point => {
            positionArr.push(new Cesium.Cartesian2(point[0], point[1]));
        });
    });
    positionArr.push(new Cesium.Cartesian2(geometry.coordinates[0][0][0], geometry.coordinates[0][0][1]));
    return positionArr;
}

export function intersect(poly1: turf.helpers.Polygon, poly2: turf.helpers.Polygon): Cesium.Cartesian2[] {
    var intersection = turf.intersect(poly1, poly2);
    if (intersection?.geometry !== undefined) {
        return turfPloygon2CartesianArr(intersection?.geometry as turf.Polygon);
    } else {
        return [];
    }
}

export function getAreaFromCartograohics(positions: Cesium.Cartographic[]): number {
    const x: number[] = [0];
    const y: number[] = [0];
    const geodesic = new Cesium.EllipsoidGeodesic();
    const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
    //数组x,y分别按顺序存储各点的横、纵坐标值
    for (let i = 0; i < positions.length - 1; i++) {
        const p1 = positions[i];
        const p2 = positions[i + 1];
        geodesic.setEndPoints(p1, p2);
        //   const s = Math.sqrt(Math.pow(geodesic.surfaceDistance, 2) +
        //     Math.pow(p2.height - p1.height, 2));
        const s = Math.sqrt(Math.pow(geodesic.surfaceDistance, 2));
        // console.log(s, p2.y - p1.y, p2.x - p1.x)
        const lat1 = p2.latitude * radiansPerDegree;
        const lon1 = p2.longitude * radiansPerDegree;
        const lat2 = p1.latitude * radiansPerDegree;
        const lon2 = p1.longitude * radiansPerDegree;
        let angle = -Math.atan2(
            Math.sin(lon1 - lon2) * Math.cos(lat2),
            Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
        );
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        // console.log('角度：' + (angle * 180) / Math.PI);

        y.push(Math.sin(angle) * s + y[i]);
        x.push(Math.cos(angle) * s + x[i]);
    }

    let sum = 0;
    for (let i = 0; i < x.length - 1; i++) {
        sum += x[i] * y[i + 1] - x[i + 1] * y[i];
    }
    // console.log(x, y)

    return Math.abs(sum + x[x.length - 1] * y[0] - x[0] * y[y.length - 1]) / 2;
}

export function pickCartesian(viewer: Cesium.Viewer, windowPosition: Cesium.Cartesian2): PickResult {
    //根据窗口坐标，从场景的深度缓冲区中拾取相应的位置，返回笛卡尔坐标。
    const cartesianModel = viewer.scene.pickPosition(windowPosition);
    //场景相机向指定的鼠标位置（屏幕坐标）发射射线
    const ray: any = viewer.camera.getPickRay(windowPosition);
    //获取射线与三维球相交的点（即该鼠标位置对应的三维球坐标点，因为模型不属于球面的物体，所以无法捕捉模型表面）
    const cartesianTerrain = viewer.scene.globe.pick(ray, viewer.scene);

    const result = new PickResult();
    if (typeof (cartesianModel) !== 'undefined' && typeof (cartesianTerrain) !== 'undefined') {
        result.cartesian = cartesianModel || cartesianTerrain;
        result.CartesianModel = cartesianModel;
        result.cartesianTerrain = cartesianTerrain as Cesium.Cartesian3;
        result.windowCoordinates = windowPosition.clone();
        //坐标不一致，证明是模型，采用绝对高度。否则是地形，用贴地模式。
        result.altitudeMode = cartesianModel.z.toFixed(0) !== cartesianTerrain!.z.toFixed(0) ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
    }
    return result;
}

export class CutAndFillResult {
    minHeight: number = Number.MAX_VALUE;
    maxHeight: number = Number.MIN_VALUE;
    cutVolume: number = 0.0;
    fillVolume: number = 0.0;
    baseArea: number = 0.0;
}

export class CubeInfo {
    minHeight: number = Number.MAX_VALUE;
    maxHeight: number = Number.MIN_VALUE;
    avgHeight: number = 0.0;
    baseArea: number = 0.0;
}

export class PickResult {
    cartesian!: Cesium.Cartesian3
    cartesianTerrain!: Cesium.Cartesian3
    CartesianModel!: Cesium.Cartesian3
    windowCoordinates!: Cesium.Cartesian2
    altitudeMode = Cesium.HeightReference.NONE
}