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
          <Button type='primary' onClick={form.onSearch} style={{width:65}}>查询</Button>
          <ExportExcel module='cargoOwner' filter={form.getFilter()}/>
        </div>,
        <Button type='primary' icon="plus" className='filter-add' onClick={form.onCreate} style={{display:'none'}}>新建</Button>
    ];
    let selectCom = (
        <Select onChange={form.onSelectFilter} value={data.userType}>
          <Option value="">-请选择-</Option>
          <Option value="10">未审核</Option>
          <Option value="11">审核中</Option>
          <Option value="12">审核通过</Option>
          <Option value="14">不通过</Option>
          <Option value="13">已拉黑</Option>
        </Select>
    );
    let listArray = [
      { key: 'userCode', label: '货主编号', },
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
    {name: 'CargoOwnerTable', cols: ['userCode', 'trueName', 'phone','userType','createTime'], func: 'getCargoOwnerTableColumns'}
  ],
  getCargoOwnerTableColumns: function ($this) {
    return  [
      { title: '货主编号',
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
          let text = '',status = 'default';
          if(val == '10'){
              text = '未审核';
              status='default'
          }else if(val == '11'){
              text = '审核中';
              status='processing'
          }else if(val == '12'){
              text = '审核通过';
              status='success'
          }else if(val == '14'){
              text = '不通过';
              status='error'
          }else if(val == '13'){
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
    initCargoOwnerForm($this,data) {
        //传入string为初始化值为"",传入数组初始值为第二项
        $this.state.hints = {};
        let fieldList = [
            'trueName',
            'phone',
            'idCard',
            'userType',
            'businessLicenseOwner',
            'businessLicenseCredit',
            'businessLicenseName',
            'businessLicenseAddr',
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
    getCargoOwnerFormRule: function (form, attrList)
    {
        let attrMap = FormUtil.getRuleObj(attrList);
        let rulesList = [
            { id: 'businessLicenseOwner', desc: '法定代表人',required: true, ...attrMap.businessLicenseOwner},
            { id: 'businessLicenseCredit', desc: '社会信用代码',required: true, ...attrMap.businessLicenseCredit},
            { id: 'businessLicenseName', desc: '公司名称',required: true, ...attrMap.businessLicenseName},
            { id: 'businessLicenseAddr', desc: '公司地址',required: true,allowSpecialChar:true, ...attrMap.businessLicenseAddr},
        ];
        return rulesList;
    },

};

