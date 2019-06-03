'use strict';
import React from 'react';
import { Radio, Icon, Button, Row, Col,Badge,Select } from 'antd';
import FormUtil from '../../../../lib/Components/FormUtil';
import ExportExcel from '../../../lib/Components/ExportExcel'

const RadioGroup = Radio.Group;
const Option = Select.Option;

let colWidth = [6, 12, 18, 24];

module.exports = {
  /**
   *  filter
  */
  
  initFilterForm(data) {
    data.userCode = '';
    data.userType = '';
  },
  
  getFilterFormRule: function (form, attrList) {
    let attrMap = FormUtil.getRuleObj(attrList);
    let rulesList = [
      { id: 'userCode', desc: 'xxx',},
      { id: 'userType', desc: 'xx',},
    ];
    return rulesList;
  },
  
  getFilterForm: function (form, data, attrList) {
    
    let attr = FormUtil.getParam(form, attrList);
    let attrMap = attr.attrMap;
    let itemLayouts = FormUtil.getFromSpan()[1];
    let hints = form.state.hints;
    let props = {
      $this:form,
      data,
      hints,
      itemLayouts,
      attrMap
    };
    const operaCom = [
        <div className='table-operation' key='operation'>
          <span className='filter-reset'><a onClick={form.onReset}>重置</a></span>
          <Button type='primary' onClick={form.onSearch}>查询</Button>
          <ExportExcel module='driver' filter={form.getFilter()}/>
          {/*<Button onClick={form.onImport}>导入</Button>*/}
        </div>,
        <Button type='primary' icon="plus" className='filter-add' onClick={form.onCreate} style={{display:'none'}}>新建</Button>
    ];
    let selectCom = (
        <Select onChange={form.onSelectFilter} value={data.userType}>
          <Option value="">-请选择-</Option>
          <Option value="20">未审核</Option>
          <Option value="21">审核中</Option>
          <Option value="22">审核通过</Option>
          <Option value="24">不通过</Option>
          <Option value="23">已拉黑</Option>
        </Select>
    );
    let listArray = [
      { key: 'userCode', label: '用户编号', },
      { key: 'userType', label: '状态',component: selectCom},
    ];
    let formItems = FormUtil.getFilterItems(props,listArray);
    formItems = [...formItems,...operaCom]
    return formItems;
  },
  

  /**
   *  table
  */
  tableViews: [
    {name: 'DriverTable',  cols: ['userCode', 'trueName', 'phone','userType','createTime'], func: 'getDriverTableColumns'}
  ],
  getDriverTableColumns: function ($this) {
    return  [
      { title: '用户编号',
        dataIndex: 'userCode',
        key: 'userCode',
        width: 200,
        render(text,record){
          return <a onClick={()=>$this.onClickUserCode(record)}>{ text }</a>;
        }
      },
      {
        title: '用户姓名',
        dataIndex: 'trueName',
        key: 'trueName',
        width: 200
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'userType',
        key: 'userType',
        width: 200,
          render(val){
              let text = '',status='default';
              if(val == '20'){
                  text = '未审核';
                  status='default'
              }else if(val == '21'){
                  text = '审核中';
                  status='processing'
              }else if(val == '22'){
                  text = '审核通过';
                  status='success'
              }else if(val == '24'){
                  text = '不通过';
                  status='error'
              }else if(val == '23'){
                  text = '已拉黑';
                  status='error'
              }
              return <Badge status={status} text={text} />;
          }
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 200,
        sorter: true,
      },
    ];
  },
    /**
     *  form
     */
    // 初始化数据
    initDriverForm($this,data) {
        //传入string为初始化值为"",传入数组初始值为第二项
        $this.state.hints = {};
        let fieldList = [
            'trueName',
            'phone',
            'idCard',
            'userType',
            'plateNumber',
            'vehicleType',
            'vehicleLength',
            'driverLicense',
            'driverLicenseCreatedate',
            'driverLicenseTerm',
            'drivingLicenseEnginecode',
            'drivingLicenseUpddate',
        ];
        fieldList.map(item=>{
            if(typeof item === "string"){
                data[item] = '';
            }else{
                data[item[0]] = item[1];
            }
        })
    },
    // 验证规则
    getDriverFormRule: function (form, attrList)
    {
        let attrMap = FormUtil.getRuleObj(attrList);
        let rulesList = [
            { id: 'plateNumber', desc: '车牌号',required: true, ...attrMap.plateNumber},
            { id: 'driverLicense', desc: '驾驶证号',required: true, ...attrMap.driverLicense},
            { id: 'drivingLicenseEnginecode', desc: '发动机号',required: true, ...attrMap.drivingLicenseEnginecode},
            { id: 'driverLicenseCreatedate', desc: '初次领证日期',required: true, ...attrMap.driverLicenseCreatedate},
            { id: 'driverLicenseTerm', desc: '有效期至',required: true, ...attrMap.driverLicenseTerm},
            { id: 'drivingLicenseUpddate', desc: '注册日期',required: true, ...attrMap.drivingLicenseUpddate},
        ];
        return rulesList;
    },
};

