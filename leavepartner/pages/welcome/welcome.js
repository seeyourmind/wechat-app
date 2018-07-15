// pages/welcome/welcome.js
var app = getApp();
var SERVERURL = getApp().globalData.SERVERURL;
var userType = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tag: 0,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let str = '';
    console.log('start: ', that.data.tag)
    app.getUserInfoData(function () {
      console.log('app global data userinfo: ', app.globalData.userInfo)
      if (app.globalData.userInfo) {
        that.setData({
          tag: 40,
          userInfo: app.globalData.userInfo
        });
        str = JSON.stringify(app.globalData.userInfo);
        wx.setStorage({
          key: 'user_info_str',
          data: str,
        });
        console.log('continu: ', str);
        that.isNewUser(function (flag) {
          console.log('is new user: ', flag);
          that.setData({
            tag: 70
          });
          if (flag) {
            console.log('get user type from server: ', flag);
            that.getUserFromServer(function (user_secrets) {
              console.log('user secret:', user_secrets)
              that.setData({
                tag: 100
              });
              if (user_secrets.state === 'SUCCEED') {
                var user_data_from_server = user_secrets.message;
                if (user_data_from_server.hasOwnProperty('className')) {
                  wx.setStorage({
                    key: 'user_type',
                    data: 'student',
                  });
                  userType = 'student';
                } else {
                  wx.setStorage({
                    key: 'user_type',
                    data: 'teacher',
                  });
                  userType = 'teacher';
                }
                wx.setStorage({
                  key: 'user_data',
                  data: user_secrets.message,
                });
                wx.redirectTo({
                  url: '../home/home?userInfo=' + str + '&usertype=' + userType,
                  success: function (res) { },
                  fail: function (res) { },
                  complete: function (res) { },
                });
              } else {
                wx.redirectTo({
                  url: '../register/register?userInfo=' + str,
                });
              }
            });
          } else {
            console.log('end: ', 'stroge had')
            that.setData({
              tag: 100
            });
            wx.getStorage({
              key: 'user_type',
              success: function (res) {
                console.log('success res: ', res.data)
                userType = res.data;
                console.log('user type from storag: ', userType)
                wx.redirectTo({
                  url: '../home/home?userInfo=' + str + '&usertype=' + userType,
                  success: function (res) { },
                  fail: function (res) { },
                  complete: function (res) { },
                });
              },
              fail: function (res) {
                console.log('fail res: ', res)
              }
            });
          }
        });
      } else {
        console.log('app.globalData.userInfo: ', app.globalData.userInfo)
      }
    });
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
   * 判断用户数据是否首次注册
   */
  isNewUser: function (f) {
    var that = this;
    // 判断当前界面上是注册界面还是修改信息界面
    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        // console.log('user_data in local storage', res.data);

        wx.getStorage({
          key: 'user_type',
          success: function (res) {
            // console.log('user_type in local storage', res.data);
            that.setData({
              hidden_choose_view: true,
              is_new_user: false
            });
            typeof f == 'function' && f(false);
            // console.log('wx.getStorage1: ', that.data.is_new_user);
          },
          fail: function (res) {
            // console.log('get user_data fail', res);
            that.setData({
              hidden_choose_view: false,
              is_new_user: true
            });
            typeof f == 'function' && f(true);
            // console.log('wx.getStorage2: ', that.data.is_new_user);
          }
        });
      },
      fail: function (res) {
        // console.log('get user_data fail', res);
        that.setData({
          hidden_choose_view: false,
          is_new_user: true
        });
        typeof f == 'function' && f(true);
        // console.log('wx.getStorage3: ', that.data.is_new_user);
      }
    });
  },
  /**
   * 获取app.globalData.userInfo
   */
  getUserInfoFromGlobalData: function (f) {
    var that = this;
    //调用应用实例的方法获取全局数据，获取用户信息
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      // console.log('1userinfo-->', that.data.userInfo)
      typeof f == 'function' && f();
    } else if (wx.canIUse('getUserInfo')) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        // console.log('2userinfo-->', that.data.userInfo);
        typeof f == 'function' && f();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          // console.log('3userinfo-->', that.data.userInfo);
          typeof f == 'function' && f();
        }
      });
    }
  },
  /**
   * 获取openid和sessionKey
   */
  getUserFromServer: function (f) {
    wx.login({
      success: function (res) {
        if (res.code) {
          // console.log('获取用户code！' + res.code)
          var code = res.code;
          if (code) {
            wx.request({
              url: SERVERURL + '/user/get_userinfo_by_wechat_js_code',
              data: {
                jsCode: code
              },
              header: {
                'content-type': 'application/json',
                'Coche-Control': 'no-cache'
              },
              method: 'POST',
              dataType: 'json',
              success: function (res) {
                // console.log('res', res);
                if (res.data.state == 'SUCCEED') {
                  typeof f == 'function' && f(res.data);
                } else {
                  if (res.data.type == 'S') {
                    typeof f == 'function' && f(res.data);
                  } else {
                    wx.showModal({
                      title: '失败',
                      content: res.data.message,
                      showCancel: false
                    });
                  }
                }
              },
              fail: function (res) {
                // console.log('获取用户登录态失败！' + res.errMsg);
                wx.showModal({
                  title: '失败',
                  content: '服务器正在努力抢修中......请稍后重试',
                  showCancel: false
                })
              }
            })
          }
        } else {
          // console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  /**
   * 权限判断
   */
  
})