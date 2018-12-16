//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onShow: function(option){
    wx.showModal({
      title: '温馨提示',
      content: '由于本功能涉及用户个人手机信息，所以目前暂未开放',
      showCancel: false,
      complete: function(){
        wx.switchTab({
          url: '/pages/parking-fee/parking-fee',
        });
      }
    });
  }
})
