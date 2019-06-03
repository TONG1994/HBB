/**
 *   货主管理
 *   Create by Malson on 2018/4/19
 */
'use strict';

import React from 'react';
import DrawerModal from './components/CargoOwnerModal';
import DictTable from '../../../lib/Components/DictTable';
import CargoOwnerActions from './action/CargoOwnerActions';
import CargoOwnerStore from './store/CargoOwnerStore';
import Filter from './components/Filter';
import FormUtil from '../../../lib/Components/FormUtil';
const FormDef = require('./components/CargoOwnerForm');
const tableName = 'CargoOwnerTable';

class CargoOwnerPage extends React.Component {
    constructor(props){
        super(props);
        this.state={
            cargoOwnerSet: {
                recordSet:[],
                errMsg : '',
                startPage:1,
                pageRow:10,
                totalRow:0,
            },
            loading: false,
            weekData:'',
            monthData:'',
            totalData:'',
            showDrawer:false,
            modalType:'',
            editData:{}

        }
    }
    componentDidMount(){
        let conf = FormUtil.getTableConf(tableName);
        this.state.cargoOwnerSet.pageRow = (conf.page !== true) ? 10 : conf.pageRow;
        this.unsubcribe=CargoOwnerStore.listen(this.onServiceChange);
        this.handleQueryClick();
    }
    onServiceChange = (data) => {
        this.setState({loading:false});
        if(data.errMsg){
            this.setState({errMsg:data.errMsg});
            return;
        }
        if (data.operation === 'retrieve') {
            let recordSet = data.recordSet.list;
            let cargoOwnerSet = {recordSet,errMsg:'',startPage:data.recordSet.startPage,pageRow:data.recordSet.pageRow,totalRow:data.recordSet.totalRow};
            this.setState({cargoOwnerSet});
        }
        if(data.operation === 'retrieveStatistics'){
            let weekData = data.recordSet.weekCount;
            let monthData = data.recordSet.monthCount;
            let totalData = data.recordSet.sumCount;
            this.setState({weekData,monthData,totalData});
        }
    }

    handleQueryClick=() =>{
        let cargoOwnerSet = this.state.cargoOwnerSet;
        let obj =  this.Filter.getFilter()||{};
        obj.orderByType = this.state.tableSort;
        let {startPage,pageRow,totalRow} = cargoOwnerSet;
        let filter = {
            startPage,
            pageRow,
            totalRow,
            object:obj
        }
        this.setState({loading:true});
        CargoOwnerActions.retrieve(filter);
        CargoOwnerActions.retrieveStatistics({});
    }
    onSearch= ()=> {
        this.handleQueryClick();
    }
    //货主详情
    onClickUserCode = (record={},modalType)=>{
        if(!modalType){
            modalType = 'detail'
        }
        this.setState({showDrawer:true,editData:record,modalType:modalType});
    }
    //关闭弹窗
    handleDrawerClose = ()=>{
        this.setState({showDrawer:false});
        this.handleQueryClick();
    }
    onTableRefresh = (current,pageRow)=>{
        this.state.cargoOwnerSet.startPage = current;
        this.state.cargoOwnerSet.pageRow = pageRow;
        this.handleQueryClick();
    }
    onTableChange = (pagination, filters, sorter)=>{
        let sort = sorter.order === 'ascend'? '1': '0';
        let tableSort = this.state.tableSort;
        if(sort === tableSort){
            return;
        }else{
            this.state.tableSort = sort;
            this.handleQueryClick();
        }
    }
    render() {
        let { cargoOwnerSet,showDrawer,modalType,editData} = this.state;
        let dataSource = cargoOwnerSet.recordSet;
        let attrProps = {
            self: this,
            tableName: tableName,
            primaryKey: 'uuid',
            fixedTool: false,    // 固定按钮，不滚动
            btnPosition: 'top',
            tableForm: FormDef,
            editCol: false,
            editTable: false,
            defView: 'CargoOwnerTable',
            totalPage: this.state.cargoOwnerSet.totalRow,
            currentPage: this.state.cargoOwnerSet.startPage,
            onRefresh: this.onTableRefresh,
        };
        let drawerModalProps = {
            showDrawer,
            modalType,
            editData,
            handleClose:this.handleDrawerClose,
            onClickUserCode:this.onClickUserCode

        };
        return (
            <div className="grid-page">
                <DrawerModal {...drawerModalProps} />
              <div className='data-list-box'>
                <div className='list'>
                  <div>本周新增</div>
                  <div className='num-show'>{this.state.weekData!= ''?this.state.weekData+'个':''}</div>
                </div>
                <div className='list'>
                  <div>本月新增</div>
                  <div className='num-show'>{this.state.monthData!= ''?this.state.monthData+'个':''}</div>
                </div>
                <div className='list'>
                  <div>总人数</div>
                  <div className='num-show'>{this.state.totalData!= ''?this.state.totalData+'个':''}</div>
                </div>
              </div>
                <div key='1' className='table-box'>
                  <Filter ref={ref => this.Filter = ref} onFilterSearch = {this.onSearch} doHandleRetrieve = {this.handleQueryClick}/>
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

module.exports = CargoOwnerPage;