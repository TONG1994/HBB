'use strict';

/**
 * XLS配置文件
 * 格式为 'moduleName':{uploadUrl:'', downloadUrl:'', option:{}, uploadFields:[], downloadFields:[]}
 * moduleName为调用模块名，即父组件的名字
 * uploadUrl为上传地址
 * downloadUrl为导出地址
 * uploadFields为上传Excel文件的字段，一般要与服务端的字段保持一致，需要跟后台人员商量
 * downloadFields为导出Excel文件的字段，同上
 * option为扩展参数，目前只支持dataCheckUrl属性，该属性是指定检查Excel文件数据接口地址
 * 数据统计说明：在导入Excel之前，需要提示用户当前数据库中有多少条数据，Excel中有多少条数据，是否导入
 * 
 * 数据统计只在导入时才会进行
 * 始发地检查只有导入官方价格时生效
 * Excel数据检查返回的数据格式为{excelNum:"", databaseNum:"", isOrigin:"", countOrigin:""}
 * 
 * excelNum：当前Excel文件中的信息数量，如果为0，需要提示用户重新选择Excel文件
 * databaseNum：当前数据库中存在的信息数量
 * isOrigin：当前导入信息的始发地是否与当前机构所在地一直，值有两种，"true"和"false"，均为string类型
 * countOrigin：只有当isOrigin为"false"才有效，表示当前Excel一共有多少条事发地与当前所在地不一致的信息
 * */
module.exports = {
    // 账单明细
    cargoOwner:{
        downloadUrl:'user/exportShippersInfo',
        downloadFields:[
            {"id":"A", "name":"userCode", "title":"货主编号", "wdith":"30"},
            {"id":"B", "name":"trueName", "title":"用户姓名", "wdith":"25"},
            {"id":"C", "name":"phone", "title":"手机号", "wdith":"30"},
            {"id":"D", "name":"userType", "title":"状态", "wdith":"25"},
            {"id":"E", "name":"createTime", "title":"时间", "wdith":"20"},
        ]
    },
    driver:{
        downloadUrl:'user/exportDriveInfo',
        downloadFields:[
            {"id":"A", "name":"orderNo", "title":"用户编号", "wdith":"30"},
            {"id":"B", "name":"startLocation", "title":"用户姓名", "wdith":"25"},
            {"id":"C", "name":"destination", "title":"手机号", "wdith":"30"},
            {"id":"D", "name":"billStatus", "title":"状态", "wdith":"25"},
            {"id":"E", "name":"createTime", "title":"时间", "wdith":"20"},
        ]
    },
    cargoOrigin:{
        downloadUrl:'goods/getExportGoods',
        downloadFields:[
            {"id":"A", "name":"orderNo", "title":"货源编号", "wdith":"30"},
            {"id":"B", "name":"startLocation", "title":"始发地", "wdith":"25"},
            {"id":"C", "name":"destination", "title":"目的地", "wdith":"30"},
            {"id":"D", "name":"billStatus", "title":"状态", "wdith":"25"},
            {"id":"E", "name":"createTime", "title":"时间", "wdith":"20"},
        ]
    },
    transport:{
        downloadUrl:'waybill/getExportWayBill',
        downloadFields:[
            {"id":"A", "name":"orderNo", "title":"运单编号", "wdith":"30"},
            {"id":"B", "name":"startLocation", "title":"始发地", "wdith":"25"},
            {"id":"C", "name":"destination", "title":"目的地", "wdith":"30"},
            {"id":"D", "name":"billStatus", "title":"状态", "wdith":"25"},
            {"id":"E", "name":"createTime", "title":"时间", "wdith":"20"},
        ]
    },
    // 官方价格
    // officialPrice: {
    //     uploadUrl: 'logistics_price/upload-xls',
    //     downloadUrl: 'logistics_price/export-excel',
    //     option: {
    //         // 数据检查地址
    //         dataCheckUrl: 'logistics_price/upload-xls-inspect'
    //     },
    //     uploadFields: [
    //       {"id":"A","name":"logisticsCompanyUuid","title":"快递公司","opts":"jjjj","width":"10"},
    //       {"id":"B","name":"transportTypeUuid","title":"运输方式","opts":"bbbbb","width":"10"},
    //     ],
    //     downloadFields: [
    //         { "id": "A", "name": "logisticsCompanyName", "title": "快递公司", "width": "15" },
    //         { "id": "B", "name": "transportTypeName", "title": "运输方式", "width": "15" },
    //         { "id": "C", "name": "origin", "title": "始发地", "width": "15" },
    //         { "id": "D", "name": "destination", "title": "目的地", "width": "15" },
    //     ]
    // },

}