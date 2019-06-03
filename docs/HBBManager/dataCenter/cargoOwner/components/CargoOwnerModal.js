/**
 *   Create by Malson on 2019/2/27
 */

import React from 'react';
import { Drawer,Upload,Modal,Avatar,Spin,Button,Input,message,Alert } from 'antd';
const { TextArea } = Input;
import FormUtils from '@/lib/Components/FormUtils'

const FormDef = require('./CargoOwnerForm');
let Utils = require('@/public/script/utils');
let Common = require('@/public/script/common');
import CargoOwnerActions from '../action/CargoOwnerActions';
import DriverActions from '../../driver/action/DriverActions';
import DriverStore from '../../driver/store/DriverStore';
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
      fileList: [
      ],
      validRules: [],
      hints: {},

    }
    //初始化数据信息
   // FormDef.initCargoOwnerForm(this,this.state.formData);
    
    //使用公共input change必加
    this.handleOnChange = Utils.handleOnChange.bind(this,'formData');
  }
    componentDidMount(){
        let attrList = [
            {
                name: 'businessLicenseOwner',
                validator: this.checkBusinessLicenseOwner
            },
            {
                name: 'businessLicenseCredit',
                validator: this.checkBusinessLicenseCredit
            },
            {
                name: 'businessLicenseName',
                validator: this.checkBusinessLicenseName
            },
            {
                name: 'businessLicenseAddr',
                validator: this.checkBusinessLicenseAddr
            },
        ];
        this.state.validRules = FormDef.getCargoOwnerFormRule(this,attrList);
        this.unsubcribe=DriverStore.listen(this.onServiceChange);
    }

    //法定代表人 中文，大等于2字，小等于于13个字。
    checkBusinessLicenseOwner = (value) =>{
        if(value == null || value == ''){
            return '请输入【中文】';
        }
        let test=/^[\u4e00-\u9fa5]+$/; //中文
        if (!test.test(value)) {
            return '请输入【中文】';
        }
        if(value.length < 2){
            return '请输入【至少2个字】';
        }
        if(value.length > 13){
            return '不能【多于13个字】';
        }
    }

    //社会信用代码 英文数字18位。
    checkBusinessLicenseCredit = (value) =>{
        if(value == null || value == ''){
            return '请输入【英文数字】';
        }

        let test=/^[a-zA-Z0-9]+$/; //英文数字
        if (!test.test(value)) {
            return '请输入【英文数字】';
        }
        if(value.length != 15 && value.length != 18) {
            return '请输入【15位或18位】';
        }
    }

    //公司名称：中英文数字，大等于4字，小等于50字。
    checkBusinessLicenseName = (value) =>{
        if(value == null || value == ''){
            return '请输入【中英文数字】';
        }
        let test=/^[\u4e00-\u9fa5a-zA-Z0-9]+$/; //中英文数字
        let specialChar = /[/。……（）/ /g.【】——《》￥*`~!#$%^&*-=+<>?:|?<>"{},\/\\;'[\]]/img;//特殊字符
        if (specialChar.test(value)) {
            return '请输入【中英文数字】';
        }
        if(value.length < 4){
            return '请输入【至少4个字】';
        }
        if(value.length > 50){
            return '不能【多于50个字】';
        }
    }
    //公司地址 大等于4字，小等于100字。
    checkBusinessLicenseAddr = (value) =>{
        if(value == null || value == ''){
            return '请输入【至少4个字】';
        }

        if(value.length < 4){
            return '请输入【至少4个字】';
        }
        if(value.length > 100){
            return '不能【多于100个字】';
        }
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
        }else{
            this.setState({errMsg:""});
        }
        if (data.operation === 'retrieveInfo') {
            //处理证件照片
            // 身份证idcardImg
            //营业执照businessLicenseImg
            let recordSet = Utils.deepCopyValue(data.recordSet);
            let fileList=[{
                uid: '1', url:this.doImg(recordSet.idcardImg)}, {uid: '2', url: this.doImg(recordSet.businessLicenseImg)}];

            //处理认证状态
            let userType = Utils.handleUserType(recordSet.userType);
            recordSet.userType =  userType != ''?userType:recordSet.userType;
            for(let i in recordSet){
                if( i === 'idcardImg' || i === 'businessLicenseImg'){
                    continue;
                }
                recordSet[i] = recordSet[i] || '暂无'
            }
            this.setState({formData:recordSet,flag:false,fileList});
        }else if(data.operation === 'update'){
            this.setState({modalType:'detail'});
        }else if(data.operation === 'userBlacklist' || data.operation === 'relieveUserBlacklist'){
            this.setState({modalType:'detail'});
        }
    }
  componentWillReceiveProps(nextProps){

      if(!nextProps.showDrawer){
          //关闭抽屉时清空数据
          this.clearState();
      }
      //flag一开始true，初始化加载数据
      if(nextProps.showDrawer && nextProps.editData.userCode && nextProps.modalType == 'detail'){
          //调用接口
          DriverActions.retrieveInfo({userUuid:nextProps.editData.uuid});
      }
    this.setState({
      visible:nextProps.showDrawer,
      modalType:nextProps.modalType,
      loading:this.state.flag
      //formData:testData
    });
  }
  shouldComponentUpdate(nextProps, nextState){
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }
  clearState = ()=>{
    FormDef.initCargoOwnerForm(this,this.state.formData);
    this.setState({loading:this.state.loading,flag:true});
  }
  onClose = ()=>{
    this.props.handleClose();
  }
  onSubmit = ()=>{
    if(Common.validator(this,this.state.formData)){
        this.setState({loading:true});
      let data={
          uuid:this.state.formData.userUuid,
          businessLicenseOwner:this.state.formData.businessLicenseOwner,
          businessLicenseCredit:this.state.formData.businessLicenseCredit,
          businessLicenseName:this.state.formData.businessLicenseName,
          businessLicenseAddr:this.state.formData.businessLicenseAddr,
      }
       DriverActions.updateInfo(data);
    }
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
                if( i === 'trueName'  || i === 'phone' ||  i === 'idCard' || i === 'userType'){
                    continue;
                }
                newData[i] = '';
            }
        }
        this.setState({
            modalType:'',
            formData:newData
        });
    }

    //拉黑
    clickBlack = () =>{
        this.state.formData.userType = "已拉黑司机";
        if(this.state.formData){
            this.setState({loading:true});
            let obj = this.state.formData.userUuid;
            CargoOwnerActions.userBlack(obj);
        }
    }

    //取消拉黑
    clickCancelBlack = () =>{
        this.state.formData.userType = "审核通过";
        if(this.state.formData){
            this.setState({loading:true});
            let obj = this.state.formData.userUuid;
            CargoOwnerActions.relieveUserBlacklist(obj);
        }
    }

  render(){
    let {placement,visible,width} = this.state;
    let title = this.props.modalType === 'detail'?<span><span className='drawer-title'>货主详情</span><span className='drawer-subtitle'>货主编号：{this.state.formData.userCode}</span></span>  :   '新增';
    let drawerClassName = this.props.modalType === 'detail'? 'modal-detail':'';
    //处理公司地址的textArea
      let area = this.state.modalType === 'detail'? <span>{this.state.formData['businessLicenseAddr']}</span> : <TextArea rows={3} name='businessLicenseAddr' id='businessLicenseAddr' value={this.state.formData['businessLicenseAddr']} style={{resize:'none',marginTop:5}} onChange={this.handleOnChange} placeholder='请输入公司地址'/>;
    //个人信息
    let cargoInfo = this.getComFormItem([
      { key:'trueName', label:'姓名'},
      { key:'phone', label:'手机号'},
      { key:'idCard', label:'身份证号'},
      { key:'userType', label:'认证状态'},
    ],{},true);

    //公司信息
    let otherInfo = this.getComFormItem([
      { key:'businessLicenseOwner', label:'法定代表人'},
      { key:'businessLicenseCredit', label:'社会信用代码'},
      { key:'businessLicenseName', label:'公司名称'},
      { key:'businessLicenseAddr', label:'公司地址',component:area},
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

                  (this.state.formData.userType == '审核通过')?(this.state.modalType == 'detail' ? <Button onClick={this.clickAlter} style={{marginBottom:20}} type="primary" ghost>编辑</Button>:
                      <Button onClick={this.onSubmit} style={{marginBottom:20}} type="primary" loading={this.state.loading}>完成</Button>):''
              }
            <div className='drawer-list-title' style={{position:'relative',height:'48px'}}>个人信息
                <Avatar src={this.state.formData.userImg==''||this.state.formData.userImg==null?noUserImg:this.state.formData.userImg} style={{float:'right',marginRight:20,width:48,height:48,}}/>
                {

                    (this.state.formData.userType != '未审核' && this.state.formData.userType != '审核中' && this.state.formData.userType != '不通过')? ( this.state.formData.userType == '已拉黑货主'?
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
          <div className='drawer-list-box infos'>
            <div className='drawer-list-title'>公司信息</div>
            { otherInfo }
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
            <div style={{width:'60%'}}>
              <div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>身份证</div>
              <div style={{width:104,float:'left',marginRight:30,textAlign:'center'}}>营业执照</div>
            </div>
          </div>
            {
                this.state.modalType == 'detail' ?
                    <Spin spinning={this.state.loading} style={{position: 'relative', left: -48, top: -190}}/> :''
            }
          {/*<div>*/}
            {/*<Button onClick={this.onSubmit}>确定</Button>*/}
          {/*</div>*/}
        </Drawer>
    )
  }
}
export default DriverModal;