var Reflux = require('reflux');
var CargoOwnerActions = require('../action/DriverActions');
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

    onRetrieveStatistics(filter) {
        let $this = this;
        let url = this.getServiceUrl('user/driverStatistics');
        Utils.doAjaxService(url,filter).then((result) => {
            //成功
            $this.recordSet = result.object || [];
            $this.filter = filter;
            //执行方法
            $this.fireEvent('retrieveStatistics',$this);
        },(result='')=>{
            //上面最后一个参数传入true时需要，表明自己处理错误信息   其他时候不需要这个方法   错误公共处理
            // let errMsg = result.errDesc || "错误";
            // $this.fireEvent('retrieve',$this,errMsg);
        });
    },
    onRetrieve: function (filter) {
        let $this = this;
        let url = this.getServiceUrl('user/queryDriverList');
        Utils.doRetrieveService(url, filter.object,filter.startPage,filter.pageRow,filter.totalRow).then((result) => {
            //成功
            $this.recordSet = result.object || [];
            $this.filter = filter;
            //执行方法
            $this.fireEvent('retrieve',$this);
        });
    },
    onRetrieveInfo(filter) {
        let $this = this;
        let url = this.getServiceUrl('user/userDetails');
        Utils.doAjaxService(url,filter).then((result) => {
            //成功
            $this.recordSet = result.object || [];
            $this.filter = filter;
            //执行方法
            $this.fireEvent('retrieveInfo',$this);
        },(result='')=>{
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
            $this.fireEvent('getInfo',$this);
        },(result='')=>{
        });
    },
    //拉黑
    onUserBlack: function (filter) {
        let $this = this;
        let url = this.getServiceUrl('user/userBlacklist');
        Utils.doAjaxService(url,filter).then((result) => {
            //成功
            $this.recordSet = result.object || [];
            $this.filter = filter;
            //执行方法
            $this.fireEvent('userBlacklist',$this);
        },(result='')=>{
        });
    },
    //取消拉黑
    onRelieveUserBlacklist(filter) {
        let $this = this;
        let url = this.getServiceUrl('user/relieveUserBlacklist');
        Utils.doAjaxService(url,filter).then((result) => {
            //成功
            $this.recordSet = result.object || [];
            $this.filter = filter;
            //执行方法
            $this.fireEvent('relieveUserBlacklist',$this);
        },(result='')=>{
        });
    },
  // onDelete: function (filter) {
  //   let $this = this;
  //   let type = filter.type;
  //   let url = this.getServiceUrl(`${type}/remove`);
  //   Utils.doAjaxService(url, filter.uuid).then((result) => {
  //     //成功
  //     $this.recordSet = result.object || [];
  //     $this.filter = filter;
  //     //执行方法
  //     $this.fireEvent('delete',$this);
  //   },(result)=>{
  //     //上面最后一个参数传入true时需要   其他时候不需要这个方法   错误公共处理
  //     let errMsg = result.errDesc || "错误";
  //     $this.fireEvent('delete',$this,errMsg);
  //   });
  // },
  // onCreate: function (filter) {
  //   let $this = this;
  //   let type = filter.type;
  //   let url = this.getServiceUrl(`${type}/create`);
  //   Utils.doAjaxService(url, filter.data).then(() => {
  //     //执行方法
  //     $this.fireEvent('create',$this);
  //   },(result)=>{
  //     //上面最后一个参数传入true时需要   其他时候不需要这个方法   错误公共处理
  //     let errMsg = result.errDesc || "错误";
  //     $this.fireEvent('create',$this,errMsg);
  //   });
  // },
  onUpdateInfo: function (filter) {
    let $this = this;
  //  let url = this.getServiceUrls('user/update');
    let url = '/hbbclient_s/user/update';
    Utils.doAjaxService(url, filter,true).then((result) => {
      //执行方法
      $this.fireEvent('update',$this);
    },(result)=>{
      //上面最后一个参数传入true时需要   其他时候不需要这个方法   错误公共处理
      let errMsg = result.errDesc || "错误";
      $this.fireEvent('update',$this,'接口返回错误提示');
    });
  },


});

module.exports = CargoOwnerStore;