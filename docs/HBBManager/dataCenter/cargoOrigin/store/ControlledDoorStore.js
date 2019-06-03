let Reflux = require('reflux');
let ControlledDoorActions = require('../action/ControlledDoorActions');
let Utils = require('../../../../public/script/utils')
let Common = require('../../../../public/script/common');
// var MsgActions = require('../../../../lib/action/MsgActions');

var ProductStore = Reflux.createStore({
  listenables: [ControlledDoorActions],
  filter: {},
  recordSet: [],
  startPage: 0,
  pageRow: 0,
  totalRow: 0,
  
  getServiceUrl(action) {
    return Common.getOriginUrl() + action;
  },
  
  fireEvent(operation, self,errMsg) {
    self.trigger({
      filter: self.filter,
      recordSet: self.recordSet,
      startPage: self.startPage,
      pageRow: self.pageRow,
      totalRow: self.totalRow,
      operation: operation,
      errMsg: errMsg,
    });
    
    // MsgActions.showError('sender', operation, errMsg);
  },
  onRetrieveNum() {
    let $this = this;
    let url = this.getServiceUrl('goods/queryGoodsStatistics');
    Utils.doAjaxService(url, {}).then((result) => {
      //成功
      let obj = result.object || {};
      $this.recordSet = obj;
      //执行方法
      $this.fireEvent('retrieveNum',$this);
    });
  },
  onRetrieveList(filter) {
    let $this = this;
    let url = this.getServiceUrl('goods/queryGoodsList');
    Utils.doRetrieveService(url, filter.object,filter.startPage,filter.pageRow,filter.totalRow).then((result) => {
      //成功
      let obj = result.object || {};
      $this.recordSet = obj.list || [];
      $this.startPage = obj.startPage;
      $this.pageRow = obj.pageRow;
      $this.totalRow = obj.totalRow;
      $this.filter = filter;
      //执行方法
      $this.fireEvent('retrieveList',$this);
    });
  },
  onRetrieveDetail: function (filter) {
    let $this = this;
    let url = this.getServiceUrl('goods/queryGoodsDetails');
    Utils.doAjaxService(url,filter).then((result) => {
      $this.recordSet = result.object || {};
      
      //执行方法
      $this.fireEvent('retrieveDetail',$this);
    });
  },
  onGetInfo(filter) {
      let $this = this;
      //  let url = this.getServiceUrl('dictionary/getAllVehicleInformation');
      let url = '/hbbclient_s/dictionary/getAllVehicleInformation';
      Utils.doAjaxService(url,filter).then((result) => {
          //成功
          $this.recordSet = result.object || [];
          $this.filter = filter;
          //执行方法
          $this.fireEvent('getAllVehicleInformation',$this);
      },(result='')=>{
      });
  },
    //省市区查询
  onGetAddress(){
      let $this = this;
      let url = this.getServiceUrl('provinceCityRegion/getAllProvinceCityRegion');
      Utils.doAjaxService(url,{}).then((result) => {
          $this.recordSet = result.object || {};

          //执行方法
          $this.fireEvent('getAllProvinceCityRegion',$this);
      });
  },
    //修改货源信息
    onUpdateInfo: function (filter) {
        let $this = this;
         let url = this.getServiceUrl('goods/updateGoods');
        Utils.doAjaxService(url, filter,true).then((result) => {
            $this.recordSet = result.object || {};
            //执行方法
            $this.fireEvent('updateGoods',$this);
        },(result)=>{
            //上面最后一个参数传入true时需要   其他时候不需要这个方法   错误公共处理
            let errMsg = result.errDesc || "错误";
            $this.fireEvent('updateGoods',$this,'接口返回错误提示');
        });
    },
});

module.exports = ProductStore;