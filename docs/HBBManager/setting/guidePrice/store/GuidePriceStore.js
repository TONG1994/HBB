var Reflux = require('reflux');
var CargoOwnerActions = require('../action/GuidePriceActions');
var Utils = require('../../../../public/script/utils');
import Common from '../../../../public/script/common';
// var MsgActions = require('../../../../lib/action/MsgActions');

var CargoOwnerStore = Reflux.createStore({
  listenables: [CargoOwnerActions],
  filter: {},
  recordSet: [],
  startPage: 0,
  pageRow: 0,
  totalRow: 0,
  
  init: function () {
  },
  getServiceUrl: function (action) {
    return Common.getOriginUrl() + action;
  },
  
  fireEvent: function (operation, self,errMsg) {
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

  onRetrieve: function (filter) {
      let $this = this;
      let url = this.getServiceUrl('guide/select');
      Utils.doAjaxService(url,filter).then((result) => {
          //成功
          $this.recordSet = result.object || [];
          $this.filter = filter;
          //执行方法
          $this.fireEvent('retrieveGuide',$this);
      },(result='')=>{
      });
  },
  onCreate: function (filter) {
    let $this = this;
    let url = this.getServiceUrl(`guide/create`);
    Utils.doAjaxService(url, filter).then(() => {
      //执行方法
      $this.fireEvent('create',$this);
    },(result)=>{
      //上面最后一个参数传入true时需要   其他时候不需要这个方法   错误公共处理
      let errMsg = result.errDesc || "错误";
      $this.fireEvent('create',$this,errMsg);
    });
  },

});

module.exports = CargoOwnerStore;