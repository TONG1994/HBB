/**
 *   Create by Malson on 2019/2/28
 */
/**
 *  do myself
*/
import React from 'react';
import { Form , Col, Input } from 'antd';

export default {
  /**
   *  获取 form.item
   *  $this  当时类的实例
   *  formParams   form参数
   *    key   必输 对应id
   *    label 必输 对应名称
   *    文字输入框比例  默认是6：10
   *  inputParams  input参数
   *    无component  任意属性
   *    有component  直接调用新组件
  */
  getFormItem($this,formParams={},inputParams={}){
    let { hints={},formData={},modalType='' } = $this.state;
    let initFormParams = {
      labelCol:{span:6},
      wrapperCol:{span:15}
    };
    initFormParams = {...initFormParams,...formParams}
    let key = formParams.key;
      let requiredFlag = formParams.requiredFlag;
    let defaultCom = modalType === 'detail'?<span>{formData[key]}</span>:
        (<Input type='text'
                key={ key }
                name={ key }
                id={ key }
                value={ formData[key] }
                onChange={ $this.handleOnChange }
                placeholder={`请输入${formParams.label}`}
                {...inputParams} />);
    let formContent = (
            <Form.Item
              help= {hints[key + 'Hint']}
              validateStatus = {hints[key + 'Status']}
              required={requiredFlag}
              {...initFormParams}
            >
              {
                inputParams.component?inputParams.component:defaultCom
                
              }
            </Form.Item>
        )
    return formContent;
  }
}