let Reflux = require('reflux');
let TransportOrderActions = require('../action/TransportOrderActions');
let Utils = require('../../../../public/script/utils')
let Common = require('../../../../public/script/common');
// var MsgActions = require('../../../../lib/action/MsgActions');

var TransportOrderStore = Reflux.createStore({
  listenables: [TransportOrderActions],
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
    let url = this.getServiceUrl('waybill/getWayBillStatistic');
    Utils.doAjaxService(url, "").then((result) => {
      //成功
      let obj = result.object || {};
      $this.recordSet = obj;
      //执行方法
      $this.fireEvent('retrieveNum',$this);
    });
  },
  onRetrieveList(filter) {
    let $this = this;
    let url = this.getServiceUrl('waybill/getWayBillList');
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
    let url = this.getServiceUrl('waybill/getDetails');
    Utils.doAjaxService(url,filter).then((result) => {
      $this.recordSet = result.object || {};
      
      //执行方法
      $this.fireEvent('retrieveDetail',$this);
    });
  }
});

module.exports = TransportOrderStore;