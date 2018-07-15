// machine-info.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    info: []

  },

  //拨打电话
  callMaintenanceMan: function () {
    wx.makePhoneCall({
      phoneNumber: '13330146158' //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)
    
    var machineid = options.machineid;
    console.log('machineid',machineid)
    var that = this;
    
    //this.getMachineDetail(machineid);
    app.getMachineDetail(machineid, function(info){
        that.setData({
          info: info
        });
    });
    that.setData({
      loadinghidden: true
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
   * 获取机器详情
   */
  getMachineDetail: function(machineID){
    console.log('调用getMachineDetail',machineID)
    var that = this;
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
        console.log('success res', res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          that.setData({
            info: returnData
          })
        } else if(res.data.total == 0){
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
      },
      complete: function (res){
        that.setData({
          loadinghidden: true
        })
      }
    });

    return returnData;
  }
})