// pages/occupy/occupy.js
var HOST = getApp().globalData.HOST;
var wechatID = wx.getStorageSync('wechatID');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carowner: {
      name: '李四',
      plate: '赣B 14725',
      phone: 12345678801,
      location: '江西理工大学图书馆后XXX'
    },
    search: false,
    login: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var name = wx.getStorageSync('name');
    var plate = wx.getStorageSync('plate');
    var phone = wx.getStorageSync('phone');
    var that = this;
    // console.log('on load:', name + ':' + plate + ':' + phone)
    if (name.length && plate.length && phone.length) {
      that.setData({
        login: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getCarOwnerInfo: function (e) {
    // console.log(e)
    var that = this;
    var current_id = e.detail.target.id;
    var search_plate = e.detail.value.searchPlate;
    switch(current_id){
      case '1':
        findUserInfoWithPlate(wechatID, search_plate, function(){
          that.setData({
            search: true
          });
        });
        break;
      case '2':
        wx.makePhoneCall({
          phoneNumber: '12345678801',
        });
        break;
    }
  },

  getCarOwnerPanel: function (e) {
    // console.log('form发生了submit事件，携带数据为：', )
    var that = this;
    var name = e.detail.value.name;
    var plate = e.detail.value.plate;
    var phone = e.detail.value.phone;
      
    checkUserLogin(wechatID, name, plate, phone, function(){
      // console.log('get car owner panel: ', name+plate+phone);
      that.setData({
        login: true
      });
    });
  }
});

function checkUserLogin(wechatID, name, plate, phone, func) {
  // console.log('check user login:', wechatID+name+phone+plate)
  wx.request({
    url: HOST + '/school_car_owner/login',
    data: {
      wechatId: wechatID,
      name: name,
      plate: plate,
      phoneNumber: phone
    },
    dataType: 'json',
    method: 'POST',
    success: function (res) {
      // console.log(res)
      if (res.data.state === 'SUCCEED') {
        // console.log('check user login return[S]: ', name + plate + phone)
        wx.setStorageSync('name', name);
        wx.setStorageSync('phone', phone);
        wx.setStorageSync('plate', plate);
        // console.log('wx set storage sync: ', wx.getStorageSync('name') + wx.getStorageSync('phone') + wx.getStorageSync('plate'))
        func();
      } else {
        wx.showModal({
          title: '提示信息',
          content: res.data.message,
          showCancel: false
        });
      }
    },
    fail: function (err) {
      // console.log(err)
    }
  });
}

function findUserInfoWithPlate(wechatID, search_plate, func){
  wx.request({
    url: HOST + "/school_car_owner/look_up_school_car_owner_by_plate",
    data: {
      wechatId: wechatID,
      plate: search_plate
    },
    method: 'post',
    dataType: 'json',
    success: function (res) {
      // console.log(res)
      if (res.data.type === 'S') {
        func();
      } else if (res.data.type === 'O') {
        wx.showModal({
          title: '提示信息',
          content: res.data.message,
          showCancel: false
        });
      } else {
        wx.showModal({
          title: '提示信息',
          content: res.data.message,
          showCancel: false
        });
      }
    },
    fail: function (err) {
      // console.log(err)
      wx.showModal({
        title: '异常信息',
        content: '服务器正在维护...',
        showCancel: false
      });
    }
  });
}

