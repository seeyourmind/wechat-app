// home.js
var app = getApp()
var authoritynum = 3
var WXID = null
var id = null
var level = null
var sceneID = 1001

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //初始化控件名
    identifyMachine: '未连接云印机',
    machineId: '未连接云印机',
    loadinghidden: false,

    //用户信息
    userInfo: {},

    //导航按钮
    buttonGroup: {
      //用户权限
      authority: 0,

      useritem: [
        //1
        [{
          action: 'scanMachineQR_Code',
          icon: 'erweima2',
          text: '扫码机器',
        }, {
          action: 'jumpToUploadFile',
          icon: 'shangchuan4',
          text: '上传打印',
        }, {
          action: 'jumpToNearMachine',
          icon: 'fujin',
          text: '找云印机',
        }],
        //2
        [{
          action: 'jumpToFileManager',
          icon: 'wenjian',
          text: '管理文件',
        }, {
          action: 'jumpToOrderDetails',
          icon: 'dingdan2',
          text: '订单详情',
        }, {
          action: 'jumpToCustomerService',
          icon: 'xiangqing',
          text: '联系客服',
        }],
      ],
      agentitem: [
        //3
        [{
          action: 'jumpToChangePrice',
          icon: 'xiugaijiage',
          text: '修改价格'
        }, {
          action: 'jumpToAccount',
          icon: 'jiaoyizonge',
          text: '交易详情'
        }, {
          action: 'jumpToMachineStatus',
          icon: 'zhuangtai2',
          text: '机器状态'
        }],
      ],
      maintainitem: [
        //4
        [{
          action: 'jumpToMachineError',
          icon: 'yichang2',
          text: '异常机器'
        }, {
          action: 'jumpToOperationLog',
          icon: 'caozuojilu',
          text: '操作日志'
        }, {
          action: 'jumpToMyMaintain',
          icon: 'unif056',
          text: '我的维护'
        }],
        //5
        [{
          action: 'jumpToMaintainLog',
          icon: 'icon_bianmaweihu',
          text: '维护日志'
        }, {}, {}]
      ],
      manageritem: [
        //6
        [{
          action: 'jumpToMachineConfigure',
          icon: 'peizhiwenjian-def',
          text: '配置机器'
        }, {
          action: 'jumpToAssignForAgent',
          icon: 'daiduilaoshifenpei',
          text: '分配代理'
        }, {
          action: 'jumpToAssignForMaintain',
          icon: 'fenpeicaigouyuan',
          text: '分配维护'
        }],
        //7
        [{
          action: 'jumpToChangeLevel',
          icon: 'gangweitiaozheng',
          text: '调整级别'
        }, {}, {}]
      ]
    }
  },

  //扫描二维码
  scanMachineQR_Code: function () {
    var that = this
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        //判断扫描的是否是机器地址
        if (res.result.indexOf(app.globalData.machineQR_CodeURL) >= 0) {
          //查找ID字段位置
          var idIndexStart = res.result.indexOf(app.globalData.machineIdURL_Field)
          if (idIndexStart >= 0) {
            idIndexStart += app.globalData.machineIdURL_Field.length + 1
            var idIndexEnd = res.result.indexOf('&', idIndexStart)
            var machineId = null
            if (idIndexEnd < 0) {
              machineId = res.result.substring(idIndexStart)
            } else {
              machineId = res.result.substring(idIndexStart, idIndexEnd)
            }
            //需要判断获取id不为空
            if (machineId && machineId.length > 0) {
              //是机器地址
              wx.showToast({
                title: '扫描成功',
                icon: 'success'
              })
              //保存到App中的usingMachineId
              app.globalData.usingMachineId = machineId;
              that.setData({
                machineId: '云印机连接成功\n编号：' + app.globalData.usingMachineId
              })
              console.log('app.globalData.usingMachineId' + ' --> ' + app.globalData.usingMachineId)
              return;
            }
          }
        }
        //扫描失败
        wx.showToast({
          title: '该二维码非云印机二维码',
          icon: 'loading'
        })
        that.setData({
          machineId: that.data.identifyMachine
        })
      },
      fail: function () {
        //扫描失败
        wx.showToast({
          title: '扫描失败',
          icon: 'loading'
        })
        that.setData({
          machineId: that.data.identifyMachine
        })
      }
    })
  },

  //联系客服
  jumpToCustomerService: function () {
    wx.makePhoneCall({
      phoneNumber: '13330146158' //仅为示例，并非真实的电话号码
    })
  },

  //跳转到Indez页面
  jumpToIndex: function () {
    wx.navigateTo({
      url: '../index/index'
    })
  },
  //跳转到 “附近的云印机” 页面
  jumpToNearMachine: function () {
    wx.navigateTo({
      url: '../user/near-machine/near-machine?linkmachine=' + app.globalData.usingMachineId
    })
  },
  //跳转到文件管理
  jumpToFileManager: function () {
    wx.navigateTo({
      url: '../user/file-manage/file-manage?id=' + id + '&linkmachine=' + app.globalData.usingMachineId
    })
  },
  //跳转到上传文件
  jumpToUploadFile: function () {
    wx.navigateTo({
      url: '../user/upload-file/upload-file?id=' + id + '&linkmachine=' + app.globalData.usingMachineId
    })
  },
  //跳转到订单详情
  jumpToOrderDetails: function () {
    wx.navigateTo({
      url: '../user/order-details/order-details?id=' + id + '&linkmachine=' + app.globalData.usingMachineId
    })
  },
  //跳转到支付订单
  jumpToPaymentOrder: function () {
    wx.navigateTo({
      url: '../user/payment-order/payment-order' + '?linkmachine=' + app.globalData.usingMachineId
    })
  },
  //跳转到修改价格标准
  jumpToChangePrice: function () {
    wx.navigateTo({
      url: '../proxy/update-price/update-price?id=' + id + '&wxid=' + WXID + '&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到交易额查询界面
  jumpToAccount: function () {
    wx.navigateTo({
      url: '../proxy/journal-account/journal-account?id=' + id + '&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到机器状态查询界面
  jumpToMachineStatus: function () {
    wx.navigateTo({
      url: '../proxy/machine-status/machine-status?id=' + id + '&level=1&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到异常机器查询界面
  jumpToMachineError: function () {
    wx.navigateTo({
      url: '../maintainer/machine-error/machine-error?id=' + id + '&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到操作日志界面
  jumpToOperationLog: function () {
    wx.navigateTo({
      url: '../maintainer/operation-log/operation-log?id=' + id + '&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到我的维护机器界面
  jumpToMyMaintain: function () {
    wx.navigateTo({
      url: '../proxy/machine-status/machine-status?id=' + id + '&level=2&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到维护日志界面
  jumpToMaintainLog: function () {
    wx.navigateTo({
      url: '../maintainer/maintain-log/maintain-log?id=' + id + '&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到配置机器界面
  jumpToMachineConfigure: function () {
    wx.navigateTo({
      url: '../proxy/machine-status/machine-status?id=' + id + '&level=3&userlevel=' + level + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到为代理商划分机器界面
  jumpToAssignForAgent: function () {
    wx.navigateTo({
      url: '../manager/assign-for-agent/assign-for-agent?id=' + id + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到为维护商划分机器界面
  jumpToAssignForMaintain: function () {
    wx.navigateTo({
      url: '../manager/assign-for-maintainer/assign-for-maintainer?id=' + id + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },
  //跳转到调整级别界面
  jumpToChangeLevel: function () {
    wx.navigateTo({
      url: '../manager/change-level/change-level?id=' + id + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('云印机[onLaunch] 场景值:', app.globalData.scene)
    var that = this

    //获取WXID
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('获取用户code！' + res.code)
          var code = res.code;
          wx.request({
            url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
            data: {
              Flag: 10,
              js_code: code
            },
            header: {
              'content-type': 'application/json'
            },
            method: 'GET',
            dataType: 'json',
            success: function (res) {
              console.log('res', res)
              WXID = res.data.openid;
              console.log('获取用户的OpenID', WXID)
            },
            fail: function (res) {
              console.log('获取用户登录态失败！' + res.errMsg);
            },
            complete: function (res) {
              //获取用户权限与用户ID
              var dbinfo = that.getUserInformation(WXID, function (dbinfo) {
                level = dbinfo.Ulevel;
                id = dbinfo.UserID;
                var authority = 'buttonGroup.authority'
                that.setData({
                  [authority]: parseInt(level),
                  loadinghidden: true
                })
                console.log('获取用户权限与用户id', dbinfo.UserID, '获取用户权限', that.data.buttonGroup.authority)
              });
            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });

    //调用应用实例的方法获取全局数据，获取用户信息
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
      console.log('app.getUserInfo' + userInfo.iv)
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
    console.log('云印机[onShow]场景值', app.globalData.scene)
    var that = this;
    if (app.globalData.scene == 0) {
      app.globalData.scene = 1;
      var authority = 'buttonGroup.authority'

      if (app.globalData.usingMachineId.length > 1){
        this.setData({
          machineId: '云印机连接成功\n编号：' + app.globalData.usingMachineId
        })
      } else {
        this.setData({
          machineId: this.data.identifyMachine
        })
      }

      this.setData({
        userInfo: null,
        [authority]: 0,
        loadinghidden: false,

      })
      console.log(this.data)

      this.onLoad();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.scene -= 1;
    app.globalData.usingMachineId = '';
    console.log('云印机[onHide]场景值', app.globalData.scene, app.globalData.usingMachineId);
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
   * 获取用户信息Uname, Ulevel
   */
  getUserInformation: function (WXID, f) {
    console.log('getUserInfomaction被调用', WXID)
    var info = null;

    if (info) {
      typeof f == "function" && f(info)
    } else {
      if (WXID =='undefined'){
        wx.showToast({
          title: '对不起，您的账号暂时无法认证(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        });
      } else {
        wx.request({
          url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
          data: {
            Flag: 6,
            WXID: WXID
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
            });
          },
          complete: function (res) {
            console.log('return info', info)
            return info;
          }
        });
      }
    }
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
  }
})