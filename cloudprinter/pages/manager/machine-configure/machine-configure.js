// add-machine.js
var lng = '';
var lat = '';
var name = '';
var address = '';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    array_status: ['请选择', '正常', '维护中'],
    array_config: [],
    array_agent: [],
    array_maintain: [],
    index_status: 0,
    index_configure: 0,
    index_agent: 0,
    index_maintainer: 0,
    machineid: '',
    lng: null,
    lat: null,
    name: '',
    address: '',
    address_mark: '',
    configmark: '',
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
    var indexadmin = 0;
    var indexagent = 0;
    var indexconfig = 0;
    var indexstatus = 0;

    that.setData({
      machineid: options.machineid,
    });

    that.getConfigFileList(function (info) {
      that.setData({
        array_config: info
      });

      that.getUserIDList(function (info) {
        that.setData({
          array_agent: info,
          array_maintain: info
        });

        app.getMachineDetail(options.machineid, function (info) {
          if (that.data.array_maintain.indexOf(info[0].adminid) != -1) {
            indexadmin = that.data.array_maintain.indexOf(info[0].adminid);
          }
          if (that.data.array_agent.indexOf(info[0].agentid) != -1) {
            indexagent = that.data.array_agent.indexOf(info[0].agentid);
          }
          if (that.data.array_config.indexOf(info[0].configID) != -1) {
            indexconfig = that.data.array_config.indexOf(info[0].configID);
          }
          if (that.data.array_status.indexOf(info[0].status) != -1) {
            indexstatus = that.data.array_status.indexOf(info[0].status);
          }
          that.setData({
            lng: info[0].lng,
            lat: info[0].lat,
            name: info[0].address_name,
            address: info[0].address_detail,
            index_maintainer: indexadmin,
            index_agent: indexagent,
            index_configure: indexconfig,
            index_status: indexstatus,
            loadinghidden: true,
            isok: false
          })
          console.log('app.getMachineDetail setData-->', that.data)
        });
      });
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

  formReset: function () {
    console.log('form发生了reset事件');
    this.setData({
      lng: '',
      lat: '',
      name: '',
      address: '',
      index_maintainer: 0,
      index_agent: 0,
      index_configure: 0,
      index_status: 0
    })
    
  },
  /**
   * picker内容改变时显示
   */
  bindPickerChange: function (e) {
    var id = e.currentTarget.id;
    switch (id) {
      case '1':
        this.setData({
          index_status: e.detail.value
        });
        break;
      case '3':
        this.setData({
          index_configure: e.detail.value
        });
        break;
      case '4':
        this.setData({
          index_agent: e.detail.value
        });
        break;
      case '5':
        this.setData({
          index_maintainer: e.detail.value
        });
        break;
      default:
        break;
    }
    console.log('picker携带的值', id)
  },

  /**
   * 获取经纬度
   */
  getLngAndLat: function (e) {
    var inputid = e.currentTarget.id;
    switch (inputid) {
      case '1':
        lng = e.detail.value;
        this.setData({
          lng: e.detail.value
        })
        break;
      case '2':
        lat = e.detail.value;
        this.setData({
          lat: e.detail.value
        })
        break;
      default:
        break;
    }
    console.log(lng, lat)
  },

  /**
   * 依据经纬度获取具体位置信息
   */
  getLocationDetail: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          name: res.name,
          address: res.address,
          lng: res.longitude,
          lat: res.latitude
        })
      },
    });
  },

  /**
   * 提交
   */
  formSubmit: function (e) {
    var data = {
      machineid: this.data.machineid,
      status: (this.data.array_status[this.data.index_status] == '请选择' ? '' : this.data.array_status[this.data.index_status]),
      lng: this.data.lng,
      lat: this.data.lat,
      address: this.data.address,
      addressname: this.data.name,
      configid: (this.data.array_config[this.data.index_configure] == '请选择' ? '' : this.data.array_config[this.data.index_configure]),
      agentid: (this.data.array_agent[this.data.index_agent] == '请选择' ? '' : this.data.array_agent[this.data.index_agent]),
      adminid: (this.data.array_maintain[this.data.index_maintainer] == '请选择' ? '' : this.data.array_maintain[this.data.index_maintainer]),
      mark: e.detail.value.mark,
      addressmark: e.detail.value.address_mark
    }

    this.updateSQLmachineInfo(data);

    console.log('form发生了submit事件，携带数据为：', data)
  },

  /**
   * 获取配置文件列表
   */
  getConfigFileList: function (f) {
    var returnData = [];
    var that = this;

    if (returnData.length > 0) {
      typeof f == 'function' && f(returnData)
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 7
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            returnData.push('请选择');
            var temp = res.data.items;
            for (var i = 0; i < temp.length; i++) {
              returnData.push(temp[i]);
            }
            typeof f == 'function' && f(returnData);
          } else if (res.data.total == 0) {
            wx.showToast({
              title: '还没有找到配置文件呢(•́ω•̀ ٥)',
              icon: 'loading',
              duration: 2000
            });
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
          return returnData;
        }
      });
    }
  },

  /**
   * 获取用户id列表
   */
  getUserIDList: function (f) {
    var returnData = [];
    var that = this;

    if (returnData.length > 0) {
      typeof f == 'function' && f(returnData)
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 8
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          returnData.push('请选择');
          if (res.statusCode == 200 && res.data.total > 0) {
            var temp = res.data.items;
            for (var i = 0; i < temp.length; i++) {
              returnData.push(temp[i].UserID);
            }
            typeof f == 'function' && f(returnData);
          } else if (res.data.total == 0) {
            wx.showToast({
              title: '还没有找到代理商呢(•́ω•̀ ٥)',
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
          return returnData;
        }
      });
    }
  },

  /**
   * 更新数据库
   */
  updateSQLmachineInfo: function (updatedata) {
    console.log('updatedata.configid', updatedata.configid)
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
      data: {
        Flag: 2,
        lng: updatedata.lng,
        lat: updatedata.lat,
        address_name: updatedata.addressname,
        address_detail: updatedata.address,
        address_mark: updatedata.addressmark,
        configID: updatedata.configid,
        agentid: updatedata.agentid,
        adminid: updatedata.adminid,
        mark: updatedata.mark,
        machineID: updatedata.machineid,
        status: updatedata.status
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
            title: '操作成功！✧٩(ˊωˋ*)و✧',
            icon: 'success',
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
  }
})