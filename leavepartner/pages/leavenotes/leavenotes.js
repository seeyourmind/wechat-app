// pages/leavenotes/leavenotes.js
var wechatID = '';
var timeflag = 1;
var getallfiles = false;
var getallclassfiles = false;
var getSeacheFiles = false;
var SERVERURL = getApp().globalData.SERVERURL;
var listType = 0;
var app = getApp();
var typeforinfo = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    user_is_teacher: false,
    type_is_search: false,
    show_search: false,
    is_search_for_detail: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getallfiles = false;
    getallclassfiles = false;
    getSeacheFiles = false;
    timeflag = 1;
    console.log('SERVERURL: ', options);
    typeforinfo = options.type;
    var that = this;
    if (options.type === 'search') {
      wx.setNavigationBarTitle({
        title: '假条搜索'
      });
      that.setData({
        type_is_search: true,
        show_search: true,
      });
    }
    wx.getStorage({
      key: 'user_type',
      success: function (res) {
        console.log('user type: ', res.data);
        if (res.data === 'teacher') {
          that.setData({
            user_is_teacher: true
          });
        }
        wx.getStorage({
          key: 'user_data',
          success: function (res) {
            console.log('user data wechat id: ', res.data.wechatId);
            wechatID = res.data.wechatId;
            if (that.data.user_is_teacher && !that.data.type_is_search) {
              wx.setNavigationBarTitle({
                title: '假条审核'
              });
              that.getVerifyList(1, function (res) {
                that.setData({
                  notesList: res,
                  loadinghidden: true
                });
                console.log('all note list verifyList-->', that.data.notesList)
              });
            } else if (!that.data.user_is_teacher) {
              that.getNotesList();
              that.setData({
                loadinghidden: true
              });
            } else {
              that.getClassNoteData(1, function(res){
                that.setData({
                  notesList: res,
                  loadinghidden: true
                });
              });
            }
          },
          fail: function (res) {
            that.setData({
              loadinghidden: true
            });
            wx.showModal({
              title: '错误',
              content: '系统获取缓存参数失败...请重启小程序',
              showCancel: false,
            });
          }
        });
      },
      fail: function (res) {
        that.setData({
          loadinghidden: true
        });
        wx.showModal({
          title: '错误',
          content: '系统获取缓存参数失败...请重启小程序',
          showCancel: false,
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
    var options = {
      type: typeforinfo
    }
    this.onLoad(options)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 学生获取假条列表
   */
  getNotesList: function () {
    var that = this;
    wx.request({
      url: SERVERURL + '/student/list_student_note_for_leaves',
      data: {
        wechatId: wechatID
      },
      header: {
        'content-type': 'application/json',
        'Coche-Control': 'no-cache'
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        // console.log('res-->', res);
        if (res.data.state === 'SUCCEED') {
          that.setData({
            notesList: res.data.message,
            loadinghidden: true
          });

          // console.log('notesList-->', that.data.notesList)
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
        // console.log('res-->', res);
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

  /**
   * 显示假条详情
   */
  showNoteDetail: function (e) {
    var that = this;
    var id = parseInt(e.currentTarget.id);
    var noteArray = that.data.notesList[id];
    var noteArrayStr = JSON.stringify(noteArray);
    // console.log('e-->', noteArrayStr);
    wx.navigateTo({
      url: 'detail/detail?notestr=' + noteArrayStr + '&is_search=' + that.data.is_search_for_detail,
    });
  },

  /**
   * 教师获取班级假条列表
   */
  getClassNoteData: function(pageNum, f) {
    console.log('this is the teacher get info: ', 'getClassNoteData'+pageNum)
    var that = this;
    listType = 2;
    wx.request({
      url: SERVERURL + '/teacher/list_class_student_note_for_leaves',
      data: {
        pageSize: 10,
        pageNum: pageNum,
        wechatId: wechatID
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
            loadinghidden: true
          });
          var list_total = res.data.message.total;
          console.log('list total: ' + list_total, 'pageNum: '+ pageNum)

          if ((10 * pageNum) >= list_total) {
            getallclassfiles = true;
          }
          console.log('all note list--getallclassfiles: ', getallclassfiles)
          typeof f == 'function' && f(res.data.message.list);

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
        // console.log('res-->', res);
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

  /**
   * 教师获取审核假条列表
   */
  getVerifyList: function (pageNum, f) {
    console.log('this is the teacher get info: ', 'getVerifyList')
    var that = this;
    listType = 0;
    wx.request({
      url: SERVERURL + '/teacher/list_need_to_audit_note_for_leaves',
      data: {
        pageSize: 10,
        pageNum: pageNum,
        wechatId: wechatID
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
            loadinghidden: true
          });
          var list_total = res.data.message.total;
          console.log('list total: ', list_total)
          if(list_total <= 0){
            wx.showToast({
              title: '暂时没有假条审核信息',
            })
          }

          if ((10 * pageNum) >= list_total) {
            getallfiles = true;
          }
          console.log('all note list--getallfiles: ', getallfiles)
          typeof f == 'function' && f(res.data.message.list);

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
        // console.log('res-->', res);
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

  /**
   * 上拉加载
   */
  onReachBottom: function (e) {
    var that = this;
    if (!that.data.user_is_teacher) {
      console.log('学生端不提供上拉加载功能')
    } else {
      console.log('教师端正在使用上拉加载功能')
      timeflag += 1;
      var temparay = that.data.notesList;

      console.log('on reach bottom getallfiles: ', getallfiles)
      console.log('on reach bottom getSeacheFiles: ', getSeacheFiles)
      console.log('on reach bottom getallclassfiles: ', getallclassfiles)

      if (listType == 0) {
        if (!getallfiles) {
          console.log('上拉加载-->', timeflag)
          console.log('on reach bottom listtype: ', listType)
          console.log('总体列表加载', listType)
          that.getVerifyList(timeflag, function (res) {
            // console.log('info-->', res)
            for (var i = 0; i < res.length; i++) {
              temparay.push(res[i]);
            }
            // console.log('temparray-->', temparay)
            that.setData({
              notesList: temparay
            });
            // console.log('notesList-->', that.data.notesList)
          });
        } else {
          wx.showToast({
            title: '加载完毕',
            icon: 'loading',
            duration: 1000
          });
        }
      } else if(listType == 1) {
        if (!getSeacheFiles) {
          console.log('上拉加载-->', timeflag)
          console.log('on reach bottom listtype: ', listType)
          console.log('姓名搜索列表加载', listType)
          that.seacheFromServerForPage(timeflag, function (res) {
            // console.log('info-->', res)
            for (var i = 0; i < res.length; i++) {
              temparay.push(res[i]);
            }
            // console.log('temparray-->', temparay)
            that.setData({
              notesList: temparay
            });
            // console.log('notesList-->', that.data.notesList)
          });
        } else {
          wx.showToast({
            title: '加载完毕',
            icon: 'loading',
            duration: 1000
          });
        }
      } else {
        if (!getallclassfiles) {
          console.log('上拉加载-->', timeflag)
          console.log('on reach bottom listtype: ', listType)
          console.log('班级搜索列表加载', listType)
          that.getClassNoteData(timeflag, function (res) {
            // console.log('info-->', res)
            for (var i = 0; i < res.length; i++) {
              temparay.push(res[i]);
            }
            // console.log('temparray-->', temparay)
            that.setData({
              notesList: temparay
            });
            // console.log('notesList-->', that.data.notesList)
          });
        } else {
          wx.showToast({
            title: '加载完毕',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    }
  },

  /**
   * input内容获取
   */
  inputBlur: function (e) {
    // console.log('e.detail.value: ', e.detail.value)
    this.setData({
      seache_name: e.detail.value
    });
  },
  /**
   * 提交搜索
   */
  seacheFromServer: function () {
    var that = this;
    var name = this.data.seache_name;
    
    if(name == null){
      wx.showToast({
        title: '查询姓名不能为空',
        icon: 'none'
      });
    } else {
      this.setData({
        loadinghidden: false
      });
      timeflag = 1;
      this.seacheFromServerForPage(1, function (list) {
        if (list.length > 0) {
          that.setData({
            type_is_search: false,
            is_search_for_detail: true,
            notesList: list,
            loadinghidden: true
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '未找到您输入同学的相关假条',
            showCancel: false
          });
        }
      });
    }
  },
  seacheFromServerForPage: function (pageNum, f) {
    var name = this.data.seache_name;
    console.log('pageNum: ', pageNum);
    listType = 1;
    wx.request({
      url: SERVERURL + '/teacher/search_student_note_for_leaves_by_name',
      data: {
        wechatId: wechatID,
        studentName: name,
        pageNum: pageNum,
        pageSize: 10
      },
      header: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        console.log('success res: ', res)
        if (res.data.state === 'SUCCEED') {
          var list_total = res.data.message.total;
          if ((10 * pageNum) >= list_total) {
            getSeacheFiles = true;
          }
          typeof f == 'function' && f(res.data.message.list);
        } else {
          wx.showModal({
            title: '失败',
            content: res.data.message,
            showCancel: false,
          });
        }
      },
      fail: function (res) {
        // console.log('fail res: ', res)
        wx.showModal({
          title: '错误',
          content: res.errMsg,
          showCancel: false,
        });
      }
    })
  },

  /**
   * 判断当前假条所处状态
   */
  checkNoteState: function (state) {
    var that = this;
    var stateinfo = '';
    switch (state) {
      case 'NEED_AUDIT':
        stateinfo = '待审核';
        break;
      case 'CANCELED':
        stateinfo = '被用户取消';
        break;
      case 'HEAD_TEACHER_PASS':
        stateinfo = '班主任审核通过';
        break;
      case 'HEAD_TEACHER_NOT_PASS':
        stateinfo = '班主任审核不通过';
        break;
      case 'COUNSELOR_TEACHER_PASS':
        stateinfo = '辅导员审核通过';
        break;
      case 'COUNSELOR_TEACHER_NOT_PASS':
        stateinfo = '辅导员审核不通过';
        break;
      case 'REPORTED_BACK_NEED_AUDIT':
        stateinfo = '销假审核';
        break;
      case 'REPORTED_BACK_HEAD_TEACHER_PASS':
        stateinfo = '班主任审核销假通过';
        break;
      case 'REPORTED_BACK_HEAD_TEACHER_NOT_PASS':
        stateinfo = '班主任审核销假不通过';
        break;
    }
  },
})