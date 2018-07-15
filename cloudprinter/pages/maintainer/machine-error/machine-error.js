// error-machine.js
var userid = null;
var userlevel = 0;
var app = getApp();
var timeflag = 0;
var getallinfo = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    touchbottom: false,
    errorInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)

    var that = this;
    userid = options.id;
    userlevel = parseInt(options.userlevel);
    timeflag = 0;
    getallinfo = false;
    this.getErrorInfo(userid, function (info) {
      that.setData({
        errorInfo: info,
        loadinghidden: true
      })
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载

    var that = this;
    timeflag = 0;
    this.getErrorInfo(userid, function (info) {
      that.setData({
        errorInfo: info
      });
      wx.showToast({
        title: '刷新成功啦！~\(≧▽≦)/~',
        duration: 2000
      })
    });
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 获取异常信息
   */
  getErrorInfo: function (id, f) {
    var returnData = null;
    var that = this;

    if (userlevel == 3) {
      id = '';
    }

    if (returnData) {
      typeof f == 'function' && f(returnData)
    } else {
      wx: wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_MaintainData.ashx',
        data: {
          Flag: 0,
          adminid: id,
          page: timeflag * 10
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            returnData = res.data.items;
            typeof f == 'function' && f(returnData);
            console.log('returnData', returnData)
          } else if (timeflag == 0 && res.data.total == 0) {
            wx.showToast({
              title: '还没有异常机器哦！✧٩(ˊωˋ*)و✧',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2500
            })
          }
          if (res.data.total < 10 && res.data.total >= 0) {
            getallinfo = true;
          }
        },
        fail: function (res) {
          console.log('fail res', res);
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        },
        complete: function (res) {
          that.setData({
            loadinghidden: true
          })
          return returnData;
        }
      });
    }
  },

  /**
 * 上拉加载
 */
  onReachBottom: function (e) {
    timeflag += 1;
    var that = this;
    var temparay = that.data.errorInfo;
    console.log('上拉加载-->',getallinfo)

    if (!getallinfo) {
      this.setData({
        touchbottom: true
      });
      console.log('上拉加载-->', timeflag)

      this.getErrorInfo(userid, function (info) {
        console.log('info-->', info)
        for (var i = 0; i < info.length; i++) {
          temparay.push(info[i]);
        }
        console.log('temparray-->', temparay)
        that.setData({
          touchbottom: false,
          errorInfo: temparay
        });
      });
    } else {
      wx.showToast({
        title: '所有内容加载完毕(*ฅ́˘ฅ̀*)♡',
        icon: 'loading',
        duration: 2000
      });
      that.setData({
        touchbottom: false
      });
    }
  }
})