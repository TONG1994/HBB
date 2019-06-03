import {Modal,message} from 'antd';
let $ = require('jquery');
let Promise = require('promise');
let fetch = require('isomorphic-fetch');
let Common = require('../../public/script/common');


module.exports = {
    initConf: function(conf) {
        this.hostList = [];
        for (var name in conf) {
            try {
                var value = conf[name];
                this[name] = value;
            } catch (E) {}
        }
    },
    loginService: function(url, data) {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
          var record = {
           flowNo: self.getFlowNo(),
            term: 'web',
            object: data
          };
          
          $.ajax({
            type: 'post',
            url: url,
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(record),
            dataType: 'json',
            success: function(result, status, xhr) {
              self.saveSessionID(result, self);
            },
            xhrFields: {
              withCredentials: true
            },
            crossDomain: true
          }).done(resolve).fail(reject);
        });
        
        return promise;
      },
    sessionID: '',
    saveSessionID: function(result, self) {
        if (result.errCode == null || result.errCode == '' || result.errCode == '000000') {
            self.sessionID = result.object.sessionId;
            // window.sessionStorage.setItem('sessionID', self.sessionID);
            // window.localStorage.setItem('sessionID', self.sessionID);
            // window.localStorage.setItem('ssoToken', result.object.ssoToken);
        }
    },
    getSessionID: function() {
        if (this.sessionID === '') {
            this.sessionID = window.sessionStorage.getItem('sessionID');
        }

        return this.sessionID;
    },
    fz_setCookie: function(name, value, daysExpire) {
        var e = '';
        if (daysExpire) {
            var expires = new Date();
            expires.setTime(expires.getTime() + 1000 * 60 * 60 * 24 * daysExpire);
            e = ';expires=' + expires.toGMTString();
        }

        document.cookie = name + '=' + ((value == null) ? '' : escape(value)) + e + ';path=/';
    },
    getFlowNo: function() {
        var id = window.sessionStorage.getItem('serialID');
        if (id) {
            id = '' + (parseInt(id) + 1);
        } else {
            id = '100000';
        }

        window.sessionStorage.setItem('serialID', id);
        return id;
    },
    ajaxBody: function(url, data, self) {
        let token = window.sessionStorage.getItem('TOKEN') || '';
        data.term = 'web';
        //如果url是hbbclient_s,将flowNo为null
        if(url.indexOf("hbbclient_s") > 0 ){
            data.flowNo = null
        }else{
            data.flowNo = this.getFlowNo();
        }
       data.corp = window.sessionStorage.corpUuid || '127V0A3L79AVP001';
        return {
            type: 'post',
            url: url,
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(data),
            dataType: 'json',
            headers:{
              Authorization:token,
            },
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        };
    },

    fetch: function(url) {
        var promise = new Promise(function(resolve, reject) {
            $.get(url).done(resolve).fail(reject);
        });

        return promise;
    },

    doJsonService: function(url, data) {
        var req = this.ajaxBody(url, data);
        var promise = new Promise(function(resolve, reject) {
            $.ajax(req).done(resolve).fail(reject);
        });

        return promise;
    },

    doGetService: function(url) {
        url = this.fmtGetUrl(url);
        var promise = new Promise(function(resolve, reject) {
            $.get(url).done(resolve).fail(reject);
        });

        return promise;
    },
    /****************************正常查询接口*******************************/
    /**
     *  errorFlag见下个方法注释
    */
    doRetrieveService: function(url, filter, startPage, pageRow, totalRow,errorFlag) {
        let $this = this;
        let query = {
            pageRow: pageRow,
            startPage: startPage,
            totalRow: totalRow,
            object: filter
        };
        let filterObj = {
            flowNo: '0',
            object: query
        };
        let req = this.ajaxBody(url, filterObj);
        if(!req) return;
        let promise = new Promise(function(resolve, reject) {
            $.ajax(req).done(
                (result)=>{
                  message.destroy();
                  if($this.checkServiceResult(result.errCode)){//请求成功
                    resolve(result)
                  }else{
                    errorFlag || $this.handleServiceError(result);
                    reject(result);
                  }
                }
            ).fail(
                (result)=>{
                  message.destroy();
                  errorFlag || $this.handleServiceError(result);
                  reject(result)
                }
            ).always((result)=>{
              $this.updateTOKEN(result.cliFlowNo);
            })
        });
        return promise;
    },
    /****************************正常请求接口*******************************/
    /**
     *  errorFlag 在参数的最后一个传入   true 为自行处理报错  直接通过reject传出去
     *  不传或者传false则默认全局处理报错
    */
    doAjaxService:function (url,filter,errorFlag) {
      let filter2 = {
        flowNo: '0',
        object: filter
      };
      let req = this.ajaxBody(url, filter2);
      let $this = this;
      if(!req) return;
      let promise = new Promise(function(resolve, reject) {
        $.ajax(req).done(
            (result)=>{
              message.destroy();
              if($this.checkServiceResult(result.errCode)){//请求成功
                resolve(result)
              }else{
                errorFlag || $this.handleServiceError(result);
                reject(result);
              }
            }
        ).fail(
          // (result)=>{
          //   message.destroy();
          //   errorFlag || $this.handleServiceError(result);
          //   reject(result)
          // }
            (XMLHttpRequest)=>{
                $this.handleSeverError(XMLHttpRequest,reject,errorFlag);
            }
        ).always((result)=>{
            if(result.cliFlowNo != '1'){
                //调用车型车长时返回的cliFlowNo是1
                $this.updateTOKEN(result.cliFlowNo);
            }
        })
      });
      return promise;
    },
    handleSeverError(XMLHttpRequest,reject,errorFlag){
        message.destroy();
        if(XMLHttpRequest.status === 401){
            message.warning('登录信息过期，请重新登录',2,()=>{
                this.backToLogin()
            });
            return;
        }
        errorFlag || this.handleServiceError();
        reject(XMLHttpRequest);
    },
    //更新Token
    updateTOKEN(TOKEN){
      if(TOKEN){
        window.sessionStorage.setItem('TOKEN',TOKEN)
      }
    },
    //请求结果类型检查
    checkServiceResult:function (errCode) {
      let flag = false;
      if(errCode === null || errCode === '' || errCode === '000000'){
        flag = true;
      }
      return flag;
    },
    backToLogin(){
      window.sessionStorage.clear();
      window.location.href = window.location.origin +'/index.html';
    },
    handleServiceError:function (err={errCode:'错误',errDesc:'请刷新重试！'}) {
      
      let $this = this;
      //利用 window.errCode 来判断当前是否存在报错信息，若存在不提示相同信息
      if(window.errCode === err.errCode) {
        return;
      }
      switch (err.errCode){
        case '40001'://账号已在其它地方登录，请重新登录
            window.errCode = err.errCode;
            Modal.warning({
                title: '提示',
                content: err.errDesc,
                okText: '确认',
                onOk(){
                    window.errCode = '';
                    $this.backToLogin()
                },
            });
            break;
        case '20003'://登录信息过期，TOKEN失效
          window.errCode = err.errCode;
          Modal.warning({
            title: '提示',
            content: err.errDesc,
            okText: '确认',
            onOk(){
              window.errCode = '';
              $this.backToLogin()
            },
          });
          break;
        default:
          message.error(`[${err.errCode}]-处理错误，${err.errDesc}!`,2);
          break;
      }
    },
  
    //深度拷贝对象
    deepCopyValue: function(source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
            if (source[item] !== null) {
                sourceCopy[item] = typeof source[item] === 'object' ? this.deepCopyValue(source[item]) : source[item];
            } else {
                sourceCopy[item] = source[item] = null;
            }
        }
        return sourceCopy;
    },

    // fmtGetUrl: function(url) {
    //     var idx = url.indexOf('corp');
    //     if (idx >= 0) {
    //         return url;
    //     }
    //
    //     if (window.loginData === undefined) {
    //         return url;
    //     }
    //
    //     var compUser = window.loginData.compUser;
    //     if (compUser === null || compUser.corpUuid === '' || compUser.corpUuid === undefined) {
    //         return url;
    //     }
    //
    //     idx = url.indexOf('?');
    //     if (idx >= 0) {
    //         url = url + '&corp=' + compUser.corpUuid;
    //     } else {
    //         url = url + '?corp=' + compUser.corpUuid;
    //     }
    //
    //     return url;
    // },
  
    // 通过fetch方式处理文件流  excel下载
    downloadExcelFile: function(url, params, callback, $this) {
        let token = window.sessionStorage.getItem('TOKEN') || '';
        let formData = new FormData();

        var req = {
            flowNo: '0',
            object: params
        };

        req.term = 'web';
        // if (typeof(window.loginData) !== 'undefined') {
        //     var compUser = window.loginData.compUser;
        //     req.corp = (compUser === null) ? '' : compUser.corpUuid;
        // } else {
        //     req.corp = '';
        // }

        formData.append('reqObject', JSON.stringify(req));

        let filename = '';

        fetch(url, {
            method: 'POST',
            // 携带cookie信息
            credentials: 'include',
            body: formData,
            cache: 'no-cache',
            headers:{
                Authorization:token,
            },
        }).then(response => {
            if (response.ok) {

                // 后台返回的response有两种类型，文件流和json数据，只有导出出错的时候才会返回json
                let disp = response.headers.get('content-disposition');
                if (disp && disp.search('attachment') !== -1) {
                    let t = disp.split(';');

                    // content-disposition中包含文件名信息
                    // 格式为:attachment; filename=details.xls
                    if (t.length === 2 && t[1].indexOf('=') !== -1) {
                        try {
                            filename = decodeURIComponent(t[1].split('=')[1].split('.')[0].substring(1)) + '.xlsx';
                        } catch (err) {}
                    }


                    // 处理filename取不到或者扩展名不对的情况
                    // 如果扩展名为xls时，用Excel打开文件会出现警告，所以统一处理为xlsx
                    if (filename && filename.indexOf('xlsx') === -1) {
                        filename = '文件.xlsx';
                    }
                    return response.blob();
                } else {
                    return response.json();
                }
            } else {
                throw `服务通信异常status:${response.status}`;
            }
        }).then(resolve => {
            // 如果是blob类型，必然会有type属性
            if (resolve.type != null) {
                // 处理IE浏览器的情况
                if (navigator.msSaveBlob) {
                    $this.setState({ loading: false });
                    return navigator.msSaveBlob(resolve, filename);
                }

                let a = document.createElement('a');
                a.href = URL.createObjectURL(resolve);
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                //去除主页面的按钮loading
                $this.setState({ loading: false });
                a.remove();
                // 记得释放对象，否则会影响性能
                URL.revokeObjectURL(a.href);
            } else {
                $this.setState({ loading: false });
                // 说明当前返回json，导出异常，通过回调函数处理错误信息
                callback(resolve);
            }

        }).catch(err => {
            // 服务器通讯异常
            // console.error(err);
        });
    },
    
    //change 度  to 度分
    ChangeToDFM:function (val) {
      let str1 = val.split(".");
      let du1 = str1[0];
      let tp = "0."+str1[1]
      tp = new String(tp*60);		//这里进行了强制类型转换
      let str2 = tp.split(".");
      let fen =str2[0];
      tp = "0."+str2[1];
      tp = tp*60;
      let miao = parseInt(tp);
      let reternVal = du1+"°"+fen+"'"+miao+"\"";
      return reternVal;
    },
  
    //获取当前时间
    now:function () {
      let D = new Date();
      let year = D.getFullYear(),
          month = D.getMonth()+1,
          day = D.getDate();
      month = month<10?'0'+month:month;
      day = day<10?'0'+day:day;
      return year+'-'+month+'-'+day;
    },
    
    //处理input change事件
    
   /**
    *  page →  当前对象
    *  objName →  存储input值得state name
   */
   handleOnChange(objName,e){
     let obj = this.state[objName];
     let val = e.target.value.replace(/(^\s*)/g, "");
     obj[e.target.id] = val;
     
     Common.validator(this, obj, e.target.id);
  
     if (this.afterChange) {
       this.afterChange(e.target.id, e.target.value);
     }
  
     //更新UI
     if(this.state.loading !== undefined){
       this.setState({loading:this.state.loading});
     }else{
       this.forceUpdate();
     }
   },
  
   toggle(){
     if (this.beforeClose && this.state.modal) {
       this.beforeClose();
     }
     this.setState({
       modal: !this.state.modal
     });
   },
  handleUserType(type){
     let userStatus = '';
     switch (type){
       case '10':
         userStatus = '未审核';
         break;
       case '11':
         userStatus = '审核中';
         break;
       case '12':
         userStatus = '审核通过';
         break;
       case '13':
         userStatus = '已拉黑货主';
         break;
       case '14':
         userStatus = '不通过';
         break;
       case '20':
         userStatus = '未审核';
         break;
       case '21':
         userStatus = '审核中';
         break;
       case '22':
         userStatus = '审核通过';
         break;
       case '23':
         userStatus = '已拉黑司机';
         break;
       case '24':
         userStatus = '不通过';
         break;
     }
     return userStatus;
  }
};