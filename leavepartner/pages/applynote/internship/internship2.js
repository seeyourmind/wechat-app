// pages/applynote/internship/internship2.js
var SERVERURL = getApp().globalData.SERVERURL;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    internshipList:[],
    identifyList:[],
    prevSubmitData: {},
    loadinghidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('option: ', options);
    let item = JSON.parse(options.data);
    that.setData({
      prevSubmitData: item
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
   * 获取图片管理器
   */
  chooseImage: function (e) {
    var buttonID = e.currentTarget.id;
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log('chooseImage res--->', res)
        var tempFilePaths = res.tempFilePaths;
        var tempFiles = res.tempFiles;
        switch (buttonID) {
          case '1':
            that.setData({
              internshipList: tempFilePaths,
              internshipFiles: tempFiles
            });
            break;
          case '2':
            that.setData({
              identifyList: tempFilePaths,
              identifyFiles: tempFiles
            });
            break;
        }
      }
    });
  },
  /**
   * 预览图片
   */
  ylimg: function (e) {
    var imageID = e.currentTarget.id;
    var that = this;
    switch(imageID) {
      case '1':
        wx.previewImage({
          current: e.target.dataset.src,
          urls: this.data.internshipList // 需要预览的图片http链接列表
        });
        break;
      case '2':
        wx.previewImage({
          current: e.target.dataset.src,
          urls: this.data.identifyList // 需要预览的图片http链接列表
        });
        break;
    }
  },
  /**
   * 取消图片
   */
  cancelImg: function (data) {
    var that = this;
    var cancelID = data.currentTarget.id;
    switch (cancelID) {
      case '1':
        that.data.internshipList.splice(data.currentTarget.dataset.index, 1);
        that.setData(
          {
            internshipList: that.data.internshipList
          }
        );
        break;
      case '2':
        that.data.identifyList.splice(data.currentTarget.dataset.index, 1);
        that.setData(
          {
            identifyList: that.data.identifyList
          }
        );
        break;
    }
    
  },
  /**
   * 添加图片
   */
  addImage: function (data) {
    var that = this;
    var addID = data.currentTarget.id;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log('add chooseImage res--->', res)
        var tempFilePaths = that.data.internshipList.concat(res.tempFilePaths);
        var tempFiles = that.data.internshipFiles.concat(res.tempFiles);
        console.log('add tempFilePaths-->', tempFilePaths)
        that.setData({
          internshipList: tempFilePaths,
          internshipFiles: tempFiles
        })
      }
    });
  },

  /**
   * 表单提交
   */
  formSubmit: function(e) {
    var that = this;
    that.setData({
      loadinghidden: false
    });
    console.log('formsubmit-->', e)
    console.log('prev submit data: ', that.data.prevSubmitData)
    console.log('internshipList', that.data.internshipList)
    console.log('identifyList', that.data.identifyList)
    console.log('file path is : ', that.data.internshipList[0])
   
    wx.uploadFile({
      url: SERVERURL+'/student/insert_internships',
      filePath: that.data.internshipList[0],
      name: 'internshipCertificateFile',
      formData: that.data.prevSubmitData,
      header: {
        'content-type': 'multipart/form-data'
      },
      success: function (res) {
        console.log('success res-->', res)
        var returnData = JSON.parse(res.data);
        console.log('return data: ', returnData)
        if (returnData.state === 'SUCCEED') {
          console.log('success.data.message: ', returnData.message)
          wx.uploadFile({
            url: SERVERURL+'/student/guardian_id_card_file_upload',
            filePath: that.data.identifyList[0],
            name: 'guardianIdCardFile',
            formData: {
              wechatId: that.data.prevSubmitData.wechatId
            },
            header: {
              'content-type': 'multipart/form-data'
            },
            success: function (res) {
              console.log('success res: ', res)
              var returnData = JSON.parse(res.data);
              if (returnData.state === 'SUCCEED') {
                that.setData({
                  loadinghidden: true
                });
                wx.showModal({
                  title: '成功',
                  content: returnData.message,
                  showCancel: false,
                  success: function(res) {
                    if(res.confirm) {
                      wx.navigateBack({
                        delta: 2
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
                  content: returnData.message,
                  showCancel: false,
                });
              }
            },
            fail: function (res) {
              that.setData({
                loadinghidden: true
              });
              wx.showModal({
                title: '服务器错误',
                content: '请确保您提交的数据没有遗漏，且格式正确：【' + res.errMsg + '】',
                showCancel: false,
              })
            }
          });
        } else {
          console.log('fail.data.message: ', returnData.message)
          that.setData({
            loadinghidden: true
          });
          wx.showModal({
            title: '失败',
            content: returnData.message,
            showCancel: false,
          });
        }
      },
      fail: function (res) {
        console.log('fail res-->', res.errMsg)
        that.setData({
          loadinghidden: true
        });
        wx.showModal({
          title: '服务器错误',
          content: '请确保您提交的数据没有遗漏，且格式正确：【' + res.errMsg + '】',
          showCancel: false,
        })
      }
    })
  },
})