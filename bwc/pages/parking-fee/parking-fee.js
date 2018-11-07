// pages/parking-fee/parking-fee.js
var util = require('../../utils/util.js');
var HOST = getApp().globalData.HOST;
var wechatId = null;
var pay_msg = null;
var begin = 30;
var paycheck = true;
var windowInfo = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0.0,
    query: true,
    plates_hist:[],
    selected: false,
    input_plate: '',
    timer: 30
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        windowInfo = res.windowHeight;
      },
    });
    wx.login({
      success: function (res) {
        // console.log('res->'+HOST,res)
        loginRequest(res.code, function(){
          that.setData({
            plates_hist: wx.getStorageSync('plates')
          });
        });
        
        // console.log('onload plates:', that.data.plates_hist);
      },
      fail: function (err) {
        // console.log('err->',err)
        wx.showModal({
          title: '异常信息',
          content: '服务器正在维护中...',
          showCancel: false
        });
      }
    })
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
   * 输入框控制selectPanel
   */
  inputSelsectStatus: function(e) {
    changeSelectedStatus(this, false);
    // console.log('bindfocus',e)
  },
  hideSelectPanel: function(e) {
    changeSelectedStatus(this, true);
    // console.log('bindurl', e)
    this.setData({
      checkPlate: e.detail.value
    });
  },
  clickHide: function(e){
    // console.log('click view to hide the select panel', e.detail.y, windowInfo*0.4)
    var that = this;
    if ((e.detail.y <= windowInfo*0.2 || e.detail.y >= windowInfo*0.4) && that.data.selected){
      // console.log('select panel will be closed')
      changeSelectedStatus(that, true);
    }
  },

  /**
   * 点击label，下拉面板的显示
   */
  selectStatus: function(){
    changeSelectedStatus(this, this.data.selected);
  },

  /**
   * 下拉面板选择车牌
   */
  selectPlate: function(e){
    var selectplate = e.currentTarget.id;
    this.setData({
      checkPlate: selectplate
    });
    changeSelectedStatus(this, this.data.selected);
  },

  /**
   * 获取支付费用
   */
  getPayMoney: function () {
    var plate = this.data.checkPlate ? this.data.checkPlate: '';
    var wechatid = wx.getStorageSync('wechatID');
    var that = this;
    paycheck = true;
    begin = 30;
    // console.log(plate, wechatid);
    wx.request({
      url: HOST + '/car_owner/get_parking_fee',
      data: {
        wechatId: wechatid,
        plate: plate.toLocaleUpperCase()
      },
      dataType: 'json',
      method: 'POST',
      success: function(res){
        if(res.data.state === 'SUCCEED'){
          pay_msg = res.data.message
          // console.log(pay_msg);
          
          if (parseInt(pay_msg.parkingactfee)<=0){
            that.setData({
              money: 0.0
            });
            wx.showModal({
              title: '温馨提醒',
              content: '当前车牌号并未产生停车费用',
              showCancel: false
            });
          } else {
            that.setData({
              query: false,
              money: parseFloat(pay_msg.parkingactfee) / 100
            });
            // console.log('this is the where to get timer')
            getTimer(that);
          }
        } else {
          that.setData({
            money: 0.0
          });
          wx.showModal({
            title: 'Sorry~~~',
            content: res.data.message,
            showCancel: false
          });
        }
      },
      fail: function(err){
        // console.log(err);
        wx.showModal({
          title: 'Sorry~~~',
          content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
          showCancel: false
        });
      }
    });
  },

  /**
   * 支付请求
   */
  payforParkingFee: function () {
    var that = this;
    paycheck = false;
    begin = 30;
    var money = that.data.money;
    var orderid = pay_msg? pay_msg.orderid:'';
    var wechatid = wx.getStorageSync('wechatID');
    if(wechatid.length>1 && orderid.length>1){
      // console.log('orderid:', orderid)
      wx.request({
        url: HOST + '/car_owner/get_order_pay_parameters',
        data: {
          wechatId: wechatid,
          orderId: orderid
        },
        dataType: 'json',
        method: 'POST',
        success: function (res) {
          // console.log(res);
          if(res.data.state === 'SUCCEED') {
            var pay_auth = res.data.message;
            that.setData({
              query: true,
              money: 0.0
            });
            wx.requestPayment({
              timeStamp: '' + pay_auth.timeStamp,
              nonceStr: pay_auth.nonceStr,
              package: pay_auth.package_,
              signType: pay_auth.signType,
              paySign: pay_auth.paySign,
              success: function (res) {
                // console.log(res)
              },
              fail: function (err) {
                // console.log(err)
                wx.showModal({
                  title: '异常信息',
                  content: err.errMsg === 'requestPayment:fail cancel' ? '支付异常：您已取消支付' : err.err_desc,
                  showCancel: false
                });
              }
            });
          } else {
            wx.showModal({
              title: 'Sorry~~~',
              content: '付费超时，请重新获取订单，并在30s内完成付款',
              showCancel: false
            });
          }
        },
        fail: function (err) {
          // console.log(res);
          wx.showModal({
            title: 'Sorry~~~',
            content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
            showCancel: false
          });
        }
      });
    } else {
      var msg = '';
      if (wechatid.length < 1) {
        msg += '系统未检测到您的WeChatID，请重启小程序。';
      }
      if (orderid.length < 1) {
        msg += '系统未检测到您的订单号，请输入车牌号重新获取。'
      }
      wx.showModal({
        title: 'Sorry~~~',
        content: msg,
        showCancel: false
      })
    }
  } 
});

/**
   * 更改selected状态
   */
function changeSelectedStatus (that, status) {
  that.setData({
    selected: !status
  });
}

/**
 * 登录验证
 */
function loginRequest(code, func) {
  wx.request({
    url: HOST + '/user/get_user_info_by_wechat_js_code',
    data: {
      'jsCode': code
    },
    dataType: 'json',
    method: 'POST',
    success: function (res) {
      // console.log(res.data)
      if (res.data.state === 'SUCCEED') {
        wechatId = res.data.message.wechatId
        // console.log(wechatId)
        wx.setStorageSync('wechatID', wechatId);
        wx.setStorageSync('carport', res.data.message.carport ? res.data.message.carport:'');
        wx.setStorageSync('plate', (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0].length > 0 ? (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0]:'');// 直接返回给我车牌
        // console.log((Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0]);
        // console.log('on loginRequst plates:', res.data.message.plates)
        wx.setStorageSync('plates', res.data.message.plates ? res.data.message.plates:[]);
        wx.setStorageSync('name', res.data.message.name ? res.data.message.name:'');
        wx.setStorageSync('phone', res.data.message.phoneNumber ? res.data.message.phoneNumber:'');
        wx.showToast({
          title: '欢迎使用',
        });
        func();
      } else {
        wx.showModal({
          title: '提示信息',
          content: '未获取到您的wechatID',
          showCancel: false
        });
      }
    },
    fail: function (err) {
      // console.log(err)
      wx.showModal({
        title: 'Sorry~~~',
        content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
        showCancel: false
      });
    }
  });
}

/**
 * 倒计时
 */
function getTimer(page){
  // console.log('get timer:', begin)
  begin -= 1;
  page.setData({
    timer: begin
  });
  if (begin <= 0 && paycheck){
    // console.log('if:', begin)
    wx.showModal({
      title: '',
      content: '您未能在30s内完成支付，订单自动取消；如需再次支付，请重新获取订单',
      showCancel: false,
      success: function (res) {
        begin = 30;
        if (res.confirm) {
          page.setData({
            query: true,
            money: 0.0
          });
        }
      }
    });
  } else if(begin > 0 && !paycheck){
    // console.log('elseif:', begin)
    begin = 30;
  } else {
    // console.log('else:', begin)
    setTimeout(function(){
      getTimer(page)
    }, 1000);
  }
}