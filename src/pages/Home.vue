<template>
    <div class="container">
        <div class="cesium-container" ref="cesiumContainer"></div>
        <div class="butns closeMap">
            <div class="butns-item">
                <img src="/img/map.png" style="margin-right: 8px;">
                <span @click="closeMap()">{{ mapType ? $t('lang.closeMap') : $t('lang.openMap') }}</span>
            </div>
        </div>
        <!-- <div class="butns changeModel_child1" v-if="changeModelType == 0">
            <div class="butns-item">
                <el-switch :active-value="1" :inactive-value="0" @change="getpipelineShow" size="small"
                    v-model="trenchShow" class="mb-2" />
                <span class="text">{{ $t('lang.trench') }}</span>
            </div>
        </div> -->
        <!-- <div class="butns changeModel">
            <div class="butns-item">
                <span @click="getchangeModel(0)" :class="changeModelType == 0 ? 'active' : ''">{{ $t('lang.designModel')
                    }}</span>
                <span @click="getchangeModel(1)" :class="changeModelType == 1 ? 'active' : ''">{{
                    $t('lang.liveActionModel') }}</span>
            </div>
        </div> -->
        <div class="butns butns2 butns3" v-if="!clShow">
            <div class="butns-item">
                <p style="height: 100%;" :class="clShow ? 'active' : ''" @click="clickRightBtn(0)">
                    <el-tooltip class="box-item tooltipBox" effect="dark" :content="$t('lang.measure')"
                        placement="left">
                        <img src="/img/cl.png" alt="">
                    </el-tooltip>
                </p>
                <!-- <p style="height: 100%;" :class="listType == 0 ? 'activeType' : ''" @click="clickRightBtn(1)">
                    <el-tooltip class="box-item tooltipBox" effect="dark"
                        :content="$t('lang.measure') + ' ' + $t('lang.record')" placement="left">
                        <img src="/img/cljl.png" alt="">
                    </el-tooltip>
                </p> -->
                <p style="height: 100%;" :class="addPoiBtnShow ? 'activeType' : ''" @click="clickRightBtn(2)">
                    <el-tooltip class="box-item tooltipBox" effect="dark"
                        :content="$t('lang.mark') + ' ' + $t('lang.poi')" placement="left">
                        <img src="/img/addbj.png" alt="">
                    </el-tooltip>
                </p>
                <!-- <p style="height: 100%;" :class="listType == 1 ? 'activeType' : ''" @click="clickRightBtn(3)">
                    <el-tooltip class="box-item tooltipBox" effect="dark"
                        :content="$t('lang.poi') + ' ' + $t('lang.record')" placement="left">
                        <img src="/img/poijl.png" alt="">
                    </el-tooltip>
                </p> -->
                <!-- <p v-if="changeModelType == 0" style="height: 100%;" :class="pipelineDialogShow ? 'activeType' : ''"
                    @click="clickRightBtn(5)">
                    <el-tooltip trigger="hover" class="box-item tooltipBox" effect="dark"
                        :content="$t('lang.designModel') + ' ' + $t('lang.list')" placement="left">
                        <img src="/img/pipe.png" alt="">
                    </el-tooltip>
                </p> -->
                <!-- <p style="height: 100%;" :class="modelDialogShow ? 'activeType' : ''" @click="clickRightBtn(4)">
                    <el-tooltip class="box-item tooltipBox" effect="dark"
                        :content="$t('lang.liveActionModel') + ' ' + $t('lang.list')" placement="left">
                        <img src="/img/model.png" alt="">
                    </el-tooltip>
                </p> -->
                <!-- 计算体积 -->
                <!-- <p style="height: 100%;" :class="volumenShow ? 'activeType' : ''" @click="clickRightBtn(6)">
                    <el-tooltip trigger="hover" class="box-item tooltipBox" effect="dark" content="体积计算"
                        placement="left">
                        <img src="/img/volume.png" alt="">
                    </el-tooltip>
                </p> -->
                <!-- v-if="changeModelType == 1" -->
                <!-- <p style="height: 100%;" :class="pointLineShow ? 'activeType' : ''" @click="clickRightBtn(7)">
                    <el-tooltip trigger="hover" class="box-item tooltipBox" effect="dark" content="绘制点线"
                        placement="left">
                        <img src="/img/volume.png" alt="">
                    </el-tooltip>
                </p> -->
            </div>
        </div>
        <!-- <div class="progresss">
            <slibar></slibar>
        </div> -->
        <!-- 绘制点线的按钮 -->
        <!-- <div class="butns butns2" v-if="pointLineShow" style="position: absolute;top: auto;bottom: 20%;height: 88px;">
            <div @click="submitFormPL" class="butns-item">
                <p @click="closedrawPLDialog">退出</p>
                <p>保存</p>
            </div>
        </div> -->

        <!-- ````````````````````````````````````````````````````````````````````````````````````````-->
        <!-- <div class="loadDialog" style="top:50%">
            <p class="label">平移（米）：</p>
            <div class="item">
                <p>X</p>
                <el-slider class="horizontal_slider" :min="-100" :max="100" v-model="tableInfo.translationX" :step="0.5"
                    @input="handleChange($event, 1)" />
            </div>
            <div class="item">
                <p>Y</p>
                <el-slider class="horizontal_slider" :min="-100" :max="100" v-model="tableInfo.translationY" :step="0.5"
                    @input="handleChange($event, 2)" />
            </div>
            <div class="item">
                <p>Z</p>
                <el-slider class="horizontal_slider" :min="-100" :max="100" v-model="tableInfo.translationZ" :step="0.5"
                    @input="handleChange($event, 3)" />
            </div>
            <p class="label">旋转（度）：</p>
            <div class="item">
                <p>X</p>
                <el-slider class="horizontal_slider" :min="-360" :max="360" v-model="tableInfo.rotateX" :step="0.1"
                    @input="handleChange($event, 7)" />
            </div>
            <div class="item">
                <p>Y</p>
                <el-slider class="horizontal_slider" :min="-360" :max="360" v-model="tableInfo.rotateY" :step="0.5"
                    @input="handleChange($event, 8)" />
            </div>
            <div class="item">
                <p>Z</p>
                <el-slider class="horizontal_slider" :min="-360" :max="360" v-model="tableInfo.rotateZ" :step="0.1"
                    @input="handleChange($event, 9)" />
            </div>
        </div> -->
        <div class="loadDialog">
            <!-- <div class="infosDialog-title">
                <p>列表</p>
            </div> -->
            <div class="forms">

                <div class="forms-table forms-table2 forms-table3">
                    <p class="forms-table-th">
                        <span>序号</span>
                        <span>标段号</span>
                        <span>状态</span>
                        <!-- <span style="color: #fff;width: 200px !important">{{ $t('lang.operate') }}</span> -->
                    </p>
                    <el-scrollbar class="tableDatas">
                        <p @click.stop="flyToRoad(item, index)"
                            :style="roadInfo?.id == item.id ? 'background-color: var(--el-color-primary);' : ''"
                            v-for="(item, index) in tableData_road" :key="index">
                            <span>{{ index + 1 }}</span>
                            <!-- {{ 'k' + (index + 25) }} -->
                            <span>{{ item.name }}</span>
                            <span
                                :style="!item.status ? 'color:#909399' : (item.status == 1 ? 'color:#E6A23C' : 'color:#67C23A')">{{
                                    !item.status ? '未完成' : (item.status == 1 ? '进行中' : '已完成') }}</span>
                            <!-- <span>{{ item.stage }}%</span> -->
                            <!-- <span style="width: 200px !important" :style="roadInfo?.id == item.id ? 'color:#fff' : ''">
                                <em @click.stop="flyToRoad(item)">{{ $t('lang.location')
                                    }}</em> -->
                            <!-- </span> -->
                        </p>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <div class="roadInfo" v-if="roadDialogShow">
            <div class="infosDialog-title">
                <p>详细信息</p>
                <el-icon @click="roadDialogShow = false, roadInfo = null">
                    <Close />
                </el-icon>
            </div>
            <div class="forms forms2">
                <div class="forms-item">
                    <p class="label">标段号</p>
                    <!-- segment -->
                    <p class=" ">
                        <span style="margin-right: 16px;">{{ roadInfo.segment }}</span>
                        <span
                            :style="!roadInfo.status ? 'color:#909399' : (roadInfo.status == 1 ? 'color:#E6A23C' : 'color:#67C23A')">{{
                                !roadInfo.status ? '未完成' : (roadInfo.status == 1 ? '进行中' : '已完成') }}</span>
                    </p>
                </div>
                <div class="forms-item">
                    <!-- <p class="label">铺层进度</p> -->
                    <div class="forms-table">
                        <p class="forms-table-th">
                            <span v-for="(item, index) in roadInfo.layers">{{ item.layerName }}</span>
                        </p>
                        <p class="forms-table-tr">
                            <span v-for="(item, index) in roadInfo.layers">{{ item.progress }}%</span>
                        </p>
                    </div>
                    <!-- <p style="display: flex;">
                        <span style="display: block;margin-bottom: 5px;flex: 1;"
                            v-for="(item, index) in roadInfo.layers">
                            <span style="width: 70px;display: inline-block;">{{ item.layerName }}：</span>{{
                                item.progress }}%；</span>
                    </p> -->
                </div>
            </div>
            <div class="infosDialog-footer">
                <p @click="roadDialogShow = false">{{ $t('lang.close') }}</p>
            </div>
        </div>
        <!-- ````````````````````````````````````````````````````````````````````````````````````````-->
        <!-- 测量 -->
        <div class="butns butns2" v-if="clShow">
            <div class="butns-item" style="position: relative">
                <p @click="getClType(0)" :class="clType == 0 ? 'activeType' : ''">
                    <el-tooltip class="box-item" effect="dark" :content="$t('lang.level')" placement="left">
                        <img src="/img/cz.png" alt="">
                    </el-tooltip>
                </p>
                <p @click="getClType(1)" :class="clType == 1 ? 'activeType' : ''">
                    <el-tooltip class="box-item" effect="dark" :content="$t('lang.vertical')" placement="left">
                        <img src="/img/sp.png" alt="">
                    </el-tooltip>
                </p>
                <!-- <p @click="getClType(2)" :class="clType == 2 ? 'activeType' : ''">
                    <el-tooltip class="box-item" effect="dark" :content="$t('lang.level2')" placement="left">
                        <img src="/img/cz.png" alt="">
                    </el-tooltip>
                </p> -->
                <el-icon @click="closeClDialog" size="20"
                    style="color: #4B4C4D;position: absolute;right: -7px;top: -7px;">
                    <CircleCloseFilled />
                </el-icon>
            </div>
            <div v-if="stemNormalList.length" @click="submitForm2" class="butns-item"
                style="height: 44px !important;margin-top: 16px;">
                <p style="height: 100%">
                    <el-tooltip class="box-item" effect="dark" :content="$t('lang.submit')" placement="left">
                        <img src="/img/cl.png" alt="">
                    </el-tooltip>
                </p>
            </div>


        </div>
        <!-- poi弹窗 -->
        <div class="infosDialog" v-if="addPoiDialogShow">
            <div class="infosDialog-title">
                <p>{{ $t(!ruleFormPoi.id ? 'lang.addPOI' : 'lang.editPOI') }}</p>
                <el-icon @click="closeaddPoiDialog()">
                    <Close />
                </el-icon>
            </div>
            <el-scrollbar class="forms" style="height: 30vh;">
                <!-- type -->
                <!-- <div class="forms-item forms-item2">
                    <p class="label required">{{ $t('lang.objectType') }}</p>
                    <el-select @change="getobjectType" style="width: 100%;" class="border border2 value"
                        v-model="ruleFormPoi.street" :placeholder="$t('lang.select')">
                        <el-option v-for="item in options_objectType" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </div> -->
                <!-- muban -->
                <!-- <div v-if="ruleFormPoi.street" class="forms-item forms-item2">
                    <p class="label required">{{ $t('lang.templateType') }}</p>
                    <el-select @change="getTemplateType" style="width: 100%;" class="border border2 value"
                        v-model="ruleFormPoi.attributeId" :placeholder="$t('lang.select')">
                        <el-option v-for="item in options_templateType" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </div> -->
                <!-- 施工对象id -->
                <!-- <div class="forms-item forms-item2">
                    <p class="label">{{ $t('lang.propertiesBundleId') }}</p>
                    <el-input v-model="pipeLineInfo.propertiesId" :placeholder="$t('lang.input')"
                        class="border border2 value"></el-input>
                </div> -->
                <!-- 施工对象 -->
                <!-- <div class="forms-item forms-item2">
                    <p class="label">{{ $t('lang.propertiesName') }}</p>
                    <el-input v-model="pipeLineInfo.propertiesName" :placeholder="$t('lang.input')"
                        class="border border2 value"></el-input>
                </div> -->
                <!-- 沟 -->
                <!-- <div class="forms-item forms-item2" v-for="(item, index) in propertyList" :key="index">
                    <p class="label" :class="{ 'required': item.required }">{{ item.name }}</p>
                    <el-input style="resize: none;" :placeholder="$t('lang.input')" class="border border2 value"
                        v-model="item.model" v-if="item.type < 3" :type="item.type == 1 ? 'text' : 'textarea'" />
                    <el-cascader popper-class="selectArea" style="width: 100%" v-if="item.type == 3"
                        v-model="item.model" :options="item.optionList" :show-all-levels="true"
                        :props="propsCascader" />
                    <el-radio-group v-model="item.model" v-if="item.type == 4" style="width: 100%">
                        <el-radio v-model="item2.model" v-for="(item2, index2) in item.optionList" :key="index2"
                            :label="item2.value">{{ item2.value }}</el-radio>
                    </el-radio-group>
                    <el-cascader popper-class="selectArea" style="width: 100%" v-if="item.type == 5"
                        v-model="item.model" :options="item.optionList" :show-all-levels="true"
                        :props="propsCascaderColur">
                        <template #default="{ node, data }">
                            <div class="smallColorPicker"
                                style="display: flex;align-items: center;justify-content: space-between;">
                                <span>{{ data.value }}</span>
                                <el-color-picker class="smallColorPicker" v-model="data.model" />
                            </div>
                        </template>
</el-cascader>
</div> -->
                <!-- 坐标 -->
                <div class="forms-item forms-item2">
                    <p class="label required">{{ $t('lang.position') }}</p>
                    <div class="flex">
                        <p style="display:flex;align-items: center;justify-content: flex-start">
                            <span style=" margin-right: 10px;">x</span>
                            <el-input style="width: 70%" v-model="ruleFormPoi.x" :placeholder="$t('lang.input')"
                                class="border border2"></el-input>
                        </p>
                        <p style="display:flex;align-items: center;justify-content: center;">
                            <span style="margin-right: 10px;">y</span>
                            <el-input style="width: 70%" v-model="ruleFormPoi.y" :placeholder="$t('lang.input')"
                                class="border border2"></el-input>
                        </p>
                        <p style="display:flex;align-items: center;justify-content: flex-end;">
                            <span style="margin-right: 10px;">z</span>
                            <el-input style="width: 70%" v-model="ruleFormPoi.z" :placeholder="$t('lang.input')"
                                class="border border2"></el-input>
                        </p>
                    </div>
                </div>
                <!-- 备注 -->
                <div class="forms-item forms-item2">
                    <p class="label">{{ $t('lang.remark') }}</p>
                    <el-input style="height: 52px;width: 100%;border-radius: 2px;" type="textarea"
                        v-model="ruleFormPoi.zbfwj" :placeholder="$t('lang.input')" resize="none"
                        class="border border2 value"></el-input>
                </div>
                <!-- 上传图片 -->
                <!-- <div class="forms-item forms-item2">
                    <p class="label">{{ $t('lang.image') }}</p>
                    <div class="company-imgs">
                        <div @mouseenter="mouseenterImg(index2)" @mouseleave="mouseleaveImg" class="company-img"
                            v-for="(item2, index2) in photoList" :key="index2">
                            <img @click="imgUpload2(photoList, index2)" :src="item2.urls ? `/dgApi${item2.urls}` : ''"
                                alt="" />
                            <div v-if="index2 == showFloat" class="company-dialog"
                                @click="imgUpload2(photoList, index2)">
                                <el-icon v-if="!issee" size="16px" color="var(--el-color-primary)"
                                    @click.stop="deletePhoto(item2, index2)">
                                    <CircleCloseFilled />
                                </el-icon>
                            </div>
                        </div>
                        <el-upload v-if="!issee && photoList.length < 6" class="urbanUploadImgs" ref="imgRef"
                            :http-request="uploadAvatar" :before-upload="beforeAvatarUpload" action="#">
                            <p>
                                <img src="/img/upimg.png" alt="">
                            </p>
                        </el-upload>
                    </div>
                </div> -->
            </el-scrollbar>
            <div class="infosDialog-footer">
                <p @click="getaddPoiShow()" class="reset">{{ $t('lang.pickUpAgain') }}</p>
                <!-- <p @click="submitForm()">{{ $t('lang.ok') }}</p> -->
            </div>
        </div>
        <!-- 测量列表、poi列表 -->
        <div class="infosDialog" v-if="listDialogShow"
            :style="listType == 0 ? (locale == 'zh' ? 'width:1240px' : 'width:1400px') : ''">
            <div class="infosDialog-title">
                <p>{{ listType == 1 ? 'POI' : $t('lang.measure') }} {{ $t('lang.record') }} </p>
                <el-icon @click="listDialogShow = false, listType = -1">
                    <Close />
                </el-icon>
            </div>
            <div class="forms">
                <div class="forms-table forms-table2">
                    <p class="forms-table-th">
                        <span>{{ listType == 0 ? $t('lang.measureType') : $t('lang.pipelineType') }}</span>
                        <span
                            :style="listType == 0 ? (locale == 'zh' ? 'width:840px !important' : 'width:950px !important') : ''">
                            {{ listType == 0 ? $t('lang.measure') : $t('lang.pipelineColor') }}</span>
                        <span v-if="listType == 1">{{ $t('lang.propertiesName') }}</span>
                        <span>{{ $t('lang.createTime') }}</span>
                        <span style="color: #fff;">{{ $t('lang.operate') }}</span>
                    </p>
                    <el-scrollbar class="tableDatas">
                        <!-- listType==0  测量 -->
                        <p v-if="listType == 0" v-for="(item, index) in tableData" :key="index">
                            <span
                                :style="'height:calc(32px * ' + ((item.attributes).length) + ');line-height:calc(32px * ' + ((item.attributes).length) + ')'">
                                {{ item.content == 0 ? $t('lang.level') : $t('lang.vertical') }}
                            </span>
                            <span v-if="item.attributes"
                                :style="(locale == 'zh' ? 'width:840px !important' : 'width:950px !important')">
                                <em v-for="(item2, index2) in (item.attributes)" style="display: block;">
                                    {{ $t('lang.line') }}{{ index2 + 1 }}：{{ item2.number }}m
                                    （{{ $t('lang.longitude') }}：{{ (item2.poi1[0].toFixed(8)) }}，{{ $t('lang.latitude')
                                    }}：{{
                                        (item2.poi1[1].toFixed(8)) }}）->
                                    （{{ $t('lang.longitude') }}：{{ (item2.poi2[0].toFixed(8)) }}，{{ $t('lang.latitude')
                                    }}：{{
                                        (item2.poi2[1].toFixed(8)) }}）
                                </em>
                            </span>
                            <span
                                :style="'height:calc(32px * ' + ((item.attributes).length) + ');line-height:calc(32px * ' + ((item.attributes).length) + ')'">
                                {{ item.createTime }}
                            </span>
                            <span style="">
                                <em @click.stop="flyTo(item)">{{ $t('lang.location') }}</em>
                                <em class="del" @click.stop="delItem(item)">{{ $t('lang.delete') }}</em>
                            </span>
                        </p>

                        <!-- listType==1   POI -->
                        <p v-if="listType == 1" v-for="(item, index) in tableData" :key="index">
                            <span>{{ item.street == 1 ? 'Device' : (item.street == 2 ? 'Duct' : "Trench") }}</span>
                            <span>{{ getTableValue(item.attributes, 'Colour') }}</span>
                            <span>{{ getTableValue(item.attributes, 'Name') }} </span>
                            <!-- <span v-if="item.address.length < 10">
                                {{ item.address ? item.address.propertiesName : '-' }}</span>
                            <el-tooltip v-else class="box-item" effect="dark" :content="item.address.propertiesName"
                                placement="right">
                                <span class="ellipsis" v-if="listType == 1">{{ item.address ?
                                    item.address.propertiesName : '-'
                                    }}</span>
                            </el-tooltip> -->
                            <span>
                                {{ item.createTime }}
                            </span>
                            <span style="">
                                <em @click.stop="flyTo(item)">{{ $t('lang.location') }}</em>
                                <em class="del" @click.stop="delItem(item)">{{ $t('lang.delete') }}</em>
                            </span>
                        </p>
                    </el-scrollbar>
                </div>

            </div>
            <el-pagination class="fixedPage" :pager-count="3" @current-change="getList(listType)" small
                v-model:current-page="currentPage" background="rgba(2, 2, 38, 0.4)" layout="total, prev, pager, next"
                :total="total" :page-size="pageSize" />
        </div>
        <!-- 模型列表 -->
        <div class="infosDialog modelDialog" v-if="modelDialogShow">
            <div class="infosDialog-title">
                <p>{{ $t('lang.liveActionModel') }} {{ $t('lang.list') }}</p>
                <el-icon @click="modelDialogShow = false">
                    <Close />
                </el-icon>
            </div>
            <div class="forms">
                <div class="forms-table" :class="powerShow ? 'forms-table2 forms-table3' : ''">
                    <p class="forms-table-th">
                        <span>{{ $t('lang.name') }}</span>
                        <span v-if="powerShow">{{ $t('lang.heightOffset') }}</span>
                        <span v-if="powerShow" style="width: 100px !important;">{{ $t('lang.status') }}</span>
                        <span>{{ $t('lang.createTime') }}</span>
                        <span style="color: #fff;">{{ $t('lang.operate') }}</span>
                    </p>
                    <el-scrollbar class="tableDatas">
                        <p v-for="(item, index) in model_tableData" :key="index">
                            <span class="ellipsis">{{ item.name }}</span>
                            <span v-if="powerShow" @click="changeHeight(item)" class="modelName">{{ item.height ?
                                Number(item.height).toFixed(4) : '-'
                                }}</span>
                            <span v-if="powerShow" style="width: 100px !important;"><el-switch
                                    @change="changeModel(item)" size="small" v-model="item.status" class="mb-2"
                                    :active-value="1" :inactive-value="0" /></span>
                            <span>{{ item.createTime }}</span>
                            <span>
                                <em @click.stop="flyToModel(item)">{{ $t('lang.location') }}</em>
                                <em v-if="powerShow" class="del" @click.stop="delModelItem(item)">{{ $t('lang.delete')
                                    }}</em>
                            </span>
                        </p>
                    </el-scrollbar>
                </div>

            </div>
            <el-pagination class="fixedPage" :pager-count="3" @current-change="getmodelList()" small
                v-model:current-page="model_currentPage" background="rgba(2, 2, 38, 0.4)"
                layout="total, prev, pager, next" :total="model_total" :page-size="model_pageSize" />
        </div>
        <!-- 管线列表 -->
        <div class="infosDialog" v-if="pipelineDialogShow && changeModelType == 0" style="width: 600px;">
            <div class="infosDialog-title">
                <p>{{ $t('lang.designModel') }} {{ $t('lang.list') }}</p>
                <el-icon @click="pipelineDialogShow = false">
                    <Close />
                </el-icon>
            </div>
            <div class="forms">
                <div class="forms-table forms-table2 forms-table3">
                    <p class="forms-table-th">
                        <span style="width: 400px !important">{{ $t('lang.city') }}</span>
                        <span style="color: #fff;width: 200px !important">{{ $t('lang.operate') }}</span>
                    </p>
                    <el-scrollbar class="tableDatas">
                        <p v-for="(item, index) in pipeLine_tableData" :key="index">
                            <span style="width: 400px !important">{{ item.Address }}</span>
                            <span style="width: 200px !important">
                                <em @click.stop="flyToPipeLine(item)">{{ $t('lang.location') }}</em>
                                <em class="del" @click.stop="deletePipeLine(item)">{{ $t('lang.delete') }}</em>
                            </span>
                        </p>
                    </el-scrollbar>
                </div>

            </div>
            <!-- <el-pagination class="fixedPage" :pager-count="3" @current-change="getPipeLine()" small
                v-model:current-page="model_currentPage" background="rgba(2, 2, 38, 0.4)"
                layout="total, prev, pager, next" :total="model_total" :page-size="model_pageSize" /> -->
        </div>
        <!-- 管线信息弹窗 -->
        <div class="infosDialog" v-if="pipeLineInfoShow" style="width: 700px;">
            <div class="infosDialog-title">
                <p>{{ pipeLineInfo.objectType }}&emsp;{{ $t('lang.pipeLineInfo') }}</p>
                <el-icon @click="pipeLineInfoShow = false">
                    <Close />
                </el-icon>
            </div>
            <div class="forms forms2">
                <div v-for="(item, index) in JSON.parse(pipeLineInfo.attributes)" class="forms-item">
                    <p class="label">{{ item.name }}</p>
                    <p class=" "> {{ item.type == 5 ? getcolorValue(item) : item.model }}</p>
                </div>
            </div>
            <div class="infosDialog-footer">
                <p @click="pipeLineInfoShow = false">{{ $t('lang.close') }}</p>
            </div>
        </div>
        <!-- 修改height -->
        <div class="infosDialog" v-if="heightDialogShow" style="width: 300px;">
            <div class="infosDialog-title">
                <p>{{ $t('lang.heightOffset') }}</p>
                <el-icon @click="heightDialogShow = false">
                    <Close />
                </el-icon>
            </div>
            <div class="forms ">
                <div class="forms-item forms-item2">
                    <el-input type="number" v-model="ruleFormModel.height" :placeholder="$t('lang.input')"
                        class="border border2 value"></el-input>
                </div>
            </div>
            <div class="infosDialog-footer">
                <p @click="submitFormModel()">{{ $t('lang.ok') }}</p>
            </div>
        </div>
        <!--  -->
        <div class="add-poi-tip cesium-tip">{{ $t('lang.pickPOI') }}</div>
        <div class="distance-measure cesium-tip">{{ $t('lang.escExit') }}</div>
        <canvas id="myCanvas" width="20" height="10"></canvas>
        <div class="zhizhen" style="">
            <el-tooltip class="box-item" effect="dark" placement="right" :content="$t('lang.myLocation')">
                <img style="" src="/img/zhizhen.png" alt="" @click="handleResetCompass" ref="compass" />
            </el-tooltip>
        </div>
        <!-- 场景完成 -->
        <div class="scenceSuc fade-in-out" v-if="scenceSucShow">
            <div>
                <img src="/img/success.png" alt="">
                <p>{{ t('lang.scenceSuc') }}</p>
            </div>
        </div>
        <!-- 放大弹窗 -->
        <el-dialog custom-class="img-Uploads" :append-to-body="true" v-model="imgUploads.imgUploadStatus" width="60%"
            :show-close="false">
            <div>
                <el-carousel :initial-index="imgUploads.initial" v-if="imgUploads.isArray" height="70vh">
                    <el-carousel-item v-for="(item, index) in imgUploads.urls" :key="index">
                        <img v-if="!item.urls.includes('mp4')" :src="'/dgApi' + item.urls" alt="">
                        <video controls autoplay loop v-if="item.urls.includes('mp4')" :src="'/dgApi' + item.urls"
                            alt="" />
                    </el-carousel-item>
                </el-carousel>
                <img v-else :src="'/dgApi' + imgUploads.imgUpload" alt="">
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import slibar from "@/components/huak.vue";
import { ref, Ref, onMounted, onUnmounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { BaseImageryType, CesiumUtils } from "../web3d/cesium/cesiumUtils";
import { Web3DUtils } from "../web3d";
import * as Cesium from "cesium";
import { attributeList, iconList, pipelineallpoint, reconstructionList, reconstructionSubmit, removeModel, removePoi, roadList, screenProgress, uploadImages } from "../api/index";
import { poiList, poiSubmit, } from "../api/index";
import { allRange, deletePipe } from "@/api/linePipe";
import { ElLoading, ElMessage, ElMessageBox, UploadInstance, UploadProps } from "element-plus";
import { nextTick } from "vue";
import { useI18n } from "vue-i18n";
import i18n from "@/utils/lang/i18n";
const { locale } = useI18n();
const t = i18n.global.t;
var loading = ref();
const route = useRoute();
var clShow = ref();
var clType = ref();
var addPoiBtnShow = ref();
var addPoiDialogShow = ref();

const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const tableData: any = ref([]);
const listType = ref();
const listDialogShow = ref();

const model_total = ref(0);
const model_currentPage = ref(1);
const model_pageSize = ref(10);
const model_tableData: any = ref([]);
const modelDialogShow = ref()
const volumenShow = ref()
const pointLineShow = ref()

const pipelineDialogShow = ref();
const pipeLine_tableData: any = ref([]);

const options_objectType: any = ref(
    [
        { id: 1, name: 'Device' },
        { id: 2, name: 'Duct' },
        { id: 3, name: 'Trench' },
    ]
)

// 匹配
function getcolorValue(item: any) {
    let value = '';
    item.optionList.forEach((element: any) => {
        if (item.model == element.key) {
            value = element.value;
        }
    });

    return value;
}

const options_templateType: any = ref([]);
function getTemplateList(type: any) {
    attributeList({
        current: 1,
        size: -1,
        type: type,
    })
        .then((res: any) => {
            if (res.data.code == 200) {
                options_templateType.value = res.data.data.records;
            }
        })
        .catch((err: any) => { });
}

const propertyList: any = ref([]);
function getTemplateType(val: any, attributes?: any) {
    options_templateType.value.forEach((e: any) => {
        if (e.id == val) {
            propertyList.value = JSON.parse(e.attributes);
        }
    });

    if (attributes) {
        propertyList.value.forEach((element: any) => {
            let data = attributes.find((i: any) => {
                return element.name == i.name
            })
            if (data) {
                element.model = data.model;
            }
        });
    }


    // console.log(propertyList.value, 'propertyList.value')
}



const propsCascader = {
    label: "value",
    value: "value",
    children: "optionList",
    checkStrictly: true,
    expandTrigger: "hover",
};

const propsCascaderColur = {
    label: "value",
    value: "key",
    children: "optionList",
    checkStrictly: true,
    expandTrigger: "hover",
};


// 上传多张图片----------------》
const issee = ref(false);
const imgRef = ref<UploadInstance>();
const photoList: Ref<any[]> = ref([]);
const showFloat = ref(100);

const imgUploads = ref({
    imgUpload: "",
    urls: [] as any,
    isArray: false,
    imgUploadStatus: false,
    initial: 0 as any,
});
function imgUpload2(urls: any, initial?: number) {
    imgUploads.value.imgUploadStatus = true;
    imgUploads.value.urls = urls;
    imgUploads.value.isArray = true;
    imgUploads.value.initial = initial;
}

function mouseenterImg(index: number) {
    showFloat.value = index;
}
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile: any) => {
    let size = rawFile.size / 1024 / 1024;
    let hz = rawFile.name.split(".")[rawFile.name.split(".").length - 1];
    if (size < 1 && (hz == "png" || hz == "jpg" || hz == "jpeg")) {
    } else {
        ElMessage.error(t('lang.imageLimit'));
        return false;
    }
};
const uploadAvatar = (rawFile?: any) => {
    const formData = new FormData();
    formData.append("file", rawFile.file);
    formData.append("filename", rawFile.file.name);
    uploadImages(formData).then((res: any) => {
        if (res.data.code == 200) {
            photoList.value.push({
                urls: res.data.data.url,
            });
        }
    });
};
const dialogImageUrl = ref("");
const dialogVisible_bigImg = ref(false);
function seeBigImg(urls: string) {
    dialogImageUrl.value = urls;
    dialogVisible_bigImg.value = true;
}
// 鼠标移出图片
function mouseleaveImg() {
    showFloat.value = 100;
}
function deletePhoto(item: any, index: any) {
    photoList.value.splice(index, 1);
}

// --------------上传

const heightDialogShow = ref(false);
let ruleFormModel = reactive({
    height: '',
    id: ''
})
function changeHeight(item: any) {
    ruleFormModel.id = item.id;
    ruleFormModel.height = item.height;
    heightDialogShow.value = true;
}

const trenchShow = ref(1)
function getpipelineShow(val: any) {
    if (pipeLine_tableData.value.length) {
        pipeLine_tableData.value.forEach(((i: any, inx: any) => {
            i.subList.forEach((e: any) => {
                if (val && e.is_trench != 0) {//是沟
                    Web3DUtils.cesiumUtils.removeTrench(e.psn, true);
                } else if (!val && e.is_trench != 0) {
                    Web3DUtils.cesiumUtils.removeTrench(e.psn, false);
                }
            });
        }))
    }
}

// 点击右侧菜单
function clickRightBtn(i: any) {
    clShow.value = false;
    listType.value = -1;
    addPoiBtnShow.value = false;
    modelDialogShow.value = false;
    pipelineDialogShow.value = false;
    listDialogShow.value = false;
    volumenShow.value = false;
    pointLineShow.value = false;
    closeaddPoiDialog();
    sessionStorage.removeItem('volumenShow');
    if (i == 0) {
        clShow.value = !clShow.value;
        sessionStorage.setItem('clShow', clShow.value);
    } else if (i == 1) {
        currentPage.value = 1;
        getList(0);
    } else if (i == 2) {
        getaddPoiShow(0);
    } else if (i == 3) {
        currentPage.value = 1;
        getList(1);
    } else if (i == 4) {
        getModel();
    } else if (i == 5) {
        getPipeLine();
    } else if (i == 6) {
        volumenShow.value = true;
        sessionStorage.setItem('volumenShow', true as any)
        Web3DUtils.cesiumUtils.selectionPolygonArea()
    } else if (i == 7) {
        pointLineShow.value = true;
        removePLMeasure = Web3DUtils.cesiumUtils.drawPointLine()
    }
}

const changMap = (show: any) => {
    if (!show) {
        // 影像
        Web3DUtils.cesiumUtils.toggleBaseImagery(BaseImageryType.IMAGERY);
    } else {
        // 电子
        Web3DUtils.cesiumUtils.toggleBaseImagery(BaseImageryType.ELECTRONCIS);
    }
};

const mapType = ref(true);
function closeMap() {
    mapType.value = !mapType.value;
    if (mapType.value) {
        Web3DUtils.cesiumUtils.toggleBaseImagery(BaseImageryType.IMAGERY);
        nextTick(() => {
            Web3DUtils.cesiumUtils.openTranslucency(true);//地下
        })
    } else {
        // 电子
        Web3DUtils.cesiumUtils.toggleBaseImagery();
    }
}

// 中引文切换
const langName = ref('English');
const handleSetLanguage = (val: any) => {
    if (val === 'en') {
        locale.value = 'en';
        langName.value = 'English';
    } else {
        locale.value = 'zh';
        langName.value = '中文';
    }
    localStorage.setItem('lang', locale.value);
    location.reload()
};


function getModel() {
    modelDialogShow.value = true;
    getmodelList();
}


function getmodelList() {
    reconstructionList({
        size: model_pageSize.value,
        current: model_currentPage.value,
        descs: "create_time",
        status: powerShow.value == false ? 1 : '',
        details: 2
    })
        .then((res) => {
            if (res.data.code == 200) {
                model_tableData.value = res.data.data.records;
                model_total.value = res.data.data.total;
            }
        })
        .catch((err) => {
            console.log(err, "err");
        });
}

function getPipeLine() {
    pipelineDialogShow.value = true;
}

const pipeLineInfo: any = ref({
    objectType: "",
    propertiesId: '',
    propertiesName: '',

    // 沟7
    propertiesLength: '',
    propertiesRoadSurface: '',
    propertiesConstructionMode: '',
    propertiesIsGardentrench: 'Y',
    propertiesSpecifications: '',
    propertiesDepth: '',
    propertiesWidth: '',

    // 管子4
    propertiesCategory: '',
    // propertiesLength:'',
    propertiesBundleSize: '',
    propertiesDuctLabelColour: '',

    // 附属物4
    propertiesNetworkLevel: '',
    propertiesModelId: '',
    locationx: '',
    locationy: '',
    // propertiesCategory: '',
});
const pipeLineInfoShow: any = ref(false);

function getPipeLineAll(is_trenchAll?: any) {
    nextTick(() => {
        pipelineallpoint({
            size: -1,
            current: model_currentPage.value,
            descs: "create_time",
            lineType: '电信'
        })
            .then((res) => {
                if (res.data.code == 200) {
                    if (!res.data.data.length) {
                        return
                    }

                    pipeLine_tableData.value = res.data.data;
                    if (pipeLine_tableData.value.length) {
                        pipeLine_tableData.value.forEach(((i: any, inx: any) => {
                            i.subList.forEach((e: any) => {
                                e.status = 1;
                                if (e.status) {
                                    Web3DUtils.cesiumUtils.pipeLineDG(e, false, is_trenchAll);
                                }

                                if (e.is_trench == 0) {//不是沟
                                    // getPipeList(e);
                                }
                            });
                        }))
                    }

                    // 点击管线
                    Web3DUtils.cesiumUtils.clickPipeGetDetail((data) => {
                        console.log(data, 'data')
                        if (data) {
                            pipeLineInfo.value = data;


                            ruleFormPoi.areaCode = data.project;
                            ruleFormPoi.iconSize = data.propertiesBundleSize;//型号
                            ruleFormPoi.backgroundSize = data.propertiesDuctLabelColour;//颜色
                            // `````````````````
                            if (data.objectType == 'Device') {
                                ruleFormPoi.street = 1;
                            } else if (data.objectType == 'Duct') {
                                ruleFormPoi.street = 2;
                            } else if (data.objectType == 'Trench') {
                                ruleFormPoi.street = 3;
                            }
                            getTemplateList(ruleFormPoi.street)
                            ruleFormPoi.attributes = data.attributes;
                            setTimeout(() => {
                                ruleFormPoi.attributeId = data.attributeId;
                                getTemplateType(ruleFormPoi.attributeId, JSON.parse(ruleFormPoi.attributes))
                            }, 200)
                            // ````````````````````
                            if (!addPoiBtnShow.value && !clShow.value) {
                                pipeLineInfoShow.value = true;
                            }
                        } else {
                            if (!addPoiBtnShow.value) {
                                ElMessage.warning(t('lang.noData'))
                            }
                        }

                    })
                    setTimeout(() => {
                        loading.value?.close();
                    }, 1500)
                }
            })
            .catch((err) => {
                console.log(err, "err");
                loading.value?.close();
            });

    })
}


const pipeList: any = ref([]);
function getPipeList(i: any) {
    nextTick(() => {
        Web3DUtils.cesiumUtils.changePipeLineColor(i);
    })
}

const reconstructionAllList: any = ref([])


function changeModel(val: any) {
    ElMessageBox.confirm(
        t('lang.confirm') + ' ' + (val.status ? t('lang.open') : t('lang.close')) + "?",
        t('lang.warn'),
        {
            confirmButtonText: t('lang.confirm'),
            cancelButtonText: t('lang.cancel'),
            type: "warning",
        }
    )
        .then(() => {
            reconstructionSubmit({
                id: val.id,
                status: val.status,
            })
                .then((response: any) => {
                    ElMessage({
                        type: "success",
                        message: t('lang.successful'),
                    });
                    getmodelList();
                })
                .catch((e: any) => {
                    console.error(e.msg);
                });
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t('lang.cancelled'),
            });
            val.status = !val.status;
        });
}

function delItem(i: any) {
    ElMessageBox.confirm(t('lang.confirm') + ' ' + t('lang.delete') + "?", t('lang.warn'), {
        confirmButtonText: t('lang.confirm'),
        cancelButtonText: t('lang.cancel'),
        type: "warning",
    })
        .then(() => {
            removePoi({
                ids: i.id
            })
                .then((res: any) => {
                    if (res.data.code == 200) {
                        ElMessage.success(t('lang.successful'));
                        getList(listType.value);

                        if (listType.value == 0) {
                            getclListAll()
                        } else {
                            getpoiListAll()
                        }

                    }
                })
                .catch((err: any) => {
                    console.log(err, "err");
                });
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t('lang.cancelled'),
            });
        });
}

function delModelItem(i: any) {
    ElMessageBox.confirm(t('lang.confirm') + ' ' + t('lang.delete') + "?", t('lang.warn'), {
        confirmButtonText: t('lang.confirm'),
        cancelButtonText: t('lang.cancel'),
        type: "warning",
    })
        .then(() => {
            removeModel({
                ids: i.id
            })
                .then((res: any) => {
                    if (res.data.code == 200) {
                        ElMessage.success(t('lang.successful'));
                        model_currentPage.value = 1;
                        getmodelList();
                    }
                })
                .catch((err: any) => {
                    console.log(err, "err");
                });
        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t('lang.cancelled'),
            });
        });
}

function deletePipeLine(i: any) {
    ElMessageBox.confirm(t('lang.confirm') + ' ' + t('lang.delete') + "?", t('lang.warn'), {
        confirmButtonText: t('lang.confirm'),
        cancelButtonText: t('lang.cancel'),
        type: "warning",
    })
        .then(() => {
            if (!i.subList.length) {
                return false;
            }
            i.subList.forEach((e: any, inx: any) => {
                deletePipe({
                    projectSn: e.psn
                })
                    .then((res: any) => {
                        if (res.data.code == 200) {
                            if (inx == i.subList.length - 1) {
                                ElMessage.success(t('lang.successful'));
                                getPipeLineAll();
                            }
                        }
                    })
                    .catch((err: any) => {
                        console.log(err, "err");
                    });
            });

        })
        .catch(() => {
            ElMessage({
                type: "info",
                message: t('lang.cancelled'),
            });
        });
}

function getTableValue(list: any, value: String) {
    var model = '-';
    if (list) {
        list.forEach((element: any) => {
            if (element.name.indexOf(value) != -1) {
                if (element.model) {
                    model = element.model.toString();
                }
            }
        });
    }
    return model;
}

function getList(i: any) {
    listType.value = i;
    poiList({
        size: pageSize.value,
        current: currentPage.value,
        descs: "create_time",
        proName: i
    })
        .then((res) => {
            if (res.data.code == 200) {
                tableData.value = res.data.data.records;
                tableData.value.forEach((element: any) => {
                    if (element.attributes) {
                        element.attributes = JSON.parse(element.attributes);
                    }
                });
                total.value = res.data.data.total;
                listDialogShow.value = true;
            }
        })
        .catch((err) => {
            console.log(err, "err");
        });
}

function flyTo(val: any) {
    listDialogShow.value = false;
    if (listType.value == 0) {
        Web3DUtils.cesiumUtils.flyToLocation(val, 9); //查看固定200高度56
    } else {
        Web3DUtils.cesiumUtils.flyToLocation(val, 200); //查看固定200高度
    }

    listType.value = -1;
}

const changeModelType = ref();
const changeModelType_child = ref(0);


function clickBuildObject(buildObjectId?: any) {
    getchangeModel(1, 1);
    // 定位到指定对象的模型位置
    nextTick(() => {
        setTimeout(() => {
            let data = reconstructionAllList.value.filter((e: any) => {
                return buildObjectId == e.gid//remark对象ID
            });

            if (data.length) {
                flyToModel(data[0], data.length > 2 ? 6 : 0)
            }

        }, 1000)
    })
}

function getchangeModel(i: any, f?: any) {
    if (!f) {
        loading.value = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.7)',
        })
    }

    changeModelType.value = i;
    Web3DUtils.cesiumUtils.removePipe();
    Web3DUtils.cesiumUtils.removeAllCl();
    // Web3DUtils.cesiumUtils.init3dtilesetJSON()//清空
    closeClDialog();

    if (i == 0) {
        getPipeLineAll(1);
    } else {
        getclListAll();
    }

    // if (!f) {
    //     setTimeout(() => {
    //         loading.value.close();
    //     }, 2000)
    // }
}
function getchangeModel_child(i: any) {
    changeModelType_child.value = i;
}

function flyToModel(item: any, h?: any) {

    if (!item.status) {
        ElMessage.warning(t('lang.noData'))
        return false;
    }

    modelDialogShow.value = false;
    item.show = true;
    if (item.url.indexOf('/dgApi/') == -1) {
        item.url = '/dgApi/' + item.url;
    }
    // Web3DUtils.cesiumUtils.init3dtilesetJSON(item, true, h);
}

function flyToRoad(item: any, index: any) {
    roadDialogShow.value = false;
    if (roadInfo.value && item.id == roadInfo.value.id) {
        roadInfo.value = null;
        Web3DUtils.cesiumUtils.flyToRoad(item, false)
        return;
    } else {
        // item.segment = 'k' + (index + 25);
        roadInfo.value = item;
        Web3DUtils.cesiumUtils.flyToRoad(item, true)
    }
}

function flyToPipeLine(item: any) {

    if (!trenchShow.value && item.is_trench == 1) {
        ElMessage.warning(t('lang.openTrench'))
        return false;
    }

    if (!item.subList.length) {
        ElMessage.warning(t('lang.noData'))
        return false;
    }

    pipelineDialogShow.value = false;
    item.subList[0].show = true;
    Web3DUtils.cesiumUtils.pipeLineDG(item.subList[0], true);
}


// websoket·······························
let testUrl = 'ws://120.237.115.74:9090/';//测试环境
let masterUrl = 'wss://hj-ws.easyar.cn/';//正式环境wss://hj-ws.easyar.cn/  47.238.143.171:9090

var websocketForm: any = reactive({
    websocketList: [],
    websocketInfo: {
        time: '',
        content: []
    },
    url: masterUrl + 'webSocket/',
    websock: null, //建立的连接
    lockReconnect: false, //是否真正建立连接
    timeout: 60 * 1000, //60秒一次心跳
    timeoutObj: null, //心跳心跳倒计时
    serverTimeoutObj: null, //心跳倒计时
    timeoutnum: null, //断开 重连倒计时
    Svalue: true,
    websocketId: ''
})

function initWebSocket() {
    //初始化weosocket
    const time = new Date().getTime();
    const wsuri = websocketForm.url + websocketForm.websocketId;
    websocketForm.websock = new WebSocket(wsuri);//建立连接
    websocketForm.websock.onopen = websocketonopen;//连接成功
    websocketForm.websock.onerror = websocketonerror;//连接错误
    websocketForm.websock.onmessage = websocketonmessage;//接收信息
    websocketForm.websock.onclose = websocketclose;	//连接关闭
}

function reconnect() {
    //重新连接
    console.log('重新连接')
    if (websocketForm.lockReconnect) {
        return;
    }
    websocketForm.lockReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    websocketForm.timeoutnum && clearTimeout(websocketForm.timeoutnum);
    websocketForm.timeoutnum = setTimeout(function () {
        //新连接
        console.log('新连接')
        initWebSocket();
        websocketForm.lockReconnect = false;
    }, 5000);
}
function reset() {
    //重置心跳
    //清除时间
    clearTimeout(websocketForm.timeoutObj);
    clearTimeout(websocketForm.serverTimeoutObj);
    start();//重启心跳
}
function start() {
    //开启心跳
    websocketForm.timeoutObj && clearTimeout(websocketForm.timeoutObj);
    websocketForm.serverTimeoutObj && clearTimeout(websocketForm.serverTimeoutObj);
    websocketForm.timeoutObj = setTimeout(function () {
        //这里发送一个心跳，后端收到后，返回一个心跳消息
        if (websocketForm.websock.readyState == 1) {
            //如果连接正常
            let params: any = {
                type: 'heartbeat',
                data: {
                    location: ''
                },
            };
            websocketsend(JSON.stringify(params));
        } else {
            //否则重连
            websocketForm.reconnect();
        }
        websocketForm.serverTimeoutObj = setTimeout(function () {
            //超时关闭
            websocketForm.websock.close();
        }, websocketForm.timeout);
    }, websocketForm.timeout);
}
function websocketonopen() {
    //连接成功事件
    let params: any = {
        type: 'test',
        data: {
            location: ''
        },
    };

    // let params: any = {
    //     type: 'clickBuildObject',
    //     data: {
    //         buildObjectId: '982135792298520724'
    //     },
    // };

    websocketsend(JSON.stringify(params));
    //提示成功
    console.log("连接成功", 3);
    //开启心跳
    start();
}
function websocketonerror(e: any) {
    //连接失败事件
    //错误
    console.log("WebSocket连接发生错误");
    //重连
    reconnect();
}
function websocketclose(e: any) {
    //连接关闭事件
    //提示关闭
    console.log("连接已关闭");
    //重连
    //  reconnect();
    websocketForm.websock.close()
    clearTimeout(websocketForm.timeoutnum);
    clearTimeout(websocketForm.timeoutObj);
    clearTimeout(websocketForm.serverTimeoutObj);
    websocketForm.timeoutnum = null;
    websocketForm.timeoutObj = null;
    websocketForm.serverTimeoutObj = null;
}
function websocketonmessage(event: any) {
    //接收服务器推送的信息
    //收到服务器信息，心跳重置
    reset();
    //打印收到服务器的内容
    let data = event && JSON.parse(event.data)
    console.log("收到服务器信息", data);

    // myLocation
    if (data.type == 'myLocation') {
        Web3DUtils.cesiumUtils.myLocation(data.data.location);
    }

    // language
    if (data.type == 'changeLanguage') {
        handleSetLanguage(data.data.language);
    }

    // 定位到三维重建
    if (data.type == 'clickBuildObject') {
        clickBuildObject(data.data.buildObjectId);
    }

    // moveLocation
    Web3DUtils.cesiumUtils.mouseMoveLocation(websocketForm.websock);//监听相机移动

}
function websocketsend(msg: any) {
    //向服务器发送信息
    websocketForm.websock.send(msg);
}
// end websocket

// ···························································

function getClType(val: any) {
    if (clType.value != val) {
        if (removeLineMeasure) {
            removeLineMeasure();
            removeLineMeasure = null;
            document.body.style.cursor = "auto";
            clType.value = -1;
        }
    }

    clType.value = val;
    getclShow(val)

    // 清除测量
    stemNormalList.value = [];
}


// 测量
let removeLineMeasure: ((isEsc?: any) => void) | any;
function getclShow(val: any) {
    if (removeLineMeasure) {
        removeLineMeasure();
        removeLineMeasure = null;
        document.body.style.cursor = "auto";
        clType.value = -1;
    } else {
        removeLineMeasure = Web3DUtils.cesiumUtils.enableLineMeasurement(val);
    }
}

let ruleFormCl: any = reactive({
    name: "",
    x: 0,
    y: 0,
    z: 0,
    id: "",
    stemNormalX: 0,
    stemNormalY: 0,
    stemNormalZ: 0,
    content: '',
    stemLength: 0,
    proName: 0,
    attributes: "",
    rId: ''
});

// addPOI
let ruleFormPoi: any = reactive({
    name: "",
    x: 0,
    y: 0,
    z: 0,
    id: "",
    proName: 1,
    img: '',//图片
    icon: '',//图标id
    zbfwj: '',//备注
    attributes: '',
    attributeId: '',
    street: ''//type
});

function getaddPoiShow(val?: any) {
    if (val == 0) {
        ruleFormPoi.name = '';
        ruleFormPoi.x = 0;
        ruleFormPoi.y = 0;
        ruleFormPoi.z = 0;
        ruleFormPoi.id = "";
        ruleFormPoi.proName = 1;
        ruleFormPoi.img = '';
        ruleFormPoi.icon = '';
        ruleFormPoi.zbfwj = '';
        ruleFormPoi.address = '';
        photoList.value = [];
        ruleFormPoi.street = '';
        ruleFormPoi.attributes = '';
        ruleFormPoi.attributeId = '';
        propertyList.value = [];

        pipeLineInfo.value = {
            objectType: "",
            propertiesId: '',
            propertiesName: '',

            // 沟7
            propertiesLength: '',
            propertiesRoadSurface: '',
            propertiesConstructionMode: '',
            propertiesIsGardentrench: 'Y',
            propertiesSpecifications: '',
            propertiesDepth: '',
            propertiesWidth: '',

            // 管子4
            propertiesCategory: '',
            // propertiesLength:'',
            propertiesBundleSize: '',
            propertiesDuctLabelColour: '',

            // 附属物4
            propertiesNetworkLevel: '',
            propertiesModelId: '',
            locationx: '',
            locationy: '',
            // propertiesCategory: '',
        };
    }

    sessionStorage.setItem('addPoiBtnShow', true as any)
    addPoiBtnShow.value = true;
    addPoiDialogShow.value = false;
    Web3DUtils.cesiumUtils.initPoi(); // 还原
    Web3DUtils.cesiumUtils.entryAddPOIMode(addPoiDialogShow, ruleFormPoi, pipeLine_tableData.value); // 进入cesium添加POI模式
}

function closeaddPoiDialog() {
    addPoiBtnShow.value = false;
    addPoiDialogShow.value = false;
    Web3DUtils.cesiumUtils.initPoi(); // 还原
    Web3DUtils.cesiumUtils.un_entryAddPOIMode();// 还原
    sessionStorage.removeItem('addPoiBtnShow')
}

function submitFormModel() {
    reconstructionSubmit(ruleFormModel)
        .then((response: any) => {
            ElMessage.success(t('lang.successful'));
            heightDialogShow.value = false;
            getmodelList();
        })
        .catch((e: any) => {
            ElMessage.error(e.msg);
        });
}

function getobjectType(val: any) {

    ruleFormPoi.attributeId = '';
    propertyList.value = [];

    // 查找icon
    iconListAll.value.filter((i: any) => {
        if (i.name == val) {
            ruleFormPoi.icon = i.id;
        }
    });

    getTemplateList(val)
}

function submitForm() {
    if (!ruleFormPoi.x) {
        ElMessage.warning(t('lang.inoutl'))
        return false;
    }
    if (!ruleFormPoi.y) {
        ElMessage.warning(t('lang.inoutw'))
        return false;
    }

    if (!ruleFormPoi.street) {
        ElMessage.warning(t('lang.select'))
        return false;
    }

    if (!ruleFormPoi.attributeId) {
        ElMessage.warning(t('lang.select'))
        return false;
    }

    pipeLineInfo.value.locationx = ruleFormPoi.x;
    pipeLineInfo.value.locationy = ruleFormPoi.y;

    let params = {
        ...ruleFormPoi,
        street: ruleFormPoi.street,
        img: photoList.value.length > 0 ? JSON.stringify(photoList.value) : "",
        attributes: JSON.stringify(propertyList.value),
    };
    poiSubmit(params)
        .then((response: any) => {
            ElMessage.success(t('lang.successful'));
            closeaddPoiDialog();
            getpoiListAll()
        })
        .catch((e: any) => {
            ElMessage.error(e.msg);
        });
}

function submitForm2() {
    stemNormalList.value.forEach((element: any, index: any) => {
        poiSubmit({
            ...ruleFormCl,
            sceneId: ruleFormCl.rId,
            attributes: JSON.stringify(element)
        })
            .then((response: any) => {
                if (index == stemNormalList.value.length - 1) {
                    ElMessage.success(t('lang.successful'));
                    closeClDialog();
                    getclListAll();
                }
            })
            .catch((e: any) => {
                ElMessage.error(e.msg);
            });
    });

}
// 关闭测量弹窗
function closeClDialog() {
    clType.value = -1;
    clShow.value = false;
    sessionStorage.setItem('clShow', clShow.value);
    getclListAll();
    if (removeLineMeasure) {
        removeLineMeasure();
        removeLineMeasure = null;
        document.body.style.cursor = "auto";
        clType.value = -1;
    }
}

let removePLMeasure: ((isEsc?: any) => void) | any;
function closedrawPLDialog() {
    pointLineShow.value = false;
    if (removePLMeasure) {
        removePLMeasure();
        removePLMeasure = null;
        document.body.style.cursor = "auto";
    }

    Web3DUtils.cesiumUtils.drawPointLine(1);
}


function submitFormPL() {

}

//展示地标
function getDbShow(val: any) {
    if (val) {
        Web3DUtils.cesiumUtils.jesium.imageryUtils.viewer.imageryLayers.addImageryProvider(Web3DUtils.cesiumUtils.jesium.imageryUtils.getTianDiTuBiaoJiImageryProvider())
    } else {
        Web3DUtils.cesiumUtils.jesium.imageryUtils.viewer.imageryLayers.addImageryProvider(Web3DUtils.cesiumUtils.jesium.imageryUtils.getArcGisImageryImageryProvider())
    }
}
// 指南针
const handleResetCompass = () => {
    let location = sessionStorage.getItem('myLocation');
    if (location) {
        Web3DUtils.cesiumUtils.myLocation(location);
    } else {
        // if (reconstructionAllList.value.length) {
        //     let row: any = reconstructionAllList.value[0];
        // Web3DUtils.cesiumUtils.init3dtilesetJSON()
        // }
    }
};

const stemNormalList: any = ref([])
const compass = ref();
onMounted(() => {
    setTimeout(() => {
        Web3DUtils.cesiumUtils.jesium.cameraUtils.addCompass(compass.value, websocketForm.websock);
    }, 2000);
    // 获取地图加载数据
    setTimeout(() => {
        // 测量回调
        Web3DUtils.cesiumUtils.clickclenCallBack = (list: any, rId: any) => {
            ruleFormCl.x = list[0].poi1[0];
            ruleFormCl.y = list[0].poi1[1];
            ruleFormCl.z = list[0].poi1[2];
            ruleFormCl.stemNormalX = list[list.length - 1].poi1[0];
            ruleFormCl.stemNormalY = list[list.length - 1].poi1[1];
            ruleFormCl.stemNormalZ = list[list.length - 1].poi1[2];
            ruleFormCl.stemLength = list[list.length - 1].number;
            ruleFormCl.content = list[list.length - 1].clType;
            ruleFormCl.rId = rId;
            if (list.length) {
                stemNormalList.value.push(list)
            }
        };

        // poi点击回调
        Web3DUtils.cesiumUtils.clickPOICallBack = (property) => {
            if (!property) {
                return;
            }

            if (clShow.value) {
                return;
            }
            ruleFormPoi.name = property.name._value;
            ruleFormPoi.x = property.x._value;
            ruleFormPoi.y = property.y._value;
            ruleFormPoi.z = property.z._value;
            ruleFormPoi.id = property.id._value;
            ruleFormPoi.proName = property.proName._value;
            ruleFormPoi.img = property.img._value;//图片
            ruleFormPoi.icon = property.icon._value;//图标id
            ruleFormPoi.zbfwj = property.zbfwj._value;//备注

            if (ruleFormPoi.img) {
                photoList.value = ruleFormPoi.img ? JSON.parse(ruleFormPoi.img) : [];
            }

            ruleFormPoi.street = Number(property.street._value);//type
            getTemplateList(ruleFormPoi.street)

            ruleFormPoi.attributes = property.attributes._value;
            setTimeout(() => {
                ruleFormPoi.attributeId = property.attributeId._value;
                getTemplateType(ruleFormPoi.attributeId, JSON.parse(ruleFormPoi.attributes))
            }, 200)

            addPoiDialogShow.value = true;
        };
    }, 1000);
});


onMounted(() => {
    const escapeListener = (event: any) => {
        if (event.key === "Escape") {
            // 处理ESC键按下的逻辑
            console.log("ESC key pressed");

            volumenShow.value = false;
            sessionStorage.removeItem('volumenShow');
            Web3DUtils.cesiumUtils.initPoi(); // 还原
            Web3DUtils.cesiumUtils.unCheckPoi(); // 取消选中地图poi
            // Web3DUtils.cesiumUtils.drawPointLine();

            if (removeLineMeasure) {
                removeLineMeasure(1);
                document.body.style.cursor = "auto";
                removeLineMeasure = Web3DUtils.cesiumUtils.enableLineMeasurement(clType.value, true);
                clType.value = -1;
            }

            if (removePLMeasure) {
                removePLMeasure(1);
                document.body.style.cursor = "auto";
                // removePLMeasure = Web3DUtils.cesiumUtils.drawPointLine(1, true);
            }

            closeaddPoiDialog()
        }
    };
    window.addEventListener("keydown", escapeListener);
});


onUnmounted(() => {
    websocketclose;
    sessionStorage.removeItem('clShow');
    sessionStorage.removeItem('addPoiBtnShow');
});

// 字典列表
const allRangeList: any = ref([]);
function allRanges() {
    allRange({
        code: "pipeType",
    }).then((res: any) => {
        if (res.data.code == 200) {
            res.data.data.forEach((element: any) => {
                element.color = "";
                if (element.dictValue.includes("给水")) {
                    element.color = "#1529A1";
                } else if (element.dictValue.includes("污水")) {
                    element.color = "#1E191B";
                } else if (element.dictValue.includes("雨水")) {
                    element.color = "#029C4D";
                } else if (element.dictValue.includes("燃气")) {
                    element.color = "#FFE34A";
                } else if (element.dictValue.includes("移动")) {
                    element.color = "#F69A13";
                } else if (element.dictValue.includes("电信")) {
                    element.color = "#3DBB22";
                } else if (element.dictValue.includes("联通")) {
                    element.color = "#0066BB";
                } else if (element.dictValue.includes("有线电视")) {
                    element.color = "#2F1779";
                } else if (element.dictValue.includes("交通信号")) {
                    element.color = "#4D5256";
                } else if (element.dictValue.includes("监控信号")) {
                    element.color = "#01A2E8";
                } else if (element.dictValue.includes("路灯")) {
                    element.color = "#E02D00";
                } else if (element.dictValue.includes("电力")) {
                    element.color = "#9D2935";
                } else if (element.dictValue.includes("工业")) {
                    element.color = "#005933";
                } else if (element.dictValue.includes("信号")) {
                    element.color = "#FF8D69";
                } else if (element.dictValue.includes("钻孔")) {
                    element.color = "#FABD2F";
                } else if (element.dictValue.includes("热力")) {
                    element.color = "#FF4928";
                } else if (element.dictValue.includes("排水")) {
                    element.color = "red";
                }
            });

            allRangeList.value = res.data.data;
        }
    });
}


// poi
const poiAllData = ref<any[]>([]);
function getpoiListAll() {
    let params = {
        size: -1,
        current: 1,
        descs: 'create_time',
        proName: 1
    };

    poiList(params)
        .then((res: any) => {
            if (res.data.code == 200) {
                poiAllData.value = res.data.data.records;
                // geojson
                const features = poiAllData.value.map((item: any) => {
                    let geometry = null;
                    if (item.x && item.y) {
                        geometry = {
                            type: "Point",
                            coordinates: [
                                parseFloat(item.x),
                                parseFloat(item.y),
                                parseFloat(item.z),
                            ],
                        };
                    }

                    if (item.icon) {
                        let iarr = iconListAll.value.filter((i: any) => { return i.id == item.icon });
                        item.iconUrl = iarr.length ? iarr[0].icon : '';
                    }
                    return {
                        type: "Feature",
                        geometry,
                        properties: item,
                    };
                });

                const geojson = {
                    type: "FeatureCollection",
                    features,
                };

                // 移除
                Web3DUtils.cesiumUtils.removeAllGuDingPOI();
                Web3DUtils.cesiumUtils.initCluster(geojson, iconListAll.value);
            }
        })
        .catch((err: any) => { });
}
// poi end

// 全部测量记录
function getclListAll() {
    let params = {
        size: -1,
        current: 1,
        descs: 'create_time',
        proName: 0
    };

    poiList(params)
        .then((res: any) => {
            if (res.data.code == 200) {
                Web3DUtils.cesiumUtils.initClList(res.data.data.records);
            }
        })
        .catch((err: any) => { });
}

// icon
const iconListAll = ref<any[]>([]);

function geticonList() {
    let params = {
        size: -1,
        current: 1,
    };
    iconList(params)
        .then((res: any) => {
            if (res.data.code == 200) {
                iconListAll.value = res.data.data.records;
            }
        })
        .catch((err: any) => { });
}



// websocketId
if (route.query.websocketId) {
    websocketForm.websocketId = route.query.websocketId;
    initWebSocket();
}

const tableData_road: any = ref([]);
const roadInfo: any = ref();
const roadDialogShow: any = ref();
// 获取数据
function getRoadList() {
    tableData_road.value = [];
    roadList()
        .then((res: any) => {
            res.scenes.forEach((e: any) => {
                e.children.forEach((e2: any) => {
                    e2.children.forEach((e3: any) => {
                        if (e3.name.indexOf('k') != -1) {
                            tableData_road.value.push(e3);
                        }
                    });
                });
            });

            getDetail();

        })
        .catch((err: any) => { });
}


const tableInfo: any = ref({
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    oldValue: 0
});
function handleChange(val: any, type: any) {
    var value = val - tableInfo.value.oldValue;
    if (type == 4) {
        value = val;
    }

    // 获取旋转平移后的值
    Web3DUtils.cesiumUtils.realign3dTileset(tableInfo.value, value, type, (result) => {
        console.log(`The result is ${result}`);
    });
    tableInfo.value.oldValue = val;
}



function getDetail(item?: any) {
    // status完成状态，整型，0:未完成;1:进行中;2已完成;
    let params = {};
    if (item) {
        params = {
            segment: item.name
        }
    }

    screenProgress(params)
        .then((res: any) => {
            if (item) {
                roadInfo.value = res.data.data;
                roadDialogShow.value = true;
            } else {
                tableData_road.value.forEach((e: any) => {
                    let data = res.data.data.find((i: any) => {
                        return e.name == i.segment
                    })
                    if (data) {
                        e.status = data.status;
                    }
                });

                Web3DUtils.cesiumUtils.init3dtilesetJSON(tableData_road.value);
                Web3DUtils.cesiumUtils.init3dtilesetBoard(tableData_road.value);
            }
        })
        .catch((err: any) => { console.log(err) });
}


// 初始化cesium
const cesiumContainer = ref(); // cesium的父级元素
const scenceSucShow = ref(false);
const powerShow = ref(false);
const initCesium = () => {
    onMounted(() => {
        /* 初始化cesium */

        const loading = ElLoading.service({
            lock: true,
            text: '正在初始化环境····',
            background: 'rgba(0, 0, 0, 0.7)',
        })
        // scenceSucShow.value = true;
        Web3DUtils.cesiumUtils = new CesiumUtils(cesiumContainer.value, () => {
            console.log("场景加载完成");
            loading.close();
            // scenceSucShow.value = true;
            // setTimeout(() => {
            // scenceSucShow.value = false;
            // }, 3000)
            getDbShow(true);//地标
            // changMap(true);//切换地图
            Web3DUtils.cesiumUtils.openTranslucency(true);//地下
            getRoadList();
            // Web3DUtils.cesiumUtils.init3dtilesetJSON('', (result: any) => {
            //     console.log(result, 'result')
            //     tableData_road.value = result;
            // });
            Web3DUtils.cesiumUtils.clickRoadGetDetail(tableData_road.value, (id) => {
                tableData_road.value.forEach((e: any, i: any) => {
                    if (e.id == id) {
                        getDetail(e);
                    }
                });

            })

            // allRanges();
            // geticonList();
            // // getclListAll();
            // getpoiListAll();

            // if (!route.query.buildObjectId) {
            //     getchangeModel(0, 1);
            // } else {
            //     clickBuildObject(route.query.buildObjectId);
            // }
        });

        /* 开发环境方便开发，把cesium和viewer放到window */
        // if (process.env.NODE_ENV === "development") {
        window.viewer = Web3DUtils.cesiumUtils.jesium.viewer;
        window.Cesium = Cesium;
        window.cesiumUtils = Web3DUtils.cesiumUtils;
        // }

        /* 初始化场景内容 */
        Web3DUtils.cesiumUtils.initScene();
        // if (scaleNum.value) {
        //     Web3DUtils.cesiumUtils.changeScale(Number(scaleNum.value));
        // }

        if (route.query.location) {
            sessionStorage.setItem('myLocation', route.query.location as any);
            Web3DUtils.cesiumUtils.myLocation(route.query.location);
        }

        if (route.query.power == 'true') {
            powerShow.value = true;
        }

    });
};
initCesium();


</script>

<style lang="scss" scoped>
.progresss {
    position: absolute;
    right: 16px;
    bottom: 7%;
    z-index: 999;
}

.fade-in-out {
    opacity: 0;
    animation: fadeInOut 3s 1;
}

@keyframes fadeInOut {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.scenceSuc {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(42, 46, 48, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;

    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        height: 147px;
        border-radius: 10px;
        padding: 0 46px;
        box-sizing: border-box;
        background: rgba(42, 46, 48, 0.8);
        color: rgba(205, 217, 233, 1);
        font-size: 14px;

        img {
            margin-bottom: 36px;
        }

    }
}

p {
    margin: 0;
}

.modelName {
    cursor: pointer;

    &:hover {
        color: rgb(68, 119, 238);
    }
}

.el-icon {
    cursor: pointer;
}

.loadDialog {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 280px;
    z-index: 999;
    border-radius: 2px;
    background: rgba(42, 46, 48, 1);
    // transform: translate(0%, 0%);
    color: #fff;

    .infosDialog-title {
        background: rgba(46, 52, 54, 1);
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        padding: 0 16px;
        box-sizing: border-box;
        font-size: 14px;
    }

    .label {
        padding: 16px;
        box-sizing: border-box;
    }

    .item {
        padding: 0 10px;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        p {
            width: 50px;
        }
    }

    .item:last-of-type {
        margin: 0;
    }

    .forms {
        padding: 16px;
        box-sizing: border-box;
        color: #fff;
        max-height: 70vh;

        .forms-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            // border: 1px solid red !important;

            .label {
                font-size: 14px;
                margin-right: 29px;
                min-width: 68px;
                color: rgba(255, 255, 255, 0.6);
            }

            :deep(.el-cascader) {
                border: 1px solid rgba(105, 117, 137, 1) !important;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                height: 32px;
                line-height: 32px;
                box-sizing: border-box;
            }

            .border {
                border: 1px solid rgba(75, 76, 77, 1);
                // width: calc(100% - 60px);
                // height: 32px;
                // line-height: 32px;
                padding: 0 12px;
                box-sizing: border-box;
                font-size: 14px;
            }

            .border2 {
                padding: 0 !important;
            }

            .value {
                border: 1px solid rgba(105, 117, 137, 1);
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                // height: 32px;
                // line-height: 32px;
                padding-left: 12px;
                box-sizing: border-box;
            }
        }

        .forms-table {
            font-size: 14px;

            .tableDatas {
                height: 171px;
                overflow: auto;
            }

            p {
                // height: 32px;
                line-height: 32px;
                border: 1px solid rgba(75, 76, 77, 1);
                display: flex;
                align-items: center;

                span {
                    flex: 1;
                    height: 100%;
                    display: inline-block;
                    cursor: pointer;
                    padding: 0 16px;
                    box-sizing: border-box;
                }

                span:first-of-type {
                    text-align: center;
                    padding: 0;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-child(2) {
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

            }

            .forms-table-th {
                background: rgba(75, 76, 77, 1);

                span {
                    border: 0 !important;
                }
            }
        }
    }

    .forms2 {
        display: grid;
        grid-template-columns: 1fr;
        grid-column-gap: 60px;
        grid-row-gap: 16px;

        .forms-item {
            .label {
                margin-right: 0px;
                width: 200px;
            }

            p:last-of-type {
                // width: 230px;
            }
        }
    }

    .infosDialog-footer {
        background: rgba(46, 52, 54, 1);
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: #fff;
        padding: 0 32px;
        box-sizing: border-box;

        p {
            border-radius: 2px;
            background: rgba(51, 100, 241, 1);
            width: 64px;
            height: 24px;
            line-height: 22px;
            text-align: center;
            font-size: 14px;
            cursor: pointer;
        }

        .reset {
            border: 1px solid rgba(68, 119, 238, 1);
            background: transparent;
            box-sizing: border-box;
            margin-right: 12px;
            color: rgba(68, 119, 238, 1);
            width: 96px;
        }

    }
}

.infosDialog {
    position: absolute;
    top: 50%;
    left: 50%;
    right: 0;
    // bottom: 0;
    width: 750px;
    // height: 742px;
    z-index: 999;
    border-radius: 2px;
    background: rgba(42, 46, 48, 1);
    transform: translate(-50%, -50%);

    .infosDialog-title {
        background: rgba(46, 52, 54, 1);
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        padding: 0 32px;
        box-sizing: border-box;
    }

    .forms {
        padding: 18px 32px;
        box-sizing: border-box;
        color: #fff;
        max-height: 70vh;

        .forms-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            // border: 1px solid red !important;

            .label {
                font-size: 14px;
                margin-right: 29px;
                min-width: 68px;
                color: rgba(255, 255, 255, 0.6);
            }

            :deep(.el-cascader) {
                border: 1px solid rgba(105, 117, 137, 1) !important;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                height: 32px;
                line-height: 32px;
                box-sizing: border-box;
            }

            .border {
                border: 1px solid rgba(75, 76, 77, 1);
                // width: calc(100% - 60px);
                // height: 32px;
                // line-height: 32px;
                padding: 0 12px;
                box-sizing: border-box;
                font-size: 14px;
            }

            .border2 {
                padding: 0 !important;
            }

            .value {
                border: 1px solid rgba(105, 117, 137, 1);
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                // height: 32px;
                // line-height: 32px;
                padding-left: 12px;
                box-sizing: border-box;
            }
        }

        .forms-item2 {
            display: block;

            .label {
                margin-bottom: 8px;
            }

            .el-input {
                width: 100%;
            }

            .flex {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-column-gap: 14px;
            }
        }

        .forms-border {
            display: flex;
            align-items: center;
            padding: 12px 0;
            box-sizing: border-box;

            p:first-of-type {
                width: 66px;
            }

            p:last-of-type {
                width: calc(100% - 66px);
                border-bottom: 1px solid rgba(62, 64, 65, 1);
                margin-left: 14px;
            }
        }

        .forms-flex {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-column-gap: 44px;
            grid-row-gap: 12px;
            font-size: 14px;

            p {
                display: flex;
                align-items: center;
                justify-content: space-between;

                span {
                    display: block;
                }

                span:last-of-type {
                    width: 132px;
                    height: 32px;
                    border-radius: 2px;
                    line-height: 32px;
                    border: 1px solid rgba(75, 76, 77, 1);
                    padding: 0 12px;
                    box-sizing: border-box;
                }
            }
        }

        .forms-table {
            margin-top: 16px;
            margin-bottom: 12px;
            font-size: 14px;

            .tableDatas {
                height: 340px;
                overflow: auto;
            }

            p {
                // height: 32px;
                line-height: 32px;
                border: 1px solid rgba(75, 76, 77, 1);
                display: flex;
                align-items: center;

                span {
                    height: 100%;
                    display: inline-block;
                }

                span:first-of-type {
                    width: 85px;
                    text-align: center;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-child(2) {
                    width: calc(100% - 85px - 132px);
                    padding: 0 16px;
                    box-sizing: border-box;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:last-of-type {
                    width: 160px;
                    padding: 0 16px;
                    box-sizing: border-box;
                    color: rgba(68, 119, 238, 1);
                    cursor: pointer;
                    display: flex;
                }
            }

            .forms-table-th {
                background: rgba(75, 76, 77, 1);

                span {
                    border: 0 !important;
                }
            }
        }

        .forms-table2 {
            p {
                text-align: center;

                span:first-of-type {
                    width: 85px !important;
                }

                span:nth-of-type(2) {
                    width: 136px !important;
                }

                span:nth-of-type(3) {
                    width: 155px !important;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-of-type(4) {
                    width: 155px !important;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                // span:last-of-type {
                //     width: 110px !important;
                // }

                .del {
                    color: red;
                    margin-left: 10px;
                    position: relative;

                    &::before {
                        position: absolute;
                        top: 50%;
                        transform: translatey(-50%);
                        left: -5px;
                        content: '';
                        width: 1px;
                        height: 12px;
                        background-color: rgba(75, 76, 77, 1);
                    }
                }
            }
        }

        .forms-table3 {
            p {
                text-align: center;

                span:first-of-type {
                    width: 150px !important;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-of-type(2) {
                    width: 100px !important;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-of-type(3) {
                    width: 200px !important;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

                span:nth-of-type(4) {
                    width: 150px !important;
                    // border-right: 1px solid rgba(75, 76, 77, 1);
                }
            }
        }
    }

    .forms2 {
        display: grid;
        grid-template-columns: 1fr;
        grid-column-gap: 60px;
        grid-row-gap: 16px;

        .forms-item {
            .label {
                margin-right: 0px;
                width: 80px;
            }

            p:last-of-type {
                // width: 230px;
            }
        }
    }

    .infosDialog-footer {
        background: rgba(46, 52, 54, 1);
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: #fff;
        padding: 0 32px;
        box-sizing: border-box;

        p {
            border-radius: 2px;
            background: rgba(51, 100, 241, 1);
            width: 64px;
            height: 24px;
            line-height: 22px;
            text-align: center;
            font-size: 14px;
            cursor: pointer;
        }

        .reset {
            border: 1px solid rgba(68, 119, 238, 1);
            background: transparent;
            box-sizing: border-box;
            margin-right: 12px;
            color: rgba(68, 119, 238, 1);
            width: 96px;
        }

    }
}

.modelDialog {
    .forms {
        .forms-table {
            p {
                span:first-of-type {
                    width: 50%;
                }

                span:nth-child(2) {
                    width: 30%;
                }
            }
        }
    }
}

.cesium-tip {
    background: color-mix(in oklch, var(--hj-input-bg-color), transparent 20%);
    color: white;
    padding: 8px;
    border-radius: 4px;
    position: absolute;
    top: 50%;
    left: 50%;
    display: none;
    z-index: 999;
    font-size: 12px;
}

.butns {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 999;
    display: flex;

    .butns-item {
        border-radius: 50px;
        background: rgba(46, 52, 54, 1);
        padding: 0 12px;
        box-sizing: border-box;
        color: rgba(205, 217, 233, 1);
        font-size: 14px;
        display: flex;
        align-items: center;
        height: 37px;
        margin-right: 16px;
        cursor: pointer;

        .text {
            margin-left: 16px;
            display: inline-block;
        }
    }

    .active {
        background: rgba(68, 119, 238, 1);
    }

    .activeType {
        // color: rgba(68, 119, 238, 1);
        background: rgba(68, 119, 238, 1);
        border-radius: 4px;
        display: inline-block;
        padding: 2px 4px;
        box-sizing: border-box;
    }
}

.butns2 {
    right: 16px;
    left: inherit !important;
    top: 50%;
    transform: translate(0, -50%);
    flex-direction: column;

    .butns-item {
        width: 37px !important;
        height: inherit !important;
        padding: 0 !important;
        flex-direction: column;
        margin: 0;

        p {
            font-size: 12px;
            width: 100%;
            height: 44px;
            border-radius: 18.5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            span {
                display: block !important;
            }

            img {
                display: block !important;
                text-align: center;
                // margin-bottom: 8px;
            }
        }

        .activeType {
            background: rgba(68, 119, 238, 1);
        }
    }
}

.butns3 {
    p {
        border-radius: 0 !important;
        padding: 22px 0 !important;
        box-sizing: border-box;
    }

    p:first-of-type {
        border-top-right-radius: 18.5px !important;
        border-top-left-radius: 18.5px !important;
    }

    p:last-of-type {
        border-bottom-right-radius: 18.5px !important;
        border-bottom-left-radius: 18.5px !important;
    }

    .butns-item {
        height: inherit !important;
    }

}

.closeMap {
    left: inherit !important;
    // bottom: calc(16px + 37px + 5px) !important;
    right: 0px !important;
    top: 10px !important;
}

.changeModel {
    top: inherit !important;
    left: inherit !important;
    bottom: 16px !important;
    right: 0 !important;

    .butns-item {
        width: 300px !important;
        padding: 0 !important;
        line-height: 37px !important;

        span {
            width: 50%;
            text-align: center;
            display: inline-block;
            height: 100%;
        }

        span:first-of-type {
            border-top-left-radius: 50px;
            border-bottom-left-radius: 50px;
        }

        span:last-of-type {
            border-top-right-radius: 50px;
            border-bottom-right-radius: 50px;
        }
    }
}

.changeModel_child1 {
    top: 10px !important;
    left: 16px !important;
}

.changeModel_child {
    top: inherit !important;
    left: inherit !important;
    bottom: 16px !important;
    right: 348px !important;

    .butns-item {
        width: 180px !important;
        padding: 0 !important;
        line-height: 37px !important;
        margin-right: 0 !important;

        span {
            width: 50%;
            text-align: center;
            display: inline-block;
            height: 100%;
        }

        span:first-of-type {
            border-top-left-radius: 50px;
            border-bottom-left-radius: 50px;
        }

        span:last-of-type {
            border-top-right-radius: 50px;
            border-bottom-right-radius: 50px;
        }
    }
}

.cesium-tip {
    // border: 1px solid
    // 	color-mix(in oklch, var(--hj-input-border-color), transparent 0%);
    background: #001030;
    color: white;
    padding: 8px;
    border-radius: 4px;
    position: absolute;
    top: 50%;
    left: 50%;
    display: none;
    z-index: 999;
    font-size: 12px;
}

.searchBox2 {
    position: absolute;
    bottom: 10px;
    right: 10px;
}

.searchBox {
    width: 294px;
    height: 32px;
    border-radius: 4px;
    background: rgba(5, 13, 19, 0.4);
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    box-sizing: border-box;

    .inputSearch-list {
        width: 100%;
        position: absolute;
        top: 40px;
        left: 0;
        max-height: 300px;
        background: rgba(5, 13, 19, 0.4);
        color: #fff;
        overflow: hidden;
        overflow: auto;
        border-radius: 3px;

        p {
            padding: 5px;
            cursor: pointer;
            display: flex;
            justify-content: space-around;
            font-size: 14px;

            &:hover {
                background-color: #84b0ff;
            }
        }

        .inputSearch-active {
            background-color: #84b0ff;
        }
    }

    .inputSearch-list::-webkit-scrollbar {
        display: none;
    }

    .el-input {
        font-size: 14px;
    }
}

.container {
    width: 100%;
    height: 100%;

    .cesium-container {
        width: 100%;
        height: 100%;
    }
}


.roadInfo {
    position: absolute;
    top: 50%;
    left: 50%;
    right: 0;
    width: 500px;
    z-index: 999;
    border-radius: 2px;
    background: rgba(42, 46, 48, 1);
    transform: translate(-50%, -50%);

    .infosDialog-title {
        background: rgba(46, 52, 54, 1);
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        padding: 0 32px;
        box-sizing: border-box;
    }

    .forms {
        padding: 18px 32px;
        box-sizing: border-box;
        color: #fff;
        max-height: 70vh;

        .forms-item {
            display: flex;
            align-items: center;

            .label {
                font-size: 14px;
                margin-right: 29px;
                min-width: 68px;
                color: rgba(255, 255, 255, 0.6);
            }

            :deep(.el-cascader) {
                border: 1px solid rgba(105, 117, 137, 1) !important;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                height: 32px;
                line-height: 32px;
                box-sizing: border-box;
            }

            .border {
                border: 1px solid rgba(75, 76, 77, 1);
                // width: calc(100% - 60px);
                // height: 32px;
                // line-height: 32px;
                padding: 0 12px;
                box-sizing: border-box;
                font-size: 14px;
            }

            .border2 {
                padding: 0 !important;
            }

            .value {
                border: 1px solid rgba(105, 117, 137, 1);
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: rgba(75, 76, 77, 1) !important;
                border-radius: 2px;
                // height: 32px;
                // line-height: 32px;
                padding-left: 12px;
                box-sizing: border-box;
            }
        }

        .forms-border {
            display: flex;
            align-items: center;
            padding: 12px 0;
            box-sizing: border-box;

            p:first-of-type {
                width: 66px;
            }

            p:last-of-type {
                width: calc(100% - 66px);
                border-bottom: 1px solid rgba(62, 64, 65, 1);
                margin-left: 14px;
            }
        }

        .forms-flex {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-column-gap: 44px;
            grid-row-gap: 12px;
            font-size: 14px;

            p {
                display: flex;
                align-items: center;
                justify-content: space-between;

                span {
                    display: block;
                }

                span:last-of-type {
                    width: 132px;
                    height: 32px;
                    border-radius: 2px;
                    line-height: 32px;
                    border: 1px solid rgba(75, 76, 77, 1);
                    padding: 0 12px;
                    box-sizing: border-box;
                }
            }
        }

        .forms-table {
            font-size: 14px;
            margin-top: 16px;
            width: 100%;

            p {
                line-height: 32px;
                border: 1px solid rgba(75, 76, 77, 1);
                display: flex;
                align-items: center;

                span {
                    height: 100%;
                    flex: 1;
                    text-align: center;
                    display: inline-block;
                    border-right: 1px solid rgba(75, 76, 77, 1);
                }

            }

            .forms-table-th {
                background: rgba(75, 76, 77, 1);

                span {
                    border: 0 !important;
                }
            }

            .forms-table-tr {
                span:last-of-type {
                    border: 0 !important;
                }
            }
        }




    }


    .infosDialog-footer {
        background: rgba(46, 52, 54, 1);
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: #fff;
        padding: 0 32px;
        box-sizing: border-box;

        p {
            border-radius: 2px;
            background: rgba(51, 100, 241, 1);
            width: 64px;
            height: 24px;
            line-height: 22px;
            text-align: center;
            font-size: 14px;
            cursor: pointer;
        }

        .reset {
            border: 1px solid rgba(68, 119, 238, 1);
            background: transparent;
            box-sizing: border-box;
            margin-right: 12px;
            color: rgba(68, 119, 238, 1);
            width: 96px;
        }

    }
}
</style>
