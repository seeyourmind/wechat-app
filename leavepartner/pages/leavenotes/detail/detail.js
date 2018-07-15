// pages/leavenotes/detail/detail.js
var SERVERURL = getApp().globalData.SERVERURL;
var notedata = '';
var latitude = null;
var longitude = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showylModal: false,
    showModal: false,
    cancel_reason: '',
    note: {},
    stateInfo: '',
    stateInfoFlag: 0,
    user_is_teacher: false,
    backOK: false,
    type_is_search: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getLocation({
      success: function (res) {
        latitude = res.latitude;
        longitude = res.longitude;
      },
      fail: function (res) {
        wx.showModal({
          title: '警告',
          content: '由于您尚未授权[location]权限，所以此功能无法使用',
          confirmColor: '#ff0000',
          cancelText: '不授权',
          confirmText: '授权',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 2000
                    });
                  }
                }
              });
            } if (res.cancel) {
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      }
    });
    console.log('options-->', options.notestr);
    console.log('options.is_search: ', options.is_search);
    if(options.is_search) {
      that.setData({
        type_is_search: options.is_search,
      });
    }
    if (options.notestr) {
      notedata = options.notestr;
      let item = JSON.parse(notedata);
      that.setData({
        note: item
      });
      that.checkNoteState(that.data.note.state);
      console.log('note-->', that.data.note)
    } else {
      wx.showModal({
        title: '错误',
        content: '系统页面间传值错误...',
        showCancel: false,
      });
    }
    wx.getStorage({
      key: 'user_type',
      success: function (res) {
        if (res.data === 'teacher') {
          that.setData({
            user_is_teacher: true
          });
        }
      },
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
   * 拒绝审核
   */
  cancelVerify: function () {
    this.setData({
      showModal: true
    });
  },

  /**
   * 通过审核
   */
  confirmVerify: function () {
    var that = this;
    var wechatID = '';
    var ID = '';

    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        wechatID = res.data.wechatId;
        ID = that.data.note.id;
        wx.request({
          url: SERVERURL+'/teacher/audit_note_for_leave',
          data: {
            wechatId: wechatID,
            id: ID,
            pass: 'true'
          },
          header: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            console.log('res-->', res);
            if (res.data.state === 'SUCCEED') {
              wx.showModal({
                title: '成功',
                content: res.data.message,
                showCancel: false,
                success: function(res) {
                  if(res.confirm){
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              })
            } else {
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false
              });
            }
          },
          fail: function (res) {
            console.log('res-->', res);
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '失败',
              content: res.errMsg,
              showCancel: false
            });
          }
        });
      }
    });
  },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 获取textarea内容
   */
  inputChange: function (e) {

    this.setData({
      cancel_reason: e.detail.value
    });
    console.log('e-->', this.data.cancel_reason);
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
    this.setData({
      cancel_reason: ''
    });
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
    var that = this;
    var wechatID = '';
    var ID = '';
    var cancelReason = that.data.cancel_reason;

    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        wechatID = res.data.wechatId;
        ID = that.data.note.id;
        wx.request({
          url: SERVERURL+'/teacher/audit_note_for_leave',
          data: {
            wechatId: wechatID,
            id: ID,
            pass: 'false',
            notPassReason: cancelReason
          },
          header: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            console.log('res-->', res);
            if (!(res.data.state === 'FAILED')) {
              wx.showModal({
                title: '成功',
                content: res.data.message,
                showCancel: false
              })
            } else {
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false
              });
            }
          },
          fail: function (res) {
            console.log('res-->', res);
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '失败',
              content: res.errMsg,
              showCancel: false
            });
          }
        });
      }
    });
  },

  /**
   * 撤销假条
   */
  cancelNote: function () {
    var that = this;
    var wechatID = '';
    var ID = null;

    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        wechatID = res.data.wechatId;
        ID = that.data.note.id;
        wx.request({
          url: SERVERURL+'/student/cancel_note_for_leave',
          data: {
            wechatId: wechatID,
            id: ID,
          },
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            console.log('res-->', res);
            if (res.data.state === 'SUCCEED') {
              wx.showModal({
                title: '成功',
                content: res.data.message,
                showCancel: false,
                success: function(res) {
                  if(res.confirm){
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              });
            } else {
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '失败',
                content: res.data.message,
                showCancel: false
              });
            }
          },
          fail: function (res) {
            console.log('res-->', res);
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '失败',
              content: res.errMsg,
              showCancel: false
            });
          }
        });
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: '系统获取缓存参数失败...请重启小程序',
          showCancel: false,
        });
      },
    });
  },

  /**
   * 判断当前假条所处状态
   */
  checkNoteState: function (state) {
    var that = this;
    switch (state) {
      case 'NEED_AUDIT':
        that.setData({
          stateInfo: '待审核',
          stateInfoFlag: 0,
        });
        break;
      case 'CANCELED':
        that.setData({
          stateInfo: '被用户取消',
          stateInfoFlag: 1,
        });
        break;
      case 'HEAD_TEACHER_PASS':
        that.setData({
          stateInfo: '待审核',
          stateInfoFlag: 0,
        });
        break;
      case 'HEAD_TEACHER_NOT_PASS':
        that.setData({
          stateInfo: '班主任审核未通过',
          stateInfoFlag: 1,
        });
        break;
      case 'COUNSELOR_TEACHER_PASS':
        that.setData({
          stateInfo: '请假成功',
          stateInfoFlag: 2,
        });
        break;
      case 'COUNSELOR_TEACHER_NOT_PASS':
        that.setData({
          stateInfo: '辅导员审核未通过',
          stateInfoFlag: 1,
        });
        break;
      case 'REPORTED_BACK_NEED_AUDIT':
        that.setData({
          stateInfo: '销假审核',
          stateInfoFlag: 0,
        });
        break;
      case 'REPORTED_BACK_HEAD_TEACHER_PASS':
        that.setData({
          stateInfo: '销假成功',
          stateInfoFlag: 2,
        });
        break;
      case 'REPORTED_BACK_HEAD_TEACHER_NOT_PASS':
        that.setData({
          stateInfo: '销假审核未通过',
          stateInfoFlag: 1,
        });
        break;
    }
  },

  /**
   * 查看学生提交假条定位
   */
  findStudentFromMap: function () {
    var note = this.data.note;
    console.log('note: ', note);
    var latitude = note.studentsPositionLatitude;
    var longitude = note.studentsPositionLongitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
    })
  },

  /**
   * 学生请假审核被拒，提交修改
   */
  modifyNote: function() {
    var note = this.data.note;
    if (note.type === 'INTERNSHIPS') {
      wx.navigateTo({
        url: '../../modifynote/common/common?notedata=' + notedata + '&notetype=' + 'i',
      });
    } else {
      wx.navigateTo({
        url: '../../modifynote/common/common?notedata=' + notedata,
      });
    }
  },
  /**
   * 学生返校销假
   */
  backlNote: function() {
    var that = this;
    var wechatID = '';
    var ID = null;

    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        wechatID = res.data.wechatId;
        ID = that.data.note.id;
        wx.request({
          url: SERVERURL + '/student/reported_back',
          data: {
            wechatId: wechatID,
            id: ID,
            studentsPositionLatitude: latitude,
            studentsPositionLongitude: longitude
          },
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            console.log('res-->', res);
            if (res.data.state === 'SUCCEED') {
              that.setData({
                backOK: true
              });
              wx.showModal({
                title: '成功',
                content: res.data.message,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              })
            } else {
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
            console.log('res-->', res);
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '失败',
              content: res.errMsg,
              showCancel: false,
            });
          }
        });
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: '系统获取缓存参数失败...请重启小程序',
          showCancel: false,
        });
      },
    });
  },
  /**
   * 续假
   */
  continueNote: function() {
    var that = this;
    var wechatID = '';
    var ID = null;

    wx.getStorage({
      key: 'user_data',
      success: function (res) {
        wechatID = res.data.wechatId;
        ID = that.data.note.id;
        wx.request({
          url: SERVERURL + '/student/extend_leave',
          data: {
            wechatId: wechatID,
            id: ID,
            studentsPositionLatitude: latitude,
            studentsPositionLongitude: longitude
          },
          header: {
            'content-type': 'application/json',
            'Coche-Control': 'no-cache'
          },
          method: 'POST',
          dataType: 'json',
          success: function (res) {
            console.log('res-->', res);
            if (res.data.state === 'SUCCEED') {
              that.setData({
                backOK: true
              });
              wx.showModal({
                title: '成功',
                content: res.data.message,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              })
            } else {
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
            console.log('res-->', res);
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '失败',
              content: res.errMsg,
              showCancel: false,
            });
          }
        });
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: '系统获取缓存参数失败...请重启小程序',
          showCancel: false,
        });
      },
    });
  },
  /**
   * 预览图片
   */
  ylimg: function (e) {
    var imageID = e.currentTarget.id;
    var that = this;
    switch (imageID) {
      case '1':
        that.setData({
          showylModal: true,
          yl_image: SERVERURL + '/image_files/' + that.data.note.internshipCertificateFilename
        });
        break;
      case '2':
        that.setData({
          showylModal: true,
          yl_image: SERVERURL + '/image_files/' + that.data.note.guardianIdCardFilename
        });
        break;
    }
  },
  /**
   * 隐藏预览
   */
  hideylModal: function() {
    this.setData({
      showylModal: false,
      yl_image: ''
    });
  }
})