var Reflux = require('reflux');

var CargoOwnerActions = Reflux.createActions([
    'retrieve',
    'retrieveStatistics',
    'retrieveInfo'
    // 'delete',
    // 'update',
    // 'create',
    // 'createDoor'
]);

module.exports = CargoOwnerActions;