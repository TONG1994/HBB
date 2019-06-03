import React from 'react';
import { withRouter } from 'react-router';
import {Steps,Button,message,Form,Input, Icon, Modal, Spin} from 'antd';
const Step = Steps.Step;
const FormItem = Form.Item;
import ErrorMsg from '../../lib/Components/ErrorMsg';
var Common = require('../../public/script/common');
import LogActions from '../action/LogActions';
import LogStores from '../data/LogStores';
import '../style/resetpwd.scss';
let codeTime;
class ResetPasswdPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            resetPasswd: {
                phone: "",
                staffNo:"",
                newPwd: "",
                confirmPad: "",
                vercode:''
            },
            loading: false,
            hints: {},
            validRules: [],
            codeBtnText:'获取验证码',
            codeBtnDisable:false,
            errMsg: '',
        };
    }
    componentDidMount() {
        this.state.validRules = [
             {
                id: 'phone',
                desc: '手机号码',
                required: true,
                max: 11,
                min:11,
                dataType:'mobile'
                
            }, {
                id: 'staffNo',
                desc: '工号',
                required: true,
                // min:7,
                // max:7,
                dataType:'number'
            }, {
                id: 'vercode',
                desc: '验证码',
                required: true,
                min:4,
                max:4
            }, {
                id: 'newPwd',
                desc: '密码',
                required: true,
                max: 16,
                min:6,
                dataType:'passwd'

            }, {
                id: 'confirmPad',
                desc: '确认密码',
                max: 16,
                min:6,
                required: true
            }
        ];
        this.unsubscribe = LogStores.listen(this.onServiceChange);
    }
    onServiceChange = (data)=>{
        if(!data.errMsg){
            this.onDismiss();
          if(data.operation==='forgetPwdcreateVercode'){
            this.setState({codeBtnText:60,codeBtnDisable:true,loading:false});
            codeTime = setInterval(()=>{
              if(this.state.codeBtnText<1){
                this.setState({codeBtnText:'获取验证码',codeBtnDisable:false});
                clearInterval(codeTime);
              }else{
                this.setState((pre)=>({codeBtnText:pre.codeBtnText-1}));
              }
            },1000);
            // message.info('短信验证码已发送,请查收!');
            Common.succMsg('短信验证码已发送,请查收!');
          }else if(data.operation==='updatePwd'){
           this.next();
          }else if(data.operation==='checkVerCode'){
              if(data.checkVercode){
                this.next();
              }else{
                clearInterval(codeTime);
                let msg = '短信验证码不正确，请输入正确的短信验证码！';
                this.setState({codeBtnText:'获取验证码',codeBtnDisable:false,loading:false,errMsg:msg});
                // message.destroy();
                // message.warn('短信验证码不正确，请输入正确的短信验证码！');

              }
          }
        }else{
          this.setState({codeBtnText:'获取验证码',codeBtnDisable:false,loading:false,errMsg:data.errMsg});
        //   message.destroy();
        //  message.warn(data.errMsg);
        }
      }
      componentWillUnmount(){
        this.unsubscribe();
        clearTimeout(codeTime)
      }
    comparePwd=()=>{
        var newPwd = this.state.resetPasswd.newPwd;
        var confirmPad = this.state.resetPasswd.confirmPad;
        var resetPasswd = this.state.resetPasswd;
        if (Common.validator(this, resetPasswd,'newPwd') && Common.validator(this, resetPasswd,'confirmPad') ) {
            if (newPwd != confirmPad) {
                // message.warn('密码两次输入需要一致！');
                Common.warnMsg('密码两次输入需要一致！');
                return false;
            }
        }else{
            return false;
        }
        return true;
    }
    next=()=>{
        const current = this.state.current + 1;
        this.setState({current});
    }
    prev=()=>{
        this.state.resetPasswd.vercode='';
        const current = this.state.current - 1;
        this.setState({current});
    }
    handleOnChange=(e)=> {
        var resetPasswd = this.state.resetPasswd;
        resetPasswd[e.target.id] = e.target.value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');;
        Common.validator(this, resetPasswd, e.target.id);
        this.setState({resetPasswd: resetPasswd});
        if(this.state.errMsg) {
            this.onDismiss();
        }
    }
    
    clickGetCheckCode=()=>{ 
        var resetPasswd = this.state.resetPasswd;
        resetPasswd.vercode='';
        if(!Common.validator(this, resetPasswd, 'phone')||!Common.validator(this, resetPasswd, 'staffNo')){
            return;
        }
        
        var loginData = {
                telephone:resetPasswd.phone,
                staffNo:resetPasswd.staffNo,
                staffType:'MANAGER'
        };
        this.setState({codeBtnDisable:true});
        LogActions.forgetPswSendMail(loginData);
    }
    clickNextToSetPwd=()=>{
           let  phone=this.state.resetPasswd.phone,
             vercode=this.state.resetPasswd.vercode,
             resetPasswd = this.state.resetPasswd,
               staffNo = this.state.resetPasswd.staffNo;
             clearInterval(codeTime);
             this.setState({codeBtnText:'获取验证码',codeBtnDisable:false,loading:false});
        if (Common.validator(this, resetPasswd,'phone') && Common.validator(this, resetPasswd,'vercode') ) {
            this.state.resetPasswd.newPwd='', this.state.resetPasswd.confirmPad='';
            // this.next();
            let data={
                telephone:phone+staffNo,
                vercode
            };
            LogActions.checkVerCode(data);
          }
    }
    clickRequestPwd=()=> {
        if(this.comparePwd()){
            var loginData = {
                type:'0',//管理员忘记密码
                phone:this.state.resetPasswd.phone,
                staffNo:this.state.resetPasswd.staffNo,
                vercode:this.state.resetPasswd.vercode,
                newPwd:this.state.resetPasswd.newPwd
            };
            this.setState({loading:true,codeBtnDisable:false,codeBtnText:'获取验证码'});
           LogActions.forgetPsw(loginData);
        }
    }
    goLogin=()=>{
        this.props.onGoBack();
    }
    showError = (msg) => {
        this.setState({errMsg: msg});
    }
    onDismiss = () => {
        this.setState({errMsg: ''});
    }
    render() {
        const {current} = this.state;
        var hints = this.state.hints;
        var layout = 'horizontal';
        const formItemLayout = {
            labelCol: ((layout == 'vertical')
                ? null
                : {
                    span: 10
                }),
            wrapperCol: ((layout == 'vertical')
                ? null
                : {
                    span: 14
                })
        };
        let firstForm = <Form layout={layout} className="form">

            <FormItem
                {...formItemLayout}
                label="手机号码"
                colon={true}
                className="form-item"
                help={hints.phoneHint}
                validateStatus={hints.phoneStatus}>
                <Input
                    prefix={< Icon type = "phone" />}
                    placeholder="请输入手机号码"
                    type="text"
                    name="phone"
                    id="phone"
                    value={this.state.resetPasswd.phone}
                    onChange={this.handleOnChange}/>
            </FormItem>
            <FormItem
                {...formItemLayout}
                label="工号"
                colon={true}
                className="form-item"
                help={hints.staffNoHint}
                validateStatus={hints.staffNoStatus}>
                <Input
                    prefix={< Icon type="solution" />}
                    placeholder="请输入工号"
                    type="text"
                    name="staffNo"
                    id="staffNo"
                    value={this.state.resetPasswd.staffNo}
                    onChange={this.handleOnChange}/>
                <span style={{color:'red',position:'absolute',top:'0px',right:'-215px'}}>忘记工号，请拨打021-52658180</span>
            </FormItem>
            <FormItem
                {...formItemLayout}
                label="短信验证码"
                colon={true}
                className="form-item form-item-check-code"
                help={hints.vercodeHint}
                validateStatus={hints.vercodeStatus}>
                <Input className="check-code-input"
                    prefix={< Icon type = "safety" />}
                    placeholder="请输入验证码"
                    type="text"
                    name="vercode"
                    id="vercode"
                    value={this.state.resetPasswd.vercode}
                    onChange={this.handleOnChange}/>
                <Button
                    className="check-code"
                    key="btnEamil"
                    size="large"
                    disabled={this.state.codeBtnDisable}
                    onClick={this.clickGetCheckCode}>
                  {this.state.codeBtnText == '获取验证码' ? this.state.codeBtnText : this.state.codeBtnText+'s'}</Button>
            </FormItem>

            <FormItem className="form-btn-line" required={false} colon={true}>
                <Button
                    type="primary"
                    size="large"
                    onClick={this.clickNextToSetPwd}>下一步</Button>
            </FormItem>
        </Form>;
        let secondForm = <Form layout={layout} className="form">
            <FormItem
                {...formItemLayout}
                label="密码"
                colon={true}
                className="form-item"
                help={hints.newPwdHint}
                validateStatus={hints.newPwdStatus}>
                <Input
                    prefix={< Icon type = "lock" style = {{ fontSize: 13 }}/>}
                    placeholder="请输入密码"
                    type="password"
                    name="newPwd"
                    id="newPwd"
                    value={this.state.resetPasswd.newPwd}
                    onChange={this.handleOnChange}/>
            </FormItem>
            <FormItem
                {...formItemLayout}
                label="确认密码"
                colon={true}
                className="form-item"
                help={hints.confirmPadHint}
                validateStatus={hints.confirmPadStatus}>
                <Input
                    prefix={< Icon type = "lock" style = {{ fontSize: 13 }}/>}
                    placeholder="请输入确认密码"
                    type="password"
                    name="confirmPad"
                    id="confirmPad"
                    value={this.state.resetPasswd.confirmPad}
                    onChange={this.handleOnChange}/>
            </FormItem>
            <FormItem className="form-btn-line" required={false} colon={true}>
                <Button
                    style={{
                    marginRight: '30px'
                }}
                    size="large"
                    onClick={this.prev}>上一步</Button>
                <Button loading={this.state.loading} type="primary" size="large" onClick={this.clickRequestPwd}>下一步</Button>

            </FormItem>
        </Form>;
        let done = <div className="done">
            <h3 className="done-head">恭喜，成功重置新密码！</h3>
            <h1 className="done-info">请牢记您的新密码哦！</h1>
            <Button className="btn" type="primary" size="large" key="btnDone" onClick={this.goLogin}>完成</Button>
        </div>;
        const steps = [
            {
                title: '身份验证',
                content: firstForm
            }, {
                title: '重设密码',
                content: secondForm
            }, {
                title: '设置完成',
                content: done
            }
        ];

        return (
            <div className="resetpwd">
            <div className="resetpwd-header">
                <div className="header">
                    <div  className="text">
                        <span>喜来快递云平台</span>
                    </div>
                </div>
                <ul className="header-menu" >
                    <li className="menu menu-active">找回密码</li>
                    <li className="menu" onClick={this.goLogin}>登录</li>
                </ul>
            </div>
           
                <div className="content">
                
               <div className="title">找回密码</div>
               <div  className='error'> <ErrorMsg message={this.state.errMsg} toggle={this.onDismiss} /></div>
              
               <div className="resetpwd-step">
               
                <Steps current={current}>
                    {steps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className="steps-content">{steps[this.state.current].content}</div>
                
            </div>
           
                </div>
            </div>
        );
    }
}

export default withRouter(ResetPasswdPage);