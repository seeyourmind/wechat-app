// file-manage.js
var userid = null;
var app = getApp();
var timeflag = 0;
var getallfiles = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: false,
    touchbottom: false,
    //全选按钮
    selectAllChecked: false,
    //界面状态
    state: 'view',//view

    //所选文件
    chooseFiles: [],

    //文件图标类型
    icon: {
      img: 'png',
      pdf: 'geshi_wendangpdf',
      word: 'fontDoc'
    },

    //条目内容的长度
    itemWidth: {
      delete: 540,
      view: 594
    },

    //文件类型名
    fileType: {
      img: '图片',
      pdf: 'PDF',
      word: 'WORD'
    },

    //条目数据
    items: [],

    //选种条目
    itemSelectedId: []
  },

  //条目长按出现删除
  itemLongtap: function (data) {
    console.info('itemLongtap.data -> ' + data.id);

    //转向delete状态，初始化选择列表，和全选状态值
    this.setData({
      state: 'delete',
      selectAllChecked: false,
      itemSelectedId: []
    })
  },

  //全选事件
  selectAll: function () {
    var that = this
    console.info('old selectAllChecked -> ' + this.data.selectAllChecked)

    //选中/取消所有条目
    for (var i = 0; i < this.data.items.length; i++) {
      this.data.itemSelectedId[i] = !this.data.selectAllChecked
    }
    console.info('itemSelectedId -> ' + this.data.itemSelectedId)
    //渲染所有条目
    this.setData({
      selectAllChecked: !that.data.selectAllChecked,
      itemSelectedId: that.data.itemSelectedId
    })
  },

  //条目选择事件
  itemSelect: function (data) {
    var that = this
    this.data.itemSelectedId = [];
    //当处于delete状态时
    if (this.data.state == 'delete') {
      console.info('data.state==delete itemSelect.data -> ' + JSON.stringify(data))
      console.log('data.currentTarget.dataset.id', data.detail.value)
      //设置该条目的状态为反
      for (var i = 0; i < data.detail.value.length; i++){
        this.data.itemSelectedId[data.detail.value[i]] = true;
        this.data.chooseFiles[i] = this.data.items[data.detail.value[i]]
      }
      
      this.setData({
        itemSelectedId: that.data.itemSelectedId,
        chooseFiles: that.data.chooseFiles
      })

      //判断是否处于全选，还是处于取消全选
      for (var i = 0; i < this.data.items.length; i++) {
        if (!this.data.itemSelectedId[this.data.items[i].id]) {
          //设置为全选
          that.setData({
            selectAllChecked: false
          })
          return
        }
      }
      //设置为取消全选
      that.setData({
        selectAllChecked: true
      })

      console.info('itemSelectedId -> ' + JSON.stringify(this.data.itemSelectedId))
    }
  },

  //取消删除
  cancelDelete: function () {
    this.setData({
      state: 'view'
    })
  },

  //点击删除
  deleteFiles: function () {
    var ids = []
    for (var item in this.data.itemSelectedId) {
      if (this.data.itemSelectedId[item]) {
        ids.push({ id: item })
      }
    }
    console.info('deleteFiles.ids -> ' + JSON.stringify(ids))
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onHide]场景值', app.globalData.scene)

    timeflag = 0;
    getallfiles = false;
    
    console.log('userid', options.id);
    userid = options.id;

    var that = this;
    this.getFileInfo(options.id, function(info){
      that.setData({
        items: info,
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

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载

    timeflag = 0;
    var that = this;

    this.getFileInfo(userid, function(info){
      that.setData({
        items: info
      });
      wx.showToast({
        title: '刷新成功啦！.˚‧º·(´ฅωฅ｀)‧º·˚.',
      })
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },

  /**
   * 获取文件管理信息
   */
  getFileInfo: function (id, f) {
    var that = this;
    console.log('getFileInfo userid-->',id)

    wx: wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_UserData.ashx',
      data: {
        Flag: 0,
        Uid: id,
        page: timeflag*10
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        console.log('success res', res);
        if(res.data.total > 0){
          typeof f == 'function' && f(res.data.items);
        } else if(timeflag==0&&res.data.total==0) {
          typeof f == 'function' && f([]);
          wx.showToast({
            title: '您还没有上传过文件哦(⊙o⊙)',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        if (res.data.total >= 0 && res.data.total < 10) {
          console.log('本次返回参数个数-->', res.data.total)
          getallfiles = true;
        }
      },
      fail: function (res) {
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
    })
  },

  /**
   * 上拉加载
   */
  onReachBottom: function(e){
    timeflag += 1;
    var that = this;
    var temparay = that.data.items;

    console.log('getallfiles-->',getallfiles)

    if(!getallfiles){
      this.setData({
        touchbottom: true
      });
      console.log('上拉加载-->', timeflag)

      this.getFileInfo(userid, function (info) {
        console.log('info-->', info)
        for(var i=0; i<info.length; i++){
          temparay.push(info[i]);
        }
        console.log('temparray-->',temparay)
        that.setData({
          touchbottom: false,
          items: temparay
        });
      });
    } else {
      wx.showToast({
        title: '所有文件加载完毕(*ฅ́˘ฅ̀*)♡',
        icon: 'loading',
        duration: 2000
      });
      that.setData({
        touchbottom: false
      });
    }
  },

  /**
   * 打印所选文件
   */
  printFiles: function(){
    console.log('打印的文件', this.data.chooseFiles)
    wx.showModal({
      title: '提示',
      content: '功能尚未实现，程序猿正在玩命开发中。。。',
      showCancel: false
    })
  },

  /**
   * 删除所选文件
   */
  deleteFiles: function(){
    var that = this;
    var filesobject = this.data.chooseFiles;
    var filesList = [];
    for(var i=0; i < filesobject.length; i++){
      filesList.push(filesobject[i].filename);
    }
    console.log('删除的文件', filesList);
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/get_UserData.ashx',
      data: {
        Flag: 2,
        Uid: userid,
        files: filesList
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        console.log('success res', res);
        if (res.data.Messag > 0) {
          wx.showToast({
            title: '所选文件已删除',
            icon: 'success',
            duration: 2000
          });
          that.cancelDelete();
          that.getFileInfo(userid, function (info) {
            that.setData({
              items: info
            });
          });
        } else {
          wx.showToast({
            title: '删除文件失败，请稍后重试',
            icon: 'loading',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        })
      }
    })
  }
})