/**
 * Excel工具类
 * @creator gypsy
 * @date 2018/5/9
 * 在使用这个工具类前需要在XLSConfig中配置信息
 */
'use strict';
import  Utils from '../../../public/script/utils';
import XLSConfig from './XLSConfig';
var Common = require('../../../public/script/common');
var type = Common.getUserType();
let $ = require('jquery');
module.exports = {

        // 获取地址 action：upload(导入) download(导出) check(数据检查)
        getActionUrl:function(module, action){
            // 从XLSConfig文件中获取配置信息
            let config = XLSConfig[module];
            if(config == null){
                return '';
            }
    
            if(action === 'upload'){
                return config.uploadUrl == null || config.uploadUrl === '' ?  '' 
                       :  Common.getOriginUrl() + config.uploadUrl;
            }
            
            if(action === 'download'){
                return config.downloadUrl == null || config.downloadUrl === '' ?  '' 
                :  Common.getOriginUrl() + config.downloadUrl;
            }
    
            if(action === 'check'){
                if(config.option != null){
                    return config.option.dataCheckUrl == null || config.option.dataCheckUrl === '' ?  '' 
                    :  Common.getOriginUrl() + config.option.dataCheckUrl;
                }else{
                    return '';
                }
            }
            
            return '';
        },
    
        // 获取Excel文件字段  action：upload(导入) download(导出) check(数据检查)
        getFields:function(module, action, filter){

            // 从XLSConfig文件中获取配置信息
            let config  = XLSConfig[module];
    
            if(config == null){
                return [];
            }
    
            // 导入和数据检查用同一套字段
            if(action === 'upload' || action === 'check'){
                //TODO上传
                // if(type==1){//总部
                //   return config.uploadFields ? config.uploadFields : [];
                // }else if(type==2){//经营中心
                //   if(filter==='1'){ //直营
                //     return config.directBusinessUpload?config.directBusinessUpload:[];
                //   }else if(filter==='2'){//加盟
                //     return config.operateJoinUpload?config.operateJoinUpload:[];
                //   }
                //     return config.uploadFields ? config.uploadFields : [];
                // }
                
            }
    
            if(action === 'download') {
                return config.downloadFields == null ? [] : config.downloadFields;
            }
        },

        // 使用fetch方式处理文件流
        downloadExcelFile: function (url, filter, fields, callback,$this) {
            let data = filter;
            this._doExportExcelFile(url, data, fields, callback,$this);
        },

        _doExportExcelFile: function(url, data, fields, callback,$this){
            // 参数预处理，data为查询条件，fields为需要导出的Excel字段
            let params = {'data': data};
            Utils.downloadExcelFile(url, params, callback,$this);
        },

         // 使用fetch方式处理文件流(params是object)
         downloadExcelFile2: function (url, filter, fields, callback,$this) {
            let data = filter;
            this._doExportExcelFile2(url, data, fields, callback,$this);
        },

        _doExportExcelFile2: function(url, data, fields, callback,$this){
            // 参数预处理，data为查询条件，fields为需要导出的Excel字段
            let params = {'object': data, 'fields': fields};
            Utils.downloadExcelFile(url, params, callback,$this);
        },

        // 使用隐藏Form的方式处理文件流
        downloadExcelByForm: function(url, filter, fields){
            // 参数预处理，data为查询条件，fields为需要导出的Excel字段
            let data = {'data':filter, 'fields':fields};
            let params = {
                'flowNo':'0',
                'term':'web',
                'corp':'',
                'object':data
            }

            if (typeof (window.loginData) !== 'undefined') {
                let compUser = window.loginData.compUser;
                params.corp = (compUser === null) ? '' : compUser.corpUuid;
            }
            this._downloadExcelByForm(url, params);
        },

        _downloadExcelByForm: function(url, params){
            let $iframe = $('<iframe id="down-file-iframe"/>');
            let $form = $('<form target="down-file-iframe" method="post"/>');
            let $input = $('<input type="hidden" name="reqObject" />');
            let value = JSON.stringify(params);
            $input.attr('value', value);
            $form.append($input);
            $form.attr('action', url);
            $iframe.append($form);
            $(document.body).append($iframe);
            $form[0].submit();
            $iframe.remove();
        }

}