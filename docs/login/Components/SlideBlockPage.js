'use strict';
let $ = require('jquery');
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import '../style/slide.scss';

let flag = false;
let startX;
class SlideBlockPage extends Component{
    constructor(props){
        super(props);
    }

    //第一次加载
    componentDidMount(){
       this.init();
    }
    init=()=>{
        this.props.setSlideState('start');
        $(".valid-arrow").on('mousedown',this.onMouseDown);
        $(document).on('mousemove',this.onMouseMove);
        $(document).on('mouseup',this.onMouseUp);
    }
    //卸载
    componentWillUnmount(){
        $(".valid-arrow").off('mousedown',this.onMouseDown);
        $(document).off('mousemove',this.onMouseMove);
        $(document).off('mouseup',this.onMouseUp);
    }
    onMouseDown=(event)=>{
        var e = event||window.event;
        e.stopPropagation();
        flag = true;
        startX = event.pageX;
    }
    onMouseMove=(event)=>{
        if(flag){
            let e = event||window.event;
            let endX = e.pageX;
            let moveX = endX- startX;
            if(moveX >= 0){
                $(".valid-arrow").css({"left":moveX+"px"});
                $(".valid-bg").css({"width":moveX+41+"px"});
                if(moveX >= 270){
                    flag = false;
                    $(document).off("mouseup");
                    $(".valid-arrow").off("mousedown");
                    $(".valid-arrow").css({"left":"270px"});
                    $(".valid-arrow > span").addClass("valid-ok");
                    $(".valid-bg").css({"width":"311px"});
                    $(".valid-text").text("验证通过").css("color","#fff");
                    this.props.setSlideState('end');
                }
            }else{
                $(".valid-arrow").css({"left":0});
                $(".valid-bg").css({"width":0+"px"});
            }
        }
    }
    onMouseUp(){
        flag = false;
        startX = 0;
        $(".valid-arrow").animate({'left':1},300);
        $(".valid-bg").animate({'width':0},300);
        $(".valid-arrow > span").removeClass("valid-ok");
        $(".valid-text").text("请按住滑块，拖动到最右边").css("color","rgb(98, 87, 87)");
    }
    render(){
        return (
            <div className="valid-box">
                <div className="valid-bg"></div>
                <div className="valid-arrow"><span></span></div>
                <p className="valid-text">请按住滑块，拖动到最右边</p>
            </div>
        )
    }
}

export default SlideBlockPage;