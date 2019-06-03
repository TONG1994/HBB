/**
 *   Create by Malson on 2019/2/27
 */

import React from 'react';
import { Drawer,Button,Select,Input,DatePicker} from 'antd';
const { TextArea } = Input;
import moment from 'moment';
import FormUtils from '@/lib/Components/FormUtils'

const FormDef = require('./VersionForm');
let Utils = require('@/public/script/utils');
let Common = require('@/public/script/common');
import DriverActions from '../action/VersionActions';
import DriverStore from '../store/VersionStore';
import noImg from '../../../../lib/style/noImg.svg';
import noUserImg from '../../../../lib/style/noUserImg.svg';



class DriverModal extends React.Component {
  constructor(props){
    super(props);
    this.state={
      formData:{},    //每个form页面必传
      modalType:'',   //每个form页面必传  是否可以编辑
      placement:'right',
      visible:false,
      width:600,
      loading:false,
      flag:true,
      previewVisible:false,
      previewImage:'',
      fileList: [],
    }
    //初始化数据信息
    FormDef.initDriverForm(this,this.state.formData);
    
    //使用公共input change必加
    this.handleOnChange = Utils.handleOnChange.bind(this,'formData');
  }
    componentDidMount(){
        // this.state.validRules = FormDef.getCargoOriginFormRule(this);
        this.unsubcribe=DriverStore.listen(this.onServiceChange);
    }
    doImg = (data)=>{
        if(data==null || data == ''){
            return noImg;
        }else{
            return data;
        }
    }
    onServiceChange = (data) => {
        this.setState({loading:false});
        if(data.errMsg){
            this.setState({errMsg:data.errMsg});
            return;
        }
        if (data.operation === 'retrieveInfo') {
            //处理证件照片
            // 身份证idcardImg
            //驾驶证driverLicenseImg;
            //行驶证drivingLicenseImg;
            let fileList=[{
                uid: '1', url:this.doImg(data.recordSet.idcardImg)}, {uid: '2', url: this.doImg(data.recordSet.driverLicenseImg)}, {uid: '3', url: this.doImg(data.recordSet.drivingLicenseImg)}];

            //处理认证状态
            let userType = Utils.handleUserType(data.recordSet.userType);
            data.recordSet.userType =  userType != ''?userType:data.recordSet.userType;
            this.setState({formData:data.recordSet,flag:false,fileList});
        }
    }
  componentWillReceiveProps(nextProps){
      if(!nextProps.showDrawer){
        this.clearState();
      }
      if(nextProps.showDrawer && nextProps.editData.userCode && this.state.flag){
          //调用接口
         DriverActions.retrieveInfo({userUuid:nextProps.editData.uuid});
      }
    this.setState({
      visible:nextProps.showDrawer,
      modalType:nextProps.modalType,
      loading:this.state.flag
      //formData:testData  //值
    });
  }
  shouldComponentUpdate(nextProps, nextState){
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }
  clearState = ()=>{
    FormDef.initDriverForm(this,this.state.formData);
    this.setState({loading:this.state.loading,flag:true});
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
      return FormUtils.getFormItem(this,{key:item.key,label:item.label},{component:item.component})
    })
  }
  //图片显示
    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }
    onChange = (date, dateString) =>{
        console.log(date, dateString);
    }
  render(){
    let {placement,visible,width} = this.state;
    let title = this.props.modalType === 'detail'? <span><span className='drawer-title'>司机详情</span><span className='drawer-subtitle'>司机编号：{this.state.formData.userCode}</span></span>  :   '新增';
    let drawerClassName = this.props.modalType === 'detail'? 'modal-detail':'';
      let selectCom = (
          <Select style={{width:'100%'}}>
            <Option value="">-请选择-</Option>
            <Option value="20">未审核</Option>
            <Option value="21">审核中</Option>
            <Option value="22">审核通过</Option>
            <Option value="24">不通过</Option>
          </Select>
      );
      let textArea = (
          <TextArea rows={6} style={{resize:'none'}}/>
      );
      const dateFormat = 'YYYY-MM-DD';
      let datePicker = (<DatePicker onChange={this.onChange} style={{width:'100%'}} defaultValue={moment(new Date())} />);
    //个人信息
    let cargoInfo = this.getComFormItem([
      { key:'trueName', label:'版本号'},
      { key:'phone', label:'发布日期',component:datePicker},
      { key:'idCard', label:'客户端类型',component:selectCom},
      { key:'userType', label:'描述',component:textArea},
    ]);
    //车辆信息
    // let otherInfo = this.getComFormItem([
    //   { key:'plateNumber', label:'车牌号'},
    //   { key:'vehicleType', label:'车型'},
    //   { key:'vehicleLength', label:'车长'},
    // ]);
    return(
        <Drawer
            wrapClassName={`drawer-modal ${drawerClassName}`}
            title={title}
            placement={placement}
            onClose={ this.onClose }
            visible={visible}
            width = {width}
        >
          <div className='drawer-list-box'>
            <div className='drawer-list-title'></div>
            { cargoInfo }
          </div>
          {/*<div className='drawer-list-box'>*/}
            {/*<div className='drawer-list-title'>车辆信息</div>*/}
            {/*{ otherInfo }*/}
          {/*</div>*/}
          {/*<div className='drawer-list-box img'>*/}
            {/*<div className='drawer-list-title'>证件照片</div>*/}
            {/*/!*{ cargoOwnerInfo }*!/*/}
            {/*<Upload*/}
                {/*listType="picture-card"*/}
                {/*fileList={this.state.fileList}*/}
                {/*onPreview={this.handlePreview}*/}
            {/*>*/}
            {/*</Upload>*/}
            {/*<Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>*/}
              {/*<img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />*/}
            {/*</Modal>*/}
            {/*<div style={{width:'74%'}}>*/}
             {/*<div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>身份证</div>*/}
              {/*<div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>驾驶证</div>*/}
              {/*<div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>行驶证</div>*/}
            {/*</div>*/}
          {/*</div>*/}
            {/*<Spin spinning={this.state.loading} style={{position:'relative' ,left:-200,top:-190}}/>*/}
          {/*<div>*/}
          <div style={{float:'right'}}>
            <Button onClick={this.onSubmit} >取消</Button>
            <Button onClick={this.onSubmit}type='primary' style={{marginLeft:8}}>确定</Button>
          </div>
          {/*</div>*/}
        </Drawer>
    )
  }
}
export default DriverModal;