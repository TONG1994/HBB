/**
 *   Create by Malson on 2019/2/27
 */
/**
 *  新增  编辑页面做成组件式
*/

import React from 'react';
import { Drawer,Row, Col } from 'antd';
import PropTypes from 'prop-types';
import '../../../public/static/lib.scss';


class DrawerModal extends React.Component {
  constructor(props){
    super(props);
    this.state={
      placement:'right',
      visible:true,
      width:600
    }
  }
  componentDidMount(){
  }
  onClose = ()=>{
    this.setState({visible:false});
  }
  formatData = (formatJson=[],sourceData={})=>{
    if(!formatJson.length)return;
    return formatJson.map((item,index)=>{
      let innerContent = [];
      if(item.list.length){
        item.list.map(jtem=>{
          if(!(jtem instanceof Array)){//占据一行
            innerContent.push(
                <Row className='drawer-list-li' key={jtem.key}>
                  <Col>
                    <span>{jtem.name}</span>：
                    <span>{sourceData[jtem.key]}</span>
                  </Col>
                </Row>
            )
          }else{//根据数组长度平分
            let num = jtem.length;
            if(!num || num>3){
              console.error('参数太多了');
              return;
            }
            let colNum = 24 / num;
            let innerList = (
                <Row className='drawer-list-li' key={jtem.key}>
                  {
                    jtem.map(ktem=>
                      <Col span={colNum} key={ktem.key}>
                        <span>{ktem.name}</span>：
                        <span>{sourceData[ktem.key]}</span>
                      </Col>
                    )
                  }
                </Row>
            );
            innerContent.push(innerList)
          }
        })
      }
      let content = (
          <div className='drawer-list-box' key={index}>
            <div className='drawer-list-title'>{item.title}</div>
            {innerContent}
          </div>
      )
      return content;
    })
  }
  render(){
    let {placement,visible,width} = this.state;
    let {formatJson,sourceData} = this.props;
    let showHtml = this.formatData(formatJson,sourceData);
    return(
        <Drawer
            wrapClassName="drawer-modal"
            title="详情"
            placement={placement}
            onClose={this.onClose}
            visible={visible}
            width = {width}
        >
          {showHtml}
        </Drawer>
    )
  }
}
DrawerModal.propTypes = {
  formatJson:PropTypes.array.isRequired,
  // sourceData:PropTypes.object.isRequired
}
export default DrawerModal;