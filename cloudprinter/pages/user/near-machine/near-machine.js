// near-machine.js
var points = null;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    //公司地址
    longitude: 114.9687695503,
    latitude: 25.8188848331,
    //地图控件
    mapCtx: null,
    markers: []
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    var that = this
    console.log('e.markerId',e.markerId)
   
    if (that.data.markers[parseInt(e.markerId)].addressname) {
      wx.setNavigationBarTitle({
        title: that.data.markers[parseInt(e.markerId)].addressname
      });

      wx.openLocation({
        latitude: that.data.markers[parseInt(e.markerId)].latitude,
        longitude: that.data.markers[parseInt(e.markerId)].longitude,
        name: that.data.markers[parseInt(e.markerId)].addressname,
        address: '机器状态：'+that.data.markers[parseInt(e.markerId)].machinestatus,
        scale: 18
      })
    } else {
      wx.setNavigationBarTitle({
        title: '附近的云印机'
      })
    }
  },
  controltap(e) {
    this.mapCtx.moveToLocation()
    wx.setNavigationBarTitle({
      title: '当前位置'
    })
  },

  //定位
  locationChange: function () {
    var that = this
    //实时定位
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: function(res){
        console.log('fail-->',res)
        // 兼容性处理
        if (wx.openSetting && wx.getSetting) {
          wx.getSetting({
            success: function (res) {
              console.log('res.authSetting["scope.userLocation"]-->', res.authSetting["scope.userLocation"])
              if (res.authSetting["scope.userLocation"]) {
                console.log('res.authSetting["scope.userLocation"]-->', res.authSetting["scope.userLocation"])
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
                          if (res.authSetting["scope.userLocation"]) {
                            wx.showToast({
                              title: '授权成功',
                              icon: 'success',
                              duration: 2000
                            });
                            //实时定位
                            wx.getLocation({
                              type: 'wgs84',
                              success: function (res) {
                                that.setData({
                                  latitude: res.latitude,
                                  longitude: res.longitude
                                })
                              }
                            });
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)

    var that = this

    this.getAllMachinePoints(function (points) {
      console.log('onLoad中使用points', points)
      that.setData({
        markers: points
      })
      console.log('onLoad中设置markers', that.data.markers)
    });

    this.locationChange()
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          controls: [{
            id: 1,
            iconPath: '/res/current-position.png',
            position: {
              left: 5,
              top: res.windowHeight - 55,
              width: 50,
              height: 50
            },
            clickable: true
          }]
        })
      },
      fail: function () {

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('near-machine')
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
   * 获取机器坐标
   */
  getAllMachinePoints: function (f) {
    var returnData = null;
    var that = this;
    var points = [];

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
        console.log('res.data.items-->', res.data.items)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          for (var i = 0; i < returnData.length; i++) {
            points.push({
              id: i,
              latitude: parseFloat(returnData[i].lat),
              longitude: parseFloat(returnData[i].lng),
              machinestatus: returnData[i].status,
              addressname: returnData[i].address_name
            });
          }
          console.log('points-->', points)
          typeof f == 'function' && f(points);
          console.log('管理员数据获取成功', points)
        } else if (res.data.total == 0) {
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
      },
      complete: function (res) {
        that.setData({
          loadinghidden: true
        })
        return points;
      }
    });
    console.log('points', points)
    console.log('markers', this.data.markers)
  }
})