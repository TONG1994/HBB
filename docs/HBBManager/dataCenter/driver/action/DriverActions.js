var Reflux = require('reflux');

var CargoOwnerActions = Reflux.createActions([
    'retrieve',
    'retrieveStatistics',
    'retrieveInfo',
    'getInfo',
    // 'delete',
    'updateInfo',
    // 'create',
    // 'createDoor'
    'userBlack',//拉黑
    'relieveUserBlacklist',//取消拉黑

]);

module.exports = CargoOwnerActions;