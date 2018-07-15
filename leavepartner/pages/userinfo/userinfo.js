// pages/userinfo/userinfo.js
var SERVERURL = getApp().globalData.SERVERURL;
var myPhone = '';
var guardianName = '';
var guardianPhone = '';
var old_data = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    user_is_teacher: false,
    modifyOpreation: true,
    loadinghidden: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.avatarUrl) {
      that.setData({
        avatarUrl: options.avatarUrl
      });
      console.log('avatarUrl', that.data.avatarUrl);
      wx.getStorage({
        key: 'user_type',
        success: function (res) {
          if (res.data === 'teacher') {
            that.setData({
              user_is_teacher: true
            });
          } else {
            that.setData({
              user_is_teacher: false
            });
          }
          console.log('user_is_teacher-->', that.data.user_is_teacher)
          wx.getStorage({
            key: 'user_data',
            success: function (res) {
              old_data = res.data;
              that.setData({
                userInfo: res.data
              });
              console.log('userInfo-->', that.data.userInfo)
            },
            fail: function (res) {
              wx.showModal({
                title: '错误',
                content: '系统内部获取参数失败...请您重启小程序',
                showCancel: false,
              });
            }
          })
        },
      });
    } else {
      wx.showModal({
        title: '错误',
        content: '系统内部获取参数失败...请您返回首页后重试',
        showCancel: false,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 输入框监听事件
   */
  inputBlur: function (e) {
    var id = e.currentTarget.id;
    var that = this;
    console.log('e.value-->', e.detail);
    switch (id) {
      case 'mp':
        if (e.detail.value === that.data.userInfo.contactInformation) {
          that.setData({
            modifyOpreation: true
          });
        } else {
          myPhone = e.detail.value;
          var account = 'userInfo.contactInformation';
          that.setData({
            //[account]: e.detail.value,
            modifyOpreation: false
          });
        }
        break;
      case 'gn':
        if (e.detail.value === that.data.userInfo.guardianName) {
          that.setData({
            modifyOpreation: true
          });
        } else {
          guardianName = e.detail.value;
          var name = 'userInfo.guardianName';
          that.setData({
            //[name]: e.detail.value,
            modifyOpreation: false
          });
        }
        break;
      case 'gp':
        if (e.detail.value === that.data.userInfo.guardianContactInformation) {
          that.setData({
            modifyOpreation: true
          });
        } else {
          guardianPhone = e.detail.value;
          var phone = 'userInfo.guardianContactInformation';
          that.setData({
            //[phone]: e.detail.value,
            modifyOpreation: false
          });
        }
        break;
    }
  },

  /**
   * 提交修改信息
   */
  submitModify: function () {
    var that = this;
    var data = {};
    var phonemodify = false;
    var gnamemodify = false;
    var gphonemodify = false;
    console.log('submit data: ', myPhone + '/' + guardianName + '/' + guardianPhone + '')
    console.log('submit data: ', 'myphone.lemgth>5: ', (myPhone.length > 5))
    console.log('submit data: ', 'guardianName.length > 1: ', (guardianName.length > 1))
    console.log('submit data: ', 'guardianPhone.length > 5: ', (guardianPhone.length > 5))
    that.setData({
      loadinghidden: false
    });
    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        console.log('old user_data: ', res.data)
        var wechatID = res.data.wechatId;
        data = {
          wechatId: wechatID
        };
        if(myPhone.length > 5) phonemodify = true;
        if(guardianName.length > 1) gnamemodify = true;
        if(guardianPhone.length > 5) gphonemodify = true;
        
        if ((myPhone.length > 5) && (guardianName.length > 1) && (guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            contactInformation: myPhone,
            guardianName: guardianName,
            guardianContactInformation: guardianPhone
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: myPhone,
            guardianContactInformation: guardianPhone,
            guardianName: guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if ((myPhone.length > 5) && (guardianName.length > 1) && !(guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            contactInformation: myPhone,
            guardianName: guardianName,
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: myPhone,
            guardianContactInformation: res.data.guardianContactInformation,
            guardianName: guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if (!(myPhone.length > 5) && (guardianName.length > 1) && (guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            guardianName: guardianName,
            guardianContactInformation: guardianPhone
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: res.data.contactInformation,
            guardianContactInformation: guardianPhone,
            guardianName: guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if ((myPhone.length > 5) && !(guardianName.length > 1) && (guardianPhone.length > 5)){
          data = {
            wechatId: wechatID,
            contactInformation: myPhone,
            guardianContactInformation: guardianPhone
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: myPhone,
            guardianContactInformation: guardianPhone,
            guardianName: res.data.guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if ((myPhone.length > 5) && !(guardianName.length > 1) && !(guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            contactInformation: myPhone,
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: myPhone,
            guardianContactInformation: res.data.guardianContactInformation,
            guardianName: res.data.guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if (!(myPhone.length > 5) && (guardianName.length > 1) && !(guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            guardianName: guardianName,
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: res.data.contactInformation,
            guardianContactInformation: res.data.guardianContactInformation,
            guardianName: guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else if (!(myPhone.length > 5) && !(guardianName.length > 1) && (guardianPhone.length > 5)) {
          data = {
            wechatId: wechatID,
            guardianContactInformation: guardianPhone
          };
          old_data = {
            classId: res.data.classId,
            className: res.data.className,
            contactInformation: res.data.contactInformation,
            guardianContactInformation: guardianPhone,
            guardianName: res.data.guardianName,
            id: res.data.id,
            name: res.data.name,
            studentNumber: res.data.studentNumber,
            wechatId: res.data.wechatId
          }
        } else {
          that.setData({
            loadinghidden: true
          });
          wx.showModal({
            title: '失败',
            content: '您提交的信息有误，或是您的信息未作任何修改',
            showCancel: false
          });
        }
        console.log('submit data  dont wechatid: ', data)
        if (data.hasOwnProperty('wechatId')) {
          console.log('submit data : ', data)
          wx.request({
            url: SERVERURL + '/student/update_information',
            data: data,
            header: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            dataType: 'json',
            success: function (res) {
              that.setData({
                loadinghidden: true
              });
              console.log('success res: ', res);
              if (res.data.state === 'SUCCEED') {
                wx.showModal({
                  title: '成功',
                  content: res.data.message,
                  showCancel: false
                });
                console.log('submit old data: ', old_data)
                wx.setStorage({
                  key: 'user_data',
                  data: old_data,
                })
              } else {
                wx.showModal({
                  title: '失败',
                  content: res.data.message,
                  showCancel: false
                });
              }
            },
            fail: function (res) {
              that.setData({
                loadinghidden: true
              });
              console.log('fail res: ', res);
              wx.showModal({
                title: '错误',
                content: res.errMsg,
                showCancel: false
              });
            }
          });
        }
      },
      fail: function (res) {
        that.setData({
          loadinghidden: true
        });
        wx.showModal({
          title: '错误',
          content: '系统获取参数失败，请您返回首页后重试',
          showCancel: false
        });
      }
    });
  }
})