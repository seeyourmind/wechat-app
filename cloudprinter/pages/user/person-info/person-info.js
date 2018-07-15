// person-info.js
var util = require('../../../utils/util.js');
var app = getApp();
var wxid = null;
var userid = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    today: util.getCurDate(),
    birthday: '请选择您的生日',
    account: '',
    level: '',
    name: null,
    sex: null,
    sexarray: ['请选择您的性别', '男', '女'],
    index: 0,
    phone: null,
    identification: null,
    homeaddress: null,
    isok: true
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
    wxid = options.wxid;
    console.log('掺入的参数userid',userid,'wxid',wxid)

    //调用应用实例的方法获取全局数据，获取用户信息
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        account: options.id,
        level: options.level
      })
      console.log('app.getUserInfo' + userInfo.iv)
    });

    that.getUserBasicInfo(that.data.account, function (info) {
      console.log('return info = ',info)
      console.log('name', info.Truename.length, 'sex', info.SEX.length, 'mobile', info.mobile.length, 'cardid', info.CARDID.length, 'address', info.ADDRESS.length, 'birthday', info.BIRTHDAY.length)
      var birthday = '请选择您的生日';
      var name = null;
      var sex = null;
      var phone = null;
      var identification = null;
      var homeaddress = null;
      var index = 0;
      if(info.Truename.length > 0){
        name = info.Truename;
      } if (info.SEX.length > 0) {
        sex = info.SEX;
        if(sex == '男'){
          index = 1;
        } else if(sex=='女') {
          index = 2;
        }
      } if (info.mobile.length > 0) {
        phone = info.mobile;
      } if (info.CARDID.length > 0) {
        identification = info.CARDID;
      } if (info.ADDRESS.length > 0) {
        homeaddress = info.ADDRESS;
      } if (info.BIRTHDAY.length > 0) {
        birthday = info.BIRTHDAY;
      }
      that.setData({
        birthday: birthday,
        name: name,
        sex: sex,
        index: index,
        phone: phone,
        identification: identification,
        homeaddress: homeaddress,
        isok: false
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
   * 获取用户基本信息
   */
  getUserBasicInfo: function (userid, f) {
    console.log('getUserInfomaction被调用', userid)
    var info = null;
    var that = this;

    if (info) {
      typeof f == "function" && f(info)
    } else {
      wx: wx.request({
        url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
        data: {
          Flag: 5,
          userid: userid
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            info = res.data.items[0];
            typeof f == "function" && f(info)
          } else {
            wx.showToast({
              title: '没有该用户(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2000
            })
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
          console.log('return info', info)
          that.setData({
            loadinghidden: true
          })
          return info;
        }
      });
    }
  },

  /**
   * 获取修改后的信息
   */
  inputBlur: function (e) {
    var inputid = e.currentTarget.id;
    console.log('当前id', inputid)
    var that = this;
    switch (inputid) {
      case 'n':
        that.setData({
          name: e.detail.value
        });
        break;
      case 's':
        that.setData({
          sex: e.detail.value
        });
        break;
      case 'p':
        that.setData({
          phone: e.detail.value
        });
        break;
      case 'i':
        that.setData({
          identification: e.detail.value
        });
        break;
      case 'h':
        that.setData({
          homeaddress: e.detail.value
        });
        break;
      default:
        break;
    }
  },
  bindDateChange: function (e) {
    var pickerid = e.currentTarget.id;
    var that = this;
    console.log('当前id', pickerid)

    var choosesex = that.data.sexarray[e.detail.value];
    console.log('当前id', choosesex)
    if (choosesex == '请选择您的性别') {
      choosesex = '';
    }
    if (pickerid == '1') {
      that.setData({
        index: e.detail.value,
        sex: choosesex
      });
    } else if (pickerid == '2') {
      this.setData({
        birthday: e.detail.value
      });
    } else {
      console.log('picker error')
    }
  },

  /**
   * 提交用户信息
   */
  submitModify: function () {
    var that = this;
    console.log(wxid,userid,that.data.name, that.data.sex, that.data.birthday, that.data.phone, that.data.identification, that.data.homeaddress);
    var name = '';
    var sex = '';
    var birthday = '';
    var phone = '';
    var identification ='';
    var homeaddress='';
    if (isNaN(that.data.name)){
      name = that.data.name;
    } if (isNaN(that.data.sex)){
      sex = that.data.sex;
    } if (that.data.birthday !='请选择您的生日'){
      birthday = that.data.birthday;
    } if (parseInt(that.data.phone)>1) {
      phone = that.data.phone;
    } if (isNaN(that.data.identification)) {
      identification = that.data.identification;
    } if (isNaN(that.data.homeaddress)) {
      homeaddress = that.data.homeaddress;
    }
    console.log(wxid, userid, name, sex, birthday, phone, identification, homeaddress);
    wx: wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
      data: {
        Flag: 9,
        Turename: name,
        sex: sex,
        birthday: birthday,
        mobile: phone,
        cardid: identification,
        address: homeaddress,
        WXID: wxid,
        UserId: userid
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        console.log('success res', res);
        if (res.statusCode == 200 && res.data.total > 0) {
          wx.showToast({
            title: '操作成功啦~\(≧▽≦)/~稍后跳转至首页',
            icon: 'success',
            duration: 2000
          });
          setTimeout(function(){
            // 关闭页面
            wx.navigateBack({
              delta: 1
            });
          },2000)
          
        } else {
          wx.showToast({
            title: '没有该用户(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        console.log('fail res', res);
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    });
  }
})