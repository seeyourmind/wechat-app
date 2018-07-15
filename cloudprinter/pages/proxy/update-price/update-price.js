// update-price.js
var userid = null;
var wxid = null;
var userlevel = 0;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    icon: 'dayinji',
    item: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)
    
    userid = options.id;
    wxid = options.wxid;
    userlevel = parseInt(options.userlevel);
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
    this.getSeverPrice(userid)
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
   * 获取修改后的价格标准
   */
  changePrice: function (e) {
    var meg = e.currentTarget.id;
    console.log('meg,',meg)
    var strs = meg.split("_");
    var configID = strs[0];
    var priceType = strs[1];
    var item = this.data.item;
    console.log('priceType,', priceType)

    if (priceType == 'print') {
      for (var i = 0; i < item.length; i++) {
        if (item[i].configID == configID) {
          var printPrice = "item[" + i + "].dyPrice";
          var print = 'print['+i+']';
          this.setData({
            [printPrice]: e.detail.value,
            [print]: e.detail.value
          });
          console.log("printPrice=", item[i].dyPrice);
          break;
        }
      }
    } else if (priceType == 'copy') {
      for (var i = 0; i < item.length; i++) {
        if (item[i].configID == configID) {
          var copyPrice = "item[" + i + "].fyPrice";
          var copy = 'copy['+i+']';
          this.setData({
            [copyPrice]: e.detail.value,
            [copy]: e.detail.value
          });
          console.log("copyPrice=", item[i].fyPrice);
          break;
        }
      }
    } else {
      console.log('priceType未匹配到')
    }
  },

  /**
   * 提交修改后的价格信息
   */
  submitPrice: function (e) {
    var item = this.data.item;
    var submitID = e.currentTarget.id;
    for (var i = 0; i < item.length; i++) {
      if (item[i].configID == submitID) {
        var printPrice = item[i].dyPrice;
        var copyPrice = item[i].fyPrice;
      }
    }
    console.log(submitID, " ", printPrice, " ", copyPrice);
    wx: wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 2,
        dyPrice: printPrice,
        fyPrice: copyPrice,
        configID: submitID,
        WXID: wxid,
        UserID: userid
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        console.log('success res', res);
        if (res.statusCode == 200 && res.data.Message.length >0){
          wx.showToast({
            title: res.data.Message,
            duration: 2000
          })
        } else if (res.data.total == 0){
          wx.showToast({
            title: '您还没有代理任何机器哦Σ(º ﾛ º๑)',
            icon: 'loading',
            duration: 2500
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2500
        })
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;

    if (userlevel == 3) {
      userid = '';
      console.log('userlevel', userlevel)
    }

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 1,
        agentid: userid
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.statusCode == 200 && res.data.total > 0) {
          that.setData({
            item: res.data.items,
            copy: null,
            print: null
          })
          wx.showToast({
            title: '刷新成功啦！ヾﾉ≧∀≦)o',
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
        console.log('success res', res);
      },
      fail: function (res) {
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    });
  },

  /**
   * 从数据库获取价格信息
   */
  getSeverPrice: function (userid) {
    var that = this;

    if(userlevel == 3){
      userid = '';
      console.log('userlevel',userlevel)
    }

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 1,
        agentid: userid
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.statusCode == 200 && res.data.total > 0) {
          that.setData({
            item: res.data.items
          })
        } else if(res.data.total == 0){
          wx.showToast({
            title: '您还没有代理任何机器哦(⊙o⊙)',
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
        console.log('success res', res);
      },
      fail: function (res) {
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
  }
})