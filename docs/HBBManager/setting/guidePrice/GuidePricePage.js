/**
 *   Create by Malson on 2019/2/18
 */

import React from 'react';
import {Input,Button, message } from 'antd';
import box from './icon_box.svg';
import error from '../../../login/style/error_icon.svg';
import GuidePriceActions from './action/GuidePriceActions';
import GuidePriceStore from './store/GuidePriceStore';


class GuidePricePage extends React.Component   {
  constructor(props){
    super(props);
    this.state={
        loading:false,
        errMsg:'',
        errMsgs:'',
        inputVal:{
            bulkingValue:'',
            minimumIndicativePrice:'',
            maximumIndicativePrice:'',
            uuid:''
        }
    }
  }
  componentDidMount(){
     this.unsubcribe=GuidePriceStore.listen(this.onServiceChange);
      GuidePriceActions.retrieve({});
  }
    onServiceChange = (data) => {
        this.setState({loading:false});
        if(data.errMsg){
            this.setState({errMsg:data.errMsg});
            return;
        }
        if (data.operation === 'retrieveGuide') {
            let recordSet = data.recordSet;
            let inputVal = {...this.state.inputVal,...recordSet};
           this.setState({inputVal});
        }else if(data.operation === 'create'){
            //保存成功，给出提示消息
            message.destroy();
            message.success('保存成功');
        }
    }

    handleOnChange = (e) => {
        let inputVal = this.state.inputVal;
        let s = e.target.value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        inputVal[e.target.id]= s;
        this.setState({
            inputVal: inputVal,
            errMsg:'',
            errMsgs:''
        });
    }
  onSubmit=()=>{
      //处理默认值
      let inputVal = this.state.inputVal;
      inputVal.bulkingValue = inputVal.bulkingValue == ''?'333':inputVal.bulkingValue;
      inputVal.minimumIndicativePrice = inputVal.minimumIndicativePrice == ''?'0.8':inputVal.minimumIndicativePrice;
      inputVal.maximumIndicativePrice = inputVal.maximumIndicativePrice == ''?'1.5':inputVal.maximumIndicativePrice;
      //((([1-9][0-9]*)+(.[0-9]{1,})?)|(0.[0-9]{1,}))
      var re = /^(([1-9]\d*(\.\d+)?)|(0\.\d+))$/;
      if(!re.test(inputVal.bulkingValue)){
         this.state.errMsg = '只能输入正数'
      }
      if(!re.test(inputVal.minimumIndicativePrice)){
          this.state.errMsgs = '只能输入正数'
      }
      if(!re.test(inputVal.maximumIndicativePrice)){
          this.state.errMsgs = '只能输入正数'
      }
      if(this.state.errMsgs==''&&this.state.errMsg==''){
          this.setState({loading:true});
          GuidePriceActions.create(inputVal);
      }else{
          this.setState({loading:false});
      }
  }
  render(){
      let visibleMsg = this.state.errMsg==''?'hidden':'visible';
      let visibleMsgs = this.state.errMsgs==''?'hidden':'visible';
    return(
        <div className="grid-page">
          <div className='table-box' style={{height:553}}>
            <div style={{fontSize:14,fontWeight:600}}>体积重量公式：</div>
            <div style={{fontSize:14,marginTop:16}}>立方米（m³）x &nbsp;&nbsp;<Input type='text'  id='bulkingValue' value={this.state.inputVal.bulkingValue} maxLength={20} onChange={this.handleOnChange} style={{width:125}}  placeholder="333"/>
              <img src={error} style={{marginLeft:8,visibility:visibleMsg}} /><span style={{color:'red',marginLeft:4,verticalAlign:'middle'}}>{this.state.errMsg}</span>
            </div>
            <div style={{fontSize:14,fontWeight:600,marginTop:34}}>运费计算公式：</div>
            <div style={{fontSize:14,marginTop:16}}>距离（km）x  重量（t）x &nbsp;&nbsp;<Input type='text' id='minimumIndicativePrice' value={this.state.inputVal.minimumIndicativePrice} maxLength={20} onChange={this.handleOnChange} style={{width:80}}  placeholder="0.8"/>～<Input type='text' id='maximumIndicativePrice' value={this.state.inputVal.maximumIndicativePrice} maxLength={20} onChange={this.handleOnChange} style={{width:80}}  placeholder="1.5"/>
              <img src={error} style={{marginLeft:8,visibility:visibleMsgs}}/><span style={{color:'red',marginLeft:4,verticalAlign:'middle'}}>{this.state.errMsgs}</span>
            </div>
            <img src={box} style={{float:'left',marginLeft:500,marginTop:-125}}/>
            <div style={{marginTop:42}}>
              <Button onClick={this.onSubmit}type='primary'>确定</Button>
              {/*<Button onClick={this.onSubmit} style={{marginLeft:8}}>取消</Button>*/}
            </div>
          </div>
        </div>)
  }
}
export default GuidePricePage;