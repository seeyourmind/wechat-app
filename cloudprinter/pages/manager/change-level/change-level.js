// change-level.js
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    array: ['普通用户', '代理商', '维护员'],
    index: 0,
    userlv: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)
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
    wx.clearStorageSync();

    var pagenum = getCurrentPages();
    var pagePrev = pagenum[pagenum.length - 2];
    var authority = 'buttonGroup.authority'

    pagePrev.setData({
      userInfo: null,
      [authority]: 0,
      loadinghidden: false
    })
    console.log(pagePrev.data);

    pagePrev.onLoad();
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
   * picker变值
   */
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 查询用户真实姓名
   */
  getUserRealName:function(e){
    var that = this;
    var realname = '';
    var userlv = 0;

    var phone = e.detail.value;
    console.log('phone',phone)

    if(phone.length < 1){
      wx.showToast({
        title: '您还没有填写用户账号( ´◔‸◔`)',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 6,
          mobile: phone
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log('phone', phone, res)
          if (res.statusCode == 200 && res.data.total > 0) {
            realname = res.data.items[0].Truename;
            userlv = res.data.items[0].Ulevel;
            that.setData({
              realname: realname,
              userlv: parseInt(userlv)

            });
            if (parseInt(userlv)==3){
              wx.showModal({
                title: '提示',
                content: '该用户为超级管理员，您无权修改其等级。',
              });
            }
          } else if (res.data.total == 0) {
            wx.showToast({
              title: '没有找到该用户Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2000
            });
            that.setData({
              realname: ''
            })
          } else {
            wx.showToast({
              title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2000
            });
            that.setData({
              realname: ''
            })
          }
        },
        fail: function (res) {
          console.log('error', res)
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          });
          that.setData({
            realname: ''
          })
        }
      });
    }

    if (e.detail.value.length < 1){
      that.setData({
        realname: ''
      })
    }
    return realname;
  },

  /**
   * 提交form
   */
  submitForm:function(e){
    var userid = e.detail.value.userid;
    var userlevel = e.detail.value.userlevel;
    console.log(userid,userlevel)

    if(userid.length < 1){
      wx.showToast({
        title: '您还没有填写用户账号( ´◔‸◔`)',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 5,
          mobile: userid,
          Ulevel: userlevel
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log('res', res)
          if (res.statusCode == 200 && res.data.total > 0) {
            wx.showToast({
              title: '操作成功！✧٩(ˊωˋ*)و✧',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2000
            })
          }
        },
        fail: function (res) {
          console.log('error', res)
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
      });
    }
  }
})