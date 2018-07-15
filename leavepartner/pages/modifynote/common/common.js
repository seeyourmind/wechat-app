// pages/applynote/common/common.js
var util = require('../../../utils/util.js');
var SERVERURL = getApp().globalData.SERVERURL;
var wechatId = null;
var leaveTime = null;
var backTime = null;
var studentsPositionLatitude = null;
var studentsPositionLongitude = null;
var user_data_from_storage = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: true,
    today: util.getCurDate(),
    endday: util.getEndDate(),
    id: null,
    start_date: '确定日期',
    start_time: '确定时间',
    end_date: '确定日期',
    end_time: '确定时间',
    notes_type: 'c',
    user_modified: false,
    user_modified_reason: false,
    user_modified_leave: false,
    user_modified_back: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getLocation({
      success: function(res) {
        studentsPositionLatitude = res.latitude;
        studentsPositionLongitude = res.longitude;
      },
      fail: function(res) {
        wx.showModal({
          title: '错误',
          content: '未获取您的位置信息，本次修改将无法成功，请稍后重试',
          showCancel: false,
        })
      }
    })
    if(options.notedata) {
      let item = JSON.parse(options.notedata);
      console.log('item data is: ', item)
      var leaveTimeArray = item.leaveTime.split(' ');
      var backTimeArray = item.backTime.split(' ');
      var startdata = leaveTimeArray[0];
      var starttime = leaveTimeArray[1].substr(0,5);
      var enddata = backTimeArray[0];
      var endtime = backTimeArray[1].substr(0,5);
      that.setData({
        old_note: item,
        old_start_date: startdata,
        old_start_time: starttime,
        old_end_date: enddata,
        old_end_time: endtime,
        noteid: item.id,
        start_date: startdata,
        start_time: starttime,
        end_date: enddata,
        end_time: endtime,
        reason: item.reason
      });
      wx.getStorage({
        key: 'user_data',
        success: function (res) {
          user_data_from_storage = res.data;
          wechatId = res.data.wechatId;
          console.log('user data: ', user_data_from_storage)
        },
      });
      
      var that = this;
      if (options.notetype == 'i') {
        that.setData({
          notes_type: 'i'
        });
      }
    } else {
      wx.showModal({
        title: '错误',
        content: '系统获取数据失败...请返回重试',
        showCancel: false
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
   * 表单提交
   */
  formSubmit: function (e) {
    this.setData({
      loadinghidden: false
    });
    var that = this;
    var id = this.data.notes_type;
    console.log('e-->', id);
    var submit_data = e.detail.value;
   
    console.log('formsubmit-->', e.detail.value)
    leaveTime = e.detail.value.startdate + 'T' + e.detail.value.starttime + ':00.000';
    backTime = e.detail.value.enddate + 'T' + e.detail.value.endtime + ':00.000';
    
    var data = {}
    if (that.data.notes_type === 'i') {
      data = {
        id: that.data.noteid,
        wechatId: wechatId,
        reason: e.detail.value.reason,
        leaveTime: leaveTime,
        backTime: backTime,
        studentsPositionLatitude: studentsPositionLatitude,
        studentsPositionLongitude: studentsPositionLongitude,
      }
    } else {
      if ((that.data.user_modified_leave || that.data.user_modified_back) && that.data.user_modified_reason) {
        data = {
          id: that.data.noteid,
          wechatId: wechatId,
          reason: e.detail.value.reason,
          leaveTime: leaveTime,
          backTime: backTime,
          studentsPositionLatitude: studentsPositionLatitude,
          studentsPositionLongitude: studentsPositionLongitude,
        }
      } else if (!that.data.user_modified_reason) {
        data = {
          id: that.data.noteid,
          wechatId: wechatId,
          leaveTime: leaveTime,
          backTime: backTime,
          studentsPositionLatitude: studentsPositionLatitude,
          studentsPositionLongitude: studentsPositionLongitude,
        }
      } else {
        data = {
          id: that.data.noteid,
          wechatId: wechatId,
          reason: e.detail.value.reason,
          studentsPositionLatitude: studentsPositionLatitude,
          studentsPositionLongitude: studentsPositionLongitude,
        }
      }
    }

    
    switch(id) {
      case 'i':
        console.log('i submit data: ', data)
        that.setData({
          loadinghidden: true
        });
        wx.navigateTo({
          url: '../internship/internship2?data=' + JSON.stringify(data) + '&file1=' + that.data.old_note.internshipCertificateFilename + '&file2=' + that.data.old_note.guardianIdCardFilename + '&user_modified=' + that.data.user_modified,
        });
        break;
      case 'c': 
        console.log('c submit data: ', data)
        wx.request({
          url: SERVERURL +'/student/update_general_note_for_leave',
          data: data,
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            if (res.data.state === 'SUCCEED') {
              console.log('success: ', res.data)
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '成功',
                content: '您的请假信息成功修改，请耐心等待系统审核。',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 2
                    });
                  }
                }
              });
            } else {
              console.log('res.data.message: ', res.data.message)
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false,
              });
            }
          },
          fail: function (res) {
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '服务器错误',
              content: res.errMsg,
              showCancel: false,
            });
          }
        });
        break;
    }
  },

  /**
   * 获取用户选择的请假实践数据
   */
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.currentTarget.id)
    var id = e.currentTarget.id;
    var that = this;
    switch (id) {
      case 'sd':
        that.setData({
          start_date: e.detail.value
        });
        break;
      case 'st':
        that.setData({
          start_time: e.detail.value
        });
        break;
      case 'ed':
        that.setData({
          end_date: e.detail.value
        });
        break;
      case 'et':
        that.setData({
          end_time: e.detail.value
        });
        break;
    }
    console.log('old start: ', that.data.old_start_date + ' ' + that.data.old_start_time);
    console.log('new start: ', that.data.start_date + ' ' + that.data.start_time);
    if((that.data.old_start_date === that.data.start_date) && (that.data.old_start_time === that.data.start_time)) {
      that.setData({
        user_modified_leave: false
      });
    } else {
      that.setData({
        user_modified_leave: true
      });
    }
    console.log('old end: ', that.data.old_end_date + ' ' + that.data.old_end_time);
    console.log('new end: ', that.data.end_date + ' ' + that.data.end_time);
    if ((that.data.old_end_date === that.data.end_date) && (that.data.old_end_time === that.data.end_time)) {
      that.setData({
        user_modified_back: false
      });
    } else {
      that.setData({
        user_modified_back: true
      });
    }
    that.userModifiedData();
  },

  /**
   * 判断用户否是修改了数据
   */
  chageReason: function(e) {
    var that = this;
    var new_reason = e.detail.value;
    var old_reason = that.data.reason;
    if(new_reason === old_reason){
      console.log('modify info tap: ', 'reason is not modified')
      that.setData({
        user_modified_reason: false
      });
    } else {
      that.setData({
        user_modified_reason: true
      });
    }
    that.userModifiedData();
  },
  /**
   * 结合时间与原因判断用户是否修改了数据
   */
  userModifiedData: function() {
    var reason_m = this.data.user_modified_reason;
    var leave_m = this.data.user_modified_leave;
    var back_m = this.data.user_modified_back;
    var that = this;
    if(reason_m || leave_m || back_m) {
      that.setData({
        user_modified: true
      });
    } else {
      that.setData({
        user_modified: false
      });
    }
  }
})