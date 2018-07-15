// upload-file.js
var app = getApp();
var filetype = '.jpg';
var filename = '';
var userid = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadinghidden: true,
    imglist: []
  },
  /**
   * form提交事件
   */
  bindFormSubmit: function (e) {
    var self = this
    //图片
    var imglist = self.data.imglist
    console.log('imglist-->', imglist)

    if (imglist != '') {
      if (imglist.length > 1) {
        wx.showModal({
          title: '提示',
          content: '暂时仅支持单个文件上传打印，请您删除多余文件',
          showCancel: false
        });
      } else {
        self.setData({
          loadinghidden: false
        });
        this.getToken(function (gettoken) {

          console.log('token-->', gettoken)
          //开始插入图片
          for (var i = 0; i < imglist.length; i++) {
            filetype = imglist[i].substr(imglist[i].indexOf('.', -1));
            console.log('filetype-->', filetype);
            //上传至服务器
            wx.uploadFile({
              url: 'https://upload-z2.qbox.me',
              filePath: imglist[i],
              name: 'file',
              formData: {
                token: gettoken.toString(),
              },
              success: function (res) {
                console.log('success res', res)
                if (i >= imglist.length) {
                  self.setData({
                    imglist: [],
                    loadinghidden: true
                  })
                  // wx.hideLoading();
                  if (res.statusCode == 200) {
                    wx.showToast({
                      title: '提交成功',
                      icon: 'success',
                      duration: 2000,
                      mask: true
                    });
                    filename = res.data.split('"')[7];
                    console.log('filename -->', filename)

                    app.globalData.usingMachineId = ''

                    self.downloadToService(filename, filetype)

                  } else {
                    wx.showToast({
                      title: '提交失败',
                      icon: 'loading',
                      duration: 2000,
                      mask: true
                    })
                  }
                }
              },
              fail: function (res) {
                console.log('fail res', res)
              }
            });
          }
          console.log(imglist);
        });
      }
    } else {
      // wx.hideLoading();
      wx.showToast({
        title: '提交不能为空',
        icon: 'success',
        duration: 2000,
        mask: true
      })
    }
    console.log('e-->', e)
  },
  //点击选择图片
  addImg: function () {
    var machineid = app.globalData.usingMachineId;
    console.log('点击选择图片', machineid, machineid.length);
    var that = this

    if (machineid.length <= 1 || machineid == 'undefined') {
      wx.showModal({
        title: '提示',
        content: '您尚未连接云印机，暂不支持上传。请确认连接后再上传！',
        confirmText: '连接',
        success: function (res) {
          if (res.confirm) {
            wx.scanCode({
              onlyFromCamera: true,//只允许从相机扫码，1.2以上支持
              success: function (res) {
                //判断扫描的是否是机器地址
                if (res.result.indexOf(app.globalData.machineQR_CodeURL) >= 0) {
                  //查找ID字段位置
                  var idIndexStart = res.result.indexOf(app.globalData.machineIdURL_Field)
                  if (idIndexStart >= 0) {
                    idIndexStart += app.globalData.machineIdURL_Field.length + 1
                    var idIndexEnd = res.result.indexOf('&', idIndexStart)
                    if (idIndexEnd < 0) {
                      machineid = res.result.substring(idIndexStart)
                    } else {
                      machineid = res.result.substring(idIndexStart, idIndexEnd)
                    }
                    //需要判断获取id不为空
                    if (machineid && machineid.length > 0) {
                      //是机器地址
                      wx.showToast({
                        title: '扫描成功' + machineid + '请选择文件上传',
                        icon: 'success'
                      })
                      //保存到App中的usingMachineId
                      app.globalData.usingMachineId = machineid
                      app.globalData.scene -= 1;
                      return;
                    }
                  }
                }
                //扫描失败
                wx.showToast({
                  title: '该二维码非云印机二维码',
                  icon: 'loading'
                })
              },
              fail: function () {
                //扫描失败
                wx.showToast({
                  title: '扫描失败',
                  icon: 'loading'
                })
              }
            })
          }
        }
      })
    } else {
      wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          console.log('chooseImage res--->', res)
          var tempFilePaths = res.tempFilePaths;
          var tempFiles = res.tempFiles;
          that.setData({
            imglist: tempFilePaths,
            imgFiles: tempFiles
          })
        }
      })
    }
  },
  //点击预览图片
  ylimg: function (e) {
    wx.previewImage({
      current: e.target.dataset.src,
      urls: this.data.imglist // 需要预览的图片http链接列表
    })

  },

  //取消图片
  cancelImg: function (data) {
    var that = this
    this.data.imglist.splice(data.currentTarget.dataset.index, 1)
    this.setData(
      {
        imglist: that.data.imglist
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.scene += 1;
    app.globalData.usingMachineId = options.linkmachine;
    console.log('云印机[onLoad]场景值', app.globalData.scene);
    userid = options.id;
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
   * 获取token
   */
  getToken: function (f) {
    var token = '';
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/tttt.aspx',
      success: function (res) {
        console.log('getToken res', res)
        token = res.data;
        token = token.substr(0, token.indexOf('<')).trim();
        console.log('getToken token-->', token)
        typeof f == 'function' && f(token)
        return token;
      },
      fail: function (res) {
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        });
      },
      complete: function (res) {
        return token;
      }
    });
  },

  /**
   * 激活服务器下载文件
   */
  downloadToService: function (filename, filetype) {
    wx.request({
      url: 'https://wxapp.51yin.net.cn/json/Download.aspx',
      data: {
        filename: filename,
        filetype: filetype,
        machineID: app.globalData.usingMachineId,
        userID: userid
      },
      success: function (res) {
        console.log('success res.data-->', res.data);
        var resstr = res.data;
        console.log('resstr-->', resstr.indexOf('Success'))
      },
      fail: function (res) {
        console.log('complete res-->', res);
        wx.showToast({
          title: '访问服务器出错Σ(ŎдŎ|||)ﾉﾉ',
          icon: 'loading',
          duration: 2000
        });
      }
    })
  }
})