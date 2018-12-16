// pages/parking-fee/parking-fee.js
var util = require('../../utils/util.js');
var rurl = require('../../utils/request-url.js');
var HOST = getApp().globalData.HOST;
var wechatId = null;
var orderId = null;
var pay_msg = null;
var begin = 100;
var paycheck = true;
var windowInfo = 0;
var timer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0.0,
    query: true,
    timer: 100,
    allready: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('wechatId form storage sync:', wx.getStorageSync('wechatID'))
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        windowInfo = res.windowHeight;
      },
    });
    wechatId = wx.getStorageSync('wechatID');
    if (wechatId){
      that.setData({
        allready: false
      });
   } else {
     wx.login({
       success: function (res) {
        //  console.log('res->'+HOST,res)
         loginRequest(res.code, function () {
           that.setData({
             allready: false
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
    wx.setStorageSync('leavePage', 'fee');
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
   * 获取支付费用
   */
  getPayMoney: function () {
    // console.log('用户需要扫二维码获取订单',wechatId);
    var that = this;
    paycheck = true;
    wx.scanCode({
      scanType: ['qrCode'],
      success: function(res){
        // console.log(res.result);
        that.setData({
          allready: true
        });
        orderId = res.result;
        begin = 100;
        wx.request({
          url: HOST + rurl.getRequestURL('get_monthly_rent_details_by_order_id'),
          method: 'POST',
          dataType: 'json',
          data: {
            'orderId': orderId,
            'wechatId': wechatId
          },
          success: function(res){
            // console.log(res)
            if (res.data.state === 'SUCCEED'){
              var pay_msg = res.data.message;
              wx.setStorageSync('plate', pay_msg.plate);
              if (parseInt(pay_msg.parkingactfee) <= 0) {
                that.setData({
                  money: 0.0
                });
                wx.showModal({
                  title: '温馨提醒',
                  content: '您暂时不需要缴纳月租费用',
                  showCancel: false
                });
              } else {
                that.setData({
                  orderDetail: res.data.message,
                  money: parseFloat(res.data.message.fee) / 100,
                  query: false
                });
                // console.log('this is the where to get timer')
                getTimer(that);
              }
            } else {
              wx.showModal({
                title: 'Sorry~~~',
                content: res.data.message,
                showCancel: false
              });
            }
          },
          fail: function(err){
            // console.log('err:', err);
            wx.showModal({
              title: 'Sorry~~~',
              content: '获取交易订单失败，请重新扫码',
              showCancel: false
            });
          },
          complete: function(){
            that.setData({
              allready: false
            });
          }
        })
      },
      fail: function(err){
        // console.log(err);
        wx.showModal({
          title: 'Sorry~~~',
          content: '未能识别该二维码，请重新扫码',
          showCancel: false
        });
      },
      complete: function () {
        that.setData({
          allready: false
        });
      }
    })
  },

  /**
   * 支付请求
   */
  payforParkingFee: function () {
    // console.log('支付请求')
    var that = this;
    paycheck = false;
    begin = 100;
    var money = that.data.money;
    var orderid = orderId? orderId:'';
    var wechatid = wechatId;
    that.setData({
      allready: true
    });
    if(wechatid.length>1 && orderid.length>1){
      // console.log('orderid:', orderid)
      wx.request({
        url: HOST + rurl.getRequestURL('get_order_pay_parameters'),
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
              money: 0.0,
              allready: true
            });
            wx.requestPayment({
              timeStamp: '' + pay_auth.timeStamp,
              nonceStr: pay_auth.nonceStr,
              package: pay_auth.package_,
              signType: pay_auth.signType,
              paySign: pay_auth.paySign,
              success: function (res) {
                // console.log(res)
                wx.showModal({
                  title: '',
                  content: '感谢您的使用，您已付款成功',
                  showCancel: false,
                  success: function(res){
                    if(res.confirm){
                      initPanel(that);
                    }
                  }
                });
              },
              fail: function (err) {
                // console.log('支付异常：', err)
                initPanel(that);
                /*
                wx.showModal({
                  title: '异常信息',
                  content: err.errMsg === 'requestPayment:fail cancel' ? '支付异常：您已取消支付' : err.err_desc,
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      initPanel(that);
                    }
                  }
                });
                */
              },
              complete: function(){
                that.setData({
                  allready: false
                })
              }
            });
          } else {
            wx.showModal({
              title: 'Sorry~~~',
              content: res.data.message,
              showCancel: false,
              success: function(res){
                if(res.confirm){
                  initPanel(that);
                }
              }
            });
          }
        },
        fail: function (err) {
          // console.log(res);
          wx.showModal({
            title: 'Sorry~~~',
            content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
            showCancel: false,
            success: function(res){
              if (res.confirm) {
                initPanel(that);
              }
            }
          });
        },
        complete: function(){
          that.setData({
            allready: false
          })
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
  },
  // 跳转至月租户
  jumpToLongTerm: function (e) {
    // console.log(e)
    begin = 100;
    paycheck = false;
    clearTimeout(timer);
    wx.redirectTo({
      url: '../parking-temporary/parking-temporary?isback=true',
    });
  }
});

/**
 * 登录验证
 */
function loginRequest(code, func) {
  wx.request({
    url: HOST + rurl.getRequestURL('get_by_wechat_js_code'),
    data: {
      'jsCode': code
    },
    dataType: 'json',
    method: 'POST',
    success: function (res) {
      // console.log(res.data)
      if (res.data.state === 'SUCCEED') {
        wechatId = res.data.message.wechatId
        wx.setStorageSync('wechatID', wechatId);
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
    // console.log('if:', begin+paycheck)
    wx.showModal({
      title: '',
      content: '您未能在100s内完成支付，订单自动取消；如需再次支付，请重新获取订单',
      showCancel: false,
      success: function (res) {
        begin = 100;
        if (res.confirm) {
          page.setData({
            query: true,
            money: 0.0
          });
        }
      }
    });
  } else if(begin > 0 && !paycheck){
    // console.log('elseif:', begin, paycheck)
    begin = 100;
  } else {
    // console.log('else:', begin, paycheck)
    timer = setTimeout(function(){
      getTimer(page)
    }, 1000);
  }
}
/**
 * 初始化面板
 */
function initPanel(page){
  page.setData({
    query: true,
    money: 0.0,
    orderDetail: false
  });
}
