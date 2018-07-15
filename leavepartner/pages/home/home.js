// home.js
var app = getApp()
var authoritynum = 3
var WXID = null
var id = null
var level = null
var sceneID = 1001;
var user_data_from_storage = null;
var user_info_str = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //初始化控件名
    identifyMachine: '欢迎使用江理请假助手',
    machineId: '欢迎使用江理请假助手',
    loadinghidden: false,

    //用户信息
    userInfo: {},

    //导航按钮
    buttonGroup: {
      //用户权限
      userIsTeacher: false,

      studentItem: [
        [{
          action: 'myLeaveNotes',
          icon: 'icon',
          color: '#B23AEE',
          text: '我的假条',
        }, {
          action: 'applyLeaveNote',
          icon: 'shenqing',
          color: '#00B2EE',
          text: '请假申请',
        }, {
          action: 'myMessages',
          icon: 'icon-',
          color: '#00CD00',
          text: 'READ ME',
        }],
      ],
      teacherItem: [
        [{
          action: 'notesVerify',
          icon: 'shenhe',
          color: '#CD0000',
          text: '假条审核',
        }, {
          action: 'searchNote',
          icon: 'sousuo',
          color: '#00b2ee',
          text: '假条搜索'
        }, {
          action: 'myMessages',
          icon: 'icon-',
          color: '#00CD00',
          text: 'READ ME',
        }]
      ]
    }
  },

  //跳转到“我的假条”页面
  myLeaveNotes: function () {
    wx.navigateTo({
      url: '../leavenotes/leavenotes?type=' + 'my'
    })
  },
  //弹出请假类型选择菜单
  applyLeaveNote: function () {
    wx.showActionSheet({
      itemList: ["普通假条", "实习假条"],
      success: function (res) {
        switch (res.tapIndex) {
          case 0:
          //跳转到“普通假条”界面
            wx.navigateTo({
              url: '../applynote/common/common?notetype='+'c',
            });
            break;
          case 1:
          //跳转到“实习假条”界面
            wx.navigateTo({
              url: '../applynote/common/common?notetype='+'i',
            });
            break;
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  //跳转到“我的消息”页面
  myMessages: function () {
    wx.navigateTo({
      url: '../messages/messages'
    })
  },
  //用户个人信息界面
  jumpuserinfo: function() {
    wx.navigateTo({
      url: '../userinfo/userinfo?avatarUrl=' + this.data.userInfo.avatarUrl,
    })
  },
  //审核假条
  notesVerify: function() {
    wx.navigateTo({
      url: '../leavenotes/leavenotes?type=' + 'shenhe',
    })
  },
  //查找假条
  searchNote: function() {
    wx.navigateTo({
      url: '../leavenotes/leavenotes?type=' + 'search',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('options: ', options)
    if (options.usertype) {
      console.log('options.usertype: ', options.usertype);
      var userISTEACHER = 'buttonGroup.userIsTeacher';
      if (options.usertype === 'teacher') {
        that.setData({
          [userISTEACHER]: true
        });
        console.log('user_is_teacher: ', that.data.userIsTeacher)
      } else {
        that.setData({
          [userISTEACHER]: false
        });
        console.log('user_is_teacher: ', that.data.userIsTeacher)
      }
    }
    
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 跳转到修改用户信息界面
   */
  modifyPersonInfo: function (e) {
    wx.navigateTo({
      url: '../user/person-info/person-info?id=' + id + '&level=' + level + '&wxid=' + WXID + '&linkmachine=' + app.globalData.usingMachineId,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
})