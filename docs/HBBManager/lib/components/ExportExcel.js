
import React from 'react';
import { Button ,Modal,Icon } from 'antd';
var Common = require('../../../public/script/common');
var XLSUtil = require('./XLSUtil');

class ExportExcel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false
        }
    }

    // mixins: [XLSUtil()],

    // 导出数据异常的处理函数
    getErrMsg = (resolve) => {
        this.setState({loading:false});
        if (resolve.errCode && resolve.errCode === 'FILE70') {
            Common.warnMsg(`没有可以导出的信息!`);
            return;
        }
        Common.errMsg(`[${resolve.errCode}]导出Excel文件异常,${resolve.errDesc}`);
    }

    // 导出Excel方法
    onExcelExport= ()=> {
        // 当前模块名
        let module = this.props.module;

        // 获取url地址，当前操作为导出，action为'download'
        let url = XLSUtil.getActionUrl(module, 'download');
        if (url === '' || url == null) {
            Common.errMsg('导出Excel文件错误,参数url缺失!');
            return;
        }
        // 根据模块名获取Excel字段
        let fields  = XLSUtil.getFields(module, 'download');

        // 查询条件
        let filter = this.props.filter == null ? {} : this.props.filter;

        this.setState({loading:true});
        // 通过fetch的方式进行文件下载(发生错误时，可以通过Modal框提示)
         XLSUtil.downloadExcelFile(url, filter, fields, this.getErrMsg,this);

    }

    render () {
        return (
            
            <Button loading={this.state.loading} onClick={this.onExcelExport} className='btn-margin' title="导出" style={{width:65}}>
              导 出
              <Modal
                  visible={this.state.loading}
                  closable={false}
                  footer={null}
                  width='190px'
              >
                <div style={{margin:'0 auto',userSelect:'none'}}>
                  <Icon type="loading" style={{marginRight:8}}/> 导出中,请等待...
                </div>
  
              </Modal>
            </Button>
        )
    }
};

module.exports = ExportExcel;