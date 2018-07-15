// pages/applynote/common/common.js
var util = require('../../../utils/util.js');
var SERVERURL = getApp().globalData.SERVERURL;
var wechatId = null;
var leaveTime = null;
var backTime = null;
var studentsPositionLatitude = null;
var studentsPositionLongitude = null;
var user_data_from_storage = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: true,
    today: util.getCurDate(),
    endday: util.getEndDate(),
    start_date: '确定日期',
    start_time: '确定时间',
    end_date: '确定日期',
    end_time: '确定时间',
    class: '选择所在班级',
    classes: ['计算机中加131班', '计算机131班', '计算机132班'],
    notes_type: 'c'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        user_data_from_storage = res.data;
        wechatId = res.data.wechatId;
        console.log('user data: ', user_data_from_storage)
      },
    });
    wx.getLocation({
      success: function (res) {
        studentsPositionLatitude = res.latitude;
        studentsPositionLongitude = res.longitude;
        console.log('user location: ', res)
      },
      fail: function(res) {
        console.log('get location fail: ', res);
        wx.showModal({
          title: '警告',
          content: '由于您尚未授权[location]权限，所以此功能无法使用',
          confirmColor: '#ff0000',
          cancelText: '不授权',
          confirmText: '授权',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 2000
                    });
                  }
                }
              });
            } if (res.cancel) {
              wx.navigateBack({
                delta: 1
              });
            }
          }
        })
      }
    });
    var that = this;
    if (options.notetype == 'i') {
      that.setData({
        notes_type: 'i'
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

  /**
   * 表单提交
   */
  formSubmit: function (e) {
    this.setData({
      loadinghidden: false
    });
    var that = this;
    var id = this.data.notes_type;
    console.log('e-->', id);
    var submit_data = e.detail.value;
   
    console.log('formsubmit-->', e.detail.value)

    leaveTime = e.detail.value.startdate + 'T' + e.detail.value.starttime + ':00.000';
    backTime = e.detail.value.enddate + 'T' + e.detail.value.endtime + ':00.000';
    
    var data = {
      wechatId: wechatId,
      reason: e.detail.value.reason,
      leaveTime: leaveTime,
      backTime: backTime,
      studentsPositionLatitude: studentsPositionLatitude,
      studentsPositionLongitude: studentsPositionLongitude,
    }
    switch(id) {
      case 'i':
        console.log('submit data: ', data)
        that.setData({
          loadinghidden: true
        });
        wx.navigateTo({
          url: '../internship/internship2?data=' + JSON.stringify(data),
        });
        break;
      case 'c': 
        wx.request({
          url: SERVERURL+'/student/insert_general',
          data: data,
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            if (res.data.state === 'SUCCEED') {
              console.log('success: ', res.data)
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '成功',
                content: '您的请假信息成功提交，请耐心等待系统审核。',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              });
            } else {
              console.log('res.data.message: ', res.data.message)
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false,
              });
            }
          },
          fail: function (res) {
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '服务器错误',
              content: res.errMsg,
              showCancel: false,
            });
          }
        });
        break;
    }
  },

  /**
   * 获取用户选择的请假实践数据
   */
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.currentTarget.id)
    var id = e.currentTarget.id;
    var that = this;
    switch (id) {
      case 'sd':
        that.setData({
          start_date: e.detail.value,
          start_time: '00:00'
        });
        break;
      case 'st':
        that.setData({
          start_time: e.detail.value
        });
        break;
      case 'ed':
        that.setData({
          end_date: e.detail.value,
          end_time: '00:00'
        });
        break;
      case 'et':
        that.setData({
          end_time: e.detail.value
        });
        break;
    }
  }
})