//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfoData: function(f){
    var that = this;
    if(that.globalData.userInfo){
      typeof f == 'function' && f(that.globalData.userInfo);
    } else {
      console.log('app.js: user need to get userinfo auth: ', 'globaldata is null')
      wx.getLocation({
        success: function(res) {
          console.log('app.js: user need to get location auth: ', res)
        },
        fail: function(res) {
          if (wx.openSetting && wx.getSetting) {
            wx.getSetting({
              success: res => {
                console.log('app.js: 权限scope.userInfo: ', res.authSetting['scope.userInfo'])
                console.log('app.js: 权限scope.userLocation: ', res.authSetting['scope.userLocation'])
                if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {

                } else {
                  wx.showModal({
                    title: '警告',
                    content: '若不为小程序授权，则无法正常使用；点击授权，重新获取权限；或者点击不授权，放弃使用该小程序；如需使用，需在微信【发现】--【小程序】--删除【江理请假助手】，重新获取授权',
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
              }
            });
          }
        }
      });
      wx.getUserInfo({
        success: function(res) {
          that.globalData.userInfo = res.userInfo;
          typeof f == 'function' && f(res.userInfo);
        },
        fail: function(res) {
          if(wx.openSetting && wx.getSetting) {
            wx.getSetting({
              success: res => {
                console.log('app.js: 权限scope.userInfo: ', res.authSetting['scope.userInfo'])
                console.log('app.js: 权限scope.userLocation: ', res.authSetting['scope.userLocation'])
                if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
                  
                } else {
                  wx.showModal({
                    title: '警告',
                    content: '若不为小程序授权，则无法正常使用；点击授权，重新获取权限；或者点击不授权，放弃使用该小程序；如需使用，需在微信【发现】--【小程序】--删除【江理请假助手】，重新获取授权',
                    confirmColor: '#ff0000',
                    cancelText: '不授权',
                    confirmText: '授权',
                    success: function(res) {
                      if(res.confirm) {
                        wx.openSetting({
                          success: function(res) {
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
              }
            });
          }
        }
      });
    }
  },
  globalData: {
    userInfo: null,
    SERVERURL: 'https://leave-assistant.jxust.edu.cn',
    // SERVERURL: 'https://evenif.top',
    scan: 0
  }
})