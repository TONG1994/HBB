/**
 *   货源管理
 *   Create by Malson on 2018/4/19
 */
'use strict';

import React from 'react';
import {Button} from 'antd';
import DictTable from '../../../lib/Components/DictTable';
import ControlledDoorActions from './action/ControlledDoorActions';
import ControlledDoorStore from './store/ControlledDoorStore';
import Filter from './components/Filter';
import FormUtil from '../../../lib/Components/FormUtil';
import DrawerModal from './components/CargoOriginModal';
const tableName = 'SettledCompanyTable';
const FormDef = require('./components/ControlledDoorForm');


class CargoOriginPage extends React.Component {
  constructor(props){
    super(props);
    this.state={
      controlledDoorSet: {
        recordSet:[],
        errMsg: '',
        startPage:1,
        pageRow:10,
        totalRow:0,
      },
      statisticsNum:{
        monthNumber:'',
        totalNumber:'',
        weekNumber:''
      },
      tableSort:'0',
      loading: false,
      showDrawer:false,
      modalType:'',
      editData:{}
    }
  }
  //处理数据返回
  onHandleService = (data)=>{
    //查询列表
    this.state.loading && this.setState({loading:false});
    if(data.operation === 'retrieveList'){
      let recordSet = data.recordSet;
      let {startPage,pageRow,totalRow} = data;
      let controlledDoorSet = {...this.state.controlledDoorSet,...{recordSet,startPage,pageRow,totalRow}};
      this.setState({controlledDoorSet});
    }else if(data.operation === 'retrieveNum'){
      let statisticsNum = data.recordSet;
      this.setState({statisticsNum});
    }
  }
  doHandleRetrieve = ()=>{
    let controlledDoorSet = this.state.controlledDoorSet;
    let {startPage,pageRow,totalRow} = controlledDoorSet;
    let filterData =  this.Filter.getFilter() || {};
    filterData.orderByType = this.state.tableSort;
    let filter = {
      startPage,
      pageRow,
      totalRow,
      object:filterData
    }
    this.setState({loading:true});
    ControlledDoorActions.retrieveList(filter);
    ControlledDoorActions.retrieveNum();
  }
  componentDidMount(){
    this.server = ControlledDoorStore.listen(this.onHandleService);
    let conf = FormUtil.getTableConf(tableName);
    this.state.controlledDoorSet.pageRow = (conf.page !== true) ? 10 : conf.pageRow;
    this.doHandleRetrieve();
  }
  componentWillUnmount(){
    this.server();
  }
  
  addDoor = () => {
  }
  
  goBack = ()=>{
  }
  
  onTableRefresh = (current, pageRow)=>{
    this.state.controlledDoorSet.startPage = current;
    this.state.controlledDoorSet.pageRow = pageRow;
    this.doHandleRetrieve();
  }
  onTableChange = (pagination, filters, sorter)=>{
    let sort = sorter.order === 'ascend'? '1': '0';
    let tableSort = this.state.tableSort;
    if(sort === tableSort){
      return;
    }else{
      this.state.tableSort = sort;
      this.doHandleRetrieve();
    }
  }
  onAddModal = ()=>{
  }
  //查询
  onFilterSearch = ()=>{
    this.doHandleRetrieve();
  }
  //订单详情
  onClickGoodsNo = (record={})=>{
    this.setState({showDrawer:true,modalType:'detail'});
    let uuid = record.uuid;
    ControlledDoorActions.retrieveDetail({
      uuid
    })
  }
  //关闭弹窗
  handleDrawerClose = ()=>{
    this.setState({showDrawer:false});
    this.doHandleRetrieve();
  }
  render() {
    let { controlledDoorSet,showDrawer,modalType,editData } = this.state;
    let dataSource = controlledDoorSet.recordSet;
    let attrProps = {
      self: this,
      tableName: tableName,
      primaryKey: 'uuid',
      fixedTool: false,    // 固定按钮，不滚动
      btnPosition: 'top',
      tableForm: FormDef,
      defView: 'SettledCompanyTable',
      totalPage: this.state.controlledDoorSet.totalRow,
      currentPage: this.state.controlledDoorSet.startPage,
      onRefresh: this.onTableRefresh,
    };
    let statisticsNum = this.state.statisticsNum;
    let drawerModalProps = {
      showDrawer,
      modalType,
      editData,
      handleClose:this.handleDrawerClose
    };
    return (
        <div className="grid-page">
          {/*<Button onClick={this.onShowDetail}>抽屉</Button>*/}
          <DrawerModal {...drawerModalProps} />
          <div className='data-list-box'>
            <div className='list'>
              <div>本周新增</div>
              <div className='num-show'>{statisticsNum.weekNumber!==''?statisticsNum.weekNumber+' 个':''}</div>
            </div>
            <div className='list'>
              <div>本月新增</div>
              <div className='num-show'>{statisticsNum.monthNumber!==''?statisticsNum.monthNumber+' 个':''}</div>
        </div>
            <div className='list'>
              <div>总数</div>
              <div className='num-show'>{statisticsNum.totalNumber!==''?statisticsNum.totalNumber+' 个':''}</div>
            </div>
          </div>
              <div key='1' className='table-box'>
                <Filter ref={ref => this.Filter = ref} onFilterSearch = {this.onFilterSearch} doHandleRetrieve = {this.doHandleRetrieve} />
                <DictTable
                    dataSource={dataSource}
                    loading={this.state.loading}
                    attrs={ attrProps }
                    onChange = {this.onTableChange}
                />
              </div>
        </div>
    );
  }
}

module.exports = CargoOriginPage;