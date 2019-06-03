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
    data.orderNo = '';
    data.billStatus = '';
  },
  
  getFilterFormRule: function (form, attrList) {
    let attrMap = FormUtil.getRuleObj(attrList);
    let rulesList = [
      { id: 'orderNo', desc: '运单编号',max: 20},
      { id: 'billStatus', desc: '状态',},
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
            <ExportExcel module='transport' filter={form.getFilter()}/>
          {/*<Button onClick={form.onImport}>导入</Button>*/}
        </div>,];
        {/*<Button type='primary' icon="plus" className='filter-add' onClick={form.onCreate}>新建</Button>*/}
    let selectCom = (
        <Select onChange={form.onSelectFilter} value={data.billStatus}>
          <Option value="">-请选择-</Option>
          <Option value="0">运输中</Option>
          <Option value="1">已完成</Option>
          <Option value="2">已取消</Option>
        </Select>
    );
    let listArray = [
      { key: 'orderNo', label: '运单编号', },
      { key: 'billStatus', label: '状态',component: selectCom},
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
    ];
    fieldList.map(item=>{
      if(typeof item === "string"){
        data[item] = '';
      }else{
        data[item[0]] = item[1];
      }
    })
  },
  // 初始化校验规则
  getCargoOriginFormRule() {
    return [
      { id: 'loadingCityName', desc: '始发地', required: true, max: 32},
      { id: 'loadingAddress', desc: '始发详细地址', required: true, max: 32},
      { id: 'unloadingProvinceName', desc: '目的地'},
      { id: 'unloadingAddress', desc: '目的详细地址'},
    ];
  },
  // 整合form列表  (不用了 2019/02/28)
  /**
   *  $this 为调用类的this
   *  data  为调用类的this.state.formData
   *  formType  为调用类要显示的form类型  分为 edit 可编辑 和  check 纯查看
  */
  getCargoOriginForm($this, data,formType='check', attrList) {
    let attr = FormUtil.getParam($this, attrList);
    let attrMap = attr.attrMap;
    // itemWidth ( 1,2,3,4 )每行分几个  labelCol  wrapperCol（文字和输入框的比例）
    let itemLayouts = {
          itemWidth: 2,
          labelCol: {span: 6},
          wrapperCol: {span: 10},
        };
    let hints = $this.state.hints;
    let props = {
      $this:$this,
      data,
      hints,
      itemLayouts,
      attrMap,
      formType
    };
    /**
     *  listArray 的属性列表
     *  key
     *  label 显示名称
     *  component 当前字段显示的组件，默认为Input
     *  other  表示不放在form里面  所有样式自己控制，比如按钮等
     *  layout  布局方式  合并上面定义的 itemLayouts
     */
    let makeTitle = (title)=>{
      return <div className='form-content-title'>{title}</div>
    }
    let listArray = [
      { key: 'title-1', other:makeTitle('个人信息')},
      { key: 'loadingCityName', label: '始发地'},
      { key: 'loadingAddress', label: '目的地'},
      { key: 'title-2', other:makeTitle('公司信息')},
      { key: 'unloadingProvinceName', label: '始发地1'},
      { key: 'unloadingAddress', label: '目的地2'},
    ];
    let items = FormUtil.getItems(props,listArray,formType);//3个必传！！
    // return FormUtils.adjuestForm(items, attr.showMap, colWidth);
    return FormUtil.adjuestForm(items, attr.showMap, colWidth);
  },
  
  /**
   *  table
  */
  tableViews: [
    {name: 'TransportTable', cols: ['orderNo', 'startLocation','destination','billStatus','createTime'], func: 'getSettledCompanyTableColumns'}
  ],
  getSettledCompanyTableColumns: function ($this) {
    return  [
      { title: '运单编号',
        dataIndex: 'orderNo',
        key: 'orderNo',
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
        dataIndex: 'billStatus',
        key: 'billStatus',
        width: 100,
        render(text, record, index){
          let prop = {
            status:'default',
            text:'暂无信息'
          };
          switch (record.billStatus){
            case '0':
              prop.status = 'processing';
              prop.text = '运输中';
            break;
            case '1':
              prop.status = 'success';
              prop.text = '已完成';
              break;
            case '2':
              prop.status = 'default';
              prop.text = '已取消';
              break;
          }
          return <Badge {...prop} />;
        }
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 150,
        sorter: true,
      },
    ];
  }
};

