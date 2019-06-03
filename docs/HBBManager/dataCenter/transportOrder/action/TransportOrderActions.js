var Reflux = require('reflux');

var ExpressActions = Reflux.createActions([
    'retrieveNum',
    'retrieveList',
    'retrieveDetail',
]);

module.exports = ExpressActions;