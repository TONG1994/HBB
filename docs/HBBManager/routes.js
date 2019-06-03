/*   eslint-disable   */

import HBBManagerLayout from './HBBManagerLayout';
import Home from '../login/LoginPage';
import Common from '../public/script/common';
import AsyncComponent from '../lib/Components/AsyncComponent';

// const CargoOriginPage = AsyncComponent(()=>import("./dataCenter/cargoOrigin/CargoOriginPage"));
import CargoOriginPage from './dataCenter/cargoOrigin/CargoOriginPage';
import CargoOwnerPage from './dataCenter/cargoOwner/CargoOwnerPage';
import DriverPage from './dataCenter/driver/DriverPage';
import TransportOrderPage from './dataCenter/transportOrder/TransportOrderPage';

import GuidePricePage from './setting/guidePrice/GuidePricePage';
import VersionPage from './systemSetManage/version/VersionPage';

/***************    基本路由    *********************/
let mainRoutes = [
  {
    path: 'dataCenter/CargoOriginPage',
    component: CargoOriginPage
  },
  {
    path: 'dataCenter/CargoOwnerPage',
    component: CargoOwnerPage
  },
  {
    path: 'dataCenter/DriverPage',
    component:DriverPage
  },
  {
    path: 'dataCenter/TransportOrderPage',
    component:TransportOrderPage
  },
  {
    path: 'setting/GuidePricePage',
    component: GuidePricePage
  },
   {
     path: 'systemSetManage/VersionPage',
     component: VersionPage
    }
];

// 过滤 路由
let controlledDoorManageRoutesArr=getGivenMenuList(mainRoutes);
function getGivenMenuList(menuListSource){
 return menuListSource;
 let menuLists = Common.getMenuList() || [], menuListGiven=[], menuArr=[]; 
  menuLists.map(item=>{
  if(item && item.path){
   menuArr.push(item.path);
  }
 });
 if(menuArr.length !== menuLists.length){
   console.error('菜单数据列表数据有无效数据，请检查！');
   return;
 }
 menuListSource.map(item =>{
   // if(menuArr.includes(item.path)){
   //    menuListGiven.push(item);
   // }

   let f = false;
   for(let i=0;i<menuArr.length;i++){
     if(menuArr[i].indexOf(item.path)!==-1){
       f = true;
       break;
     }
   }
   if(f){
     menuListGiven.push(item)
   };
 });
 return menuListGiven;
}

/***************   总路由    *********************/
let oriangeRoute = '/HBBManager/';

module.exports = {
  path: '/HBBManager',
  component: HBBManagerLayout,
  indexRoute: { component: Home },
  childRoutes: [
    {
      path: oriangeRoute,
      indexRoute: { component: CargoOwnerPage },
      childRoutes: mainRoutes
    },
  ]
};

