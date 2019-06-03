/**
 *   Create by Malson on 2019/2/27
 */

import React from 'react';
import { Drawer,Input, Select,Alert,Button,Spin,message } from 'antd';
const Option = Select.Option;
import FormUtils from '@/lib/Components/FormUtils'
import ControlledDoorStore from '../store/ControlledDoorStore';
import ControlledDoorActions from "../action/ControlledDoorActions";
import AreaSelect from '../Components/AreaSelect';
const FormDef = require('./ControlledDoorForm');
let Utils = require('@/public/script/utils');
let Common = require('@/public/script/common');
import '../CargoOrigin.scss';

class CargoOriginModal extends React.Component {
    constructor(props){
        super(props);
        this.state={
            formData:{},    //每个form页面必传
            newFormData:{},    //每个form页面必传
            modalType:'',   //每个form页面必传  是否可以编辑
            placement:'right',
            visible:false,
            width:600,
            flag:true,
            loading:true,
            carTypeOption:[],
            carLengthOption:[],
            carTypeCode:[],
            carLengthCode:[],
            areaList:{},
            loadingFlag:'',
            unloadingFlag:'',
            loadingAddressFlag:'',
            unloadingAddressFlag:'',
            loadingTimesFlag:'',
            unloadingTimesFlag:''
        }
        //初始化数据信息
        FormDef.initCargoOriginForm(this,this.state.formData);

        //使用公共input change必加
        this.handleOnChange = Utils.handleOnChange.bind(this,'formData');
    }
    componentDidMount(){
        let attrList = [
            {
                name: 'goodsTypeName',
                validator: this.checkGoodsTypeName
            },
            {
                name: 'maxWeight',
                validator: this.checkMaxWeight
            },
            {
                name: 'maxVolume',
                validator: this.checkMaxWeight
            },
            {
                name: 'paymentMethod',
                validator: this.checkPaymentMethod
            },
            {
                name: 'remark',
                validator: this.checkRemark
            },
        ];
        this.state.validRules = FormDef.getCargoOriginFormRule(this,attrList);
        this.server = ControlledDoorStore.listen(this.onHandleService);
        if(window.sessionStorage.address){
            let areaList=[];
            try {
                areaList = JSON.parse(window.sessionStorage.address);
            }catch (err){}
            this.setState({areaList});
            return;
        }else{
            ControlledDoorActions.getAddress();
        }

    }
    checkGoodsTypeName=(value)=>{
        if(value.length>10){
            return '【货物名称】最多输入【10】个字符';
        }
    }
    checkPaymentMethod=(value)=>{
        if(value.length>10){
            return '【支付方式】最多输入【10】个字符';
        }
    }
    checkRemark=(value)=>{
        if(value.length>50){
            return '【备注】最多输入【50】个字符';
        }
    }
    //校验货品重量
    checkMaxWeight=(value)=>{
        var test=/^[0-9]\d{0,2}(\.\d{1,2})?$/;
        var re = /^(([1-9]\d*(\.\d+)?)|(0\.\d+))$/;
        if(!test.test(value) && value!= '' && value!= "1000" && value!= "1000.00"  && value!= "1000.0"){
            return '请输入【0-1000正数，不包含0，最多可以保留两位小数】';
        }else if(!re.test(value) && value!= '' && value!= "1000" && value!= "1000.00"  && value!= "1000.0"){
            return '请输入【0-1000正数，不包含0，最多可以保留两位小数】';
        }else if(value === '0' || value === '0.0' || value === '0.00'){
            return '请输入【0-1000正数，不包含0，最多可以保留两位小数】';
        }
    }
    componentWillUnmount(){
        this.server();
    }
    //处理数据返回
    onHandleService = (data)=>{
        //查询列表
        this.state.loading && this.setState({loading:false});
        if(data.errMsg){
            this.setState({errMsg:data.errMsg});
            return;
        }
        if(data.operation === 'retrieveDetail'){
            let recordSet = data.recordSet || {};
            this.handleDetailData(recordSet)
        }else if(data.operation === 'getAllVehicleInformation'){
            if(data.filter == '2'){
                //车型
                let carTypeOption =  data.recordSet.item;
                this.setState({carTypeOption});
            }
            if(data.filter == '1'){
                //车长
                let carLengthOption =  data.recordSet.item;
                this.setState({carLengthOption});
            }
        }else if(data.operation === 'updateGoods') {
            this.setState({modalType: 'detail'});
        }else if(data.operation === 'getAllProvinceCityRegion'){
            this.setState({areaList:data.recordSet});
        }
    }
    componentWillReceiveProps(nextProps){
        if(!nextProps.showDrawer){
            this.clearState();
        }
        if(nextProps.showDrawer && this.state.flag){
            //调用接口获取车型车长
            ControlledDoorActions.getInfo("1");
            ControlledDoorActions.getInfo("2");
        }
        this.setState({
            visible:nextProps.showDrawer,
            modalType:nextProps.modalType,
            formData:{}
        });
    }

    //格式化详情信息
    handleDetailData = (formData={})=>{
        //需要拼接的字段
        let newFormData = Utils.deepCopyValue(formData);
        let loadingPlace = `${formData.loadingProvinceName} ${formData.loadingCityName} ${formData.loadingCountyName} ${formData.loadingAddress}`,
            unloadingPlace = `${formData.unloadingProvinceName} ${formData.unloadingCityName} ${formData.unloadingCountyName} ${formData.unloadingAddress}`,
            carLength = '',
            carType = '',
            loadingPlaceCode =[formData.loadingProvinceCode,formData.loadingCityCode,formData.loadingCountyCode],
            unloadingPlaceCode =[formData.unloadingProvinceCode,formData.unloadingCityCode,formData.unloadingCountyCode],
            carLengthList = formData.carLengthList || [],
            carTypeList = formData.carTypeList || [],
            carTypeCode = [],
            carLengthCode = [];
        let newloadingTimes = formData.loadingTimes && formData.loadingTimes + '装';
        let newunloadingTimes = formData.unloadingTimes && formData.unloadingTimes + '卸';
        carLengthList.map((item,i)=>{
            carLengthCode.push(item.dictionaryUuid);
            if(i===0){
                carLength = item.dictionaryValue + '米';
            }else{
                carLength += "/"+item.dictionaryValue + '米';

            }
        });
        carTypeList.map((item,i)=>{
            carTypeCode.push(item.dictionaryUuid);
            if(i===0){
                carType = item.dictionaryValue;
            }else{
                carType += "/"+item.dictionaryValue;
            }
        });
        this.setState({
            carTypeCode:carTypeCode,
            carLengthCode:carLengthCode,
        });
        formData.loadStatus = newloadingTimes + newunloadingTimes;//几装几卸
        formData.carLength = carLength || '不限';//车长
        formData.carType = carType || '不限';//车型
        formData.loadingPlaceCode = loadingPlaceCode;//装货地code
        formData.unloadingPlaceCode = unloadingPlaceCode;//卸货地code
        formData.loadingPlace = loadingPlace;//装货地
        formData.unloadingPlace = unloadingPlace;//卸货地
        formData.newMaxWeight = formData.maxWeight?formData.maxWeight + '吨':'暂无';
        formData.newMaxVolume = formData.maxVolume?formData.maxVolume + '方':'暂无';
        //装载个人信息
        let userVo = formData.userInfoVo || {}
        let personData = {
            trueName:userVo.trueName,
            phone:userVo.phone,
            idCard:userVo.idCard,
            userCode:userVo.userCode,
            businessLicenseName:userVo.businessLicenseName,
            businessLicenseAddr:userVo.businessLicenseAddr,
            userType:userVo.userType,
            userImg:userVo.userImg,
        }
        formData = {...formData,...personData};
        for(let i in formData){
            if( i === 'userImg'  || i === 'loadingTimes' ||  i === 'unloadingTimes' || i==='loadingAddress' || i==='unloadingAddress' || i==='newGoodsTypeName'){
                continue;
            }
            formData[i] = formData[i] || '暂无'
        }
        this.setState({formData,newFormData});
    }
    shouldComponentUpdate(nextProps, nextState){
        return JSON.stringify(this.state) !== JSON.stringify(nextState);
    }
    clearState = ()=>{
        FormDef.initCargoOriginForm(this,this.state.formData);
        this.setState({loading:this.state.loading});
        this.setState({
            loadingFlag:'',
            unloadingFlag:'',
            loadingAddressFlag:'',
            unloadingAddressFlag:'',
            loadingTimesFlag:'',
            unloadingTimesFlag:''
        });
    }
    onClose = ()=>{
        this.props.handleClose();
    }
    //点击完成
    onSubmit = ()=>{
        let {carTypeCode,carLengthCode,formData,loadingFlag,unloadingFlag,loadingAddressFlag,unloadingAddressFlag,loadingTimesFlag,unloadingTimesFlag}= this.state;
        if(formData.loadingPlaceCode.length==0 || formData.unloadingPlaceCode.length==0 || loadingFlag!='' || unloadingFlag!='' || loadingAddressFlag!='' || unloadingAddressFlag!='' || loadingTimesFlag!='' || unloadingTimesFlag!=''){
            return false
        }
        for (let i in formData) {
            if( i === 'userImg' || i === 'loadingTimes' ||  i === 'unloadingTimes' || i==='loadingAddress' || i==='unloadingAddress'){
                continue;
            }
            formData[i] = formData[i] || '暂无'
        }
        if (formData.maxWeight == '' && formData.maxVolume == '') {
            message.error('物品体积和物品重量至少选填一项');
            return false
        } else if(formData.loadingTimes =='' && formData.unloadingTimes !=''){
            message.error('装货和卸货方式必须同时存在');
            return false
        } else if(formData.loadingTimes !='' && formData.unloadingTimes ==''){
            message.error('装货和卸货方式必须同时存在');
            return false
        }
        if(Common.validator(this,formData)) {
            formData.loadingProvinceCode = formData.loadingPlaceCode[0];
            formData.loadingCityCode = formData.loadingPlaceCode[1];
            formData.loadingCountyCode = formData.loadingPlaceCode[2];
            formData.unloadingProvinceCode = formData.unloadingPlaceCode[0];
            formData.unloadingCityCode = formData.unloadingPlaceCode[1];
            formData.unloadingCountyCode = formData.unloadingPlaceCode[2];
            formData.loadingProvinceName = this.getAddressList(formData.loadingPlaceCode[0], '1');
            formData.loadingCityName = this.getAddressList(formData.loadingPlaceCode[1], '2');
            formData.loadingCountyName = this.getAddressList(formData.loadingPlaceCode[2], '3');
            formData.unloadingProvinceName = this.getAddressList(formData.unloadingPlaceCode[0], '1');
            formData.unloadingCityName = this.getAddressList(formData.unloadingPlaceCode[1], '2');
            formData.unloadingCountyName = this.getAddressList(formData.unloadingPlaceCode[2], '3');
            formData.carTypeList = this.getList(carTypeCode, "1");
            formData.carLengthList = this.getList(carLengthCode, "2");
            if(formData.loadingAddress == '暂无'){
                formData.loadingPlace = `${formData.loadingProvinceName} ${formData.loadingCityName} ${formData.loadingCountyName}`;
            }else{
                formData.loadingPlace = `${formData.loadingProvinceName} ${formData.loadingCityName} ${formData.loadingCountyName} ${formData.loadingAddress}`;
            }

            formData.unloadingPlace = `${formData.unloadingProvinceName} ${formData.unloadingCityName} ${formData.unloadingCountyName} ${formData.unloadingAddress}`;
            if(formData.maxWeight != ''){
                formData.newMaxWeight = formData.maxWeight + '吨';
            }else{
                formData.newMaxWeight = '暂无';
            }
            if(formData.maxVolume != ''){
                formData.newMaxVolume = formData.maxVolume + '方';
            }else{
                formData.newMaxVolume = '暂无';
            }
            let newloadingTimes='',
                newunloadingTimes='';
            if(formData.loadingTimes != '' && formData.unloadingTimes != ''){
                newloadingTimes = formData.loadingTimes && formData.loadingTimes + '装';
                newunloadingTimes = formData.unloadingTimes && formData.unloadingTimes + '卸';
            }else{
                newloadingTimes = '暂无';
                newunloadingTimes = '';
            }
            formData.loadStatus = newloadingTimes + newunloadingTimes;//几装几卸
            let carLength = '',
                carType = '';
            formData.carLengthList.map((item,i)=>{
                if(i===0){
                    carLength = item.dictionaryValue + '米';
                }else{
                    carLength += "/"+item.dictionaryValue + '米';

                }
            });
            formData.carTypeList.map((item,i)=>{
                if(i===0){
                    carType = item.dictionaryValue;
                }else{
                    carType += "/"+item.dictionaryValue;
                }
            });
            formData.carLength = carLength || '不限';//车长
            formData.carType = carType || '不限';//车型
            let uuid = Common.getLoginData();
            formData.editor = uuid.uuid;
            let newFormData = Utils.deepCopyValue(this.state.formData);
            let data = {
                loadingProvinceCode: newFormData.loadingPlaceCode[0],
                loadingCityCode: newFormData.loadingPlaceCode[1],
                loadingCountyCode: newFormData.loadingPlaceCode[2],
                unloadingProvinceCode: newFormData.unloadingPlaceCode[0],
                unloadingCityCode: newFormData.unloadingPlaceCode[1],
                unloadingCountyCode: newFormData.unloadingPlaceCode[2],
                uuid: newFormData.uuid,
                loadingAddress: newFormData.loadingAddress,
                unloadingAddress: newFormData.unloadingAddress,
                loadingProvinceName: newFormData.loadingProvinceName,
                loadingCityName: newFormData.loadingCityName,
                loadingCountyName: newFormData.loadingCountyName,
                unloadingProvinceName: newFormData.unloadingProvinceName,
                unloadingCityName: newFormData.unloadingCityName,
                unloadingCountyName: newFormData.unloadingCountyName,
                goodsTypeName: newFormData.goodsTypeName,
                maxWeight: newFormData.maxWeight,
                maxVolume: newFormData.maxVolume,
                loadingDate: newFormData.loadingDate,
                loadingTimeType: newFormData.loadingTimeType,
                loadingTimes: newFormData.loadingTimes,
                unloadingTimes: newFormData.unloadingTimes,
                paymentMethod: newFormData.paymentMethod,
                remark: newFormData.remark,
                carTypeList: newFormData.carTypeList,
                carLengthList: newFormData.carLengthList,
                editor: newFormData.editor,
            };
            for (let i in data) {
                if(data[i] === '暂无') {
                    data[i] = '';
                }
            }
            ControlledDoorActions.updateInfo(data);
            this.setState({
                loading: true,
            });
        }
    }
    //获取修改后地址中文
    getAddressList(value,key){
        let {areaList}= this.state;
        let addressList = [];
        if(areaList.length>0 && value.length>0){
            if(key == 1){
                areaList.map(item=>{
                    if(item.value == value){
                        addressList= item.label;
                    }
                })
            }else if(key == 2){
                areaList.map(item=>{
                    if(item.children){
                        item.children.map(jtem=>{
                            if(jtem.value == value){
                                addressList= jtem.label;
                            }
                        })
                    }
                })
            }else if(key == 3){
                areaList.map(item=>{
                    if(item.children){
                        item.children.map(jtem=>{
                            if(jtem.children){
                                jtem.children.map(htem=>{
                                    if(htem.value == value){
                                        addressList= htem.label;
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
        return addressList;
    }
    //获取车型或者车长的list
    getList(value,key){
        let {carTypeOption,carLengthOption}= this.state;
        let list = [];
        if(value.length>0){
            if(key==1){
                value.map(item=>{
                    carTypeOption.map(jtem=>{
                        if(item == jtem.uuid){
                            list.push(jtem);
                        }
                    })
                })
            }else{
                value.map(item=>{
                    carLengthOption.map(jtem=>{
                        if(item == jtem.uuid){
                            list.push(jtem);
                        }
                    })
                })
            }
        }
        let newList = JSON.parse(JSON.stringify(list).replace(/uuid/g,"dictionaryUuid"));
        let newList1 = JSON.parse(JSON.stringify(newList).replace(/value/g,"dictionaryValue"));
        newList1.map (item=>{
            delete item.itemId;
        })
        return newList1;
    }
    //获取块级
    /**
     *  list 为 [{}]
     *  对象内包括
     *      key   :  key
     *      label :  label
     */
    getComFormItem = (list=[],colpParam={},isRender)=>{
        if(isRender){
            //不需要修改的
            return list.map( item =>{
                let spanHtm = <span>{this.state.formData[item.key]}</span>
                return FormUtils.getFormItem(this,{key:item.key,label:item.label,...colpParam},{component:spanHtm})
            })
        }
        return list.map( item =>{
            return FormUtils.getFormItem(this,{key:item.key,label:item.label,requiredFlag:item.requiredFlag,...colpParam},{component:item.component})
        })
    }
    //编辑
    clickEdit=()=>{
        //设置modalType为修改
        let newData = this.state.formData;
        for (let i in newData) {
            if(newData[i] === '暂无') {
                newData[i] = '';
            }
        }
        this.setState({
            modalType:'',
            formData:newData
        });
    }
    //选择车型
    carTypeOnChange = (value) =>{
        if(value.length>3){
            message.error('车型最多只能选择3个');
            value = value.slice(0,3);
        }
        this.setState({
            loading:false,
            carTypeCode:value
        });
    }
    //选择车长
    carLengthOnChange = (value) =>{
        if(value.length>3){
            message.error('车长最多只能选择3个');
            value = value.slice(0,3);
        }
        this.setState({
            loading:false,
            carLengthCode:value
        });
    }
    //选择地址
    areaPosition = (key,value) =>{
        if(value == null){
            value = [];
        };
        if(value.length == 0){
            if(key=='loadingPlaceCode'){
                this.setState({loadingFlag:key});
            }else{
                this.setState({unloadingFlag:key});
            }
        }else{
            this.setState({
                loadingFlag:'',
                unloadingFlag:'',
            });
        }
        this.state.formData[key] = value;
        this.setState({loading:false});
    }
    newHandleOnChange=(key,e)=>{
        let value = e.target.value.replace(/(^\s*)/g, "");
        this.setNew(key,value,true);
    }
    setNew=(id,val,f) =>{
        let formData = Object.assign({},this.state.formData);
        formData[id] = val;
        if(id=='loadingAddress' || id=='unloadingAddress'){
            let specialChar = /[/。……（），=_？！@.【】——「」《》￥*`~!#$%^&*()+<>?:|?<>"{},\/\\;'[\]]/img;
            if(specialChar.test(val) || val.length>30){
                if(id=='loadingAddress'){
                    if(this.state.unloadingAddressFlag == 'unloadingAddress'){
                        this.setState({
                            loadingAddressFlag:id,
                            unloadingAddressFlag:'unloadingAddress',
                        });
                    }else{
                        this.setState({
                            loadingAddressFlag:id,
                            unloadingAddressFlag:'',
                        });
                    }
                }else{
                    if(this.state.loadingAddressFlag == 'loadingAddress'){
                        this.setState({
                            loadingAddressFlag:'loadingAddress',
                            unloadingAddressFlag:id,
                        });
                    }else{
                        this.setState({
                            loadingAddressFlag:'',
                            unloadingAddressFlag:id,
                        });
                    }
                }
            }else{
                if(id=='loadingAddress'){
                    if(this.state.unloadingAddressFlag == 'unloadingAddress'){
                        this.setState({
                            loadingAddressFlag:'',
                            unloadingAddressFlag:'unloadingAddress',
                        });
                    }else{
                        this.setState({
                            loadingAddressFlag:'',
                            unloadingAddressFlag:'',
                        });
                    }
                }else{
                    if(this.state.loadingAddressFlag == 'loadingAddress'){
                        this.setState({
                            loadingAddressFlag:'loadingAddress',
                            unloadingAddressFlag:'',
                        });
                    }else{
                        this.setState({
                            loadingAddressFlag:'',
                            unloadingAddressFlag:'',
                        });
                    }
                }
            }
        }else if(id=='loadingTimes' || id=='unloadingTimes'){
            let newTest = /^([1-9]|10)$/ ;
            if(!newTest.test(val) &&  val != ''){
                if(id=='loadingTimes'){
                    if(this.state.unloadingTimesFlag == 'unloadingTimes'){
                        this.setState({
                            loadingTimesFlag:id,
                            unloadingTimesFlag:'unloadingTimes',
                        });
                    }else{
                        this.setState({
                            loadingTimesFlag:id,
                            unloadingTimesFlag:'',
                        });
                    }
                }else{
                    if(this.state.loadingTimesFlag == 'loadingTimes'){
                        this.setState({
                            loadingTimesFlag:'loadingTimes',
                            unloadingTimesFlag:id,
                        });
                    }else{
                        this.setState({
                            loadingTimesFlag:'',
                            unloadingTimesFlag:id,
                        });
                    }
                }
            }else{
                if(id=='loadingTimes'){
                    if(this.state.unloadingTimesFlag == 'unloadingTimes'){
                        this.setState({
                            loadingTimesFlag:'',
                            unloadingTimesFlag:'unloadingTimes',
                        });
                    }else{
                        this.setState({
                            loadingTimesFlag:'',
                            unloadingTimesFlag:'',
                        });
                    }
                }else{
                    if(this.state.loadingTimesFlag == 'loadingTimes'){
                        this.setState({
                            loadingTimesFlag:'loadingTimes',
                            unloadingTimesFlag:'',
                        });
                    }else{
                        this.setState({
                            loadingTimesFlag:'',
                            unloadingTimesFlag:'',
                        });
                    }
                }
            }
        }
        for (let i in formData) {
            if(formData[i] === '暂无') {
                formData[i] = '';
            }
        }
        Common.validator(this,formData,id);
        this.setState({formData});
    }
    render(){
        let {placement,visible,width,formData,newFormData,carTypeOption,carLengthOption,loadingFlag,unloadingFlag,loadingAddressFlag,unloadingAddressFlag,loadingTimesFlag,unloadingTimesFlag} = this.state;
        let carTypeItem = carTypeOption;
        let carLengthItem = carLengthOption;
        let carTypeChildren = [],
            carLengthChildren = [];
        if(carTypeItem.length>0){
            carTypeItem.map(item=>{
                carTypeChildren.push(<Option key={item.uuid}>{item.value}</Option>)
            })
        }
        if(carLengthItem.length>0){
            carLengthItem.map(item=>{
                carLengthChildren.push(<Option key={item.uuid}>{item.value}</Option>)
            })
        }
        let title = this.props.modalType === 'detail'?<span><span className='drawer-title'>货源详情</span><span className='drawer-subtitle'>货源编号：{formData.goodsNo}</span></span>:'新增';
        let drawerClassName = this.props.modalType === 'detail'? 'modal-detail':'';
        let maxWeightInput = this.state.modalType === 'detail'?<span>{this.state.formData['maxWeight'] == ''?'':this.state.formData['maxWeight'] == '暂无'?'暂无':`${this.state.formData['maxWeight']}吨`}</span>:
            (
                <Input type='text' key='maxWeight' maxLength={7} name='maxWeight' id='maxWeight' value={ this.state.formData['maxWeight'] } onChange={this.handleOnChange} placeholder='请输入货物重量，单位为吨'/>
            );
        let maxVolumeInput = this.state.modalType === 'detail'?<span>{this.state.formData['maxVolume'] == ''?'':this.state.formData['maxVolume'] == '暂无'?'暂无':`${this.state.formData['maxVolume']}方`}</span>:
            (
                <Input type='text' key='maxVolume' maxLength={7} name='maxVolume' id='maxVolume' value={ this.state.formData['maxVolume'] } onChange={this.handleOnChange} placeholder='请输入货物重量，单位为方'/>
            );
        //车型，车长的下拉框
        let carTypeSelect = this.state.modalType === 'detail'? <span>{this.state.formData['carType']}</span>
            : (
                <Select
                    mode="multiple"
                    placeholder="请选择车型"
                    onChange={this.carTypeOnChange}
                    style={{ width: '100%' }}
                    value={this.state.carTypeCode}
                >
                    {carTypeChildren}
                </Select>
            );
        let carLengthSelect = this.state.modalType === 'detail'? <span>{this.state.formData['carLength']}</span>
            :( <Select
                mode="multiple"
                placeholder="请选择车长"
                onChange={this.carLengthOnChange}
                style={{ width: '100%' }}
                value={this.state.carLengthCode}
            >
                {carLengthChildren}
            </Select>);
        let loadingPlaceSelect = this.state.modalType === 'detail'?<span>{this.state.formData['loadingPlace']}</span>:
            (
                <div style={{marginBottom:10}}>
                    <AreaSelect className={loadingFlag} onChange={this.areaPosition.bind(this,'loadingPlaceCode')} allowClear id='loadingPlaceCode' name='loadingPlaceCode' value={this.state.formData['loadingPlaceCode']}/>
                    {(loadingFlag!=''?<span  style={{color:'#ff0000',fontSize:'12px'}}>请选择【装货地】</span>:'')}
                    <Input className={loadingAddressFlag} maxLength={31} placeholder="请输入详细地址" key='loadingAddress' id='loadingAddress' name='loadingAddress' onChange={this.newHandleOnChange.bind(this,'loadingAddress')} value={this.state.formData['loadingAddress']} type="text" style={{ width: '100%',marginTop:10}}/>
                    {(loadingAddressFlag!=''?<span style={{color:'#ff0000',fontSize:'12px'}}>【详细地址】仅支持中英文数字,最多输入【30】个字符</span>:'')}
                </div>
            );
        let unloadingPlaceSelect = this.state.modalType === 'detail'?<span>{this.state.formData['unloadingPlace']}</span>:
            (
                <div>
                    <AreaSelect className={unloadingFlag} onChange={this.areaPosition.bind(this,'unloadingPlaceCode')} id='unloadingPlaceCode' name='unloadingPlaceCode' value={this.state.formData['unloadingPlaceCode']}/>
                    {(unloadingFlag!=''?<span  style={{color:'#ff0000',fontSize:'12px'}}>请选择【卸货地】</span>:'')}
                    <Input className={unloadingAddressFlag} maxLength={31} placeholder="请输入详细地址" key='unloadingAddress' id='unloadingAddress' name='unloadingAddress'  onChange={this.newHandleOnChange.bind(this,'unloadingAddress')} value={this.state.formData['unloadingAddress']} type="text" style={{ width: '100%',marginTop:10}}/>
                    {(unloadingAddressFlag!=''?<span  style={{color:'#ff0000',fontSize:'12px'}}>【详细地址】仅支持中英文数字,最多输入【30】个字符</span>:'')}
                </div>
            );
        let loadStatus = this.state.modalType === 'detail'?<span>{this.state.formData['loadStatus']}</span>:
            (
                <div>
                    <div style={{overflow:"hidden"}}>
                        <Input className={loadingTimesFlag} placeholder="请输入几装" maxLength={1} key='loadingTimes' id='loadingTimes' name='loadingTimes'  onChange={this.newHandleOnChange.bind(this,'loadingTimes')} value={this.state.formData['loadingTimes']} type="text" style={{float:'left',width:'40%'}}/>
                        <span style={{float:'left',marginLeft:10,lineHeight:'32px'}}>装</span>
                        <Input className={unloadingTimesFlag} placeholder="请输入几卸" maxLength={1} key='unloadingTimes' id='unloadingTimes' name='unloadingTimes'  onChange={this.newHandleOnChange.bind(this,'unloadingTimes')} value={this.state.formData['unloadingTimes']} type="text" style={{float:'left',width:'40%',marginLeft:10}}/>
                        <span style={{float:'left',marginLeft:10,lineHeight:'32px'}}>卸</span>
                    </div>
                        {(unloadingTimesFlag!='' || loadingTimesFlag!=''?<span  style={{color:'#ff0000',fontSize:'12px'}}>请输入【1-9整数】</span>:'')}
                </div>

            );
        //货源信息
        let cargoInfo = this.getComFormItem([
            { key:'loadingPlace', label:'装货地',component:loadingPlaceSelect,requiredFlag:true},
            { key:'unloadingPlace', label:'卸货地',component:unloadingPlaceSelect,requiredFlag:true},
        ],{},false);
        //其他信息
        let otherInfo = this.getComFormItem([
            { key:'goodsTypeName', label:'货物名称'},
            { key:'maxWeight', label:'货物重量',component:maxWeightInput},
            { key:'maxVolume', label:'货物体积',component:maxVolumeInput},
            { key:'carType', label:'车型',component:carTypeSelect},
            { key:'carLength', label:'车长',component:carLengthSelect},
            { key:'loadStatus', label:'几装几卸',component:loadStatus},
            { key:'paymentMethod', label:'支付方式'},
            { key:'remark', label:'备注',},
        ],{},false);
        //货主信息
        let cargoOwnerInfo = this.getComFormItem([
            { key:'trueName', label:'用户名'},
            { key:'phone', label:'手机号'},
            { key:'idCard', label:'身份证号'},
            { key:'userCode', label:'货主编号'},
            { key:'businessLicenseName', label:'公司名称'},
            { key:'businessLicenseAddr', label:'住所'},
        ],{},true);
        let imgVisible = formData.userImg?'inline':'none';
        let userStatus = Utils.handleUserType(formData.userType) || '';
        return(
            <Drawer
                wrapClassName={`drawer-modal ${drawerClassName}`}
                title={title}
                placement={placement}
                onClose={ this.onClose }
                visible={visible}
                width = {width}
                destroyOnClose
            >
                <Spin tip="数据加载中..." spinning={this.state.loading}>
                    <div className='drawer-list-box'>
                        {
                            (this.state.errMsg && this.state.errMsg != '') ?<Alert message={this.state.errMsg} type="error" style={{marginBottom:10}} closable/>:''
                        }
                        {
                            (userStatus != '未审核' && userStatus != '审核中' && userStatus != '' && formData.status == 1 )?( this.state.modalType == 'detail'? <Button onClick={this.clickEdit} style={{marginBottom:20}} type="primary" ghost>编辑</Button>:
                                <Button onClick={this.onSubmit} style={{marginBottom:20}} type="primary" loading={this.state.loading}>完成</Button>):''
                        }
                        <div className='drawer-list-title'>货源信息</div>
                            {cargoInfo}
                        </div>
                    <div className='drawer-list-box'>
                        <div className='drawer-list-title'>其他信息</div>
                        { otherInfo }
                    </div>
                    <div className='drawer-list-box'>
                        <div className='drawer-list-title'>货主信息</div>
                        <div style={{position:'absolute',right:40,top:26,textAlign:'center',}}>
                            <div style={{textAlign:'center',color:'#1890FF',marginBottom:12,fontSize:14}}>{userStatus}</div>
                            <img style={{width:48,height:48,borderRadius:'50%',display:imgVisible}} src={formData.userImg}/>
                        </div>
                        { cargoOwnerInfo }
                    </div>
                </Spin>
            </Drawer>
        )
    }
}
export default CargoOriginModal;