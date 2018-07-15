// journal-account.js
var util = require('../../../utils/util.js');
var Charts = require('../../../charts/wxcharts.js');
var columnCharts = null;
var dayCharts = null;
var weekCharts = null;
var monthCharts = null;
var rangeCharts = null;
var windowWidth = 300;
var serie_name = '日交易额';
var start_time = null;
var end_time = null;
var userid = null;
var userlevel = 0;
var totalPrice = 0;
var totalPrice2 = 0;
var ymax = 0;
var app = getApp();

wx.getSystemInfo({
  success: function (res) {
    windowWidth = res.windowWidth
  }
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    lastTapDiffTime: 0,
    hiddenTitle: false,
    hiddenTotal: true,
    hiddenDetails: false,
    hiddenPicker: true,
    hiddenSubmitCanvas: true,
    today: util.getCurDate(),
    inputStartDate: '请选择起始日期',
    inputStartColor: '#808080',
    inputEndDate: '请选择终止日期',
    inputEndColor: '#808080',
    buttonMess: '请选择起始日期',
    buttonColor: '#e6e6e6',
    buttonTextColor: '#808080',
    canvasStartPoint: [0, 0],
    canvasMovePoint: [0, 0],
    leftMoveCount: 0,
    rightMoveCount: 0,
    select1: '#47d2bd',
    selectText1: '#fff',
    select7: '#e6e6e6',
    selectText7: '#808080',
    select30: '#e6e6e6',
    selectText30: '#808080',
    timeMes: '日-',
    accountInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)

    console.log('运行onLoad方法')
    userid = options.id;
    userlevel = parseInt(options.userlevel);
    var today = util.getCurDate();
    var that = this;
    totalPrice = 0;
    totalPrice2 = 0;

    that.getTodayData(today, function (info) {
      var temp = '' + totalPrice;
      var temp2 = '' + totalPrice2;
      temp = temp.substr(0, temp.indexOf('.')+3);
      temp2 = temp2.substr(0, temp2.indexOf('.') + 3);
      console.log('此时的canvasid', columnCharts, totalPrice, temp)
      that.setData({
        accountInfo: info.items,
        totalPrice: temp,
        totalPrice2: temp2
      });

      ymax = parseInt(info.max) + 1;

      var accountInfo = info.items;
      console.log('onShow中的accountInfo', accountInfo)
      var machineIDs = [];
      var machineAddresses = [];
      var accountDays = [];
      var accountDays2 = [];
      for (var i = 0; i < (6 < accountInfo.length ? 6 : accountInfo.length); i++) {
        console.log('第i次', i)
        machineIDs[i] = accountInfo[i].machineID;
        machineAddresses[i] = accountInfo[i].address_name.substr(0,9);
        if (parseFloat(accountInfo[i].Amount) > 0) {
          accountDays[i] = accountInfo[i].Amount;
        } else {
          accountDays[i] = 0;
        }
        if (parseFloat(accountInfo[i].Amount2) > 0) {
          accountDays2[i] = accountInfo[i].Amount2;
        } else {
          accountDays2[i] = 0;
        }

        totalPrice = (totalPrice * 10 + parseFloat(accountDays[i])*10)/10 ;
        totalPrice2 = (totalPrice2 * 10 + parseFloat(accountDays2[i]) * 10) / 10;
      }

      var temp = '' + totalPrice;
      temp = temp.substr(0, temp.indexOf('.') + 3);
      var temp2 = '' + totalPrice2;
      temp2 = temp2.substr(0, temp2.indexOf('.') + 3);
      that.setData({
        totalPrice: temp,
        totalPrice2: temp2
      })

      console.log('draw ymax', ymax)

      console.log('返回的结果', machineIDs, machineAddresses, accountDays, accountDays2, totalPrice)
      dayCharts = that.drawNewChart('columnCanvas', machineIDs, machineAddresses, '日交易额', accountDays, accountDays2, ymax)

      columnCharts = dayCharts;
    })
    console.log('onLoad方法中的accountInfo', that.data.accountInfo)
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
    console.log('运行onShow方法')
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
   * 双击隐藏事件
   */
  hiddenView: function (e) {
    // 触摸时间距离页面打开毫秒数
    var curTime = e.timeStamp;
    // 上次触摸距离页面打开毫秒数
    var lastTime = this.data.lastTapDiffTime;
    if (lastTime > 0) {
      // 如果两次时间间隔小于300毫秒则认为是一次双击事件
      if (curTime - lastTime < 300) {
        console.log(e.timeStamp + '- db tap');
        this.setData({
          hiddenTitle: true,
          hiddenTotal: false,
          hiddenDetails: true,
          hiddenPicker: false
        });
      } else {
        console.log(e.timeStamp + '- tap');
      }
    } else {
      console.log(e.timeStamp + '- first tap');
    }
    this.setData({
      // 本次触摸时间设置为上次触摸时间
      lastTapDiffTime: curTime
    });
  },

  /**
   * 双击显示事件
   */
  showView: function (e) {
    columnCharts = null;
    // 触摸时间距离页面打开毫秒数
    var curTime = e.timeStamp;
    // 上次触摸距离页面打开毫秒数
    var lastTime = this.data.lastTapDiffTime;
    if (lastTime > 0) {
      // 如果两次时间间隔小于300毫秒则认为是一次双击事件
      if (curTime - lastTime < 300) {
        console.log(e.timeStamp + '- db tap');
        this.setData({
          hiddenTitle: false,
          hiddenTotal: true,
          hiddenDetails: false,
          hiddenPicker: true,
          hiddenSubmitCanvas: true,
          inputStartDate: '请选择起始日期',
          inputStartColor: '#808080',
          inputEndDate: '请选择终止日期',
          inputEndColor: '#808080',
          buttonMess: '请选择起始日期',
          buttonColor: '#e6e6e6',
          buttonTextColor: '#808080'
        });
        start_time = null;
        end_time = null;
      
        // 当前操作图表赋值为dayCharts
        columnCharts = dayCharts;
        // 将rangeCharts清空
        rangeCharts = null;
      }
    }
    this.setData({
      // 本次触摸时间设置为上次触摸时间
      lastTapDiffTime: curTime
    });
  },

  /**
   * 用户自定义查询时间
   */
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var targetID = e.currentTarget.id;

    if (targetID == 'startDate') {
      start_time = e.detail.value;
      this.setData({
        inputStartDate: e.detail.value,
        inputStartColor: '#000'
      });
    }
    console.log('start_time.length=', start_time == null)
    if (targetID == 'endDate') {
      end_time = e.detail.value;
      this.setData({
        inputEndDate: e.detail.value,
        inputEndColor: '#000'
      });
    }
    console.log('end_time.length=', end_time == null)
    if (start_time != null) {
      if (end_time != null) {
        this.setData({
          buttonMess: '提交',
          buttonColor: '#47d2bd',
          buttonTextColor: 'white'
        });
      } else {
        this.setData({
          buttonMess: '请选择终止日期',
          buttonColor: '#e6e6e6',
          buttonTextColor: '#808080'
        });
      }
    } else {
      this.setData({
        buttonMess: '请选择起始日期',
        buttonColor: '#e6e6e6',
        buttonTextColor: '#808080'
      });
    }
    console.log(this.data.inputStartDate, this.data.inputEndDate);
  },

  /**
   * Canvas移动事件
   */
  // 记录触摸开始位置坐标
  canvasTouchStart: function (e) {
    console.log('坐标', e)
    this.setData({
      canvasStartPoint: [e.changedTouches[0].x, e.changedTouches[0].y]
    });
    console.log('开始触摸', [e.changedTouches[0].x, e.changedTouches[0].y])
  },
  // 捕捉用户滑动的位置坐标
  canvasTouchMove: function (e) {
    console.log('坐标', e)
    this.setData({
      canvasMovePoint: [e.changedTouches[0].x, e.changedTouches[0].y]
    });
  },
  // 当滑动结束，实现canvas的左右滑动效果
  canvasUpdateData: function (e) {
    var curPoint = this.data.canvasMovePoint;
    var startPoint = this.data.canvasStartPoint;
    var accountInfo = this.data.accountInfo;
    var initIndex = 0;
    var machineIDs = new Array(6);
    var machineAddresses = new Array(6);
    var accountDays = new Array(6);
    var accountDays2 = new Array(6);
    var leftCount = this.data.leftMoveCount;
    var rightCount = this.data.rightMoveCount;

    console.log('处于侧滑阶段的accountInfo', accountInfo)

    // 比较pageX值
    if (curPoint[0] <= startPoint[0]) {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        console.log(e.timeStamp + ' - touch left move');
        leftCount = leftCount + 1;
        this.setData({
          leftMoveCount: leftCount
        })
        console.log('L:leftCount=', this.data.leftMoveCount)
        console.log('L:rightCount=', this.data.rightMoveCount)
      }
    } else {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        console.log(e.timeStamp + ' - touch right move');
        rightCount = rightCount + 1;
        this.setData({
          rightMoveCount: rightCount
        })
        console.log('R:leftCount=', this.data.leftMoveCount)
        console.log('R:rightCount=', this.data.rightMoveCount)
      }
    }

    initIndex = (leftCount - rightCount) * 6;
    console.log('OK:initIndex=', initIndex)
    if (initIndex < accountInfo.length && initIndex >= 0) {
      var endLoopLeft = initIndex + 6;
      if (endLoopLeft >= accountInfo.length) {
        endLoopLeft = accountInfo.length;
      }
      for (var i = 0, j = initIndex; j < endLoopLeft; i++ , j++) {
        machineIDs[i] = accountInfo[j].machineID;
        machineAddresses[i] = accountInfo[j].address_name.substr(0, 9);
        if (parseFloat(accountInfo[j].Amount) > 0) {
          accountDays[i] = accountInfo[j].Amount;
        } else {
          accountDays[i] = 0;
        }
        if (parseFloat(accountInfo[j].Amount2) > 0) {
          accountDays2[i] = accountInfo[j].Amount2;
        } else {
          accountDays2[i] = 0;
        }
      }
      console.log('更新的数据', machineIDs, machineAddresses, accountDays, accountDays2, ymax, columnCharts)
      // 更新
      this.updateChart(machineIDs, machineAddresses, serie_name, accountDays, accountDays2);

    } else {
      if (initIndex >= accountInfo.length - 1) {
        this.setData({
          leftMoveCount: parseInt(accountInfo.length / 6)
        })
        console.log('E:set leftCount=', this.data.leftMoveCount)
      }
      if (initIndex < 0) {
        this.setData({
          leftMoveCount: 0,
          rightMoveCount: 0
        })
        console.log('E:set rightCount=', this.data.rightMoveCount)
      }
      console.log('E:leftCount=', this.data.leftMoveCount)
      console.log('E:rightCount=', this.data.rightMoveCount)
      console.log('1 E:数组索引已超出范围', initIndex)
    }
  },

  /**
   * 选择不同时间范围的交易额
   */
  chooseAccount: function (e, curIdInt) {
    // 触摸时间距离页面打开毫秒数
    var curTime = e.timeStamp;
    // 上次触摸距离页面打开毫秒数
    var lastTime = this.data.lastTapDiffTime;
    this.setData({
      // 本次触摸时间设置为上次触摸时间
      lastTapDiffTime: curTime,
    });

    // 如果两次时间间隔小于300毫秒则认为是一次双击事件
    if (lastTime > 0 && curTime - lastTime < 500) {
      console.log('此时属于快速点击' + e.timeStamp + '- db tap');
    } else {
      console.log('此时不属于快速点击' + e.timeStamp + '- db tap');
      columnCharts = null;
      this.setData({
        totalPrice: 0,
        totalPrice2: 0,
      });
      var accountInfo = [];
      var machineIDs = [];
      var machineAddresses = [];
      var accountDays = [];
      var accountDays2 = [];
      totalPrice = 0;
      totalPrice2 = 0;
      var that = this;

      if (isNaN(curIdInt)) {
        var curID = e.currentTarget.id;
        curIdInt = parseInt(curID);
      }

      var that = this;
      var dates = [];

      console.log('curID=', curID);
      switch (curIdInt) {
        case 1:
          that.setData({
            select1: '#47d2bd',
            selectText1: '#fff',
            select7: '#e6e6e6',
            selectText7: '#808080',
            select30: '#e6e6e6',
            selectText30: '#808080',
            loadinghideen: false,
            timeMes: '日-'

          });
          dates[0] = util.getCurDate();
          dates[1] = dates[0];
          console.log('start,end', dates[0], dates[1])
          serie_name = '日交易额';
          break;
        case 7:
          that.setData({
            select7: '#47d2bd',
            selectText7: '#fff',
            select1: '#e6e6e6',
            selectText1: '#808080',
            select30: '#e6e6e6',
            selectText30: '#808080',
            loadinghideen: false,
            timeMes: '周-'
          });
          dates = util.getSevenDays();
          console.log('start,end', dates[0], dates[1])
          serie_name = '周交易额';
          break;
        case 30:
          that.setData({
            select30: '#47d2bd',
            selectText30: '#fff',
            select7: '#e6e6e6',
            selectText7: '#808080',
            select1: '#e6e6e6',
            selectText1: '#808080',
            loadinghideen: false,
            timeMes: '月-'
          });
          dates = util.getThirtyDays();
          console.log('start,end', dates[0], dates[1])
          serie_name = '月交易额';
          break;
        default:
          that.setData({
            select1: '#47d2bd',
            selectText1: '#fff',
            select7: '#e6e6e6',
            selectText7: '#808080',
            select30: '#e6e6e6',
            selectText30: '#808080',
            loadinghideen: false,
            timeMes: '日-'
          });
          serie_name = '日交易额';
          break;
      }

      this.getStretchData(dates[0], dates[1], function (info) {
        accountInfo = info.items;
        ymax = parseInt(info.max) + 1;

        that.setData({
          accountInfo: accountInfo,
          loadinghideen: true
        });

        for (var i = 0; i < (6 < accountInfo.length ? 6 : accountInfo.length); i++) {
          machineIDs[i] = accountInfo[i].machineID;
          machineAddresses[i] = accountInfo[i].address_name.substr(0, 9);
          if (parseFloat(accountInfo[i].Amount) > 0) {
            accountDays[i] = accountInfo[i].Amount;
          } else {
            accountDays[i] = 0;
          }
          if (parseFloat(accountInfo[i].Amount2) > 0) {
            accountDays2[i] = accountInfo[i].Amount2;
          } else {
            accountDays2[i] = 0;
          }

          totalPrice = (totalPrice * 10 + parseFloat(accountDays[i]) * 10) / 10;
          totalPrice2 = (totalPrice2 * 10 + parseFloat(accountDays2[i]) * 10) / 10;
        }
        console.log('update ymax', ymax);
        // 重绘
        dayCharts = that.drawNewChart('columnCanvas', machineIDs, machineAddresses, serie_name, accountDays, accountDays2, ymax, function (newchart) {
          columnCharts = newchart;
          

          var temp = '' + totalPrice;
          temp = temp.substr(0, temp.indexOf('.') + 3);
          var temp2 = '' + totalPrice2;
          temp2 = temp2.substr(0, temp2.indexOf('.') + 3);
          console.log('此时的canvasid', columnCharts, totalPrice, temp)
          that.setData({
            totalPrice: temp,
            totalPrice2: temp2,
            leftMoveCount: 0,
            rightMoveCount: 0
          });
        });
      });

      console.log('位于日期范围选择阶段的accountInfo', accountInfo);
    }
  },

  /**
   * 提交按钮事件
   */
  submitDateRange: function () {
    var that = this;
    var buttonMessage = that.data.buttonMess;
    console.log('触发了点击事件')

    if (buttonMessage == '请选择起始日期' || buttonMessage == '请选择终止日期') {
      wx.showToast({
        title: buttonMessage,
        icon: "loading"
      });
    } else {
      wx.showToast({
        title: buttonMessage,
        icon: "success",
        duration: 2000
      });

      var isd = that.data.inputStartDate;
      var ied = that.data.inputEndDate;

      if (isd > ied) {
        wx.showToast({
          title: '时间选择错误,,Ծ‸Ծ,,',
          icon: "loading",
          duration: 2000
        });
      } else {
        that.setData({
          loadinghideen: false,
          timeMes: ''
        });
        that.getStretchData(that.data.inputStartDate, that.data.inputEndDate, function (info) {
          var accountInfo = info.items;
          var machineIDs = [];
          var machineAddresses = [];
          var accountDays = [];
          var accountDays2 = [];
          totalPrice = 0;
          totalPrice2 = 0;
          ymax = parseInt(info.max) + 1;

          for (var i = 0; i < (6 < accountInfo.length ? 6 : accountInfo.length); i++) {
            machineIDs[i] = accountInfo[i].machineID;
            machineAddresses[i] = accountInfo[i].address_name.substr(0, 9);
            if (parseFloat(accountInfo[i].Amount) > 0) {
              accountDays[i] = accountInfo[i].Amount;
            } else {
              accountDays[i] = 0;
            }
            if(parseFloat(accountInfo[i].Amount2)>0){
              accountDays2[i] = accountInfo[i].Amount2;
            } else {
              accountDays2[i] = 0;
            }

            totalPrice = (totalPrice*10 + parseFloat(accountDays[i])*10)/10;
            totalPrice2 = (totalPrice2 * 10 + parseFloat(accountDays2[i]) * 10) / 10;
          }

          console.log('ymax', ymax)

          serie_name = '交易额';

          rangeCharts = that.drawNewChart('userRangeCanvas', machineIDs, machineAddresses, serie_name, accountDays, accountDays2, ymax, function (newchart) {
            // 当前操作图表赋值为rangeCharts
            columnCharts = newchart;

            var temp = '' + totalPrice;
            temp = temp.substr(0, temp.indexOf('.') + 3);
            var temp2 = '' + totalPrice2;
            temp2 = temp2.substr(0, temp2.indexOf('.') + 3);
            console.log('此时的canvasid', columnCharts, totalPrice, temp)
            that.setData({
              totalPrice: temp,
              totalPrice2: temp2,
              hiddenSubmitCanvas: false,
              accountInfo: info.items,
              loadinghideen: true
            });
          });
        });
      }
    }
  },

  /**
   * 绘制新图表
   */
  drawNewChart: function (canvas, categorie, categorie2, series_name, series_data, series_data2, ymax, f) {
    console.log('此时画的canvasid', canvas)
    console.log('初始画categorie2', categorie2)

    var newChart = null;
    newChart = new Charts({
      canvasId: canvas,
      type: 'column',
      categories: categorie,
      categories2: categorie2,
      series: [{
        name: series_name,
        data: series_data,
        color: '#47d2bd'
      },{
        name: '未打印',
        data: series_data2,
        color: '#ff0000'
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        format: function (val) {
          return val + '元';
        },
        min: 0,
        max: ymax
      },
      width: windowWidth - 35,
      height: 300,
      dataLabel: true
    });

    this.setData({
      leftMoveCount: 0,
      rightMoveCount: 0
    });

    typeof f == 'function' && f(newChart);

    return newChart;
  },

  /**
   * 更新图表
   */
  updateChart: function (categorie, categorie2, series_name, series_data, series_data2) {
    console.log('更新ymax', categorie2)
    columnCharts.updateData({
      categories: categorie,
      categories2: categorie2,
      series: [{
        name: series_name,
        data: series_data,
        color: '#47d2bd'
      },{
        name: '未打印',
        data: series_data2,
        color: '#ff0000'
      }]
    });
  },

  /**
   * 获取一天的交易额
   */
  getTodayData: function (today, f) {
    var returnData = null;
    var that = this;
    console.log('调用了获取一天的交易额')

    wx.showNavigationBarLoading();

    if (userlevel == 3) {
      userid = ''
    }

    if (returnData) {
      typeof f == 'function' && f(returnData)
    } else {
      wx: wx.request({
        url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
        data: {
          Flag: 3,
          agentid: userid,
          date: today
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            returnData = res.data;
            typeof f == "function" && f(returnData)
            console.log('运行getTodayData方法', returnData)

          } else if (res.data.total == 0) {
            wx.showToast({
              title: '您还有没代理任何机器哦Σ(º ﾛ º๑)',
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
          });
          console.log('this.data.loadinghidden-->', that.data.loadinghidden)
          console.log('return returnData', returnData)
          wx.hideNavigationBarLoading();
          return returnData;
        }
      });
    }
  },
  /**
   * 获取一段时间内交易详情
   */
  getStretchData: function (start, end, f) {
    var returnData = null;
    var that = this;
    wx.showNavigationBarLoading();

    if (userlevel == 3) {
      userid = '';
    }

    if (returnData) {
      typeof f == 'function' && f(returnData)
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/agentinf.ashx',
        data: {
          Flag: 4,
          agentid: userid,
          startDate: start,
          endDate: end
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          console.log('success res', res);
          if (res.statusCode == 200 && res.data.total > 0) {
            returnData = res.data;
            typeof f == 'function' && f(returnData);
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
          wx.hideNavigationBarLoading();
          return returnData;
        }
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载

    this.chooseAccount(null, 1);
    wx.showToast({
      title: '刷新成功✧٩(ˊωˋ*)و✧',
      duration: 2000
    })

    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  }
})

Array.prototype.max = function () {
  return Math.max.apply({}, this)
}
Array.prototype.min = function () {
  return Math.min.apply({}, this)
}

