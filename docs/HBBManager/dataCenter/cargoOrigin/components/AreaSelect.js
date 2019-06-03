/**
 *   Create by Malson on 2018/12/7
 */

import React from 'react';
import {Cascader ,Input } from 'antd';
import ControlledDoorStore from '../store/ControlledDoorStore';
import ControlledDoorActions from "../action/ControlledDoorActions";
import '../CargoOrigin.scss';

class AreaSelect extends React.Component {
    constructor(props){
        super(props);
        this.state={
            areaList: {},
            value:'',
        };
    }
    componentDidMount(){
        this.getAddressFun = ControlledDoorStore.listen(this.onHandleService);
        if(window.sessionStorage.address){
            let areaList=[];
            try {
                areaList = JSON.parse(window.sessionStorage.address);
            }catch (err){}
            this.setState({areaList});
            return;
        }
        ControlledDoorActions.getAddress();
    }
    //处理数据返回
    onHandleService = (data)=>{
        if(data.operation==='getAllProvinceCityRegion'){
            let areaList = data.recordSet;
            this.setState({areaList});
            window.sessionStorage.address = JSON.stringify(areaList);
        }
    }
    onChange=(value)=>{
        this.setState({ value });
        if(value.length>= 0){
            if(this.props.onChange){
                this.props.onChange(value);
            }
        }else{
            if(this.props.onChange){
                this.props.onChange(null);
            }
        }
    }
    componentWillUnmount(){
        this.getAddressFun();
    }
    render(){
        let val=[];
        if(this.state.value){
            val= this.state.value;
        }else{
            val = this.props.value?this.props.value:[];
        }
        let areaList = this.state.areaList? this.state.areaList:{};
        return(
            areaList.length > 0?(
                <div>
                    <Cascader className={this.props.className} options={areaList} value={val} placeholder="请选择地址" style={{ width: '100%'}} onChange={this.onChange}/>
                </div>
            ):''

        )
    }
}

export default AreaSelect;