// machine-status.js
var WxSearch = require('../../../wxSearch/wxSearch.js');
var index = 0;
var ink = 0;
var paper = 0;
var other = '';
var logtext = '';
var allMachinesInfo = [];
var allMachinesAddress = [];
var windowHeight = 0;
var userid = null;
var userlevel = 0;
var start = 0;
var end = 0;
var distance = 0;
var app = getApp();
var timeflag = 0;
var getallinfo = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    level: 0,
    popupTitle: '',
    inputtype: 'text',
    submitb: true,
    statusInfo: [],
    plusorminus: '+'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)
    
    timeflag = 0;
    getallinfo = false;
    userid = options.id;
    userlevel = parseInt(options.userlevel);
    console.log('id,level', userid, userlevel)

    //获取窗口高度，避免不同尺寸手机无法实现点击背景退出
    wx: wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
      }
    })
    //设置用户级别，用于显示不同菜单项
    this.setData({
      level: parseInt(options.level)
    });

    var that = this
    //初始化的时候渲染wxSearchdata 第二个为你的search高度
    WxSearch.init(that, 50, [], false);
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
    var that = this;
    timeflag = 0;
    //获取机器信息
    if (userlevel == 1) {
      this.getAgentMachines(userid, function(info){
        that.setData({
          statusInfo: info
        })
      });
    } else if (userlevel == 2) {
      this.getMaintainMachines(userid, function(info){
        that.setData({
          statusInfo: info
        })
      });
    } else {
      this.getManageMachines(function(info){
        that.setData({
          statusInfo: info
        })
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      loadinghidden: false,
      statusInfo: []
    });
    timeflag = 0;
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
   * 代理商 管理员--机器详情
   */
  machineDetail: function (e) {

    var machineidindex = e.currentTarget.id;
    var machineid = this.data.statusInfo[machineidindex].machineid;
    var level = this.data.level;

    wx.navigateTo({
      url: '../machine-info/machine-info?machineid=' + machineid + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },

  /**
   * 维护员--加墨
   */
  addInk: function (e) {
    index = e.currentTarget.id;
    var level = this.data.level;
    console.log(index, level)

    this.setData({
      showModalStatus: true,
      popupTitle: '添加墨粉的数量',
      inputtype: 'digit',
      inputid: 'ink'
    })
  },

  /**
   * 维护员--加纸
   */
  addPaper: function (e) {
    index = e.currentTarget.id;
    var level = this.data.level;
    console.log(index, level)

    this.setData({
      showModalStatus: true,
      popupTitle: '添加纸张的数量',
      inputtype: 'digit',
      inputid: 'paper'
    })
  },

  /**
   * 维护员--其它
   */
  other: function (e) {
    index = e.currentTarget.id;
    var level = this.data.level;
    console.log(index, level)

    this.setData({
      showModalStatus: true,
      popupTitle: '其它操作的描述',
      inputtype: 'text',
      inputid: 'other'
    })
  },

  /**
   * 维护员--动画显示
   */
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu);
    var inkCount = 'statusInfo[' + index + '].ink';
    var paperCount = 'statusInfo[' + index + '].papers';
    var otherOperation = 'statusInfo[' + index + '].other';
    if (this.data.plusorminus=='+'){
      this.setData({
        [inkCount]: (parseInt(this.data.statusInfo[index].ink) + parseInt(ink)),
        [paperCount]: (parseInt(this.data.statusInfo[index].papers) + parseInt(paper)),
        [otherOperation]: other
      });
    } else {
      this.setData({
        [inkCount]: (parseInt(this.data.statusInfo[index].ink) - parseInt(ink)),
        [paperCount]: (parseInt(this.data.statusInfo[index].papers) - parseInt(paper)),
        [otherOperation]: other
      });
    }
    
    console.log('调用powerDrawer结果:', this.data);

    //提交日志
    this.submitLog(ink, paper, other);

    ink = 0;
    paper = 0;
    other = '';
  },
  util: function (currentStatu) {
    console.log('currentStatu', currentStatu)
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;

    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({
        animationData: animation
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false,
            submitb: true
          }
        );
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true,
          submitb: true
        }
      );
    }
  },

  /**
   * 读取input输入内容
   */
  getInputValue: function (e) {
    var inputid = e.currentTarget.id;
    var that = this;

    that.setData({
      submitb: false
    })

    if (inputid == 'ink') {
      ink = parseInt(e.detail.value);
      logtext = '添加墨粉' + this.data.plusorminus + ink;
    } else if (inputid == 'paper') {
      paper =  parseInt(e.detail.value);
      logtext = '添加纸张' + this.data.plusorminus + paper;
    } else {
      other = e.detail.value;
      logtext = other;
    }
    console.log('ink：', ink, 'paper:', paper, 'other:', other);
  },

  /**
   * 提交维护日志
   */
  submitLog: function (ink, paper, other) {
    var machineid = this.data.statusInfo[index].machineid;
    var action = logtext;

    console.log('submitLog-->', userid, machineid, action)
    if (action.length > 0) {
      console.log('action.length > 0', action.length)
      this.upateMachineLogs(machineid, action);
      this.updataUserLogs(userid, machineid, action);
      if (ink > 0) {
        console.log('ink > 0', ink)
        console.log('this.data.statusInfo[index].ink', this.data.statusInfo[index].ink)
        this.updataAddInk(machineid, this.data.statusInfo[index].ink);
      } if (paper > 0) {
        console.log('paper > 0', paper)
        console.log('this.data.statusInfo[index].papers', this.data.statusInfo[index].papers)
        this.updataAddPaper(machineid, this.data.statusInfo[index].papers);
      }
    } else {
      wx.showToast({
        title: '您取消了操作哦！(⊙o⊙)',
        duration: 2000,
        icon: 'loading'
      })
    }
  },

  /**
     * 管理员--配置机器
     */
  machineConfigure: function (e) {

    var machineidindex = e.currentTarget.id;
    var machineid = this.data.statusInfo[machineidindex].machineid;
    var level = this.data.level;

    wx.navigateTo({
      url: '../../manager/machine-configure/machine-configure?machineid=' + machineid + '&linkmachine=' + app.globalData.usingMachineId,
    })
  },

  /**
   * WxSearch框架实现的函数
   */
  wxSearchFn: function (e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);
    var address = that.data.wxSearchData.value;
    console.log('调用了search功能，此时搜索的内容为', address)
    //address = '江西理工大学校本部';
    var searchData = null;
    switch (parseInt(userlevel)) {
      case 1:
        searchData = that.getAgentMachinesWithAddress(address, userid);
        break;
      case 2:
        searchData = that.getMaintainerMachinesWithAddress(address, userid);
        break;
      case 3:
        searchData = that.getManagerMachinesWithAddress(address);
        break;
      default:
      console.log('no match switch',userlevel)
        break;
    }

    console.log('调用了search功能，此时搜索的内容为', searchData)
    that.setData({
      statusInfo: searchData
    })

  },
  wxSearchInput: function (e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
  },
  wxSerchFocus: function (e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },

  /**
   * 点击背景取消
   */
  backgroundcancel: function (e) {
    this.util('close');
    wx.showToast({
      title: '您取消了操作哦！(⊙o⊙)',
      duration: 2000,
      icon: 'loading'
    });
  },

  /**
   * 代理商获取机器信息
   */
  getAgentMachines: function (agentID, f) {
    console.log('代理商')
    var that = this;
    var returnData = [];

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 8,
        agentid: agentID,
        page: timeflag*10
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          typeof f == 'function' && f(returnData);
          console.log('代理商获取机器')
        } else if (timeflag == 0 && res.data.total == 0) {
          wx.showToast({
            title: '您还没有代理任何机器呢Σ(º ﾛ º๑)',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
        if (res.data.total < 10 && res.data.total >= 0) {
          getallinfo = true;
        }
      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2500
        })
      },
      complete: function (res) {
        that.setData({
          loadinghidden: true
        })
      }
    });

    return returnData;
  },

  /**
   * 获取维护人员机器信息
   */
  getMaintainMachines: function (maintainID, f) {
    console.log('维护人员', maintainID)
    var that = this;
    var returnData = [];

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 9,
        adminid: maintainID,
        page: timeflag*10
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res', res, res.statusCode, res.data.items)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          typeof f == 'function' && f(returnData);
          console.log('维护人员数据获取成功')
        } else if (timeflag == 0 && res.data.total == 0) {
          wx.showToast({
            title: '您还没有维护任何机器呢Σ( ° △ °|||)︴！',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
        if (res.data.total < 10 && res.data.total >= 0) {
          getallinfo = true;
        }
      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        that.setData({
          loadinghidden: true
        })
      }
    });

    return returnData;
  },

  /**
   * 管理员获取机器信息
   */
  getManageMachines: function (f) {
    var that = this;
    var returnData = [];
    console.log('调用getManageMachines', timeflag*10)

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
      data: {
        Flag: 0,
        page: timeflag*10
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('调用成功', res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          typeof f == 'function' && f(returnData)
          console.log('管理员数据获取成功')
        } else if (timeflag == 0 && res.data.total == 0) {
          wx.showToast({
            title: '您还没有管理任何机器呢(ÒωÓױ)！',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }
        if (res.data.total < 10 && res.data.total >= 0) {
          getallinfo = true;
        }
      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        that.setData({
          loadinghidden: true
        })
      }
    });

    return returnData;
  },

  /**
   * 数据库操作--加墨
   */
  updataAddInk: function (machineID, inkcount) {
    console.log('加墨操作', machineID, inkcount)
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_MaintainData.ashx',
      data: {
        Flag: 3,
        machineid: machineID,
        ink: inkcount
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res', res)
        if (res.data.Message == '更新完成!') {
          wx.showToast({
            title: '操作成功！✧٩(ˊωˋ*)و✧',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    });
  },

  /**
   * 数据库操作--加纸
   */
  updataAddPaper: function (machineID, papaercount) {
    console.log('加纸操作', machineID, papaercount)
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_MaintainData.ashx',
      data: {
        Flag: 4,
        machineid: machineID,
        papers: papaercount
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res', res)
        if (res.data.Message == '更新完成!') {
          wx.showToast({
            title: '操作成功！✧٩(ˊωˋ*)و✧',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    });
  },

  /**
   * 数据库操作--写入机器日志
   */
  upateMachineLogs: function (machineID, action) {
    console.log('写入机器日志操作')

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_MaintainData.ashx',
      data: {
        Flag: 5,
        machineid: machineID,
        action: action
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('机器日志success res', res.data.Message)
        if (res.data.Message == '插入完成!') {
          wx.showToast({
            title: '操作成功！✧٩(ˊωˋ*)و✧',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ' + res.data.Message,
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    });
  },

  /**
   * 数据库操作--写入用户日志
   */
  updataUserLogs: function (userid, machineID, action) {
    console.log('写入用户日志')
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_MaintainData.ashx',
      data: {
        Flag: 6,
        UserID: userid,
        machineid: machineID,
        action: action
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('用户日志success res', res.data.Message)
        if (res.data.Message == '插入完成!') {
          console.log('写入用户日志成功')
          wx.showToast({
            title: '操作成功！✧٩(ˊωˋ*)و✧',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ' + res.data.Message,
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    });
  },

  /**
   * 查询地址内机器
   */
  getAgentMachinesWithAddress: function (address, id) {
    console.log('agent get machine with address')
    var returnData = [];
    var that = this;

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
      data: {
        Flag: 10,
        address: address,
        agentid: id
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res',res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          that.setData({
            statusInfo: returnData
          })
        } else if (res.data.total == 0) {
          wx.showToast({
            title: '您查询的地址暂时还没有机器呢(๑ʘ̅ д ʘ̅๑)!!!',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        that.setData({
          loadinghidden: true
        })
      }
    });
  },
  getMaintainerMachinesWithAddress: function (address, id) {
    console.log('maintainer get machine with address',address,id)
    var returnData = [];
    var that = this;

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
      data: {
        Flag: 11,
        address: address,
        adminid: id
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res',res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          that.setData({
            statusInfo: returnData
          })
        } else if (res.data.total == 0) {
          wx.showToast({
            title: '您查询的地址暂时还没有机器呢(๑ʘ̅ д ʘ̅๑)!!!',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        if (!(returnData.length > 0)) {
          wx.showModal({
            title: '提示',
            content: '您输入的地址可能有误或是不详细，请确认后重新输入详细的机器位置信息',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.setData({
                  statusInfo: allMachinesInfo
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
                that.setData({
                  statusInfo: allMachinesInfo
                })
              }
            }
          })
        }

        return returnData;
      }
    });
  },
  getManagerMachinesWithAddress: function (address) {
    console.log('manager get machine with address', address)
    var returnData = [];
    var that = this;

    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
      data: {
        Flag: 1,
        address: address
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log('res.data.items', res)
        if (res.statusCode == 200 && res.data.total > 0) {
          returnData = res.data.items;
          that.setData({
            statusInfo: returnData
          })
        } else if (res.data.total == 0) {
          wx.showToast({
            title: '您查询的地址暂时还没有机器呢(๑ʘ̅ д ʘ̅๑)!!!',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2000
          })
        }

      },
      fail: function (res) {
        console.log('error', res)
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      },
      complete: function (res) {
        if (!(returnData.length > 0)) {
          wx.showModal({
            title: '提示',
            content: '您输入的地址可能有误或是不详细，请确认后重新输入详细的机器位置信息',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.setData({
                  statusInfo: allMachinesInfo
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
                that.setData({
                  statusInfo: allMachinesInfo
                })
              }
            }
          })
        }
        return returnData;
      }
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载

    wx.request({
      url: 'https://URL',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    });
  },

  /**
   * 改变运算符
   */
  changeOperation: function(e){
    if (this.data.plusorminus=='+'){
      this.setData({
        plusorminus: '-'
      });
    }else{
      this.setData({
        plusorminus: '+'
      });
    }
  },

  /**
  * 上拉加载
  */
  onReachBottom: function (e) {
    timeflag += 1;
    var that = this;
    var temparay = that.data.statusInfo;

    if (!getallinfo) {
      this.setData({
        touchbottom: true
      });
      console.log('上拉加载-->', timeflag)

      //获取机器信息
      if (userlevel == 1) {
        this.getAgentMachines(userid, function (info) {
          console.log('info-->', info)
          for (var i = 0; i < info.length; i++) {
            temparay.push(info[i]);
          }
          console.log('temparray-->', temparay)
          that.setData({
            touchbottom: false,
            statusInfo: temparay
          });
        });
      } else if (userlevel == 2) {
        this.getMaintainMachines(userid, function (info) {
          console.log('info-->', info)
          for (var i = 0; i < info.length; i++) {
            temparay.push(info[i]);
          }
          console.log('temparray-->', temparay)
          that.setData({
            touchbottom: false,
            statusInfo: temparay
          });
        });
      } else {
        this.getManageMachines(function (info) {
          console.log('info-->', info)
          for (var i = 0; i < info.length; i++) {
            temparay.push(info[i]);
          }
          console.log('temparray-->', temparay)
          that.setData({
            touchbottom: false,
            statusInfo: temparay
          });
        });
      }
    } else {
      wx.showToast({
        title: '所有内容加载完毕(*ฅ́˘ฅ̀*)♡',
        icon: 'loading',
        duration: 2000
      });
      that.setData({
        touchbottom: false
      });
    }
  }
})