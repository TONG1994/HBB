var Reflux = require('reflux');

var ExpressActions = Reflux.createActions([
    'retrieveNum',
    'retrieveList',
    'retrieveDetail',
    'getInfo',
    'getAddress',//获取省市区
    'updateInfo'//修改货源
]);

module.exports = ExpressActions;