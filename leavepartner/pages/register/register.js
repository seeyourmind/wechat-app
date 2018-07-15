// pages/register/register.js
var SERVERURL = getApp().globalData.SERVERURL;
var app = getApp();
var code = '';
var user_info_str = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: true,
    isok: false,
    openid: '',
    session_key: '',
    userInfo: {},
    hidden_choose_view: false,
    classIndex: 0,
    classList: ['请选择您所在班级', '计算机中加', '计算机', '电信', '通信'],
    student_block: true,
    teacher_block: true,
    account: null,
    name: null,
    phone: null,
    guardian: null,
    guardian_phone: null,
    t_account: null,
    t_name: null,
    is_new_user: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.login({
      success: function (res) {
        console.log('res.code: ', res.code)
        if (res.code) {
          code = res.code;
        }
      }
    });
    console.log('code-->', code)
    var that = this;
    if (options.userInfo) {
      let item = JSON.parse(options.userInfo);
      console.log('options userInfo', item)
      that.setData({
        userInfo: item
      });
    } else {
      wx.getStorage({
        key: 'user_info_str',
        success: function (res) {
          console.log('storage user_info_str success: ', res)
          user_info_str = res.data;
          let item = JSON.parse(res.data);
          that.setData({
            userInfo: item
          });
        },
        fail: function (res) {
          console.log('storage user_info_str fail: ', res)
          wx.showModal({
            title: '提醒',
            content: '获取用户信息失败......请您稍后再试',
          })
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
   * 输入框监听事件
   */
  inputBlur: function (e) {
    var id = e.currentTarget.id;
    var that = this;
    console.log('e.value-->', e.detail.value);
    switch (id) {
      case 'a':
        that.setData({
          account: e.detail.value
        });
        break;
      case 'n':
        that.setData({
          name: e.detail.value
        });
        break;
      case 'p':
        that.setData({
          phone: e.detail.value
        });
        break;
      case 'j':
        that.setData({
          guardian: e.detail.value
        });
        break;
      case 'h':
        that.setData({
          guardian_phone: e.detail.value
        });
        break;
      case 't':
        that.setData({
          t_account: e.detail.value
        });
        break;
      case 'tn':
        that.setData({
          t_name: e.detail.value
        });
        break
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 按钮触发不同角色信息注册
   */
  choose_view_show: function (e) {
    var id = e.currentTarget.id;
    var that = this;
    switch (id) {
      case '1':
        that.setData({
          hidden_choose_view: true,
          student_block: false,
          teacher_block: true
        });
        break;
      case '2':
        that.setData({
          hidden_choose_view: true,
          student_block: true,
          teacher_block: false
        });
        break;
    }
  },
  /**
   * 返回角色选择界面
   */
  show_choose_buttoun: function () {
    var that = this;
    that.setData({
      hidden_choose_view: false,
      student_block: true,
      teacher_block: true
    });
  },
  /**
   * 用户提交事件
   */
  submitModify: function (e) {
    var id = e.currentTarget.id;
    var that = this;
    var data = {};

    that.setData({
      loadinghidden: false,
      isok: true,
    });

    switch (id) {
      case '1':
        console.log('学生提交', id);
        data = {
          jsCode: code,
          studentNumber: that.data.account,
          name: that.data.name,
          contactInformation: that.data.phone,
          guardianName: that.data.guardian,
          guardianContactInformation: that.data.guardian_phone
        }
        wx.request({
          url: SERVERURL+'/user/student_register',
          data: data,
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            that.setData({
              loadinghidden: true
            });
            if (res.data.state === 'SUCCEED') {
              console.log('success: ', res.data.message)
              wx.setStorage({
                key: 'user_data',
                data: res.data.message,
              });
              wx.setStorage({
                key: 'user_type',
                data: 'student',
              });
              wx.redirectTo({
                url: '../home/home?userInfo=' + user_info_str + '&usertype=' + 'student',
              });
            } else {
              that.setData({
                isok: false
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false
              });
              wx.login({
                success: function (res) {
                  console.log('res.code: ', res.code)
                  if (res.code) {
                    code = res.code;
                  }
                }
              });
            }
          }
        });
        break;
      case '2':
        console.log('教师提交', id);
        data = {
          jsCode: code,
          teacherNumber: that.data.t_account,
          name: that.data.t_name
        };
        wx.request({
          url: SERVERURL+'/user/teacher_register',
          data: data,
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            that.setData({
              loadinghidden: true
            });
            if (res.data.state === 'SUCCEED') {
              console.log('res.data-->', res.data.message);
              wx.setStorage({
                key: 'user_data',
                data: res.data.message,
              });
              wx.setStorage({
                key: 'user_type',
                data: 'teacher',
              });
              wx.redirectTo({
                url: '../home/home?userInfo=' + user_info_str + '&usertype=' + 'teacher',
              });
            } else {
              that.setData({
                isok: false
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false
              });
              wx.login({
                success: function (res) {
                  console.log('res.code: ', res.code)
                  if (res.code) {
                    code = res.code;
                  }
                }
              });
            }
          }
        });
        break;
    }
    console.log('data-->', data)
  }
})