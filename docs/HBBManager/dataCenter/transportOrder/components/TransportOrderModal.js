/**
 *   Create by Malson on 2019/2/27
 */

import React from 'react';
import { Drawer,Row, Col,Form,Avatar,Spin } from 'antd';
import FormUtils from '@/lib/Components/FormUtils'
import TransportOrderStore from '../store/TransportOrderStore';

const FormDef = require('./TransportOrderForm');
let Utils = require('@/public/script/utils');
let Common = require('@/public/script/common');
import noUserImg from '../../../../lib/style/noUserImg.svg';

class TransportOrderModal extends React.Component {
  constructor(props){
    super(props);
    this.state={
      formData:{},    //每个form页面必传
      modalType:'',   //每个form页面必传  是否可以编辑
      placement:'right',
      visible:false,
      width:600,
      loading:true,
    }
    //初始化数据信息
    FormDef.initCargoOriginForm(this,this.state.formData);
    
    //使用公共input change必加
    this.handleOnChange = Utils.handleOnChange.bind(this,'formData');
  }
  componentDidMount(){
    this.state.validRules = FormDef.getCargoOriginFormRule(this);
    this.server = TransportOrderStore.listen(this.onHandleService);
  }
  componentWillUnmount(){
    this.server();
  }
  //处理数据返回
  onHandleService = (data)=>{
    //查询列表
    this.state.loading && this.setState({loading:false});
    if(data.operation === 'retrieveDetail'){
      let recordSet = data.recordSet || {};
      this.handleDetailData(recordSet)
    }
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      visible:nextProps.showDrawer,
      modalType:nextProps.modalType,
      formData:{}
    });
  }
  //格式化详情信息
  handleDetailData = (formData={})=>{
    //货源信息
    let goodsData = formData.goodsData || {};
    let loadingTimes = goodsData.loadingTimes && goodsData.loadingTimes + '装';
    let unloadingTimes = goodsData.unloadingTimes && goodsData.unloadingTimes + '卸';
    let times = loadingTimes + unloadingTimes;//几装几卸
    let loadingPlace,unloadingPlace;
    if(JSON.stringify(goodsData) == "{}"){
        loadingPlace = '暂无';
        unloadingPlace = '暂无';
    }else{
        loadingPlace = `${goodsData.loadingProvinceName} ${goodsData.loadingCityName} ${goodsData.loadingCountyName} ${goodsData.loadingAddress}`,
        unloadingPlace = `${goodsData.unloadingProvinceName} ${goodsData.unloadingCityName} ${goodsData.unloadingCountyName} ${goodsData.unloadingAddress}`;
    }
    let maxVolume = goodsData.maxVolume?goodsData.maxVolume + '方':'暂无',
        maxWeight = goodsData.maxWeight?goodsData.maxWeight + '吨':'暂无';
    let goodInfo = {
        paymentMethod:goodsData.paymentMethod,
        times:times,
        idCard:goodsData.idCard,
        remark:goodsData.remark,
        goodsNo:goodsData.goodsNo,
        goodsTypeName:goodsData.goodsTypeName,
        loadingPlace:loadingPlace,//装货地
        unloadingPlace:unloadingPlace,//卸货地
        maxVolume:maxVolume,
        maxWeight:maxWeight,
    };
    //司机信息
    let driverData = formData.driverData || {};
    let vehicleType = driverData.vehicleType || '不限';
    let vehicleLength;
    if(driverData.vehicleLength == null || driverData.vehicleLength == ''){
        vehicleLength = driverData.vehicleLength+ '米' || '不限';
    }
    let driverInfo = {
        trueName:driverData.trueName,
        phone:driverData.phone,
        driverUserCode:driverData.userCode,
        plateNumber:driverData.plateNumber,
        vehicleType:vehicleType,
        idCard:driverData.idCard,
        userType:Utils.handleUserType(driverData.userType),
        vehicleLength:vehicleLength,
        driverImg:driverData.userImg,
    };
    //货主信息
    let shipperData = formData.shipperData || {};
    let shipperInfo = {
        shipperTrueName:shipperData.trueName,
        shipperUserCode:shipperData.userCode,
        shipperBusinessLicenseName:shipperData.businessLicenseName,
        shipperIdCard:shipperData.idCard,
        shipperPhone:shipperData.phone,
        shipperUserType:Utils.handleUserType(shipperData.userType),
        shipperBusinessLicenseAddr:shipperData.businessLicenseAddr,
        shipperImg:shipperData.userImg,
    };
    formData = {...formData,...goodInfo,...driverInfo,...shipperInfo};
    for(let i in formData){
        if( i === 'driverImg' || i === 'shipperImg' ){
            continue;
        }
        formData[i] = formData[i] || '暂无'
    }
    this.setState({formData});
  }
  shouldComponentUpdate(nextProps, nextState){
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }
  clearState = ()=>{
    FormDef.initCargoOriginForm(this,this.state.formData);
    this.setState({loading:this.state.loading});
  }
  onClose = ()=>{
    this.props.handleClose();
  }
  onSubmit = ()=>{
    if(Common.validator(this,this.state.formData)){
      console.log('成功')
    }
  }
  //获取块级
  /**
   *  list 为 [{}]
   *  对象内包括
   *      key   :  key
   *      label :  label
  */
  getComFormItem = (list=[],colpParam={})=>{
    return list.map( item =>{
      return FormUtils.getFormItem(this,{key:item.key,label:item.label,...colpParam})
    })
  }
  render(){
    let {placement,visible,width,formData} = this.state;
    let title = this.props.modalType === 'detail'?<span><span className='drawer-title'>运单详情</span></span>:'新增';
    let drawerClassName = this.props.modalType === 'detail'? 'modal-detail':'';
    //自定义文字和输入框的比例
    // let colpParam = {
    //       labelCol:{span:7},
    //       wrapperCol:{span:16}
    //     };
    // let cargoInfo = this.getComFormItem([
    //   { key:'loadingCityName', label:'始发地'},
    //   { key:'loadingAddress', label:'始发地详细'},
    // ],colpParam);
    // let colpParam = {
    //       labelCol:{span:6},
    //       wrapperCol:{span:15}
    // };
    //运单信息
    let transportInfo = this.getComFormItem([
      { key:'orderNo', label:'运单编号'},
      { key:'paymentMethod', label:'支付方式'},
      { key:'times', label:'几装几卸'},
      { key:'loadingPlace', label:'装货地'},
      { key:'unloadingPlace', label:'卸货地'},
      { key:'createTime', label:'下单时间'},
      { key:'remark', label:'备注'},
    ]);
    //货源信息
    let goodsInfo = this.getComFormItem([
      { key:'goodsNo', label:'货物编号'},
      { key:'goodsTypeName', label:'货物名称'},
      { key:'maxWeight', label:'货物重量'},
      { key:'maxVolume', label:'货物体积'},
    ]);
    //司机信息
    let driverInfo = this.getComFormItem([
        { key:'trueName', label:'姓名'},
        { key:'driverUserCode', label:'司机编号'},
        { key:'phone', label:'手机号'},
        { key:'idCard', label:'身份证号'},
        { key:'plateNumber', label:'车牌号'},
        { key:'vehicleType', label:'车型'},
        { key:'vehicleLength', label:'车长'},
        { key:'userType', label:'认证状态'},
    ]);
    //货主信息
    let cargoOwnerInfo = this.getComFormItem([
      { key:'shipperTrueName', label:'姓名'},
      { key:'shipperUserCode', label:'货主编号'},
      { key:'shipperPhone', label:'手机号'},
      { key:'shipperIdCard', label:'身份证号'},
      { key:'shipperBusinessLicenseName', label:'公司名称'},
      { key:'shipperBusinessLicenseAddr', label:'住所'},
      { key:'shipperUserType', label:'认证状态'},
    ]);
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
              <div className='drawer-list-title'>运单信息</div>
              { transportInfo }
            </div>
            <div className='drawer-list-box'>
              <div className='drawer-list-title'>货源信息</div>
              { goodsInfo }
            </div>
            <div className='drawer-list-box info'>
                <div className='drawer-list-title' style={{height:48}}>司机信息<Avatar src={this.state.formData.driverImg==''||this.state.formData.driverImg==null?noUserImg:this.state.formData.driverImg} style={{float:'right',marginRight:20,width:48,height:48}}/></div>
                { driverInfo }
            </div>
            <div className='drawer-list-box info'>
              <div className='drawer-list-title' style={{height:48}}>货主信息<Avatar src={this.state.formData.shipperImg==''||this.state.formData.shipperImg==null?noUserImg:this.state.formData.shipperImg} style={{float:'right',marginRight:20,width:48,height:48}}/></div>
              { cargoOwnerInfo }
            </div>
          </Spin>
        </Drawer>
    )
  }
}
export default TransportOrderModal;