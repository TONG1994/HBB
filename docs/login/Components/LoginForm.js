'use strict';

import React from 'react';
import { Form, Input,Icon } from 'antd';
const FormItem = Form.Item;

let Common = require('../../public/script/common');
let Utils = require('../../public/script/utils');
import FormUtil from '../../lib/Components/FormUtil';


//components
module.exports = {
	layout: 'horizontal',
	colWidth: [6, 12, 18, 24],
 
	initForm(data){
		data.userName = '';
      	data.no = '';
	},

	getFormRule: function (form, attrList)
	{
		var attrMap = {};
		if (attrList) {
			var count = attrList.length;
			for (var x = 0; x < count; x++) {
				var {
					name,
					...attrs
				} = attrList[x];

				if (attrs) attrMap[name] = attrs;
			}
		}

		var rules = [
			{ id: 'userName', desc: '用户名',required:true, max: '20', ...attrMap.userName },
		    { id: 'passwd', desc: '密码',required:true,allowSpecialChar:true, max: '20', ...attrMap.passwd },
		];

		return rules;
	},
	
	getForm: function (form, data, attrList, labelWidths, layout) {
		if (!labelWidths) {
			labelWidths = [16, 8, 6, 5];
		}
		
		var attr = FormUtil.getParam(form, attrList);
		var attrMap = attr.attrMap;

		if (!layout) {
			layout = this.layout;
		}

		var layoutItem = 'form-item-' + layout;
		var itemLayouts = FormUtil.getItemLayout(layout, labelWidths);
		
		var hints = form.state.hints;
		var items = [
			<FormItem {...itemLayouts[3] } key ="userName"  help={hints.userNameHint} validateStatus={hints.userNameStatus}  className={layoutItem} >
				<Input autoComplete='off' className='login-input' prefix={<Icon type="user" style={{fontSize: 16}}/>}
                               placeholder="用户名" type="text" name="userNameLogin" id="userName"  {...attrMap.userName}
                               value={data.userName} onChange={form.handleOnChange}/>
  
		
			</FormItem>,
			<FormItem {...itemLayouts[3] } key ="passwd" help={hints.passwdHint} validateStatus={hints.passwdStatus}  className={layoutItem} >
				<Input  className='login-input' prefix={<Icon type="lock" style={{fontSize: 16}}/>}
                               placeholder="密码" type="password" name="passwd" id="passwd" {...attrMap.passwd}
                               value={data.passwd} onChange={form.handleOnChange}/>
       
		
			</FormItem>,
		];
		
		return FormUtil.adjuestForm(items, attr.showMap, this.colWidth);
	},
};

