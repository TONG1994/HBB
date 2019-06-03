/**
 *   Create by Malson on 2019/2/27
 */

import React from 'react';
import { Drawer,Spin,Upload,Modal,Avatar,Button,Alert,Select,DatePicker } from 'antd';
const Option = Select.Option;
import FormUtils from '@/lib/Components/FormUtils'
import moment from 'moment';
const FormDef = require('./DriverForm');
let Utils = require('@/public/script/utils');
let Common = require('@/public/script/common');
import DriverActions from '../action/DriverActions';
import DriverStore from '../store/DriverStore';
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
      vehicleTypeOption:[],
      vehicleLengthOption:[]
    }
    //初始化数据信息
    FormDef.initDriverForm(this,this.state.formData);
    
    //使用公共input change必加
    this.handleOnChange = Utils.handleOnChange.bind(this,'formData');
  }
    componentDidMount(){
        let attrList = [
            {
                name: 'plateNumber',
                validator: this.checkPlateNumber
            },
            {
                name: 'driverLicense',
                validator: this.checkDriverLicense
            },
            {
                name: 'drivingLicenseEnginecode',
                validator: this.checkDrivingLicenseEnginecode
            },
            {
                name: 'driverLicenseTerm',
                validator: this.checkDriverLicenseTerm
            },
        ];
        this.state.validRules = FormDef.getDriverFormRule(this,attrList);
        this.unsubcribe=DriverStore.listen(this.onServiceChange);
    }
    //车牌号 首位为【汉字】，后6~7位为英文数字
    checkPlateNumber = (value) =>{
        if(value == null || value == ''){
            return '请输入【车牌号】';
        }
        var xreg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;

        var creg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;

        if(value.length == 7){
            if(!creg.test(value)){
                return '请输入【正确的车牌号】';
            }
        } else if(value.length == 8){
            if(!xreg.test(value)){
                return '请输入【正确的车牌号】';
            }
        } else{
            return '首位为【汉字】，后6~7位为英文数字';
         }
    }
    //驾驶证号 18位数字
    checkDriverLicense = (value) =>{
        if(value == null || value == ''){
            return '请输入【驾驶证号】';
        }
        let test=/(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
        if (!test.test(value)) {
            return '请输入【正确的驾驶证号】';
        }
    }
    //发动机号 中英文数字、英文横线 大等于5小等于20.
    checkDrivingLicenseEnginecode = (value) =>{
        if(value == null || value == ''){
            return '请输入【发动机号】';
        }
        let test=/^[\u4e00-\u9fa5a-zA-Z0-9-]+$/;
        if (!test.test(value)) {
            return '请输入【中英文数字、英文横线】';
        }
        if(value.length < 5){
            return '请输入【至少5位中英文数字、英文横线】';
        }
        if(value.length > 20){
            return '请输入【最多20位中英文数字、英文横线】';
        }
    }
    //有效期必须比初次注册日期大
    checkDriverLicenseTerm = (value) =>{
        var oDate1 = new Date(value);
        var oDate2 = new Date(this.state.formData.driverLicenseCreatedate);
        if(oDate1.getTime() <= oDate2.getTime()){
           return '有效期必须比初次领证日期大';
        }
    }
    doImg = (data)=>{
        if(data==null || data == ''){
            return noImg;
        }else{
            return data;
        }
    }
    doDate = (data)=>{
        if(data != '' && data != null){
            if(data.indexOf("-") > 0){
               return data;
            }else{
                return  data.substring(0,4)+'-'+data.substring(4,6)+'-'+data.substring(6,8);
            }
        }
        return data;
    }
    onServiceChange = (data) => {
        this.setState({loading:false});
        if(data.errMsg){
            this.setState({errMsg:data.errMsg});
            return;
        }else{
            this.setState({errMsg:''});
        }
        if (data.operation === 'retrieveInfo') {
            console.log(data);
            let recordSet = Utils.deepCopyValue(data.recordSet);
            //处理证件照片
            // 身份证idcardImg
            //驾驶证driverLicenseImg;
            //行驶证drivingLicenseImg;
            let fileList=[{
                uid: '1', url:this.doImg(recordSet.idcardImg)}, {uid: '2', url: this.doImg(recordSet.driverLicenseImg)}, {uid: '3', url: this.doImg(recordSet.drivingLicenseImg)}];

            //处理认证状态
            let userType = Utils.handleUserType(recordSet.userType);
            recordSet.userType =  userType != ''?userType:recordSet.userType;
            //处理日期格式
            recordSet.driverLicenseCreatedate = this.doDate(recordSet.driverLicenseCreatedate);
            recordSet.driverLicenseTerm = this.doDate(recordSet.driverLicenseTerm);
            recordSet.drivingLicenseUpddate = this.doDate(recordSet.drivingLicenseUpddate);
            recordSet.vehicleType =  recordSet.vehicleType == null ? '':recordSet.vehicleType;
            recordSet.vehicleLength =  recordSet.vehicleLength == null ? '':recordSet.vehicleLength;
            for(let i in recordSet){
                if( i === 'idcardImg' || i === 'driverLicenseImg' || i === 'drivingLicenseImg'){
                    continue;
                }
                recordSet[i] = recordSet[i] || '暂无'
            }
            this.setState({formData:recordSet,flag:false,fileList});
        }else if(data.operation === 'update'){
            this.setState({modalType:'detail'});
        }else if(data.operation === 'getInfo'){
            if(data.filter == '2'){
                //车型
                let vehicleTypeOption =  data.recordSet.item;
                this.setState({vehicleTypeOption});
            }
            if(data.filter == '1'){
                //车长
                let vehicleLengthOption =  data.recordSet.item;
                this.setState({vehicleLengthOption});
            }
        }else if(data.operation === 'userBlacklist' || data.operation === 'relieveUserBlacklist'){
            this.setState({modalType:'detail'});
        }
    }
  componentWillReceiveProps(nextProps){
      if(!nextProps.showDrawer){
        this.clearState();
      }
      if(nextProps.showDrawer && nextProps.editData.userCode && this.state.flag){
          //调用接口
         DriverActions.retrieveInfo({userUuid:nextProps.editData.uuid});
          //调用接口获取车型车长
          DriverActions.getInfo("1");
          DriverActions.getInfo("2");
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
          return FormUtils.getFormItem(this,{key:item.key,label:item.label,...colpParam},{component:item.component})
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

    //编辑
    clickAlter=()=>{
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

    onChangeDate =(flag ,date, dateString)=>{
        switch (flag){
            case 'driverLicenseCreatedate':
                this.state.formData.driverLicenseCreatedate = dateString;
                Common.validator(this,this.state.formData,'driverLicenseCreatedate');
                break;
            case 'driverLicenseTerm':
                this.state.formData.driverLicenseTerm = dateString;
                Common.validator(this,this.state.formData,'driverLicenseTerm');
                break;
            case 'drivingLicenseUpddate':
                this.state.formData.drivingLicenseUpddate = dateString;
                Common.validator(this,this.state.formData,'drivingLicenseUpddate');
                break;
        }
        this.setState({loading:false});
    }

    handleOnSelect = (key,value) =>{
     this.state.formData[key] = value;
     this.setState({loading:false});
    }

    disabledDate = (current) =>{
        return  current && current > moment().endOf('day');
    }

    onSubmit = ()=>{
        if(Common.validator(this,this.state.formData)){
            this.setState({loading:true});
            let data={
                uuid:this.state.formData.userUuid,
                plateNumber:this.state.formData.plateNumber,
                vehicleType:this.state.formData.vehicleType,
                vehicleLength:this.state.formData.vehicleLength,
                driverLicense:this.state.formData.driverLicense,
                driverLicenseCreatedate:this.state.formData.driverLicenseCreatedate.replace(new RegExp( '-' , "g" ),""),
                driverLicenseTerm:this.state.formData.driverLicenseTerm.replace(new RegExp( '-' , "g" ),""),
                drivingLicenseEnginecode:this.state.formData.drivingLicenseEnginecode,
                drivingLicenseUpddate:this.state.formData.drivingLicenseUpddate.replace(new RegExp( '-' , "g" ),""),
            }
            DriverActions.updateInfo(data);
        }
    }

    //拉黑
    clickBlack = () =>{
        this.state.formData.userType = "已拉黑司机";
        if(this.state.formData){
            this.setState({loading:true});
            let obj = this.state.formData.userUuid;
            DriverActions.userBlack(obj);
        }
    }

    //取消拉黑
    clickCancelBlack = () =>{
        this.state.formData.userType = "审核通过";
        if(this.state.formData){
            this.setState({loading:true});
            let obj = this.state.formData.userUuid;
            DriverActions.relieveUserBlacklist(obj);
        }
    }

  render(){
    let {placement,visible,width,vehicleTypeOption,vehicleLengthOption} = this.state;
    let title = this.props.modalType === 'detail'? <span><span className='drawer-title'>司机详情</span><span className='drawer-subtitle'>司机编号：{this.state.formData.userCode}</span></span>  :   '新增';
    let drawerClassName = this.props.modalType === 'detail'? 'modal-detail':'';
    //车型，车长的下拉框
    let vehicleTypeSelect = this.state.modalType === 'detail'? <span>{this.state.formData['vehicleType']}</span>
        : ( <Select defaultValue={this.state.formData['vehicleType']} style={{width:'100%'}}  onChange={this.handleOnSelect.bind(this,'vehicleType')}>
            <Select.Option value="">-请选择-</Select.Option>
            {
                vehicleTypeOption.map(item=>{
                    return <Select.Option value={item.value}>{item.value}</Select.Option>
                })
            }
        </Select>);
    let vehicleLengthSelect = this.state.modalType === 'detail'? <span>{this.state.formData['vehicleLength'] == ''?'':this.state.formData['vehicleLength'] == '暂无'?'暂无':`${this.state.formData['vehicleLength']}米`}</span>
        :( <Select defaultValue={this.state.formData['vehicleLength']} style={{width:'100%'}}  onChange={this.handleOnSelect.bind(this,'vehicleLength')}>
        <Select.Option value="">-请选择-</Select.Option>
        {
             vehicleLengthOption.map(item=>{
                return <Select.Option value={item.value}>{item.value}米</Select.Option>
            })
        }

    </Select>);
    //日期控件
      const dateFormat = 'YYYY-MM-DD';
      let driverLicenseCreatedate = this.state.modalType === 'detail'? <span>{this.state.formData['driverLicenseCreatedate']}</span>
          : (<DatePicker placeholder="请选择初次领证日期" style={{width:'100%'}} defaultValue={moment(this.state.formData['driverLicenseCreatedate'])} format={dateFormat} onChange={this.onChangeDate.bind(this,'driverLicenseCreatedate')} allowClear={false} disabledDate={this.disabledDate}/>);
      let driverLicenseTerm = this.state.modalType === 'detail'? <span>{this.state.formData['driverLicenseTerm']}</span>
          : (<DatePicker placeholder="请选择有效期至" style={{width:'100%'}} defaultValue={moment(this.state.formData['driverLicenseTerm'])} format={dateFormat} allowClear={false} onChange={this.onChangeDate.bind(this,'driverLicenseTerm')}/>);
      let drivingLicenseUpddate = this.state.modalType === 'detail'? <span>{this.state.formData['drivingLicenseUpddate']}</span>
          :(<DatePicker placeholder="请选择注册日期" style={{width:'100%'}} defaultValue={moment(this.state.formData['drivingLicenseUpddate'])} format={dateFormat} allowClear={false} onChange={this.onChangeDate.bind(this,'drivingLicenseUpddate')}  disabledDate={this.disabledDate}/>);
    //个人信息
    let cargoInfo = this.getComFormItem([
      { key:'trueName', label:'姓名'},
      { key:'phone', label:'手机号'},
      { key:'idCard', label:'身份证号'},
      { key:'userType', label:'认证状态'},
    ],{},true);
    //车辆信息
    let otherInfo = this.getComFormItem([
      { key:'plateNumber', label:'车牌号'},
      { key:'vehicleType', label:'车型',component:vehicleTypeSelect},
      { key:'vehicleLength', label:'车长',component:vehicleLengthSelect},
    ],{},false);
      //驾驶证
      let driverInfo = this.getComFormItem([
          { key:'driverLicense', label:'驾驶证号'},
          { key:'driverLicenseCreatedate', label:'初次领证日期',component:driverLicenseCreatedate},
          { key:'driverLicenseTerm', label:'有效期至',component:driverLicenseTerm},
      ],{},false);
      //行驶证
      let driverLicenseInfo = this.getComFormItem([
          { key:'drivingLicenseEnginecode', label:'发动机号'},
          { key:'drivingLicenseUpddate', label:'注册日期',component:drivingLicenseUpddate},
      ],{},false);

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
          <div className='drawer-list-box info'>
              {
                  (this.state.errMsg && this.state.errMsg != '') ?<Alert message={this.state.errMsg} type="error" style={{marginBottom:10}} closable/>:''
              }
              {

                  (this.state.formData.userType == '审核通过')?( this.state.modalType == 'detail'? <Button onClick={this.clickAlter} style={{marginBottom:20}} type="primary" ghost>编辑</Button>:
                      <Button onClick={this.onSubmit} style={{marginBottom:20}} type="primary" loading={this.state.loading}>完成</Button>):''
              }
              <div className='drawer-list-title' style={{position:'relative',height:'48px'}}>个人信息
                  <Avatar src={this.state.formData.userImg ==null || this.state.formData.userImg =='' ?noUserImg:this.state.formData.userImg} style={{float:'right',marginRight:20,width:48,height:48,}}/>
                  {

                      (this.state.formData.userType != '未审核' && this.state.formData.userType != '审核中' && this.state.formData.userType != '不通过')? ( this.state.formData.userType == '已拉黑司机'?
                          <div style={{position:'absolute',top:33,right:20,background:'white',width:20,height:20,borderRadius:'50%'}}>
                              <svg viewBox="64 64 896 896" className="" data-icon="center" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" style={{color:'red',marginTop:'2px',marginLeft:2}}>
                                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372 0-89 31.3-170.8 83.5-234.8l523.3 523.3C682.8 852.7 601 884 512 884zm288.5-137.2L277.2 223.5C341.2 171.3 423 140 512 140c205.4 0 372 166.6 372 372 0 89-31.3 170.8-83.5 234.8z"></path>
                              </svg>
                              <Button type="primary" onClick={this.clickCancelBlack} ghost style={{position:'absolute',right:-20,top:27,zIndex:100}} loading={this.state.loading}>解除拉黑</Button>
                          </div>
                              :
                          <Button type="primary" onClick={this.clickBlack} ghost style={{position:'absolute',right:0,top:60,zIndex:100}} loading={this.state.loading}>
                              <svg viewBox="64 64 896 896" className="" data-icon="center" width="1em" height="1em"
                                   fill="currentColor" aria-hidden="true" focusable="false" style={{display:'hidden'}}>
                                  <path
                                      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372 0-89 31.3-170.8 83.5-234.8l523.3 523.3C682.8 852.7 601 884 512 884zm288.5-137.2L277.2 223.5C341.2 171.3 423 140 512 140c205.4 0 372 166.6 372 372 0 89-31.3 170.8-83.5 234.8z"></path>
                              </svg> 拉黑
                          </Button>):''
                  }

              </div>

              { cargoInfo }
          </div>
          <div className='drawer-list-box'>
            <div className='drawer-list-title'>车辆信息</div>
            { otherInfo }
              <div className='drawer-list-title' style={{paddingLeft:58,paddingTop:31,fontSize:14}}>驾驶证</div>
              { driverInfo }
              <div className='drawer-list-title' style={{paddingLeft:58,paddingTop:31,fontSize:14}}>行驶证</div>
              { driverLicenseInfo }

          </div>
          <div className='drawer-list-box img'>
            <div className='drawer-list-title'>证件照片</div>
            {/*{ cargoOwnerInfo }*/}
            <Upload
                listType="picture-card"
                fileList={this.state.fileList}
                onPreview={this.handlePreview}
            >
            </Upload>
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
            <div style={{width:'95%'}}>
             <div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>身份证</div>
              <div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>驾驶证</div>
              <div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>行驶证</div>
            </div>
          </div>
            <div style={{height:120}}></div>
            {
                this.state.modalType == 'detail'? < Spin spinning={this.state.loading} style={{position:'relative' ,left:-200,top:-190}}/>:''
            }
          {/*<div>*/}
            {/*<Button onClick={this.onSubmit}>确定</Button>*/}
          {/*</div>*/}
        </Drawer>
    )
  }
}
export default DriverModal;