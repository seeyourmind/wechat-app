// assign-for-agent.js
var app = getApp();
var machines = [];
var crud = 'u';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    chooseMachines: ['请选择要划分的机器'],
    showModalStatus: false,
    showSubmitBtn: false,
    items: [],
    array: [],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)

    var that = this;

    app.getUserIDList(function (info) {
      that.setData({
        array: info
      })
    });

    app.getAllMachines(function (info){
      that.setData({
        items: info,
        loadinghidden: true
      })
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

  showMenu: function() {
    this.setData({
      showModalStatus: true
    })

    machines = [];
  },

  powerDrawer: function (e) {
    crud = e.currentTarget.id;
    console.log('crud-->', crud)
    this.setData({
      chooseMachines: (machines.length > 0 ? machines : ['请选择要划分的机器'])
    })

    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
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
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }

    // 按钮
    if(machines.length>0){
      this.setData({
        showSubmitBtn: true
      })
    } else {
      this.setData({
        showSubmitBtn: false
      })
    }
  },

  bindDateChange: function (e) {
    this.setData({
      index: e.detail.value
    });
  },

  checkboxChange: function (e) {
    machines = e.detail.value;
    console.log('checkbox发生change事件，携带value值为：', machines);
  },

  /**
   * 数据提交到服务器
   */
  submitToService: function () {
    var agentid = this.data.array[this.data.index];
    console.log('需要提交到数据库的数据有', machines, agentid, crud)

    if (agentid == '请选择' || !(/^\d+$/.test(agentid))) {
      wx.showToast({
        title: '您还没有选择代理商Σ(ŎдŎ|||)ﾉﾉ',
        icon: 'loading',
        duration: 2500
      })
    } else {
      wx.request({
        url: 'https://wxapp.51yin.net.cn/json/get_ManagerData.ashx',
        data: {
          Flag: 3,
          machineID: machines,
          agentid: agentid,
          curd: crud
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log('res.data', res)
          if (res.statusCode == 200 && res.data.total > 0) {
            wx.showToast({
              title: '操作成功！✧٩(ˊωˋ*)و✧',
              duration: 2500
            })
          } else {
            wx.showToast({
              title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
              icon: 'loading',
              duration: 2500
            })
          }
        },
        fail: function (res) {
          console.log('error', res)
          wx.showToast({
            title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
            icon: 'loading',
            duration: 2500
          })
        }
      });
    }
  }
})