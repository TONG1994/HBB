/**
 *   司机管理
 *   Create by Malson on 2018/4/19
 */
'use strict';

import React from 'react';
import DrawerModal from './components/DriverModal';
import DictTable from '../../../lib/Components/DictTable';
import DriverActions from './action/DriverActions';
import DriverStore from './store/DriverStore';
import Filter from './components/Filter';
import FormUtil from '../../../lib/Components/FormUtil';
const FormDef = require('./components/DriverForm');
const tableName = 'DriverTable';


class DriverPage extends React.Component {
    constructor(props){
        super(props);
        this.state={
            driverSet: {
                recordSet:[],
                errMsg: '',
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
        this.state.driverSet.pageRow = (conf.page !== true) ? 10 : conf.pageRow;
        this.unsubcribe=DriverStore.listen(this.onServiceChange);
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
            let driverSet = {recordSet,errMsg:'',startPage:data.recordSet.startPage,pageRow:data.recordSet.pageRow,totalRow:data.recordSet.totalRow};
            this.setState({driverSet});
        }
        if(data.operation === 'retrieveStatistics'){
            let weekData = data.recordSet.weekCount;
            let monthData = data.recordSet.monthCount;
            let totalData = data.recordSet.sumCount;
            this.setState({weekData,monthData,totalData});
        }
    }

    handleQueryClick=() =>{
        let driverSet = this.state.driverSet;
        let obj =  this.Filter.getFilter()||{};
        obj.orderByType = this.state.tableSort;
        let {startPage,pageRow,totalRow} = driverSet;
        let filter = {
            startPage,
            pageRow,
            totalRow,
            object:obj
        }
        this.setState({loading:true});
        DriverActions.retrieve(filter);
        DriverActions.retrieveStatistics({});
    }
    onSearch= ()=> {
        this.handleQueryClick();
    }

    //司机详情
    onClickUserCode = (record={})=>{
        this.setState({showDrawer:true,editData:record,modalType:'detail'});
    }
    //关闭弹窗
    handleDrawerClose = ()=>{
        this.setState({showDrawer:false});
        this.handleQueryClick();
    }

    onTableRefresh = (current,pageRow)=>{
        this.state.driverSet.startPage = current;
        this.state.driverSet.pageRow = pageRow;
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
    // onAddModal = ()=>{
    //     this.setState({ modalType:true,actionType:'home' });
    // }
    render() {
        let { driverSet,showDrawer,modalType,editData} = this.state;
        let dataSource = driverSet.recordSet;
        let attrProps = {
            self: this,
            tableName: tableName,
            primaryKey: 'uuid',
            fixedTool: false,    // 固定按钮，不滚动
            btnPosition: 'top',
            tableForm: FormDef,
            editCol: false,
            editTable: false,
            defView: 'DriverTable',
            totalPage: this.state.driverSet.totalRow,
            currentPage: this.state.driverSet.startPage,
            onRefresh: this.onTableRefresh,
        };
        let drawerModalProps = {
            showDrawer,
            modalType,
            editData,
            handleClose:this.handleDrawerClose
        };
        return (
            <div className="grid-page">
              <DrawerModal {...drawerModalProps} />
              <div className='data-list-box'>
                <div className='list'>
                  <div>本周新增</div>
                  <div className='num-show'>{this.state.weekData != ''?this.state.weekData+'个':''}</div>
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

              {/*<AddDoorModal ref={ref => this.AddDoorModal = ref} {...addDoorModalProps}/>*/}
            </div>
        );
    }
}

module.exports = DriverPage;