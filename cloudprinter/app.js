//app.js
App({
  data: {},

  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    console.log('app场景值:', options)
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          console.log('wx.getUserInfo-->',res)
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail: function (res){
          console.log('wx.getUserInfo-->',res)
          // 兼容性处理
          if (wx.openSetting && wx.getSetting) {
            wx.getSetting({
              success: function (res) {
                console.log('res.authSetting["scope.userInfo"]-->', res.authSetting["scope.userInfo"])
                if (res.authSetting["scope.userInfo"]) {
                  console.log('res.authSetting["scope.userInfo"]-->', res.authSetting["scope.userInfo"])
                } else {
                  wx.showModal({
                    title: '警告',
                    content: '若不为小程序授权，则无法正常使用云印机功能；点击授权，重新获取权限；或是点击不授权，放弃使用该小程序，如需再用，需在微信【发现】--【小程序】--删除【云印机】，重新授权。',
                    confirmText: '授权',
                    cancelText: '不授权',
                    confirmColor: '#ff0000',
                    success: function (res) {
                      if (res.confirm) {
                        wx.openSetting({
                          success: function (res) {
                            if (res.authSetting["scope.userInfo"]) {
                              wx.showToast({
                                title: '授权成功',
                                icon: 'success',
                                duration: 2000
                              })
                            }
                          }
                        })
                      } if (res.cancel) {
                        wx.navigateBack({
                          delta: 1
                        });
                      }
                    }
                  });
                }
              }
            });
          } else {
            wx.showModal({
              title: '提醒',
              content: '您的微信版本过低，部分功能将无法使用，请升级到微信最新版本。',
            });
          }
        }
      })
    }
  },

  getUserIDList: function (f) {
    var returnData = [];
    var that = this;

    if (returnData.length > 0) {
      typeof f == 'function' && f(returnData)
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 8
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            returnData.push('请选择');
            var temp = res.data.items;
            for (var i = 0; i < temp.length; i++) {
              returnData.push(temp[i].UserID);
            }
            typeof f == 'function' && f(returnData);
          }else if(res.data.total == 0){
            wx.showToast({
              title: '没有找到任何用户Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
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
        },
        complete: function (res) {
          return returnData;
        }
      });
    }
  },

  getAllMachines: function (f) {
    var returnData = null;

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 0
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          typeof f == 'function' && f(returnData);
          console.log('管理员数据获取成功',res.data.items)
        } else if(res.data.total == 0){
          wx.showToast({
            title: '没有找到任何机器Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2500
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2500
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2500
        })
      }
    });
  },

  getMachineDetail: function (machineID, f) {
    console.log('调用getMachineDetail', machineID)
    var returnData = [];

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 7,
        machineid: machineID
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('getmachinedetail success res', res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          typeof f == 'function' && f(returnData)
        } else if (res.data.total == 0) {
          wx.showToast({
            title: '没有找到该机器或者机器尚未上线(๑ʘ̅ д ʘ̅๑)!!!',
            icon: 'loading',
            duration: 2500
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2500
          })
        }
      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2500
        })
      }
    });
    return returnData;
  },

  globalData: {
    //当前正在使用的机器ID
    usingMachineId: '',
    //机器地址
    machineQR_CodeURL: '51yin.net.cn',
    //机器地址字段名
    machineIdURL_Field: 'machineno',

    userInfo: null,
    scene: 1
  }
})
