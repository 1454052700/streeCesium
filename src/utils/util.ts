import proj4 from 'proj4';
import * as Cesium from "cesium";
// 坐标转换
//定义一些常量
const PI = 3.1415926535897932384626;
const a = 6378245.0; // 长半轴
const ee = 0.00669342162296594323; // 扁率
const gcj02towgs84 = (lng: any, lat: any) => {
    lat = +lat;
    lng = +lng;
    if (out_of_china(lng, lat)) {
        return [lng, lat];
    } else {
        let dlat = transformlat(lng - 105.0, lat - 35.0);
        let dlng = transformlng(lng - 105.0, lat - 35.0);
        let radlat = (lat / 180.0) * PI;
        let magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        let sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
        dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
        let mglat = lat + dlat;
        let mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat];
    }
};

const out_of_china = (lng: any, lat: any) => {
    lat = +lat;
    lng = +lng;
    // 纬度3.86~53.55,经度73.66~135.05
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};

const transformlat = (lng: any, lat: any) => {
    lat = +lat;
    lng = +lng;
    let ret =
        -100.0 +
        2.0 * lng +
        3.0 * lat +
        0.2 * lat * lat +
        0.1 * lng * lat +
        0.2 * Math.sqrt(Math.abs(lng));
    ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
            2.0) /
        3.0;
    ret +=
        ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) *
            2.0) /
        3.0;
    ret +=
        ((160.0 * Math.sin((lat / 12.0) * PI) +
            320 * Math.sin((lat * PI) / 30.0)) *
            2.0) /
        3.0;
    return ret;
};

const transformlng = (lng: any, lat: any) => {
    lat = +lat;
    lng = +lng;
    let ret =
        300.0 +
        lng +
        2.0 * lat +
        0.1 * lng * lng +
        0.1 * lng * lat +
        0.1 * Math.sqrt(Math.abs(lng));
    ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
            2.0) /
        3.0;
    ret +=
        ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) *
            2.0) /
        3.0;
    ret +=
        ((150.0 * Math.sin((lng / 12.0) * PI) +
            300.0 * Math.sin((lng / 30.0) * PI)) *
            2.0) /
        3.0;
    return ret;
};

// 
/**
 * 计算两个点之间的中心点坐标
 * @param point1 第一个点的坐标[long,lat]
 * @param point2 第二个点的坐标[long,lat]
 * @returns 返回中心点
 */
function twoToCenter(point1: any, point2: any) {
    // 将经纬度转换为Cesium的Cartographic对象  
    var cartographic1 = Cesium.Cartographic.fromDegrees(point1[0], point1[1], point1[2]);
    var cartographic2 = Cesium.Cartographic.fromDegrees(point2[0], point2[1], point2[2]);

    // 将Cartographic转换为Cartesian3（在WGS84椭球体上）  
    var cartesian1 = Cesium.Cartographic.toCartesian(cartographic1);
    var cartesian2 = Cesium.Cartographic.toCartesian(cartographic2);

    // 计算中点的Cartesian3坐标  
    var midpointCartesian = Cesium.Cartesian3.midpoint(cartesian1, cartesian2, new Cesium.Cartesian3());

    // // 将中点的Cartesian3坐标转换回Cartographic  
    // var midpointCartographic = Cesium.Cartographic.fromCartesian(midpointCartesian);

    // // 将Cartographic转换回经纬度  
    // var midpointLon = Cesium.Math.toDegrees(midpointCartographic.longitude);
    // var midpointLat = Cesium.Math.toDegrees(midpointCartographic.latitude);
    // //计算两个点的中心坐标
    // let centerPoint = Cesium.Cartesian3.lerp(pointNew1, pointNew2, 0.5, new Cesium.Cartesian3())
    return midpointCartesian
}

// Cartesian3转经纬度
function cartesian3ToLonLat(cartesian3: any) {
    //Cartesian3坐标转换回Cartographic
    var midpointCartographic = Cesium.Cartographic.fromCartesian(cartesian3);

    // 将Cartographic转换回经纬度
    var lon = Cesium.Math.toDegrees(midpointCartographic.longitude);
    var lat = Cesium.Math.toDegrees(midpointCartographic.latitude);
    return [lon, lat]
}



export {
    gcj02towgs84,
    twoToCenter,
    cartesian3ToLonLat
}