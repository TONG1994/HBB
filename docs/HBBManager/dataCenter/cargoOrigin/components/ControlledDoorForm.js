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
    data.goodsNo = '';
    data.status = '';
  },
  
  getFilterFormRule: function (form, attrList) {
    let attrMap = FormUtil.getRuleObj(attrList);
    let rulesList = [
      { id: 'goodsNo', desc: '货源编号',max: 20},
      { id: 'status', desc: '状态',},
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
          <ExportExcel module='cargoOrigin' filter={form.getFilter()}/>
          {/*<Button onClick={form.onImport}>导入</Button>*/}
        </div>,];
        {/*<Button type='primary' icon="plus" className='filter-add' onClick={form.onCreate}>新建</Button>*/}
    let selectCom = (
        <Select onChange={form.onSelectFilter} value={data.status}>
          <Option value="">-请选择-</Option>
          <Option value="1">已发布</Option>
          <Option value="2">已成交</Option>
          <Option value="3">已失效</Option>
        </Select>
    );
    let listArray = [
      { key: 'goodsNo', label: '货源编号',  max: 20},
      { key: 'status', label: '状态',component: selectCom},
    ];
    let formItems = FormUtil.getFilterItems(props,listArray);
    formItems = [...formItems,...operaCom]
    return formItems;
  },
  /**
   *  form
  */
  // 初始化数据
  initCargoOriginForm($this,data) {
    //传入string为初始化值为"",传入数组初始值为第二项
    $this.state.hints = {};
    let fieldList = [
        'loadingProvinceName',
        'loadingCityName',
        'loadingCountyName',
        'loadingAddress',
        'unloadingProvinceName',
        'unloadingCityName',
        'unloadingCountyName',
        'unloadingAddress',
        ['carLength',0],
        'status',
        'loadingPlaceCode'
    ];
    fieldList.map(item=>{
      if(typeof item === "string"){
        data[item] = '';
      }else{
        data[item[0]] = item[1];
      }
    })
  },
  // 整合form列表  (不用了 2019/02/28)

  /**
   *  table
  */
  tableViews: [
    {name: 'SettledCompanyTable', cols: ['goodsNo', 'startLocation','destination','status','releaseTime'], func: 'getSettledCompanyTableColumns'}
  ],
  getSettledCompanyTableColumns: function ($this) {
    return  [
      { title: '货源编号',
        dataIndex: 'goodsNo',
        key: 'goodsNo',
        width: 160,
        render(text,record){
          return <a onClick={()=>$this.onClickGoodsNo(record)}>{ text }</a>;
        }
      },
      {
        title: '始发地',
        dataIndex: 'startLocation',
        key: 'startLocation',
        width: 220,
        render(text, record, index){
          let show = `${record.loadingProvinceName} ${record.loadingCityName} ${record.loadingCountyName}`;
          return <span>{ show }</span>;
        }
      },
      {
        title: '目的地',
        dataIndex: 'destination',
        key: 'destination',
        width: 220,
        render(text, record, index){
          let show = `${record.unloadingProvinceName} ${record.unloadingCityName} ${record.unloadingCountyName}`;
          return <span>{ show }</span>;
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render(text, record, index){
          let prop = {
            status:'default',
            text:'暂无信息'
          };
          switch (record.status){
            case '0':
              prop.status = 'default';
              prop.text = '未发布';
            break;
            case '1':
              prop.status = 'processing';
              prop.text = '已发布';
              break;
            case '2':
              prop.status = 'success';
              prop.text = '已成交';
              break;
            case '3':
              prop.status = 'error';
              prop.text = '已失效';
              break;
          }
          return <Badge {...prop} />;
        }
      },
      {
        title: '时间',
        dataIndex: 'releaseTime',
        key: 'releaseTime',
        width: 150,
        sorter: true,
      },
    ];
  },
  // 验证规则
  getCargoOriginFormRule: function (form, attrList)
  {
      let attrMap = FormUtil.getRuleObj(attrList);
      let rulesList = [
          { id: 'goodsTypeName', desc: '货物名称',allowSpecialChar:true,max: '11',...attrMap.goodsTypeName},
          { id: 'maxWeight', desc: '货品重量',allowSpecialChar:true, ...attrMap.maxWeight},
          { id: 'maxVolume', desc: '货品体积',allowSpecialChar:true, ...attrMap.maxWeight},
          { id: 'paymentMethod', desc: '支付方式',allowSpecialChar:true,max: '11',...attrMap.paymentMethod},
          { id: 'remark', desc: '备注',allowSpecialChar:true,max: '51',...attrMap.remark},
      ];
      return rulesList;
  },
};

