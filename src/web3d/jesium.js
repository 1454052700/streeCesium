import * as Cesium$1 from "cesium";
import {
  PolylineCollection,
  GeoJsonDataSource,
  Color,
  Cartesian3,
  PolygonHierarchy,
  JulianDate,
  PostProcessStage,
  Cartographic,
  HorizontalOrigin,
  VerticalOrigin,
  Cartesian2,
  ScreenSpaceEventType,
  CallbackProperty,
  Material,
  Event,
  defined,
  Property,
} from "cesium";
import { lineString, length, polygon, centroid, area } from "@turf/turf";

/**
 * 相机相关工具类
 */
class CameraUtils {
  viewer;
  controlUtils;
  constructor(viewer, controlUtils) {
    this.viewer = viewer;
    this.controlUtils = controlUtils;
  }
  /**
   * 处理相机平移(鼠标左键平移)
   * @param cameraTranslationCallback 相机平移回调事件
   */
  watchCameraTranslation(cameraTranslationCallback) {
    let removeMouseMove;
    // 按下监听移动事件
    this.controlUtils.addMouseEventWatch(() => {
      // 鼠标移动触发相机平移事件
      removeMouseMove = this.controlUtils.addMouseEventWatch(() => {
        cameraTranslationCallback();
      }, Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium$1.ScreenSpaceEventType.LEFT_DOWN);
    // 抬起取消监听移动事件
    this.controlUtils.addMouseEventWatch(() => {
      if (removeMouseMove) removeMouseMove();
    }, Cesium$1.ScreenSpaceEventType.LEFT_UP);
  }
  /**
   * 处理相机缩放(鼠标滚轮缩放)
   */
  watchCameraZoom(cameraZoomCallback) {
    this.controlUtils.addMouseEventWatch(() => {
      cameraZoomCallback();
    }, Cesium$1.ScreenSpaceEventType.WHEEL);
  }
  /**
   * 处理相机右键缩放(鼠标右键缩放)
   */
  watchCameraRightZoom(cameraRightZoomCallback) {
    let removeMouseMove;
    this.controlUtils.addMouseEventWatch(() => {
      removeMouseMove = this.controlUtils.addMouseEventWatch(() => {
        cameraRightZoomCallback();
      }, Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium$1.ScreenSpaceEventType.RIGHT_DOWN);
    this.controlUtils.addMouseEventWatch(() => {
      if (removeMouseMove) removeMouseMove();
    }, Cesium$1.ScreenSpaceEventType.RIGHT_UP);
  }
  /**
   * 监听相机倾斜
   * @param cameraTilt
   */
  watchCameraTilt(cameraTilt) {
    let removeMouseMove;
    this.controlUtils.addMouseEventWatch(() => {
      removeMouseMove = this.controlUtils.addMouseEventWatch(() => {
        cameraTilt();
      }, Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium$1.ScreenSpaceEventType.MIDDLE_DOWN);
    this.controlUtils.addMouseEventWatch(() => {
      if (removeMouseMove) removeMouseMove();
    }, Cesium$1.ScreenSpaceEventType.MIDDLE_UP);
  }
  /**
   * 处理当前相机矩形是否超出范围矩形
   */
  handleCurrentCameraRectangleWhetherExceedRange(range) {
    const currentRectangle = this.viewer.camera.computeViewRectangle(); // 当前相机的bbox(弧度指)
    if (currentRectangle) {
      const cornerDegerValue = {
        east: (currentRectangle?.east / Math.PI) * 180,
        north: (currentRectangle?.north / Math.PI) * 180,
        south: (currentRectangle?.south / Math.PI) * 180,
        west: (currentRectangle?.west / Math.PI) * 180,
      };
      console.log(cornerDegerValue);
      const eastExceedRange = cornerDegerValue.east < range.east; // 超过最大east
      const northExceedRange = cornerDegerValue.north < range.north; // 超过最大north
      const southExceedRange = cornerDegerValue.south < range.south; // 超过最大south
      const westExceedRange = cornerDegerValue.west < range.west; // 超过最大west
      if (
        eastExceedRange ||
        northExceedRange ||
        southExceedRange ||
        westExceedRange
      ) {
        console.log("超出了");
      }
    }
  }
  /**
   * 限制相机范围(待开发)
   */
  limitCameraArea() {
    /*
            east
            :
            1.9920222732020763
            north
            :
            0.3944911912847686
            south
            :
            0.3924099634996581
            west
            :
            1.9888397770436042
        */
    const range = {
      east: 114.1344689505352,
      north: 22.602680315705285,
      south: 22.483434747413092,
      west: 113.95212535233814,
    };
    this.watchCameraTranslation(() => {
      console.log("相机平移");
      this.handleCurrentCameraRectangleWhetherExceedRange(range);
    });
    this.watchCameraZoom(() => {
      console.log("相机缩放");
      this.handleCurrentCameraRectangleWhetherExceedRange(range);
    });
    this.watchCameraRightZoom(() => {
      console.log("相机右键缩放");
      this.handleCurrentCameraRectangleWhetherExceedRange(range);
    });
    this.watchCameraTilt(() => {
      console.log("相机倾斜");
      this.handleCurrentCameraRectangleWhetherExceedRange(range);
    });
  }
  /**
   * 通过坐标数组指定相机 有过度 的飞向指定位置
   * @param coord [x, y, z]（WGS84坐标）
   */
  flyToByCoordArray(coord) {
    this.viewer.camera.flyTo({
      destination: Cesium$1.Cartesian3.fromDegrees(...coord),
    });
  }
  /**
   * 通过坐标数组指定相机 没有过度 的飞向指定位置
   * @param coord [经度, 维度, 高度]（WGS84坐标）
   */
  setViewByCoordArray(coord) {
    this.viewer.camera.setView({
      destination: Cesium$1.Cartesian3.fromDegrees(...coord),
    });
  }
  /**
   * 获取当前相机信息
   * {
   *      经度,
   *      维度,
   *      高度,
   *      pitch,
   *      heading,
   *      roll
   * }
   */
  getCameraInfo() {
    const catoPosition = this.viewer.camera.positionCartographic;
    return {
      latitude: Cesium$1.Math.toDegrees(catoPosition.latitude),
      longitude: Cesium$1.Math.toDegrees(catoPosition.longitude),
      height: catoPosition.height,
      pitch: this.viewer.camera.pitch,
      heading: this.viewer.camera.heading,
      roll: this.viewer.camera.roll,
    };
  }
  /**
   * 添加指南针旋转监听(这个元素默认为向上是北方向)
   */
  addCompass(compassEl, websock) {
    if (compassEl) {
      return this.viewer.camera.changed.addEventListener(() => {
        const rotateAngle = Cesium$1.Math.toDegrees(
          this.viewer.camera.heading
        ).toFixed(2);
        compassEl.style.transform = `rotateZ(${rotateAngle}deg)`;
        // ··················
        var minPitch = -Math.PI / 22.5; // 最小倾斜角度30度
        var pitch = this.viewer.scene.camera.pitch;
        if (Math.abs(pitch) < Math.abs(minPitch)) {
          this.resetCameraHeading(minPitch);
        }
      });
    }
  }
  /**
   * 重置相机重新指向北方(heading为0)
   */
  resetCameraHeading(minPitch) {
    const cameraInfo = this.getCameraInfo();
    // this.viewer.camera.setView({
    //     destination: Cesium$1.Cartesian3.fromDegrees(cameraInfo.longitude, cameraInfo.latitude, cameraInfo.height),
    //     orientation: {
    //         // heading: Cesium$1.Math.toRadians(cameraInfo.heading),
    //         // pitch: minPitch ? minPitch : Cesium$1.Math.toRadians(cameraInfo.pitch),
    //         // roll: Cesium$1.Math.toRadians(cameraInfo.roll)
    //         pitch: minPitch,
    //         heading: this.viewer.camera.heading,
    //         roll: this.viewer.camera.roll
    //     }
    // });
  }
  /**
   * 相机限制（不想要限制的不传就行）
   * @param option 配置对象
   */
  limitCamera(option) {
    if (option.maxHeight !== undefined)
      this.viewer.scene.screenSpaceCameraController.maximumZoomDistance =
        option.maxHeight; //相机高度的最大值
    if (option.minHeight !== undefined)
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance =
        option.minHeight; //相机的高度的最小值
    if (option.enableTilt !== undefined)
      this.viewer.scene.screenSpaceCameraController.enableTilt =
        option.enableTilt; // 是否允许相机倾斜
    if (option.enableRotate !== undefined)
      this.viewer.scene.screenSpaceCameraController.enableRotate =
        option.enableRotate; // 是否允许相机旋转
  }
  /**
   * 根据相机参数进行相机飞行(可以和getCameraInfo搭配)
   * @param option 相机参数
   */
  flyToByOption(option) {
    this.viewer.camera.flyTo({
      destination: Cesium$1.Cartesian3.fromDegrees(
        option.longitude,
        option.latitude,
        option.height
      ),
      orientation: {
        heading: option.heading,
        pitch: option.pitch,
        roll: option.roll,
      },
    });
  }
}

/**
 * 用于cesium鼠标相关的帮助函数
 */
class ControlUtils {
  viewer;
  handler; // cesium用于添加监听事件的handler
  __polygon_point_arr = []; // 动态绘制多边形时用于存放多边形点的数组（绘制完成后会清空）
  __temporary_polygon_entity = null; // 动态绘制多边形时用于存放临时多边形entity的对象（绘制完成会清空）
  __eventList = {
    0: [],
    1: [],
    2: [],
    3: [],
    5: [],
    6: [],
    7: [],
    10: [],
    11: [],
    12: [],
    15: [],
    16: [],
    17: [],
    18: [],
    19: [],
  };
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium$1.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
  }
  /**
   * 添加cesium场景的鼠标事件(同一事件类型只能有一个action，多次注册会覆盖之前的)
   * @param callback 鼠标事件触发的回调函数
   * @param eventType 鼠标事件类型，参考Cesium.ScreenSpaceEventType
   */
  addMouseEventWatch(callback, eventType) {
    //  将回调函数加入事件队列
    this.__eventList[eventType].push(callback);
    // 处理监听事件
    const notSetInputAction = !this.handler.getInputAction(eventType); // 判断当前事件是否设置了inputAction
    if (notSetInputAction) {
      this.handler.setInputAction((event) => {
        const events = [...this.__eventList[eventType]];
        // 获取当前事件类型的事件队列
        events.forEach(
          /* 事件队列的函数 */ /* 事件队列的函数 */ (eventCallBack) => {
            eventCallBack(event);
          }
        );
      }, eventType);
    }
    // 返回移除事件函数
    return () => {
      const callbackIndex = this.__eventList[eventType].indexOf(callback);
      if (callbackIndex > -1) {
        this.__eventList[eventType].splice(callbackIndex, 1);
      }
    };
  }
  /**
   * 开启绘制的方法
   */
  drawPolygon(callback, polygonColor) {
    // 清除可能会用到的监听事件
    if (this.handler) {
      this.handler.removeInputAction(Cesium$1.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.removeInputAction(Cesium$1.ScreenSpaceEventType.RIGHT_CLICK);
    }
    this.handler = new Cesium$1.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    //鼠标左键--确定选中点
    this.handler.setInputAction((event) => {
      // 屏幕坐标转为空间坐标
      let cartesian = this.viewer.camera.pickEllipsoid(
        event.position,
        this.viewer.scene.globe.ellipsoid
      );
      // 判断是否定义（是否可以获取到空间坐标）
      if (Cesium$1.defined(cartesian)) {
        // 将点添加进保存多边形点的数组中，鼠标停止移动的时添加的点和，点击时候添加的点，坐标一样
        this.__polygon_point_arr.push(cartesian);
        // 判断是否开始绘制动态多边形，没有的话则开始绘制
        if (this.__temporary_polygon_entity == null) {
          // 绘制动态多边形
          this.draw_dynamic_polygon(polygonColor);
        }
      }
    }, Cesium$1.ScreenSpaceEventType.LEFT_CLICK);
    //鼠标移动--实时绘制多边形
    this.handler.setInputAction((event) => {
      // 屏幕坐标转为空间坐标
      let cartesian = this.viewer.camera.pickEllipsoid(
        event.endPosition,
        this.viewer.scene.globe.ellipsoid
      );
      // 判断是否定义（是否可以获取到空间坐标）
      if (Cesium$1.defined(cartesian)) {
        // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
        if (this.__temporary_polygon_entity) {
          // 只要元素点大于一，每次就删除一个点，因为实时动态的点是添加上去的
          if (this.__polygon_point_arr.length > 1) {
            // 删除数组最后一个元素（鼠标移动添加进去的点）
            this.__polygon_point_arr.pop();
          }
          // 将新的点添加进动态多边形点的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
          this.__polygon_point_arr.push(cartesian);
        }
      }
    }, Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
    //鼠标右键--结束绘制
    this.handler.setInputAction((event) => {
      // 取消鼠标移动监听
      this.handler.removeInputAction(Cesium$1.ScreenSpaceEventType.MOUSE_MOVE);
      // 清除动态绘制的多边形
      this.viewer.entities.remove(this.__temporary_polygon_entity);
      // 删除保存的临时多边形的entity
      this.__temporary_polygon_entity = null;
      // 绘制结果多边形
      const entity = this.draw_polygon(polygonColor);
      // 清空多边形点数组，用于下次绘制
      this.__polygon_point_arr = [];
      // 清除所有事件
      if (this.handler) {
        this.handler.removeInputAction(
          Cesium$1.ScreenSpaceEventType.LEFT_CLICK
        );
        this.handler.removeInputAction(
          Cesium$1.ScreenSpaceEventType.MOUSE_MOVE
        );
        this.handler.removeInputAction(
          Cesium$1.ScreenSpaceEventType.RIGHT_CLICK
        );
      }
      // 绘制全流程完成调用回调函数并传入绘制结果
      callback(entity);
    }, Cesium$1.ScreenSpaceEventType.RIGHT_CLICK);
  }
  /**
   * 绘制结果多边形
   */
  draw_polygon(polygonColor) {
    // 删除最后一个动态添加的点，如果鼠标没移动，最后一个和倒数第二个是一样的，所以也要删除
    this.__polygon_point_arr.pop();
    // 三个点以上才能绘制成多边形
    if (this.__polygon_point_arr.length >= 3) {
      let polygon_point_entity = this.viewer.entities.add({
        polygon: {
          hierarchy: this.__polygon_point_arr,
          material: polygonColor.withAlpha(0.22),
        },
        polyline: {
          positions: [...this.__polygon_point_arr, this.__polygon_point_arr[0]],
          clampToGround: true,
          width: 4,
          material: polygonColor.withAlpha(1),
        },
      });
      return {
        entity: polygon_point_entity,
        coord: [...this.__polygon_point_arr],
      };
    }
  }
  /**
   * 绘制动态多边形
   */
  draw_dynamic_polygon(polygonColor) {
    this.__temporary_polygon_entity = this.viewer.entities.add({
      polygon: {
        // 这个方法上面有重点说明
        hierarchy: new Cesium$1.CallbackProperty(() => {
          // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
          return new Cesium$1.PolygonHierarchy(this.__polygon_point_arr);
        }, false),
        material: polygonColor.withAlpha(0.22),
      },
      polyline: {
        positions: new Cesium$1.CallbackProperty(() => {
          return [...this.__polygon_point_arr, this.__polygon_point_arr[0]];
        }, false),
        clampToGround: true,
        width: 4,
        material: polygonColor.withAlpha(1),
      },
    });
  }
}

/**
 * 坐标相关工具类
 */
class CoordUtils {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
  }
  /**
   * Cartographic转经纬度
   */
  cato2Lat(cato) {
    return {
      latitude: Cesium$1.Math.toDegrees(cato.latitude),
      longitude: Cesium$1.Math.toDegrees(cato.longitude),
      height: cato.height,
    };
  }
  /**
   * 经纬度转Cartographic
   * @param coord 经纬度数组 [经度，维度，高度]
   */
  lat2Cato(coord) {
    const cartographic = Cesium$1.Cartographic.fromDegrees(...coord);
    return cartographic;
  }
  /**
   * Cartographic转笛卡尔3
   */
  cato2Car3(cato) {
    return this.viewer.scene.globe.ellipsoid.cartographicToCartesian(cato);
  }
}

/**
 * @Author: Caven
 * @Date: 2021-01-31 20:40:25
 */
const BD_FACTOR = (3.14159265358979324 * 3000.0) / 180.0;
const PI = 3.1415926535897932384626;
const RADIUS = 6378245.0;
const EE = 0.00669342162296594323;
class CoordTransform {
  /**
   * BD-09 To GCJ-02
   * @param lng
   * @param lat
   * @returns {number[]}
   */
  static BD09ToGCJ02(lng, lat) {
    let x = +lng - 0.0065;
    let y = +lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * BD_FACTOR);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * BD_FACTOR);
    let gg_lng = z * Math.cos(theta);
    let gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat];
  }
  /**
   * GCJ-02 To BD-09
   * @param lng
   * @param lat
   * @returns {number[]}
   * @constructor
   */
  static GCJ02ToBD09(lng, lat) {
    lat = +lat;
    lng = +lng;
    let z =
      Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * BD_FACTOR);
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * BD_FACTOR);
    let bd_lng = z * Math.cos(theta) + 0.0065;
    let bd_lat = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat];
  }
  /**
   * WGS-84 To GCJ-02
   * @param lng
   * @param lat
   * @returns {number[]}
   */
  static WGS84ToGCJ02(lng, lat) {
    lat = +lat;
    lng = +lng;
    if (this.out_of_china(lng, lat)) {
      return [lng, lat];
    } else {
      let d = this.delta(lng, lat);
      return [lng + d[0], lat + d[1]];
    }
  }
  /**
   * GCJ-02 To WGS-84
   * @param lng
   * @param lat
   * @returns {number[]}
   * @constructor
   */
  static GCJ02ToWGS84(lng, lat) {
    lat = +lat;
    lng = +lng;
    if (this.out_of_china(lng, lat)) {
      return [lng, lat];
    } else {
      let d = this.delta(lng, lat);
      let mgLng = lng + d[0];
      let mgLat = lat + d[1];
      return [lng * 2 - mgLng, lat * 2 - mgLat];
    }
  }
  /**
   *
   * @param lng
   * @param lat
   * @returns {number[]}
   */
  static delta(lng, lat) {
    let dLng = this.transformLng(lng - 105, lat - 35);
    let dLat = this.transformLat(lng - 105, lat - 35);
    const radLat = (lat / 180) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLng = (dLng * 180) / ((RADIUS / sqrtMagic) * Math.cos(radLat) * PI);
    dLat = (dLat * 180) / (((RADIUS * (1 - EE)) / (magic * sqrtMagic)) * PI);
    return [dLng, dLat];
  }
  /**
   *
   * @param lng
   * @param lat
   * @returns {number}
   */
  static transformLng(lng, lat) {
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
      ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) /
      3.0;
    ret +=
      ((150.0 * Math.sin((lng / 12.0) * PI) +
        300.0 * Math.sin((lng / 30.0) * PI)) *
        2.0) /
      3.0;
    return ret;
  }
  /**
   *
   * @param lng
   * @param lat
   * @returns {number}
   */
  static transformLat(lng, lat) {
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
      ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) /
      3.0;
    ret +=
      ((160.0 * Math.sin((lat / 12.0) * PI) +
        320 * Math.sin((lat * PI) / 30.0)) *
        2.0) /
      3.0;
    return ret;
  }
  /**
   *
   * @param lng
   * @param lat
   * @returns {boolean}
   */
  static out_of_china(lng, lat) {
    lat = +lat;
    lng = +lng;
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
  }
}

/**
 * @Author: Caven
 * @Date: 2021-01-31 22:07:05
 */
class AmapMercatorTilingScheme extends Cesium$1.WebMercatorTilingScheme {
  constructor(options) {
    super(options);
    let projection = new Cesium$1.WebMercatorProjection();
    this._projection.project = function (cartographic, result) {
      result = CoordTransform.WGS84ToGCJ02(
        Cesium$1.Math.toDegrees(cartographic.longitude),
        Cesium$1.Math.toDegrees(cartographic.latitude)
      );
      result = projection.project(
        new Cesium$1.Cartographic(
          Cesium$1.Math.toRadians(result[0]),
          Cesium$1.Math.toRadians(result[1])
        )
      );
      return new Cesium$1.Cartesian2(result.x, result.y);
    };
    this._projection.unproject = function (cartesian, result) {
      let cartographic = projection.unproject(cartesian);
      result = CoordTransform.GCJ02ToWGS84(
        Cesium$1.Math.toDegrees(cartographic.longitude),
        Cesium$1.Math.toDegrees(cartographic.latitude)
      );
      return new Cesium$1.Cartographic(
        Cesium$1.Math.toRadians(result[0]),
        Cesium$1.Math.toRadians(result[1])
      );
    };
  }
}

/**
 * @Author: Caven
 * @Date: 2020-01-15 20:31:28
 */
const TILE_URL$2 = {
  img: "//webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  elec: "//webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  cva: "//webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
};
class AmapImageryProvider extends Cesium$1.UrlTemplateImageryProvider {
  constructor(options = {}) {
    options["url"] =
      options.url ||
      [
        options.protocol || "",
        TILE_URL$2[options.style] || TILE_URL$2["elec"],
      ].join("");
    if (!options.subdomains || !options.subdomains.length) {
      options["subdomains"] = ["01", "02", "03", "04"];
    }
    if (options.crs === "WGS84") {
      options["tilingScheme"] = new AmapMercatorTilingScheme({});
    }
    options["maximumLevel"] = 18;
    super(options);
  }
}

/**
 * @Author: Caven
 * @Date: 2021-01-30 22:41:41
 */
const EARTH_RADIUS = 6370996.81;
const MC_BAND = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
const LL_BAND = [75, 60, 45, 30, 15, 0];
const MC2LL = [
  [
    1.410526172116255e-8, 8.98305509648872e-6, -1.9939833816331,
    2.009824383106796e2, -1.872403703815547e2, 91.6087516669843,
    -23.38765649603339, 2.57121317296198, -0.03801003308653, 1.73379812e7,
  ],
  [
    -7.435856389565537e-9, 8.983055097726239e-6, -0.78625201886289,
    96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737,
    -16.50741931063887, 2.28786674699375, 1.026014486e7,
  ],
  [
    -3.030883460898826e-8, 8.98305509983578e-6, 0.30071316287616,
    59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908,
    -3.29883767235584, 0.32710905363475, 6.85681737e6,
  ],
  [
    -1.981981304930552e-8, 8.983055099779535e-6, 0.03278182852591,
    40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263,
    0.12923347998204, -0.04625736007561, 4.48277706e6,
  ],
  [
    3.09191371068437e-9, 8.983055096812155e-6, 0.00006995724062,
    23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273,
    0.03430082397953, -0.00466043876332, 2.5551644e6,
  ],
  [
    2.890871144776878e-9, 8.983055095805407e-6, -0.00000003068298,
    7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596,
    0.00010322952773, -0.00000323890364, 8.260885e5,
  ],
];
const LL2MC = [
  [
    -0.0015702102444, 1.113207020616939e5, 1.704480524535203e15,
    -1.033898737604234e16, 2.611266785660388e16, -3.51496691766537e16,
    2.659570071840392e16, -1.072501245418824e16, 1.800819912950474e15, 82.5,
  ],
  [
    8.277824516172526e-4, 1.113207020463578e5, 6.477955746671608e8,
    -4.082003173641316e9, 1.077490566351142e10, -1.517187553151559e10,
    1.205306533862167e10, -5.124939663577472e9, 9.133119359512032e8, 67.5,
  ],
  [
    0.00337398766765, 1.113207020202162e5, 4.481351045890365e6,
    -2.339375119931662e7, 7.968221547186455e7, -1.159649932797253e8,
    9.723671115602145e7, -4.366194633752821e7, 8.477230501135234e6, 52.5,
  ],
  [
    0.00220636496208, 1.113207020209128e5, 5.175186112841131e4,
    3.796837749470245e6, 9.920137397791013e5, -1.22195221711287e6,
    1.340652697009075e6, -6.209436990984312e5, 1.444169293806241e5, 37.5,
  ],
  [
    -3.441963504368392e-4, 1.113207020576856e5, 2.782353980772752e2,
    2.485758690035394e6, 6.070750963243378e3, 5.482118345352118e4,
    9.540606633304236e3, -2.71055326746645e3, 1.405483844121726e3, 22.5,
  ],
  [
    -3.218135878613132e-4, 1.113207020701615e5, 0.00369383431289,
    8.237256402795718e5, 0.46104986909093, 2.351343141331292e3,
    1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45,
  ],
];
class BaiduMercatorProjection {
  constructor() {
    this.isWgs84 = false;
  }
  getDistanceByMC(point1, point2) {
    if (!point1 || !point2) {
      return 0;
    }
    point1 = this.convertMC2LL(point1);
    if (!point1) {
      return 0;
    }
    let x1 = this.toRadians(point1["lng"]);
    let y1 = this.toRadians(point1["lat"]);
    point2 = this.convertMC2LL(point2);
    if (!point2) {
      return 0;
    }
    let x2 = this.toRadians(point2["lng"]);
    let y2 = this.toRadians(point2["lat"]);
    return this.getDistance(x1, x2, y1, y2);
  }
  /**
   * 根据经纬度坐标计算两点间距离;
   * @param point1
   * @param point2
   * @returns {number|*} 返回两点间的距离
   */
  getDistanceByLL(point1, point2) {
    if (!point1 || !point2) {
      return 0;
    }
    point1["lng"] = this.getLoop(point1["lng"], -180, 180);
    point1["lat"] = this.getRange(point1["lat"], -74, 74);
    point2["lng"] = this.getLoop(point2["lng"], -180, 180);
    point2["lat"] = this.getRange(point2["lat"], -74, 74);
    let x1 = this.toRadians(point1["lng"]);
    let y1 = this.toRadians(point1["lat"]);
    let x2 = this.toRadians(point2["lng"]);
    let y2 = this.toRadians(point2["lat"]);
    return this.getDistance(x1, x2, y1, y2);
  }
  /**
   * 平面直角坐标转换成经纬度坐标;
   * @param point
   * @returns {Point|{lng: number, lat: number}}
   */
  convertMC2LL(point) {
    if (!point) {
      return { lng: 0, lat: 0 };
    }
    let lnglat = {};
    if (this.isWgs84) {
      lnglat.lng = (point.lng / 20037508.34) * 180;
      let mmy = (point.lat / 20037508.34) * 180;
      lnglat.lat =
        (180 / Math.PI) *
        (2 * Math.atan(Math.exp((mmy * Math.PI) / 180)) - Math.PI / 2);
      return {
        lng: lnglat["lng"].toFixed(6),
        lat: lnglat["lat"].toFixed(6),
      };
    }
    let temp = {
      lng: Math.abs(point["lng"]),
      lat: Math.abs(point["lat"]),
    };
    let factor = undefined;
    for (let i = 0; i < MC_BAND.length; i++) {
      if (temp["lat"] >= MC_BAND[i]) {
        factor = MC2LL[i];
        break;
      }
    }
    lnglat = this.convertor(point, factor);
    return {
      lng: lnglat["lng"].toFixed(6),
      lat: lnglat["lat"].toFixed(6),
    };
  }
  /**
   * 经纬度坐标转换成平面直角坐标;
   * @param point 经纬度坐标
   * @returns {{lng: number, lat: number}|*}
   */
  convertLL2MC(point) {
    if (!point) {
      return { lng: 0, lat: 0 };
    }
    if (
      point["lng"] > 180 ||
      point["lng"] < -180 ||
      point["lat"] > 90 ||
      point["lat"] < -90
    ) {
      return point;
    }
    if (this.isWgs84) {
      let mercator = {};
      let earthRad = 6378137.0;
      mercator.lng = ((point.lng * Math.PI) / 180) * earthRad;
      let a = (point.lat * Math.PI) / 180;
      mercator.lat =
        (earthRad / 2) * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
      return {
        lng: parseFloat(mercator["lng"].toFixed(2)),
        lat: parseFloat(mercator["lat"].toFixed(2)),
      };
    }
    point["lng"] = this.getLoop(point["lng"], -180, 180);
    point["lat"] = this.getRange(point["lat"], -74, 74);
    let temp = { lng: point["lng"], lat: point["lat"] };
    let factor = undefined;
    for (let i = 0; i < LL_BAND.length; i++) {
      if (temp["lat"] >= LL_BAND[i]) {
        factor = LL2MC[i];
        break;
      }
    }
    if (!factor) {
      for (let i = 0; i < LL_BAND.length; i++) {
        if (temp["lat"] <= -LL_BAND[i]) {
          factor = LL2MC[i];
          break;
        }
      }
    }
    let mc = this.convertor(point, factor);
    return {
      lng: parseFloat(mc["lng"].toFixed(2)),
      lat: parseFloat(mc["lat"].toFixed(2)),
    };
  }
  /**
   *
   * @param fromPoint
   * @param factor
   * @returns {{lng: *, lat: *}}
   */
  convertor(fromPoint, factor) {
    if (!fromPoint || !factor) {
      return { lng: 0, lat: 0 };
    }
    let x = factor[0] + factor[1] * Math.abs(fromPoint["lng"]);
    let temp = Math.abs(fromPoint["lat"]) / factor[9];
    let y =
      factor[2] +
      factor[3] * temp +
      factor[4] * temp * temp +
      factor[5] * temp * temp * temp +
      factor[6] * temp * temp * temp * temp +
      factor[7] * temp * temp * temp * temp * temp +
      factor[8] * temp * temp * temp * temp * temp * temp;
    x *= fromPoint["lng"] < 0 ? -1 : 1;
    y *= fromPoint["lat"] < 0 ? -1 : 1;
    return {
      lng: x,
      lat: y,
    };
  }
  /**
   *
   * @param x1
   * @param x2
   * @param y1
   * @param y2
   * @returns {number}
   */
  getDistance(x1, x2, y1, y2) {
    return (
      EARTH_RADIUS *
      Math.acos(
        Math.sin(y1) * Math.sin(y2) +
          Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)
      )
    );
  }
  /**
   *
   * @param deg
   * @returns {number}
   */
  toRadians(deg) {
    return (Math.PI * deg) / 180;
  }
  /**
   *
   * @param rad
   * @returns {number}
   */
  toDegrees(rad) {
    return (180 * rad) / Math.PI;
  }
  /**
   *
   * @param v
   * @param a
   * @param b
   * @returns {number}
   */
  getRange(v, a, b) {
    if (a != null) {
      v = Math.max(v, a);
    }
    if (b != null) {
      v = Math.min(v, b);
    }
    return v;
  }
  /**
   *
   * @param v
   * @param a
   * @param b
   * @returns {*}
   */
  getLoop(v, a, b) {
    while (v > b) {
      v -= b - a;
    }
    while (v < a) {
      v += b - a;
    }
    return v;
  }
  /**
   *
   * @param point
   * @returns {{lng: number, lat: number}|*}
   */
  lngLatToMercator(point) {
    return this.convertLL2MC(point);
  }
  /**
   *
   * @param point
   * @returns {{x: (number|*), y: (number|*)}}
   */
  lngLatToPoint(point) {
    let mercator = this.convertLL2MC(point);
    return {
      x: mercator["lng"],
      y: mercator["lat"],
    };
  }
  /**
   * 墨卡托变换至经纬度
   * @param point 墨卡托
   * @returns Point 经纬度
   */
  mercatorToLngLat(point) {
    return this.convertMC2LL(point);
  }
  /**
   * 平面到球面坐标
   * @param point 平面坐标
   * @returns Point 球面坐标
   */
  pointToLngLat(point) {
    let mercator = { lng: point.x, lat: point.y };
    return this.convertMC2LL(mercator);
  }
  /**
   * 地理坐标转换至像素坐标
   * @param point 地理坐标
   * @param zoom 级别
   * @param mapCenter 地图中心点，注意为了保证没有误差，这里需要传递墨卡托坐标
   * @param mapSize 地图容器大小
   */
  pointToPixel(point, zoom, mapCenter, mapSize) {
    if (!point) {
      return;
    }
    point = this.lngLatToMercator(point);
    let zoomUnits = this.getZoomUnits(zoom);
    let x = Math.round(
      (point["lng"] - mapCenter["lng"]) / zoomUnits + mapSize.width / 2
    );
    let y = Math.round(
      (mapCenter["lat"] - point["lat"]) / zoomUnits + mapSize.height / 2
    );
    return { x, y };
  }
  /**
   * 像素坐标转换至地理坐标
   * @param pixel 像素坐标
   * @param zoom 级别
   * @param mapCenter 地图中心点，注意为了保证没有误差，这里需要传递墨卡托坐标
   * @param mapSize 地图容器大小
   */
  pixelToPoint(pixel, zoom, mapCenter, mapSize) {
    if (!pixel) {
      return;
    }
    let zoomUnits = this.getZoomUnits(zoom);
    let lng = mapCenter["lng"] + zoomUnits * (pixel.x - mapSize.width / 2);
    let lat = mapCenter["lat"] - zoomUnits * (pixel.y - mapSize.height / 2);
    let point = { lng, lat };
    return this.mercatorToLngLat(point);
  }
  /**
   *
   * @param zoom
   * @returns {number}
   */
  getZoomUnits(zoom) {
    return Math.pow(2, 18 - zoom);
  }
}

/**
 * @Author: Caven
 * @Date: 2021-01-31 19:22:04
 */
class BaiduMercatorTilingScheme extends Cesium$1.WebMercatorTilingScheme {
  constructor(options) {
    super(options);
    let projection = new BaiduMercatorProjection();
    this._projection.project = function (cartographic, result) {
      result = result || {};
      result = CoordTransform.WGS84ToGCJ02(
        Cesium$1.Math.toDegrees(cartographic.longitude),
        Cesium$1.Math.toDegrees(cartographic.latitude)
      );
      result = CoordTransform.GCJ02ToBD09(result[0], result[1]);
      result[0] = Math.min(result[0], 180);
      result[0] = Math.max(result[0], -180);
      result[1] = Math.min(result[1], 74.000022);
      result[1] = Math.max(result[1], -71.988531);
      result = projection.lngLatToPoint({
        lng: result[0],
        lat: result[1],
      });
      return new Cesium$1.Cartesian2(result.x, result.y);
    };
    this._projection.unproject = function (cartesian, result) {
      result = result || {};
      result = projection.mercatorToLngLat({
        lng: cartesian.x,
        lat: cartesian.y,
      });
      result = CoordTransform.BD09ToGCJ02(result.lng, result.lat);
      result = CoordTransform.GCJ02ToWGS84(result[0], result[1]);
      return new Cesium$1.Cartographic(
        Cesium$1.Math.toRadians(result[0]),
        Cesium$1.Math.toRadians(result[1])
      );
    };
    this.resolutions = options.resolutions || [];
  }
  /**
   *
   * @param x
   * @param y
   * @param level
   * @param result
   * @returns {module:cesium.Rectangle|*}
   */
  tileXYToNativeRectangle(x, y, level, result) {
    const tileWidth = this.resolutions[level];
    const west = x * tileWidth;
    const east = (x + 1) * tileWidth;
    const north = ((y = -y) + 1) * tileWidth;
    const south = y * tileWidth;
    if (!Cesium$1.defined(result)) {
      return new Cesium$1.Rectangle(west, south, east, north);
    }
    result.west = west;
    result.south = south;
    result.east = east;
    result.north = north;
    return result;
  }
  /**
   *
   * @param position
   * @param level
   * @param result
   * @returns {undefined|*}
   */
  positionToTileXY(position, level, result) {
    const rectangle = this._rectangle;
    if (!Cesium$1.Rectangle.contains(rectangle, position)) {
      return undefined;
    }
    const projection = this._projection;
    const webMercatorPosition = projection.project(position);
    if (!Cesium$1.defined(webMercatorPosition)) {
      return undefined;
    }
    const tileWidth = this.resolutions[level];
    const xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth);
    const yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth);
    if (!Cesium$1.defined(result)) {
      return new Cesium$1.Cartesian2(xTileCoordinate, yTileCoordinate);
    }
    result.x = xTileCoordinate;
    result.y = yTileCoordinate;
    return result;
  }
}

/**
 * @Author: Caven
 * @Date: 2020-01-15 20:27:27
 */
const TILE_URL$1 = {
  img: "//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46",
  vec: "//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020",
  custom:
    "//api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}",
  traffic:
    "//its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2",
};
class BaiduImageryProvider {
  constructor(options = {}) {
    this._url =
      options.url ||
      [
        options.protocol || "",
        TILE_URL$1[options.style] || TILE_URL$1["custom"],
      ].join("");
    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 18;
    this._crs = options.crs || "BD09";
    if (options.crs === "WGS84") {
      let resolutions = [];
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i);
      }
      this._tilingScheme = new BaiduMercatorTilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cesium$1.Cartesian2(
          -20037726.37,
          -12474104.17
        ),
        rectangleNortheastInMeters: new Cesium$1.Cartesian2(
          20037726.37,
          12474104.17
        ),
      });
    } else {
      this._tilingScheme = new Cesium$1.WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cesium$1.Cartesian2(
          -33554054,
          -33746824
        ),
        rectangleNortheastInMeters: new Cesium$1.Cartesian2(33554054, 33746824),
      });
    }
    this._rectangle = this._tilingScheme.rectangle;
    this._credit = undefined;
    this._style = options.style || "normal";
    this._errorEvent = new Cesium$1.Event();
  }
  get url() {
    return this._url;
  }
  get token() {
    return this._token;
  }
  get tileWidth() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "tileWidth must not be called before the imagery provider is ready."
      );
    }
    return this._tileWidth;
  }
  get tileHeight() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "tileHeight must not be called before the imagery provider is ready."
      );
    }
    return this._tileHeight;
  }
  get maximumLevel() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "maximumLevel must not be called before the imagery provider is ready."
      );
    }
    return this._maximumLevel;
  }
  get minimumLevel() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "minimumLevel must not be called before the imagery provider is ready."
      );
    }
    return 0;
  }
  get tilingScheme() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "tilingScheme must not be called before the imagery provider is ready."
      );
    }
    return this._tilingScheme;
  }
  get rectangle() {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "rectangle must not be called before the imagery provider is ready."
      );
    }
    return this._rectangle;
  }
  get ready() {
    return !!this._url;
  }
  get errorEvent() {
    return this._errorEvent;
  }
  get credit() {
    return this._credit;
  }
  get hasAlphaChannel() {
    return true;
  }
  getTileCredits(x, y, level) {}
  requestImage(x, y, level) {
    if (!this.ready) {
      throw new Cesium$1.DeveloperError(
        "requestImage must not be called before the imagery provider is ready."
      );
    }
    let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level);
    let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
    let url = this._url
      .replace("{z}", level)
      .replace("{s}", String(1))
      .replace("{style}", this._style);
    if (this._crs === "WGS84") {
      url = url.replace("{x}", String(x)).replace("{y}", String(-y));
    } else {
      url = url
        .replace("{x}", String(x - xTiles / 2))
        .replace("{y}", String(yTiles / 2 - y - 1));
    }
    return Cesium$1.ImageryProvider.loadImage(this, url);
  }
}

/**
 * @Author: Caven
 * @Date: 2020-01-21 16:10:47
 */
const TILE_URL = {
  img: "//p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400",
  elec: "//rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid={style}&scene=0&version=347",
};
class TencentImageryProvider extends Cesium$1.UrlTemplateImageryProvider {
  constructor(options = {}) {
    let url =
      options.url ||
      [
        options.protocol || "",
        TILE_URL[options.style] || TILE_URL["elec"],
      ].join("");
    options["url"] = url.replace("{style}", options.style || 1);
    if (!options.subdomains || !options.subdomains.length) {
      options["subdomains"] = ["0", "1", "2"];
    }
    if (options.style === "img") {
      options["customTags"] = {
        sx: (imageryProvider, x, y, level) => {
          return x >> 4;
        },
        sy: (imageryProvider, x, y, level) => {
          return ((1 << level) - y) >> 4;
        },
      };
    }
    super(options);
  }
}

/**
 * @Author: Caven
 * @Date: 2020-01-15 20:31:46
 */
const MAP_URL =
  "//t{s}.tianditu.gov.cn/DataServer?T={style}_w&x={x}&y={y}&l={z}&tk={key}";
class TdtImageryProvider extends Cesium$1.UrlTemplateImageryProvider {
  constructor(options = {}) {
    super({
      url: [
        options.protocol || "",
        MAP_URL.replace(/\{style\}/g, options.style || "vec").replace(
          /\{key\}/g,
          options.key || ""
        ),
      ].join(""),
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
      maximumLevel: 18,
    });
  }
}

/**
 * 影像相关工具类
 */
class ImageryUtils {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
  }
  /**
   * 设置底图透明度
   * @param opacity 透明度
   */
  setBaseLayerOpacity(opacity) {
    if (opacity === 0) {
      this.viewer.imageryLayers._layers[0].show = false;
    } else {
      this.viewer.imageryLayers._layers[0].show = true;
      this.viewer.imageryLayers._layers[0].alpha = opacity;
    }
  }
  /**
   * 获取天地图电子地图provider
   * @returns
   */
  getTianDiTuElectroncisImageryProvider() {
    return new Cesium$1.WebMapTileServiceImageryProvider({
      url:
        "http://{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
        "&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
        "&style=default&format=tiles&tk=00539456b0b4a9228b436dcb209be82d",
      layer: "tdtCva",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "c",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      tilingScheme: new Cesium$1.GeographicTilingScheme(),
      tileMatrixLabels: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
      ],
      maximumLevel: 18,
    });
  }
  /**
   * 获取天地图路线地图provider
   */
  getTianDiTuBiaoJiImageryProvider() {
    return new Cesium$1.WebMapTileServiceImageryProvider({
      url:
        "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
        "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
        "&style=default&format=tiles&tk=00539456b0b4a9228b436dcb209be82d",
      layer: "tdtCva",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "c",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      tilingScheme: new Cesium$1.GeographicTilingScheme(),
      tileMatrixLabels: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
      ],
      maximumLevel: 18,
    });
  }
  /**
   * 获取ArcGis影像地图provider
   * @returns
   */
  getArcGisImageryImageryProvider() {
    return new Cesium$1.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    });
  }
  /**
     * 获取高德影像地图provider（可解决底图坐标系问题）
     * @example
     * var options = {
            style: 'img', // style: img、elec、cva
            crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
        }
        viewer.imageryLayers.addImageryProvider(jesium.imageryUtils.getAmapImageryProvider(options))
     */
  getAmapImageryProvider(option) {
    return new AmapImageryProvider(option);
  }
  /**
     * 获取百度地图provider（可解决底图坐标系问题）
     * @example
     * var options = {
            style: 'normal', // style: img、vec、normal、dark
            crs: 'WGS84' // 使用84坐标系，默认为：BD09
        }
        viewer.imageryLayers.addImageryProvider(jesium.imageryUtils.getBaiduImageryProvider(options))
     * @returns
     */
  getBaiduImageryProvider(option) {
    return new BaiduImageryProvider(option);
  }
  /**
     * 获取腾讯地图provider
     * @example
     * var options = {
            style: 1 //style: img、1：经典
        }

        viewer.imageryLayers.addImageryProvider(jesium.imageryUtils.getTencentImageryProvider(options))
     * @returns
     */
  getTencentImageryProvider(option) {
    return new TencentImageryProvider(option);
  }
  /**
     * 获取天地图provider
     * @example
     * var options = {
            style: 'vec', //style: vec、cva、img、cia、ter
            key: '' // token
        }
        viewer.imageryLayers.addImageryProvider(jesium.imageryUtils.getTdtImageryProvider(options))
     */
  getTdtImageryProvider(option) {
    return new TdtImageryProvider(option);
  }
}

const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * cesium的模型相关帮助类
 */
class ModelUtils {
  viewer;
  billboardCollection; // 广告牌集合
  labelCollection; // 标签集合
  constructor(viewer) {
    this.viewer = viewer;
    this.billboardCollection = this.viewer.scene.primitives.add(
      new Cesium$1.BillboardCollection({
        scene: this.viewer.scene,
      })
    );
    this.labelCollection = this.viewer.scene.primitives.add(
      new Cesium$1.LabelCollection({
        scene: this.viewer.scene,
      })
    );
  }

  /**
   * 加载3dtiles
   * @param url 3dtiles地址
   * @param name 3dtiles名字
   * @param autoFlyTo 相机是否自动飞向3dtiles
   * @param metadata 额外属性
   */
  add3DTiles(url, name = "", autoFlyTo = true) {
    const tileset = this.viewer.scene.primitives.add(
      new Cesium$1.Cesium3DTileset({
        url,
        maximumScreenSpaceError: 1, //减少默认的屏幕空间误差，提高远处的模型细节等级
        skipLevelOfDetail: true,
        cullRequestsWhileMovingMultiplier: 240,
        maximumMemoryUsage: 128,
        dynamicScreenSpaceErrorDensity: 0.1,
        dynamicScreenSpaceError: true,
        unionClippingRegions: true,
        arcType: Cesium.ArcType.NONE,
      })
    );
    // 设置3dtiles的额外属性
    tileset.name = name;
    tileset.uuid = `${name}-${guid()}`;

    let elementMap = new Object();
    function loadFeature(feature) {
      feature.params = {};
      const element = feature.getProperty("id");

      // 塞入管点数据
      // let ids = element.split('_');
      // let newIds = [];
      // // // 判断_
      // if (ids.length == 3 && ids[2].length < 5) {
      //     newIds = [ids[0], ids[1] + '_' + ids[2]];

      // } else if (ids.length == 2) {
      //     newIds = ids;

      // } else if (ids.length == 4) {
      //     newIds = [ids[0] + '_' + ids[1], ids[2] + '_' + ids[3]];

      // } else if (ids.length == 3 && ids[1].length < 5) {
      //     newIds = [ids[0] + '_' + ids[1], ids[2]];

      // }
      // let filterData = pipeList.filter((i) => i.code == newIds[0] && i.connectcode == newIds[1]);
      // feature.params = filterData.length > 0 ? filterData[0] : {};
      // end----------------------

      let features = elementMap[element];
      if (!Cesium.defined(features)) {
        features = [];
        elementMap[element] = features;
      }
      features.push(feature);
    }
    function processContentFeatures(content, callback) {
      const featuresLength = content.featuresLength;
      for (let i = 0; i < featuresLength; ++i) {
        const feature = content.getFeature(i);
        callback(feature);
      }
    }
    function processTileFeatures(tile, callback) {
      const content = tile.content;
      const innerContents = content.innerContents;
      if (Cesium.defined(innerContents)) {
        const length = innerContents.length;
        for (let i = 0; i < length; ++i) {
          processContentFeatures(innerContents[i], callback);
        }
      } else {
        processContentFeatures(content, callback);
      }
    }

    tileset.tileLoad.addEventListener(function (tile) {
      processTileFeatures(tile, loadFeature);
    });
    tileset.allTilesLoaded.addEventListener((tile) => {
      tileset.elementMap = elementMap;
    });

    // 相机是否有过渡的飞向刚刚加载的3dtiles
    autoFlyTo && this.viewer.flyTo(tileset);
    return tileset.uuid;
  }
  /**
   * 通过uuid获取3dtiles
   * @param uuid 3dtiles对象的uuid
   */
  get3DTilesByUUID(uuid) {
    const cesiumPrimitives = this.viewer.scene.primitives._primitives;
    for (let i = 0; i < cesiumPrimitives.length; i++) {
      const primitive = cesiumPrimitives[i];
      if (primitive.uuid === uuid) {
        return primitive;
      }
    }
    return null;
  }
  /**
   * 通过uuid设置3dtiles透明度
   * @param uuid
   */
  set3DTilesOpacityByUUID(uuid, opacity) {
    const threeDTiles = this.get3DTilesByUUID(uuid);
    if (threeDTiles) {
      if (opacity == 0) {
        threeDTiles.show = false;
      } else {
        threeDTiles.show = true;
        threeDTiles.style = new Cesium$1.Cesium3DTileStyle({
          color: `color('rgba(255,255,255,${opacity})')`,
        });
      }
    }
  }
  /**
     * 添加广告牌
     * @example
     * this.jesium.modelUtils.addBillboard({
            image: "/images/AchientWenWu.png",
            position,
        })
     * @param option 广告牌参数
     */
  addBillboard(option) {
    return this.billboardCollection.add(option);
  }
  /**
   * 清除广告牌
   * @param billboard 广告牌
   * @returns 清除成功
   */
  removeBillboard(billboard) {
    return this.billboardCollection.remove(billboard);
  }
  /**
   * 添加文字标签
   * @param option 文字标签参数
   * @returns 文字标签对象
   */
  addLabel(option) {
    return this.labelCollection.add(option);
  }
  /**
   * 清除广告牌
   * @param label 广告牌
   * @returns 清除成功
   */
  removeLabel(label) {
    return this.labelCollection.remove(label);
  }
  /**
   * 添加gltf(RTX3060Ti测试为1w个10FPS)
   * @param option
   */
  addGLTFByI3DM(option) {
    const matrixs = [];
    option.positionArr.forEach((position) => {
      let positionMatrix = Cesium$1.Cartesian3.fromDegrees(
        position.longitude,
        position.latitude,
        position.height
      );
      var modelMatrix = Cesium$1.Transforms.headingPitchRollToFixedFrame(
        positionMatrix,
        new Cesium$1.HeadingPitchRoll(
          position.rotationY,
          position.rotationX,
          position.rotationZ
        )
      );
      Cesium$1.Matrix4.multiplyByUniformScale(
        modelMatrix,
        position.scale,
        modelMatrix
      );
      matrixs.push({
        modelMatrix: modelMatrix,
        batchId: position.curModelCustomProperty,
      });
    });
    return this.viewer.scene.primitives.add(
      new Cesium$1.ModelInstanceCollection({
        url: option.url,
        instances: matrixs,
      })
    );
  }
}

/**
 * 几何体工具类
 */
class GeometryUtils {
  viewer;
  polylineCollection;
  constructor(viewer) {
    this.viewer = viewer;
    this.polylineCollection = this.viewer.scene.primitives.add(
      new PolylineCollection()
    );
  }
  /**
     * 加载geojson
     * @param loadOption 设置geojson数据绘制的样式
     * {
        sourceUri?: string; -重写用于解析相对链接的url。
        describe?: GeoJsonDataSource.describe; -返回Property对象（或字符串）的函数。
        markerSize?: number;-为每个点创建的贴图接点的默认大小（以像素为单位）。
        markerSymbol?: string;-为每个点创建的地图接点的默认符号。
        markerColor?: Color;-为每个点创建的贴图接点的默认颜色。
        stroke?: Color;-多段线和多边形轮廓的默认颜色。
        strokeWidth?: number;-多段线和多边形轮廓的默认宽度。（这个没用，因为被限制住了，最大只能是1，参考issues：https://github.com/CesiumGS/cesium/issues/6942）
        fill?: Color;-多边形内部的默认颜色。
        clampToGround?: boolean;-如果我们希望几何特征（多边形或线字符串）固定在地面上，则为true。
        credit?: Credit | string;-画布上显示的数据源信用。
       }
     * @returns geojson对象加载进入viewer.dataSources完成的promise
     */
  async addGeojson(url, loadOption = {}) {
    const datasource = await this.viewer.dataSources.add(
      GeoJsonDataSource.load(url, loadOption)
    );
    return datasource;
  }
  /**
   * 以entity的方式加载polyline
   */
  addPolylinePrimities(option) {
    return this.polylineCollection.add(option);
  }
  /**
   * 绘制反选遮罩
   * @param holePositions
   * @param polygonPositions
   */
  addHolePolygonEntity(option) {
    option = Object.assign(
      {
        polygonPositions: [100, 0, 100, 89, 150, 89, 150, 0],
        material: Color.BLACK.withAlpha(0.4),
      },
      option
    );
    let cs = Cartesian3.fromDegreesArray(option.holePositions);
    let hole = new PolygonHierarchy(cs);
    this.viewer.entities.add({
      name: "convertLayer",
      polygon: {
        hierarchy: {
          positions: Cartesian3.fromDegreesArray(option.polygonPositions),
          holes: [hole],
        },
        material: option.material,
      },
    });
  }
}

class TimeUtils {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
  }
  /**
   * cesium时间转中国公历时间(cesium时间距离中国时间相差了8小时)
   */
  cesiumTimeToGregorianDate() {
    const chinaCurrentTime = JulianDate.now();
    // 以当前cesium时间为准增加8小时为中国小时
    JulianDate.addHours(this.viewer.clock.currentTime, 8, chinaCurrentTime);
    return JulianDate.toGregorianDate(chinaCurrentTime);
  }
  /**
   * 以中国公历时间设置cesium时间的小时
   * @param hours 中国公历小时
   */
  setHours(hours) {
    /* 1. 获取当前时间并转化为中国时间 */
    const chinaCurrentTime = JulianDate.now();
    JulianDate.addHours(this.viewer.clock.currentTime, 8, chinaCurrentTime);
    /* 2. 计算当前时间差，将当前china时间为目标时间，转化成cesium时间并赋值给cesium */
    const chinaCurrentTimeGregorianDate =
      JulianDate.toGregorianDate(chinaCurrentTime);
    const hoursDiff = hours - chinaCurrentTimeGregorianDate.hour;
    const chinaTime = JulianDate.addHours(
      chinaCurrentTime,
      hoursDiff,
      chinaCurrentTime
    );
    JulianDate.addHours(chinaTime, -8, this.viewer.clock.currentTime);
    /* 3. 返回设置小时后的china时间 */
    return JulianDate.toGregorianDate(chinaTime);
  }
}

class LightUtils {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
  }
  /**
   * 开启全局照明（根据当前时间控制地球明亮，以及天空盒）
   * @param open true：开启 false：关闭
   */
  openGlobeLighting(open) {
    this.viewer.scene.globe.enableLighting = open;
  }
}

/**
 * 雪天
 */
const snowFS = `uniform sampler2D colorTexture; //输入的场景渲染照片
 varying vec2 v_textureCoordinates;
 
 float snow(vec2 uv,float scale)
 {
     float time = czm_frameNumber / 60.0;
     float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
     uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
     uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
     p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
     k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
     return k*w;
 }
 
 void main(void){
     vec2 resolution = czm_viewport.zw;
     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
     vec3 finalColor=vec3(0);
     //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));
     float c = 0.0;
     c+=snow(uv,30.);
     c+=snow(uv,20.);
     c+=snow(uv,15.);
     c+=snow(uv,10.);
     c+=snow(uv,8.);
     c+=snow(uv,6.);
     c+=snow(uv,5.);
     finalColor=(vec3(c)); //屏幕上雪的颜色
     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.2);  //将雪和三维场景融合
 
 }`;
/**
 * 雨天
 */
const rainFS = `uniform sampler2D colorTexture;//输入的场景渲染照片
 varying vec2 v_textureCoordinates;
 
 float hash(float x){
     return fract(sin(x*133.3)*13.13);
 }
 
 void main(void){
 
     float time = czm_frameNumber / 60.0;
     vec2 resolution = czm_viewport.zw;
 
     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
     vec3 c=vec3(.6,.7,.8);
 
     float a=-.4;
     float si=sin(a),co=cos(a);
     uv*=mat2(co,-si,si,co);
     uv*=length(uv+vec2(0,4.9))*.3+2.;
 
     float v=1.-sin(hash(floor(uv.x*100.))*2.);
     float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
     c*=v*b; //屏幕上雨的颜色
 
     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.15); //将雨和三维场景融合
 }`;
/**
 * 雾天
 */
const fogFS =
  "uniform sampler2D colorTexture;\n" +
  "  uniform sampler2D depthTexture;\n" +
  "  varying vec2 v_textureCoordinates;\n" +
  "  void main(void)\n" +
  "  {\n" +
  "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
  "      vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);\n" +
  "      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n" +
  "      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n" +
  "      float f=(depthcolor.r-0.22)/1.7;\n" +
  "      if(f<0.0) f=0.0;\n" +
  "      else if(f>1.0) f=1.0;\n" +
  "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
  "   }";
/**
 * 阴天
 */
const overcastFS = `uniform sampler2D colorTexture;//输入的场景渲染照片
 varying vec2 v_textureCoordinates;
 
 void main(void){
     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(0.5, 0.5, 0.5, 1.0), 0.5); //将阴和三维场景融合
 }`;

class WeatherUtils {
  viewer;
  weather = {
    snow: null,
    rain: null,
    fog: null,
    overcast: null,
  };
  constructor(viewer) {
    this.viewer = viewer;
  }
  /**
   * 启用雪天天气
   * @param enable 是否启用
   */
  enableSnowWeather(enable) {
    if (enable) {
      if (!this.weather.snow) {
        // 没有雪我才去添加，有雪了就不管了
        this.weather.snow = new PostProcessStage({
          name: "snow",
          fragmentShader: snowFS,
        });
        this.viewer.scene.postProcessStages.add(this.weather.snow);
      }
    } else {
      if (this.weather.snow) {
        this.viewer.scene.postProcessStages.remove(this.weather.snow);
        this.weather.snow = null;
      }
    }
  }
  /**
   * 启用雪天天气
   * @param enable 是否启用
   */
  enableRainWeather(enable) {
    if (enable) {
      if (!this.weather.rain) {
        // 没有雪我才去添加，有雪了就不管了
        this.weather.rain = new PostProcessStage({
          name: "rain",
          fragmentShader: rainFS,
        });
        this.viewer.scene.postProcessStages.add(this.weather.rain);
      }
    } else {
      if (this.weather.rain) {
        this.viewer.scene.postProcessStages.remove(this.weather.rain);
        this.weather.rain = null;
      }
    }
  }
  /**
   * 启用雾天天气
   * @param enable 是否启用
   */
  enableFogWeather(enable) {
    if (enable) {
      if (!this.weather.fog) {
        // 没有雪我才去添加，有雪了就不管了
        this.weather.fog = new PostProcessStage({
          name: "fog",
          fragmentShader: fogFS,
        });
        this.viewer.scene.postProcessStages.add(this.weather.fog);
      }
    } else {
      if (this.weather.fog) {
        this.viewer.scene.postProcessStages.remove(this.weather.fog);
        this.weather.fog = null;
      }
    }
  }
  /**
   * 启用阴天天气
   * @param enable 是否启用
   */
  enableOvercastWeather(enable) {
    if (enable) {
      if (!this.weather.overcast) {
        // 没有雪我才去添加，有雪了就不管了
        this.weather.overcast = new PostProcessStage({
          name: "overcast",
          fragmentShader: overcastFS,
        });
        this.viewer.scene.postProcessStages.add(this.weather.overcast);
      }
    } else {
      if (this.weather.overcast) {
        this.viewer.scene.postProcessStages.remove(this.weather.overcast);
        this.weather.overcast = null;
      }
    }
  }
}

class MeasureUtils {
  viewer;
  controlUtils;
  modelUtils;
  coordUtils;
  /* 测量点相关属性 */
  __removePointMeasureResult;
  /* 线段距离测量相关属性 */
  __polylineCoords = []; // polyline点列表
  __dynamicPolyline = null; // 动态绘制的polyline
  __polylineBillboards = []; // polyline的点的广告牌
  __polylineLabels = []; // polyline的点的label
  __polyline = null;
  __polylineLeftClick;
  __polylineMouseMove;
  __polylineRightClick;
  /* polygon面积测量相关属性 */
  __polygonCoords = [];
  __dynamicPolygon = null;
  __polygonBillboards = [];
  __polygon = null;
  __polygonLabel = null;
  __polygonLeftClick;
  __polygonMouseMove;
  __polygonRightClick;
  constructor(viewer, controlUtils, modelUtils, coordUtils) {
    this.viewer = viewer;
    this.controlUtils = controlUtils;
    this.modelUtils = modelUtils;
    this.coordUtils = coordUtils;
  }
  /**
   * 启用点测量
   * @param measuredCallback 测量完成回调函数(因为这里返回了billboard和label，可以通过更改属性自定义样式)
   * @returns 清除并禁用点测量
   */
  enableMeasurePoint(measuredCallback = () => {}) {
    let billboard;
    let label;
    const removeClickGetCoord = this.controlUtils.addMouseEventWatch(
      (event) => {
        /* 判断之前是否有测量结果，有的话就把之前的测量结果删掉 */
        if (this.__removePointMeasureResult) this.__removePointMeasureResult();
        /* 获取点击的坐标 */
        const pick = this.viewer.scene.pickPosition(event.position);
        const degrees = this.coordUtils.cato2Lat(
          Cartographic.fromCartesian(pick)
        );
        degrees.height += 1;
        /* 根据点击的坐标获取 */
        billboard = this.modelUtils.addBillboard({
          image: `data:image/png;base64,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`,
          position: Cartesian3.fromDegrees(
            degrees.longitude,
            degrees.latitude,
            degrees.height
          ),
          scale: 0.4,
          eyeOffset: new Cartesian3(0, 0, -14),
        });
        label = this.modelUtils.addLabel({
          text: `经度:${degrees.longitude} 维度:${degrees.latitude} 高度:${degrees.height}`,
          position: Cartesian3.fromDegrees(
            degrees.longitude,
            degrees.latitude,
            degrees.height
          ),
          font: "16px 雅黑",
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -18),
          backgroundColor: Color.BLACK.withAlpha(0.51),
          showBackground: true,
          backgroundPadding: new Cartesian2(19, 5),
          eyeOffset: new Cartesian3(0, 0, -14),
        });
        /* 测量完成的回调，返回添加到场景的内容 */
        measuredCallback({
          billboard,
          label,
        });
        /* 给类中移除点测量结果的函数赋值 */
        this.__removePointMeasureResult = () => {
          this.modelUtils.removeBillboard(billboard);
          this.modelUtils.removeLabel(label);
          this.__removePointMeasureResult = undefined;
        };
      },
      ScreenSpaceEventType.LEFT_CLICK
    );
    return () => {
      removeClickGetCoord(); // 移除点击事件
      if (this.__removePointMeasureResult) this.__removePointMeasureResult(); // 移除测量结果
    };
  }
  /**
   * 启用线段距离测量
   * @returns
   */
  enableMeasurePolylineDistance() {
    this.__polylineLeftClick = this.measurePolylineDistanceLeftClick();
    this.__polylineMouseMove = this.measurePolylineDistanceMouseMove();
    this.__polylineRightClick = this.measurePolylineDistanceRightClick();
    return () => {
      // 移除正在绘制多的polyline
      if (this.__dynamicPolyline) {
        this.viewer.entities.remove(this.__dynamicPolyline);
        this.__dynamicPolyline = null;
      }
      // 移除所有billboard
      if (this.__polylineBillboards.length > 0) {
        this.__polylineBillboards.forEach((billboard) => {
          this.modelUtils.removeBillboard(billboard);
        });
        this.__polylineBillboards = [];
      }
      // 移除所有label
      if (this.__polylineLabels.length > 0) {
        this.__polylineLabels.forEach((label) => {
          this.modelUtils.removeLabel(label);
        });
        this.__polylineLabels = [];
      }
      if (this.__polyline) {
        this.viewer.entities.remove(this.__polyline);
        this.__polyline = null;
      }
      // 清空坐标点
      this.__polylineCoords = [];
      // 移除所有鼠标事件
      if (this.__polylineLeftClick) {
        this.__polylineLeftClick();
        this.__polylineLeftClick = undefined;
      }
      if (this.__polylineRightClick) {
        this.__polylineRightClick();
        this.__polylineRightClick = undefined;
      }
      if (this.__polylineMouseMove) {
        this.__polylineMouseMove();
        this.__polylineMouseMove = undefined;
      }
    };
  }
  /**
   * 线段测量的left click事件处理
   * @returns
   */
  measurePolylineDistanceLeftClick() {
    return this.controlUtils.addMouseEventWatch((event) => {
      const position = this.viewer.camera.pickEllipsoid(
        event.position,
        this.viewer.scene.globe.ellipsoid
      );
      if (position) {
        this.__polylineCoords.push(position);
        /* 1. 判断是否有正在动态绘制的polyline
                        没有： 创建一个
                        有： 不用创建了，MOUSE_MOVE会用到
                */
        if (this.__dynamicPolyline === null) {
          this.__dynamicPolyline = this.viewer.entities.add({
            polyline: {
              positions: new CallbackProperty(() => {
                return [...this.__polylineCoords];
              }, false),
              clampToGround: true,
              width: 4,
              material: new Color(79 / 255, 232 / 255, 175 / 255),
            },
          });
        }
        /*
                    2. 添加点的icon
                */
        this.__polylineBillboards.push(
          this.modelUtils.addBillboard({
            image: `data:image/png;base64,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`,
            position: position,
            scale: 0.6,
            eyeOffset: new Cartesian3(0, 0, -14),
          })
        );
        /*
                    3. 添加点的label
                */
        if (this.__polylineCoords.length === 1) {
          // 第一个点
          // 起点
          this.__polylineLabels.push(
            this.modelUtils.addLabel({
              text: "起点",
              position: position,
              font: "16px 雅黑",
              showBackground: true,
              backgroundColor: Color.BLACK.withAlpha(0.51),
              horizontalOrigin: HorizontalOrigin.CENTER,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: new Cartesian2(0, -20),
              eyeOffset: new Cartesian3(0, 0, -14),
            })
          );
        } else {
          const lineCoordArr = [];
          this.__polylineCoords.forEach((coord, length) => {
            /* 因为最后一个鼠标移动动态绘制的所以要去掉 */
            if (length === this.__polylineCoords.length - 1) return;
            /* 处理角度经纬度传入数组 */
            const degrees = this.coordUtils.cato2Lat(
              Cartographic.fromCartesian(coord)
            );
            lineCoordArr.push([degrees.longitude, degrees.latitude]);
          });
          const turfLine = lineString(lineCoordArr);
          const turfLength = length(turfLine, {
            units: "meters",
          });
          this.__polylineLabels.push(
            this.modelUtils.addLabel({
              text: `${turfLength}米`,
              position: position,
              font: "16px 雅黑",
              showBackground: true,
              backgroundColor: Color.BLACK.withAlpha(0.51),
              horizontalOrigin: HorizontalOrigin.CENTER,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: new Cartesian2(0, -20),
              eyeOffset: new Cartesian3(0, 0, -14),
            })
          );
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }
  /**
   * 线段距离测量mouse move事件处理
   * @returns
   */
  measurePolylineDistanceMouseMove() {
    return this.controlUtils.addMouseEventWatch((event) => {
      const position = this.viewer.camera.pickEllipsoid(
        event.endPosition,
        this.viewer.scene.globe.ellipsoid
      );
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
  }
  /**
   * 线段距离测量right click事件处理
   * @returns
   */
  measurePolylineDistanceRightClick() {
    return this.controlUtils.addMouseEventWatch((event) => {
      if (!(this.__polylineCoords.length - 1 >= 2)) return;
      if (this.__polylineMouseMove) {
        this.__polylineMouseMove();
        this.__polylineMouseMove = undefined;
      }
      if (this.__dynamicPolyline)
        this.viewer.entities.remove(this.__dynamicPolyline);
      this.__dynamicPolyline = null;
      this.__polylineCoords.pop();
      this.__polyline = this.viewer.entities.add({
        polyline: {
          positions: [...this.__polylineCoords],
          clampToGround: true,
          width: 4,
          material: new Color(79 / 255, 232 / 255, 175 / 255),
        },
      });
      this.__polylineCoords = [];
      if (this.__polylineLeftClick) {
        this.__polylineLeftClick();
        this.__polylineLeftClick = undefined;
      }
      if (this.__polylineRightClick) {
        this.__polylineRightClick();
        this.__polylineRightClick = undefined;
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }
  enableMeasurePolygonArea() {
    this.__polygonLeftClick = this.measurePolygonAreaLeftClick();
    this.__polygonMouseMove = this.measurePolygonAreaMouseMove();
    this.__polygonRightClick = this.measurePolygonAreaRightClick();
    return () => {
      // 移除正在绘制多的polygon
      if (this.__dynamicPolygon) {
        this.viewer.entities.remove(this.__dynamicPolygon);
        this.__dynamicPolygon = null;
      }
      // 移除所有billboard
      if (this.__polygonBillboards.length > 0) {
        this.__polygonBillboards.forEach((billboard) => {
          this.modelUtils.removeBillboard(billboard);
        });
        this.__polygonBillboards = [];
      }
      // 移除绘制好的polygon
      if (this.__polygon) {
        this.viewer.entities.remove(this.__polygon);
        this.__polygon = null;
      }
      // 移除面积label
      if (this.__polygonLabel) {
        this.modelUtils.removeLabel(this.__polygonLabel);
        this.__polygonLabel = null;
      }
      // 清空坐标点
      this.__polygonCoords = [];
      // 移除所有鼠标事件
      if (this.__polygonLeftClick) {
        this.__polygonLeftClick();
        this.__polygonLeftClick = undefined;
      }
      if (this.__polygonRightClick) {
        this.__polygonRightClick();
        this.__polygonRightClick = undefined;
      }
      if (this.__polygonMouseMove) {
        this.__polygonMouseMove();
        this.__polygonMouseMove = undefined;
      }
    };
  }
  measurePolygonAreaLeftClick() {
    return this.controlUtils.addMouseEventWatch((event) => {
      const position = this.viewer.camera.pickEllipsoid(
        event.position,
        this.viewer.scene.globe.ellipsoid
      );
      if (position) {
        this.__polygonCoords.push(position);
        /* 1. 判断是否有正在动态绘制的polyline
                        没有： 创建一个
                        有： 不用创建了，MOUSE_MOVE会用到
                */
        if (this.__dynamicPolygon === null) {
          this.__dynamicPolygon = this.viewer.entities.add({
            polygon: {
              // 这个方法上面有重点说明
              hierarchy: new CallbackProperty(() => {
                // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                return new PolygonHierarchy(this.__polygonCoords);
              }, false),
              material: new Color(79 / 255, 232 / 255, 175 / 255, 0.5),
            },
            polyline: {
              positions: new CallbackProperty(() => {
                return [...this.__polygonCoords, this.__polygonCoords[0]];
              }, false),
              clampToGround: true,
              width: 4,
              material: new Color(79 / 255, 232 / 255, 175 / 255),
            },
          });
        }
        /*
                    2. 添加点的icon
                */
        this.__polygonBillboards.push(
          this.modelUtils.addBillboard({
            image: `data:image/png;base64,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`,
            position: position,
            scale: 0.6,
            eyeOffset: new Cartesian3(0, 0, -14),
          })
        );
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }
  measurePolygonAreaMouseMove() {
    return this.controlUtils.addMouseEventWatch((event) => {
      const position = this.viewer.camera.pickEllipsoid(
        event.endPosition,
        this.viewer.scene.globe.ellipsoid
      );
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
  measurePolygonAreaRightClick() {
    return this.controlUtils.addMouseEventWatch((event) => {
      if (!(this.__polygonCoords.length - 1 >= 2)) return;
      if (this.__polygonMouseMove) {
        this.__polygonMouseMove();
        this.__polygonMouseMove = undefined;
      }
      if (this.__dynamicPolygon)
        this.viewer.entities.remove(this.__dynamicPolygon);
      this.__dynamicPolygon = null;
      this.__polygonCoords.pop();
      this.__polygon = this.viewer.entities.add({
        polygon: {
          hierarchy: new PolygonHierarchy(this.__polygonCoords),
          material: new Color(79 / 255, 232 / 255, 175 / 255, 0.5),
        },
        polyline: {
          positions: [...this.__polygonCoords, this.__polygonCoords[0]],
          clampToGround: true,
          width: 4,
          material: new Color(79 / 255, 232 / 255, 175 / 255),
        },
      });
      /* 计算多边形中心点 */
      const degreesCoords = [];
      this.__polygonCoords.forEach((coord) => {
        const degrees = this.coordUtils.cato2Lat(
          Cartographic.fromCartesian(coord)
        );
        degreesCoords.push([degrees.longitude, degrees.latitude]);
      });
      // 让多边形闭合
      degreesCoords.push([degreesCoords[0][0], degreesCoords[0][1]]);
      const turfPolygon = polygon([degreesCoords]);
      // 多边形中心点
      const turfCenter = centroid(turfPolygon);
      const polygonCenter = Cartesian3.fromDegrees(
        turfCenter.geometry.coordinates[0],
        turfCenter.geometry.coordinates[1]
      );
      /* 计算多边形面积 */
      // 面积
      const measureOfArea = area(turfPolygon);
      this.__polygonLabel = this.modelUtils.addLabel({
        text: `${measureOfArea}m²`,
        position: polygonCenter,
        font: "16px 雅黑",
        showBackground: true,
        backgroundColor: Color.BLACK.withAlpha(0.51),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -20),
        eyeOffset: new Cartesian3(0, 0, -14),
      });
      this.__polygonCoords = [];
      if (this.__polygonLeftClick) {
        this.__polygonLeftClick();
        this.__polygonLeftClick = undefined;
      }
      if (this.__polygonRightClick) {
        this.__polygonRightClick();
        this.__polygonRightClick = undefined;
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }
}

class MaterialUtils {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
  }
  getPolylineTrailLinkMaterialProperty(duration, image) {
    const materialType = "PolylineTrailLink" + guid();
    const curTime = new Date().getTime();
    Material._materialCache.addMaterial(materialType, {
      fabric: {
        type: materialType,
        uniforms: {
          color: new Color(0.0, 0.0, 1.0, 0.5),
          image: image,
          time: 20,
        },
        source:
          "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    vec2 st = materialInput.st;\n\
                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                    material.alpha = colorImage.a * color.a;\n\
                    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                    return material;\n\
                }",
      },
      translucent: function (material) {
        return true;
      },
    });
    class PolylineTrailLinkMaterialProperty {
      isConstant = false;
      definitionChanged = new Event();
      constructor() {}
      getType(time) {
        return materialType;
      }
      getValue(time, result) {
        if (!defined(result)) {
          result = {};
        }
        result.color = Property.getValueOrClonedDefault(
          undefined,
          time,
          Color.WHITE,
          result.color
        );
        result.image = image;
        result.time = ((new Date().getTime() - curTime) % duration) / duration;
        return result;
      }
      equals(other) {
        return (
          this === other ||
          (other instanceof PolylineTrailLinkMaterialProperty &&
            // @ts-ignore
            Cesium.Property.equals(Color.WHITE, other._color))
        );
      }
    }
    const materialProperty = new PolylineTrailLinkMaterialProperty();
    return materialProperty;
  }
}

/**
 * Cesium工具类总类，不直接拿它使用，而是通过Web3DUtils.cesiumUtils访问
 */
class Jesium {
  viewer;
  modelUtils; // cesium的模型（3dtiles、primitive、entity）相关操作帮助函数类
  cameraUtils; // cesium的相机相关操作帮助类
  coordUtils; // cesium的坐标转化相关操作帮助类
  controlUtils; // cesium的鼠标事件相关操作帮助类
  imageryUtils;
  geometryUtils;
  timeUtils;
  lightUtils;
  weatherUtils;
  measureUtils;
  materialUtils;
  /**
   * 初始化cesium场景
   * @param container cesium场景容器元素
   * @param viewerConfig cesium场景配置项
   */
  constructor(container, viewerConfig = {}) {
    viewerConfig = {};
    viewerConfig = Object.assign(
      {
        infoBox: false,
        baseLayerPicker: false,
        sceneModePicker: false,
        homeButton: false,
        geocoder: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        selectionIndicator: false,
        // terrainProvider: Cesium$1.createWorldTerrain({
        //     requestWaterMask: true,
        //     requestVertexNormals: true  如果你需要光照效果
        // }),//cesium原生地图
        terrainProvider: Cesium$1.createWorldTerrain(), //地形
        // imageryProvider: new Cesium$1.ArcGisMapServerImageryProvider({
        //     url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        // }),
        useBrowserRecommendedResolution: true,
      },
      viewerConfig
    );

    // 初始化viewer
    Cesium$1.RequestScheduler.maximumRequestsPerServer = 18; // 设置cesium请求调度器的最大并发数量
    Cesium$1.RequestScheduler.throttleRequests = false; //关闭请求调度器的请求节流

    this.viewer = new Cesium$1.Viewer(container, viewerConfig);
    this.viewer.cesiumWidget.creditContainer.style.display = "none"; // 去掉cesium的左下角logo区域
    this.viewer.scene.globe.baseColor = Cesium$1.Color.BLACK; // 设置地球颜色

    this.viewer.scene.globe.depthTestAgainstTerrain = true; //开启高程遮挡
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
      new Cesium$1.NearFarScalar(400.0, 0.0, 800.0, 1.0);
    // // 初始化帮助类们
    this.modelUtils = new ModelUtils(this.viewer);
    this.coordUtils = new CoordUtils(this.viewer);
    this.controlUtils = new ControlUtils(this.viewer);
    this.cameraUtils = new CameraUtils(this.viewer, this.controlUtils);
    this.imageryUtils = new ImageryUtils(this.viewer);
    this.geometryUtils = new GeometryUtils(this.viewer);
    this.timeUtils = new TimeUtils(this.viewer);
    this.lightUtils = new LightUtils(this.viewer);
    this.weatherUtils = new WeatherUtils(this.viewer);
    this.measureUtils = new MeasureUtils(
      this.viewer,
      this.controlUtils,
      this.modelUtils,
      this.coordUtils
    );
    this.materialUtils = new MaterialUtils(this.viewer);
  }
  /**
   * 启用地形深度测试
   * @param enable 是否启用
   */
  enableDepthTestAgainstTerrain(enable) {
    this.viewer.scene.globe.depthTestAgainstTerrain = enable;
  }
  /**
   * 显示cesium的FPS
   * @param visible
   */
  showFPS(visible) {
    this.viewer.scene.debugShowFramesPerSecond = visible;
  }
  /**
   * 设置相机碰撞检测开启状态
   * @param enable 是否开启
   */
  enableCameraCollisionDetection(enable) {
    this.viewer.scene.screenSpaceCameraController.enableCollisionDetection =
      enable;
  }
  /**
   * 开启大地透明
   * @param enable 是否开启
   */
  enableLandTransparent(enable) {
    this.viewer.scene.globe.translucency.enabled = enable;
  }
  /**
   * 设置大地透明度
   * @param alpha 透明度(0~1)
   */
  setLandAlpha(alpha) {
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.farValue =
      alpha;
  }
  /**
   * 加载cesium的页面被销毁时一定要调用此方法，否则多次打开关闭，会造成内存溢出
   */
  destory() {
    // 释放内存和CPU占用
    this.viewer?.canvas
      .getContext("webgl")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
    this.viewer?.destroy();
  }
}

/**
 * jesium版本号
 */
// const version = require("../package.json").version;

export {
  CameraUtils,
  ControlUtils,
  CoordUtils,
  GeometryUtils,
  ImageryUtils,
  Jesium,
  LightUtils,
  MeasureUtils,
  ModelUtils,
  TimeUtils,
  WeatherUtils,
};
