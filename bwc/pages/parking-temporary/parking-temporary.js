// pages/parking-temporary/parking-temporary.js
var util = require('../../utils/util.js');
var rurl = require('../../utils/request-url.js');
var HOST = getApp().globalData.HOST;
var wechatId = null;
var pay_msg = null;
var begin = 100;
var paycheck = true;
var windowInfo = 0;
var _province_ = ['赣', '川', '鄂', '甘', '贵', '桂', '黑', '沪', '吉', '冀', '津', '晋', '京', '辽', '鲁', '蒙', '闽', '宁', '青', '琼', '陕', '苏', '皖', '湘', '新', '渝', '豫', '粤', '云', '藏', '浙'];
var plate = null;
var timer = null;
var is_input = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    province: ['赣', '川', '鄂', '甘', '贵', '桂', '黑', '沪', '吉', '冀', '津', '晋', '京', '辽', '鲁', '蒙', '闽', '宁', '青', '琼', '陕', '苏', '皖', '湘', '新', '渝', '豫', '粤', '云', '藏', '浙'],
    index: 0,
    money: 0.0,
    query: true,
    plates_hist: [],
    selected: false,
    input_plate: '',
    timer: 100,
    allready: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        windowInfo = res.windowHeight;
      },
    });
    // console.log('wechatId form storage sync:', wx.getStorageSync('wechatID'))
    wechatId = wx.getStorageSync('wechatID');
    if (wechatId) {
      getUserInfoByWechatId(wechatId, that, function(){
        if (options.isback != 'true') {
          wx.showToast({
            title: '欢迎使用',
          });
        }
        var p_province, p_number;
        plate = wx.getStorageSync('plate');
        // console.log('plate::', plate);
        [p_province, p_number] = slicePlate(plate);
        // console.log('pp:' + p_province, 'pn:' + p_number)
        that.setData({
          plates_hist: wx.getStorageSync('plates'),
          checkPlate: p_number,
          index: p_province > 0 ? p_province : 0
        });
      });
      // console.log('index', that.data.index)
    } else {
      wx.login({
        success: function (res) {
          // console.log('res->'+HOST,res)
          
          loginRequest(res.code, function () {
            console.log(wx.getStorageSync('plate'))
            var p_province, p_number;
            plate = wx.getStorageSync('plate');
            [p_province, p_number] = slicePlate(plate);
            that.setData({
              plates_hist: wx.getStorageSync('plates'),
              checkPlate: p_number,
              index: p_province>0 ? p_province : 0,
              allready: false
            });
          });
          
          // console.log('onload plates:', that.data.province[that.data.index]);
        },
        fail: function (err) {
          // console.log('err->',err)
          wx.showModal({
            title: '异常信息',
            content: '服务器正在维护中...',
            showCancel: false
          });
        }
      });
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
    wx.setStorageSync('leavePage', 'temporary');
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
  inputSelsectStatus: function (e) {
    changeSelectedStatus(this, false);
    // console.log('bindfocus',e)
  },
  hideSelectPanel: function (e) {
    changeSelectedStatus(this, true);
    // console.log('bindurl', e.detail.value)
    var that = this;
    if(is_input){
      that.setData({
        checkPlate: e.detail.value
      });
      plate = _province_[that.data.index] + e.detail.value;
    }
  },
  clickHide: function (e) {
    // console.log('click view to hide the select panel', e.detail.y, windowInfo*0.4)
    var that = this;
    if ((e.detail.y <= windowInfo * 0.2 || e.detail.y >= windowInfo * 0.4) && that.data.selected) {
      // console.log('select panel will be closed')
      changeSelectedStatus(that, true);
    }
  },

  /**
   * 点击label，下拉面板的显示
   */
  selectStatus: function () {
    changeSelectedStatus(this, this.data.selected);
  },

  /**
   * 下拉面板选择车牌
   */
  selectPlate: function (e) {
    plate = e.currentTarget.id;
    is_input = false;
    var p_province, p_number;
    [p_province, p_number] = slicePlate(plate);
    this.setData({
      checkPlate: p_number,
      index: p_province>0 ? p_province : 0,
    });
    changeSelectedStatus(this, this.data.selected);
  },

  /**
   * 获取支付费用
   */
  getPayMoney: function () {
    var wechatid = wx.getStorageSync('wechatID');
    var that = this;
    paycheck = true;
    that.setData({
      allready: true
    });
    begin = 100;
    // console.log(plate, wechatid);
    wx.request({
      url: HOST + rurl.getRequestURL('get_parking_fee'),
      data: {
        wechatId: wechatid,
        plate: plate.toUpperCase()
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if (res.data.state === 'SUCCEED') {
          pay_msg = res.data.message
          // console.log(pay_msg);
          wx.setStorageSync('plate', pay_msg.plate);

          if (parseInt(pay_msg.parkingactfee) <= 0) {
            that.setData({
              money: 0.0
            });
            wx.showModal({
              title: '温馨提醒',
              content: '当前车牌号并未产生停车费用',
              showCancel: false
            });
          } else {
            wx.setStorageSync('plate', pay_msg.plate);
            that.setData({
              query: false,
              money: parseFloat(pay_msg.parkingactfee) / 100,
              campus: res.data.message.campus
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
      fail: function (err) {
        // console.log(err);
        wx.showModal({
          title: 'Sorry~~~',
          content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
          showCancel: false
        });
      },
      complete: function () {
        that.setData({
          allready: false
        });
      }
    });
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
    var orderid = pay_msg ? pay_msg.orderid : '';
    var wechatid = wx.getStorageSync('wechatID');
    that.setData({
      allready: true
    });
    if (wechatid.length > 1 && orderid.length > 1) {
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
          if (res.data.state === 'SUCCEED') {
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
                  content: '感谢您的使用，您已付款成功，请在15分钟内离开学校，否则闸门将不会自动开启，且将加收您的停车费！！！',
                  showCancel: false
                });
              },
              fail: function (err) {
                // console.log(err)
                /*
                wx.showModal({
                  title: '异常信息',
                  content: err.errMsg === 'requestPayment:fail cancel' ? '支付异常：您已取消支付' : err.err_desc,
                  showCancel: false
                });
                */
              },
              complete: function () {
                that.setData({
                  allready: false
                })
              }
            });
          } else {
            wx.showModal({
              title: 'Sorry~~~',
              content: res.data.message,
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
        },
        complete: function () {
          initPanel(that);
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
  jumpToLongTerm: function(e){
    // console.log(e)
    begin = 100;
    paycheck = false;
    clearTimeout(timer);
    wx.switchTab({
      url: '../parking-fee/parking-fee',
    });
  },
  // 下拉省份简称
  bindPickerChange: function(e){
    this.setData({
      index: e.detail.value
    });
  }
});

/**
   * 更改selected状态
   */
function changeSelectedStatus(that, status) {
  that.setData({
    selected: !status
  });
}

/**
 * 登录验证
 */
function loginRequest(code, func) {
  // console.log('wechatId form storage sync:', wx.getStorageSync('wechatID'))
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
        if(wx.getStorageSync('wechatID')){
          wx.showToast({
            title: '欢迎使用',
          });
        } else {
          wx.showModal({
            title: '温馨提示',
            content: '欢迎使用江理自助parking！您只需点击省份简称，选择车牌对应省份，再输入车牌后六位，即可查询需要缴付的停车费用，通过微信支付方式完成付款,付费成功后15分钟内出门，将自动开闸。如若逾期将加收停车费用！！！',
            showCancel: false
          });
          wx.setStorageSync('wechatID', wechatId);
        }
        if (res.data.message.lastUsePlateId) {
          wx.setStorageSync('plate', (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0].length > 0 ? (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0] : '');// 直接返回给我车牌
        } else {
          // console.log(res.data.message)
        }
        // console.log((Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0]);
        // console.log('on loginRequst plates:', res.data.message.plates)
        wx.setStorageSync('plates', res.data.message.plates ? res.data.message.plates : []);
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
function getTimer(page) {
  // console.log('get timer:', begin)
  begin -= 1;
  page.setData({
    timer: begin
  });
  if (begin <= 0 && paycheck) {
    // console.log('if:', begin, paycheck)
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
  } else if (begin > 0 && !paycheck) {
    // console.log('elseif:', begin)
    begin = 100;
  } else {
    // console.log('else:', begin)
    timer = setTimeout(function () {
      getTimer(page)
    }, 1000);
  }
}

/**
 * 处理车牌号，将省份分割
 */
function slicePlate(plate_){
  // console.log('get plate::', plate)
  var pprovince = plate_.slice(0,1);
  pprovince = _province_.indexOf(pprovince);
  var pnumber = plate_.slice(1);
  // console.log('pp:'+pprovince, 'pn:'+pnumber)
  return [pprovince, pnumber];
}

/**
 * 初始化面板
 */
function initPanel(page) {
  page.setData({
    query: true,
    money: 0.0
  });
}

/**
 * 获取用户信息
 */
function getUserInfoByWechatId(wid, cpage, fun) {
  wx.request({
    url: HOST + rurl.getRequestURL('get_by_wechat_id'),
    data: {
      wechatId: wechatId
    },
    method: 'post',
    dataType: 'json',
    success: function (res) {
      if (res.data.state === 'SUCCEED') {
        // console.log("get user info by wechat id：", res)
        if (res.data.message.lastUsePlateId) {
          plate = (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0].length > 0 ? (Object.entries(res.data.message.plates).filter(e => e[1]['id'] === res.data.message.lastUsePlateId).map(e => e[1]['character']))[0] : '';
          wx.setStorageSync('plate', plate);// 直接返回给我车牌
        }
        wx.setStorageSync('plates', res.data.message.plates ? res.data.message.plates : '');
        fun();
      } else {
        wx.showModal({
          title: '提示信息',
          content: '未获取到您的wechatID',
          showCancel: false
        });
      }
    },
    fail: function (err) {
      wx.showModal({
        title: 'Sorry~~~',
        content: '服务器被坏小孩破坏了，程序猿小哥哥正在努力修复中。。。',
        showCancel: false
      });
    },
    complete: function(){
      cpage.setData({
        allready: false
      });
    }
  })
}