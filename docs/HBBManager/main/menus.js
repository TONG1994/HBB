import Common from '../../public/script/common';
function ModuleMenus() {
  this.mainMenus = [
    {
      name: '数据中心',
      to: 'dataCenter',
      icon: 'dashboard',
      childItems: Common.getFilterList([
        {
          name: '货主',
          to: '/HBBManager/dataCenter/CargoOwnerPage'
        },
        {
          name: '司机',
          to: '/HBBManager/dataCenter/DriverPage'
        },
        {
          name: '货源',
          to: '/HBBManager/dataCenter/CargoOriginPage'
        },
        {
          name: '运单',
          to: '/HBBManager/dataCenter/TransportOrderPage'
        },
      ])
    },
    {
      name: '设置',
      to: 'setting',
      icon: 'setting',
      childItems: Common.getFilterList([
        {
          name: '指导价',
          to: '/HBBManager/setting/GuidePricePage'
        },
      ])
    },
    // {
    //   name: '系统',
    //   to: 'system',
    //   icon: 'desktop',
    //   childItems: Common.getFilterList([
    //       {
    //           name: '版本',
    //           to: '/HBBManager/systemSetManage/VersionPage'
    //       },
    //   ])
    // },
  ];
  this.topMenus = [];
}

module.exports = new ModuleMenus(this);
