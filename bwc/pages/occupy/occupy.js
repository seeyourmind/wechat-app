// pages/occupy/occupy.js
var HOST = getApp().globalData.HOST;
var wechatID = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carowner: {},
    search: false,
    query: false,
    login: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wechatID = wx.getStorageSync('wechatID');
    var phone = wx.getStorageSync('phone');
    var that = this;
    console.log('on load:', phone+wechatID)
    if (phone.length) {
      that.setData({
        login: false
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
  //获取占位车主信息
  getCarOwnerInfo: function (e) {
    console.log(e)
    var that = this;
    var current_id = e.detail.target.id;
    var search_plate = e.detail.value.searchPlate;
    switch(current_id){
      case '1':
        that.setData({query: true});
        findUserInfoWithPlate(wechatID, search_plate, function(res){
          that.setData({
            query: false,
            search: true,
            carowner: res
          });
        });
        break;
      case '2':
        wx.makePhoneCall({
          phoneNumber: that.data.carowner.phoneNumber,
        });
        break;
    }
  },
  // 获取用户输入数据
  getCarOwnerPanel: function (e) {
    // console.log('form发生了submit事件，携带数据为：', )
    var that = this;
    var name = e.detail.value.name;
    var plate = (e.detail.value.plate).toUpperCase();
    var phone = e.detail.value.phone;
    console.log(e)
    //验证车主身份
    checkUserLogin(wechatID, name, plate, phone, function(){
      console.log('get car owner panel: ', name+plate+phone);
      that.setData({
        login: false
      });
    });
  },

  flashInterface: function () {
    var that = this;
    that.setData({
      search: false,
      query: false,
      carowner: {}
    })
  },

  // 跳转至月租户
  jumpToLongTerm: function (e) {
    // console.log(e)
    wx.redirectTo({
      url: '../parking-temporary/parking-temporary?isback=true',
    });
  }
});

// 验证是否为月租户
function checkUserLogin(wechatID, name, plate, phone, func) {
  console.log('check user login:', wechatID+name+phone+plate)
  wx.request({
    url: HOST + '/school_car_owner/login',
    data: {
      wechatId: wechatID,
      name: name,
      plate: plate.toUpperCase(),
      phoneNumber: phone
    },
    dataType: 'json',
    method: 'POST',
    success: function (res) {
      console.log(res)
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

// 查找占位车主
function findUserInfoWithPlate(wechatID, search_plate, func){
  wx.request({
    url: HOST + "/school_car_owner/look_up_school_car_owner_by_plate",
    data: {
      wechatId: wechatID,
      plate: search_plate.toLocaleUpperCase()
    },
    method: 'post',
    dataType: 'json',
    success: function (res) {
      console.log(res)
      if (res.data.state === 'SUCCEED') {
        func(res.data.message);
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

